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

  startTime : number = 0;
  endTime : number = 0;

  public hubConnection: signalR.HubConnection | undefined;

  constructor(private api: ApiService) {}

  ngOnInit() {

    this.startConnection();
    this.getAuctions();

  }
  
  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
                            // .withUrl('https://localhost:7058/auctionhub')
                            // .withUrl('https://localhost:44381/adhochub')
                             .withUrl('https://flex-user-authorization-service-flex-build.paas-dev-njrar-02.ams1907.com/adhochub')
                            //.withUrl('http://localhost:7174/api')
                            //.withUrl('https://worldport-signalr-functions-eastus-dev.azurewebsites.net/api/')
                            .build();

    this.hubConnection.on("ReceiveNewBid", ({ auctionId, bidValue}) => {
      console.log('endTime',Date.now());
      this.endTime = Date.now();
      console.log('timelapse ' + (this.endTime - this.startTime));

      //update auction array item
      this.updateAuctionItem(auctionId, bidValue);

      //Highlight the record of the table that got updated
      this.auctionClicked =  auctionId;

      setTimeout(() => this.auctionClicked =  0, 2000);
    }) 

    this.hubConnection.on("ReceiveAdhoc", () => {
      console.log('Message Received',Date.now());
      console.log('endTime',Date.now());
      this.endTime = Date.now();
      console.log('timelapse ' + (this.endTime - this.startTime));

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
    
    console.log('startTime',Date.now());
    this.startTime = Date.now();

    //calling notifyNewBid
    // await this.hubConnection?.invoke("NotifyNewBid", {
    //   auctionId: id,
    //   bidValue: parseInt(newBid)
    // })
    
    //await this.hubConnection?.invoke("NotifyAdhoc");

    await this.api.notifyAdhoc(this.api_request_body).toPromise();
    
  }
}
