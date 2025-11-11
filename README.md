# **Framez**

### 🎥 Demo  
https://github.com/Toluwaa-o/framez/blob/main/DEMO.mp4

A mobile social app built with **React Native (Expo)** that lets users share moments, browse a global feed, follow other users, like posts, and manage their personal profile. Inspired by Instagram but intentionally simplified for learning, clarity, and fast iteration.

Framez demonstrates mobile authentication, real-time data sync, social interactions, media uploads, and a clean, structured UI.

---

## **Why Firebase?**

Framez uses **Firebase** as the backend because it offers an incredibly easy setup process, especially for mobile apps. Firebase Authentication + Firestore gives real-time updates, strong security, and effortless scaling, making it the perfect backend for a fast, lightweight social app.

---

## **Features**

### **Authentication**

* User registration, login, and logout using **Firebase Authentication**
* Persistent sessions so users stay logged in after reopening the app
* Helpful error handling for invalid credentials and network issues

---

### **Social Features**

* **Follow / Unfollow users**
* **Like / Unlike posts**
* **Search for users**
* Real-time updates for social interactions

---

### **Posts**

* Users can create and share posts containing:

  * Text
  * Images (uploaded via **Cloudinary**)
* Posts appear in a global feed sorted by most recent
* Each post displays:

  * Author info
  * Timestamp
  * Image (if available)
  * Post text
  * Like count

---

### **Profile**

* View logged-in user's:

  * Name
  * Email
  * Avatar
* See follower and following counts
* View all posts created by the user
* UI updates automatically when new posts or follows occur

---

## **Tech Stack**

### **Frontend**

* **React Native**
* **Expo**
* **TypeScript**
* **Tailwind (NativeWind)** for styling

### **Backend**

* **Firebase**

  * Authentication
  * Firestore Database
  * Storage (optional—images handled via Cloudinary)

### **Media Handling**

* **Cloudinary**

  * Stores uploaded images
  * Fast delivery via CDN
  * Ideal for mobile uploads

---

## **Core Objectives Achieved**

✅ Full authentication flow
✅ Post creation + image upload
✅ Global feed with real-time updates
✅ User search
✅ Follow / Unfollow users
✅ Like system
✅ Profile with user posts
✅ Dark/Light mode
✅ Cloudinary integration for image hosting

---

## **Installation & Setup**

### 1. Clone the project

```sh
git clone https://github.com/Toluwaa-o/framez.git
cd framez
```

### 2. Install dependencies

```sh
npm install
```

### 3. Configure environment variables

Create `.env`:

```
EXPO_PUBLIC_FIREBASE_API_KEY=xxxx
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxx
EXPO_PUBLIC_FIREBASE_PROJECT_ID=xxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxx
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxx
EXPO_PUBLIC_FIREBASE_APP_ID=xxxx
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=xxxx
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=xxxx
```

### 4. Run the app

```sh
npx expo start
```

---

## **Screens (Overview)**

* **Login**
* **Register**
* **Home Feed**
* **Create Post**
* **Profile**
* **Search Users**