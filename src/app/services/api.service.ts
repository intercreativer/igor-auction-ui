import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { SignalRConnectionInfo } from '../signalr-model';

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
  worldPortSignalRUrl: string = 'https://worldport-signalr-functions-eastus-dev.azurewebsites.net/api/'

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

  sendSignalRNotification(request: any) {
    const params = request;
    return this.http.post<any>(this.worldPortSignalRUrl + 'broadcast', params, {
      headers: this.getCustomBroadcastHeaders()
    });
  }

  getCustomBroadcastHeaders(): HttpHeaders {
    const headers = new HttpHeaders()
      .set('Content-Type', 'text/plain')
      .set('x-functions-key', 'oT6J6gZLgFcY-V-qqGh5vnc39ZKpxbmqugdYosdEeEKnAzFuRso_4w==')
    // console.log('Headerbroadcast', headers);
    return headers;
  }

  getConnectionInfo(): Observable<SignalRConnectionInfo> {
    const requestUrl = this.worldPortSignalRUrl + 'negotiate';
    console.log('requestURL ' + requestUrl);
    return this.http.post<SignalRConnectionInfo>(requestUrl, null, {
      headers: this.getCustomHeaders()
    }).pipe(catchError(this.handleError));
  }

  getCustomHeaders(): HttpHeaders {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('x-functions-key', 'oT6J6gZLgFcY-V-qqGh5vnc39ZKpxbmqugdYosdEeEKnAzFuRso_4w==')
      .set('x-ms-signalr-userid', '5915087')
      .set('x-hub-name', 'FlexOpsHub')
      .set('Access-Control-Allow-Origin', '*');
    console.log('Header', headers);
    return headers;
  }

  handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(error);
  }
}
