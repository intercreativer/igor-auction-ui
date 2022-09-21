import { Component, OnInit } from '@angular/core';
import { ApiService, Auction } from './services/api.service';
import { map } from 'rxjs/operators';

import * as signalR from "@microsoft/signalr";

export interface myAuction {
  auctionId: number;
  auctionName: string;
  currentBid: number;
}

export interface jsonbody {
  auctionId: number;
  bidValue: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  title = 'igor-auction-ui';
  response = [];
  myAuctions: myAuction[] = [];
  api_request_body: jsonbody = <jsonbody>{};

  displayedAuctionColumns: string[] = ['auctionId', 'auctionName', 'currentBid', 'bidForm'];
  rowStyle = 'row-default';
  auctionClicked: number | undefined;

  public hubConnection: signalR.HubConnection | undefined;

  constructor(private api: ApiService) {}

  ngOnInit() {

    this.startConnection();
    this.getAuctions();

  }
  
  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
                            .withUrl('https://localhost:7058/auctionhub')
                            .build();

    this.hubConnection.on("ReceiveNewBid", ({ auctionId, bidValue}) => {

      //update auction array item
      this.updateAuctionItem(auctionId, bidValue);

      //Highlight the record of the table that got updated
      this.auctionClicked =  auctionId;

      setTimeout(() => this.auctionClicked =  0, 2000);
    }) 

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err))
  }

  updateAuctionItem (auctionId: number, newBidValue: number) {
      let updateItem =this.myAuctions.find(auction => auction.auctionId == auctionId);
      if (updateItem != null) {
        updateItem.currentBid = newBidValue;
      }
      console.log(this.myAuctions);
  }

  private getAuctions() {
    this.api.getAuctions()
      .subscribe((response) => {
        this.myAuctions = JSON.parse(JSON.stringify(response));
        console.log(this.myAuctions);
      }
      );
  }

  async PlaceNewBid(id: number, newBid: string)
  {
    this.api_request_body.auctionId = id;
    this.api_request_body.bidValue = Number(newBid);

    const bid = await this.api.placeNewBid(this.api_request_body).toPromise();
    console.log(bid);

    //calling notifyNewBid
    await this.hubConnection?.invoke("NotifyNewBid", {
      auctionId: id,
      bidValue: parseInt(newBid)
    })
    
    this.updateAuctionItem(id, Number(newBid));
    //this.getAuctions();
  }
}
