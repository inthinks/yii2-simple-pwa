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

  const messaging = firebase.messaging();

  messaging.onTokenRefresh(function() {
    messaging.getToken()
    .then(function(refreshedToken) {
      setTokenSentToServer(false);
      sendTokenToServer(refreshedToken);
    })
    .catch(function(err) {
      console.log('Unable to retrieve refreshed token ', err);
    });
  });

  messaging.onMessage(function(payload) {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);

      const notificationTitle = 'TITLE';
      const notificationOptions = {
          body: 'CONTENT',
          icon: 'https://www.gstatic.com/devrel-devsite/v595dc2b5326ecd7de309fb4a71a7facdb2414a46fa087cc37cc0f175714dd5bb/web/images/lockup.svg',
      };

      if (!("Notification" in window)) {
          console.log("This browser does not support system notifications");
      }
      else if (Notification.permission === "granted") {
          var notification = new Notification(notificationTitle,notificationOptions);
          notification.onclick = function(event) {
              event.preventDefault();
              window.open(payload.data.url , '_blank');
              notification.close();
          }
      }
  });

  function requestToken() {
    messaging.getToken()
    .then(function(currentToken) {console.log(currentToken);
      if (currentToken) {
        sendTokenToServer(currentToken);
      } else {
        setTokenSentToServer(false);
      }
    })
    .catch(function(err) {
      console.log('An error occurred while retrieving token. ', err);
      setTokenSentToServer(false);
    });
  }

  function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer()) {
      console.log('Sending token to server...');
      sendTokenToAppsDev(currentToken);
      setTokenSentToServer(true);
    } else {
      console.log('Token already sent to server so won\'t send it again ' +
          'unless it changes');
    }
  }

  function sendTokenToAppsDev(currentToken) {
    var url = '';
    var method = "POST";

    var device = 3;
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      device = 4;
    }

    var postData = new FormData();
    postData.append('token', currentToken);

    var async = true;
    var request = new XMLHttpRequest();
    request.withCredentials = true;
    request.onload = function () {
       var status = request.status;
       var data = request.responseText;
    }

    console.log('request post to Server');
    request.open(method, url, async);
    request.setRequestHeader("X-CSRF-TOKEN", $('meta[name="csrf-token"]').attr('content'));
    request.send(postData);
  }

  function isTokenSentToServer() {
    if (window.localStorage.getItem('sentToServer') == 1) {
          return true;
    }
    return false;
  }

  function setTokenSentToServer(sent) {
    window.localStorage.setItem('sentToServer', sent ? 1 : 0);
  }

  function requestPermission() {
    console.log('Requesting permission...');

    messaging.requestPermission()
    .then(function() {
    requestToken();
      console.log('Notification permission granted.');
    })
    .catch(function(err) {
      console.log('Unable to get permission to notify.', err);
    });
    // [END request_permission]
  }

  function deleteToken() {
    messaging.getToken()
    .then(function(currentToken) {
      messaging.deleteToken(currentToken)
      .then(function() {
        console.log('Token deleted.');
        setTokenSentToServer(false);
      })
      .catch(function(err) {
        console.log('Unable to delete token. ', err);
      });
    })
    .catch(function(err) {
      console.log('Error retrieving Instance ID token. ', err);
    });
  }

  function resendToken(){
    messaging.getToken()
    .then(function(currentToken) {
        $.post( '', { token: currentToken } );
    });
  }

  //resendToken();
  requestPermission();

  $(function() 
  { 
      var $meta = $('meta[name="csrf-token"]'); 
      if( $meta.length ) 
      { 
          $.ajaxSetup({ 
              headers: { 
                  'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') 
              } 
          }); 
      } 
  });