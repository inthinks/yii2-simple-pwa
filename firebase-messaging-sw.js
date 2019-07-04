// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
importScripts('https://www.gstatic.com/firebasejs/4.12.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.12.1/firebase-messaging.js');

var config = {
    apiKey: "AIzaSyDivmeHpbR34oVegz6Yrk8xX_gMxX0elDM",
    authDomain: "yii2-pwa.firebaseapp.com",
    databaseURL: "https://yii2-pwa.firebaseio.com",
    projectId: "yii2-pwa",
    storageBucket: "",
    messagingSenderId: "885568658681",
    appId: "1:885568658681:web:d2223de115af76cf"
    };

firebase.initializeApp(config);

var messaging = firebase.messaging();

/*
 * We need a generic class to hold data and methods, that inherit from Event
 */
class CustomPushEvent extends Event {
  constructor(data) {
    super('push')
    
    Object.assign(this, data)
    this.custom = true
  }
}

/*
 * Overrides push notification data, to avoid having 'notification' key and firebase blocking
 * the message handler from being called
 */
self.addEventListener('push', (e) => {
  // Skip if event is our own custom event
  if (e.custom) return;

  // Kep old event data to override
  let oldData = e.data

  // Create a new event to dispatch
  let newEvent = new CustomPushEvent({
    data: {
      json() {
        let newData = oldData.json()
        newData._notification = newData.notification
        delete newData.notification
        return newData
      },
    },

    waitUntil: e.waitUntil.bind(e),
  })

  // Stop event propagation
  e.stopImmediatePropagation()

  // Dispatch the new wrapped event
  dispatchEvent(newEvent)
})

/**
 * Here is is the code snippet to initialize Firebase Messaging in the Service
 * Worker when your app is not hosted on Firebase Hosting.

 // [START initialize_firebase_in_sw]
 // Give the service worker access to Firebase Messaging.
 // Note that you can only use Firebase Messaging here, other Firebase libraries
 // are not available in the service worker.
 importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
 importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

 // Initialize the Firebase app in the service worker by passing in the
 // messagingSenderId.
 firebase.initializeApp({
   'messagingSenderId': 'YOUR-SENDER-ID'
 });

 // Retrieve an instance of Firebase Messaging so that it can handle background
 // messages.
 const messaging = firebase.messaging();
 // [END initialize_firebase_in_sw]
 **/


// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  var notificationTitle = 'TITLE';
  var notificationOptions = {
    body: 'BODY',
    icon: 'ICON',
    data: 'DATA'
  };

  // https://stackoverflow.com/questions/46393388/fcm-web-receive-only-data-and-hide-notification-section-or-disable
  return self.registration.showNotification(notificationTitle,
    notificationOptions).then(function () {self.registration.getNotifications().then(notifications => {
        for (var i =0;i<notifications.length;i++)
        {
            if(typeof notifications[i].data.FCM_MSG !== 'undefined')
            {
                //then we destroy the fake notification immedialtely !
                notifications[i].close();
            }
        }
      });
    });
});
// [END background_handler]

self.addEventListener('notificationclick', function(event) {
  console.log(event);
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data.url));
});
