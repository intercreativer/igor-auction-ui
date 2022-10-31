import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { MessagingService } from './messaging.service';

export interface Auction {
  auctionId: number;
  auctionName: string;
  currentBid: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  getAuctionUrl: string = "https://localhost:7058/api/Auctions/GetAuctions";
  newBidUrl: string = "https://localhost:7058/api/Auctions/PlaceBid";
  firebaseUrl: string = "https://fcm.googleapis.com/fcm/send";

  constructor(private http: HttpClient, private messagingService: MessagingService) { }

  getAuctions() {
    // now returns an Observable of Auction
    return this.http.get<Auction>(this.getAuctionUrl);
  }

  placeNewBid(request: any) {
    const params = request;
    // console.log('post Params');
    // console.log(params);
    return this.http.post<Auction>(this.newBidUrl, params);
  }

  NotifyNewBid(request: any) {
    console.log('serverKey', this.messagingService.serverKey);
    const headers = new HttpHeaders().append('Authorization', `Bearer ` + this.messagingService.serverKey);
    
    const params = request;
    console.log('firebase Params', params);
    return this.http.post<Auction>(this.firebaseUrl, params, { headers });
  }

}
