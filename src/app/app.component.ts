import { Component, OnInit } from '@angular/core';
import { ApiService, Auction } from './services/api.service';
import { map } from 'rxjs/operators';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { MessagingService } from './services/messaging.service';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries



export interface myAuction {
  auctionId: number;
  auctionName: string;
  currentBid: number;
}

export interface auctionBid {
  auctionId: number;
  bidValue: number;
}

export interface notification {
  title: string;
  body: string;
}

export interface firebaseMessage {
  notification: notification;
  to: string;
  data: auctionBid;
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
  auctionBidApi_request_body: auctionBid = <auctionBid>{};
  firebaseMessage: firebaseMessage = <firebaseMessage>{};
  
  displayedAuctionColumns: string[] = ['auctionId', 'auctionName', 'currentBid', 'bidForm'];

  rowStyle = 'row-default';
  auctionClicked: number | undefined;

  message: any;

  firebaseToken: any = null;
  serverKey: string = "AAAAlprbRTI:APA91bFIjvv87nx-b0eujFW-wPtqQOoZKMAGROKCQge2lA5JfW3COCc7VEsNLX835TS0kS5OIkuEqV16vsqTdg1Yzt5jDamd-BkU69w8dL26iDEWXAmzi0HMrqUsuvcUjWVlU0276dLO";

  currentMessage = new BehaviorSubject<any>(null);

  newBid : auctionBid = <auctionBid>{};
  startTime : number = 0;
  endTime : number = 0;

  constructor(private api: ApiService, 
              // private messagingService: MessagingService,
              private angularFireMessaging: AngularFireMessaging
              ) {}

  ngOnInit() {

    // this.messagingService.requestPermission();
    // this.messagingService.receiveMessaging();
    // this.message = this.messagingService.currentMessage;

    this.requestPermission();
    this.receiveMessaging();
    this.message = this.currentMessage;

    this.getAuctions();
  }

  requestPermission() {
    this.angularFireMessaging.requestToken.subscribe((token) => {
      if (token != null) {
        console.log(token);
        this.firebaseToken = token;
      }
      else
        console.log('Please allow notifications otherwise you will be out of sync with outher clients');
    },(err)=>{
      console.log("Unable to get permission for notification ", err);
    })
  }

  updateAuctionItem (newBid : auctionBid) {
    let updateItem =this.myAuctions.find(auction => auction.auctionId == Number(newBid.auctionId));
    if (updateItem != null) {
      updateItem.currentBid = Number(newBid.bidValue);
    }
  }

  receiveMessaging(){
    this.angularFireMessaging.messages.subscribe(payload => {
      console.log('endTime',Date.now());
      this.endTime = Date.now();
      console.log('timelapse ' + (this.endTime - this.startTime));

      console.log("new message received", payload)

      this.newBid = JSON.parse(JSON.stringify(payload.data));
      console.log('new bid',this.newBid);

      this.updateAuctionItem(this.newBid);

      //Highlight the record of the table that got updated
      this.auctionClicked =  Number(this.newBid.auctionId);

      setTimeout(() => this.auctionClicked =  0, 2000);      

      this.currentMessage.next(payload);
    })
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
    this.auctionBidApi_request_body.auctionId = id;
    this.auctionBidApi_request_body.bidValue = Number(newBid);

    const bid = await this.api.placeNewBid(this.auctionBidApi_request_body).toPromise();
    console.log('startTime',Date.now());
    this.startTime = Date.now();

    this.firebaseMessage.notification = {"title" : "New bid was placed", "body": "New bid was placed"};
    this.firebaseMessage.to = this.firebaseToken;
    this.firebaseMessage.data = this.auctionBidApi_request_body;

    console.log(this.firebaseMessage);
    await this.api.NotifyNewBid(this.firebaseMessage).toPromise();

    //  this.getAuctions();
  }
}
