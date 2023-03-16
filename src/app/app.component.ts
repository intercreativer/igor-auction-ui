import { Component, OnInit } from '@angular/core';
import { ApiService, Auction } from './services/api.service';
import { map } from 'rxjs/operators';

import * as signalR from "@microsoft/signalr";
import { Observable } from 'rxjs';
import { SignalRConnectionInfo } from './signalr-model';
import { SignalRdata } from './constants';

export interface myAuction {
  auctionId: number;
  auctionName: string;
  currentBid: number;
}

export interface jsonbody {
  auctionId: number;
  bidValue: number;
}

export interface flexOpsJsonBody {
  Sender: string;
  MessageText: string;
  GroupName: string;
  Recipient: string;
  ConnectionId: string;
  IsPrivate: boolean;
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
  flexops_request_body: flexOpsJsonBody = <flexOpsJsonBody>{};

  displayedAuctionColumns: string[] = ['auctionId', 'auctionName', 'currentBid', 'bidForm'];
  rowStyle = 'row-default';
  auctionClicked: number | undefined;

  startTime : number = 0;
  endTime : number = 0;

  connStartTime : number = 0;
  connEndTime : number = 0;

  public hubConnection: signalR.HubConnection | undefined;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.connStartTime = Date.now();
    this.startConnection();
    this.getAuctions();
  }




  
  public startConnection = () => {

    this.api.getConnectionInfo().subscribe((info) => {
      info.accessToken = info.accessToken;
      info.url = info.url;
      SignalRdata.ready = true;
      const options = {
        accessTokenFactory: () => info.accessToken,
        transport: signalR.HttpTransportType.ServerSentEvents ,
        logging: signalR.LogLevel.Trace, 
      };    
    
    
    this.hubConnection = new signalR.HubConnectionBuilder()
                            .withUrl(info.url, options)
                            .withAutomaticReconnect()
                            .configureLogging(signalR.LogLevel.Information)
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

    this.hubConnection.on("newMessage", ({Message}) => {
      // console.log('Message Received', Message);
      this.endTime = Date.now();
      console.log('Message Received', Message, this.endTime);
      
      console.log('timelapse ' + (this.endTime - this.startTime));

    })     

    this.hubConnection
      .start()
      .then(() => {
        this.connEndTime = Date.now();
        console.log('Connection started. Timelapse ' + (this.connEndTime - this.connStartTime))
      }
      )
      .catch(err => console.log('Error while starting connection: ' + err))

    });}

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
 
    // this.api_request_body.auctionId = id;
    // this.api_request_body.bidValue = Number(newBid);

    this.flexops_request_body.Sender = "5915087";
    this.flexops_request_body.MessageText = "ping";
    this.flexops_request_body.GroupName = "none";
    this.flexops_request_body.Recipient = "none";
    this.flexops_request_body.ConnectionId = "none";
    this.flexops_request_body.IsPrivate = false;


    const bid = await this.api.placeNewBid(this.api_request_body).toPromise();
    
    this.startTime = Date.now();
    console.log('Sending the message', this.startTime);
    

    //calling notifyNewBid
    // await this.hubConnection?.invoke("NotifyNewBid", {
    //   auctionId: id,
    //   bidValue: parseInt(newBid)
    // })
    
    //await this.hubConnection?.invoke("NotifyAdhoc");

    //await this.api.notifyAdhoc(this.api_request_body).toPromise();

    await this.api.sendSignalRNotification(this.flexops_request_body).toPromise();
    
  }
}
