// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyCWjOwZfPDeBiIeivARr4fsMZ_1p_F-Wh0",
  projectId: "notification-service-c556c",
  messagingSenderId: "543455414606",
  appId: "1:543455414606:web:7242afe8f36c0a21d8b61f",
};
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  // Only show notification if it exists in the payload
  if (payload.notification) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      // Add a tag to prevent duplicate notifications
      tag: 'notification-' + Date.now()
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});