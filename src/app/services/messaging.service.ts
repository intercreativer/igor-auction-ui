import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFireMessaging } from "@angular/fire/compat/messaging";

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  firebaseToken: any = null;
  serverKey: string = "AAAAlprbRTI:APA91bFIjvv87nx-b0eujFW-wPtqQOoZKMAGROKCQge2lA5JfW3COCc7VEsNLX835TS0kS5OIkuEqV16vsqTdg1Yzt5jDamd-BkU69w8dL26iDEWXAmzi0HMrqUsuvcUjWVlU0276dLO";

  currentMessage = new BehaviorSubject<any>(null);

  constructor(private angularFireMessaging: AngularFireMessaging) { }

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

  receiveMessaging(){
    this.angularFireMessaging.messages.subscribe(payload => {
      console.log("new message received", payload)
      this.currentMessage.next(payload);
    })
  }

}
