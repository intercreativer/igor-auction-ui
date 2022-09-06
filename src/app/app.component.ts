import { Component, OnInit } from '@angular/core';
import { ApiService, Auction } from './services/api.service';
import { map } from 'rxjs/operators';

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

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.getAuctions();
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
    console.log("button clicked. auction id " + id + " new Bid " + newBid);

    this.api_request_body.auctionId = id;
    this.api_request_body.bidValue = Number(newBid);

    const bid = await this.api.placeNewBid(this.api_request_body).toPromise();
    console.log(bid);

    this.getAuctions();
  }
}
