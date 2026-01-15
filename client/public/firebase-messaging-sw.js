/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Vite sẽ thay thế các chuỗi này (String Replacement) dựa trên config 'define'
firebase.initializeApp({
	apiKey: "VITE_FIREBASE_API_KEY",
	authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
	projectId: "VITE_FIREBASE_PROJECT_ID",
	messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
	appId: "VITE_FIREBASE_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received', payload);
    const notificationTitle = payload.notification?.title || "CAD SQUAD";
    const notificationOptions = {
        body: payload.notification?.body || "Bạn có thông báo mới",
        icon: '/favicon.ico',
        badge: '/favicon.ico', // Thêm badge cho Android
        data: payload.data,    // Lưu data để xử lý khi click
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Thêm sự kiện click vào thông báo để mở app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/') // Mở trang chủ khi click
    );
});