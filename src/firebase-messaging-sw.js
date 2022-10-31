importScripts('https://www.gstatic.com/firebasejs/9.10.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.10.0/firebase-messaging-compat.js')


    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyD1jPaIDNDKHJ_7c78XcYYsG6vaRMUQtoQ",
        authDomain: "igor-s-auction.firebaseapp.com",
        projectId: "igor-s-auction",
        storageBucket: "igor-s-auction.appspot.com",
        messagingSenderId: "646843155762",
        appId: "1:646843155762:web:3ddef445d82924d05f432b",
        measurementId: "G-00JXP4J4NZ"
      };
  
    //   // Initialize Firebase
    //   const app = initializeApp(firebaseConfig);

          // Initialize Firebase Cloud Messaging and get a reference to the service
          // const messaging = getMessaging(app);

      firebase.initializeApp(firebaseConfig);

      const messaging = firebase.messaging();
  
      // Add the public key generated from the console here.
      // messaging.getToken({vapidKey: "BLl21ShHYT15eFRLtzPRE9PRkiQv3pjlKUQ1hWe0f0rwNysxqFL5TYcfB8vrF9SFZO8VePXBTlI_1LZHVqa9VVE"});