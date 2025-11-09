# **Framez**

A mobile social app built with **React Native (Expo)** that lets users share moments, browse a global feed, and manage their personal profile. Inspired by Instagram but simplified for learning, clarity, and fast iteration.

Framez demonstrates mobile authentication, real-time data sync, media uploads, and a clean, structured UI.

---

## **Features**

### **Authentication**

* User registration, login, and logout using **Firebase Authentication**
* Persistent user sessions so users remain logged in after reopening the app
* Error handling for invalid credentials and network issues

---

### **Posts**

* Users can create and share posts containing:

  * Text
  * Images (uploaded via **Cloudinary**)
* Posts appear in a global feed sorted by most recent
* Each post displays:

  * Author name
  * Timestamp
  * Image (if available)
  * Post text

---

### **Profile**

* View logged-in user's:

  * Name
  * Email
  * Avatar
* View all posts created by the current user
* Posts auto-update when the user creates new ones

---

## **Tech Stack**

### **Frontend**

* **React Native**
* **Expo** (managed workflow)
* **TypeScript**
* **Tailwind (NativeWind)** for styling

### **Backend**

* **Firebase**

  * Authentication
  * Firestore Database
  * Storage (optional, but images are hosted via Cloudinary)

### **Media Handling**

* **Cloudinary**

  * Stores uploaded user images
  * Returns a secure URL saved in Firestore
  * Lightweight, fast, mobile-friendly

---

## **Core Objectives Achieved**

✅ Complete authentication flow
✅ Post creation and image upload
✅ Global feed with real-time updates
✅ User profile with own posts
✅ Clean mobile UI reminiscent of Instagram
✅ dark/Light Modes
✅ Cloudinary integration for robust image hosting

---

## **Project Structure**

```
/app
  /auth
  /feed
  /profile
  /components
  /hooks
  firebase/
  utils/
  App.tsx
```

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
