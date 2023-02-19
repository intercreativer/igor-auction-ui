import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

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
  notifyAdhocUrl: string = "http://localhost:7174/api/NotifyAdhoc";

  constructor(private http: HttpClient) { }

  getAuctions() {
    // now returns an Observable of Auction
    return this.http.get<Auction>(this.getAuctionUrl);
  }

  placeNewBid(request: any) {
    const params = request;
    return this.http.post<Auction>(this.newBidUrl, params);
  }

  notifyAdhoc(request: any) {
    const params = request;
    return this.http.post<Auction>(this.notifyAdhocUrl, params);
  }
}
