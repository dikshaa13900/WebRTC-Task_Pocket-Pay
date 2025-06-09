

# WebRTC Video Call App – Pocket Pay Task

A simple 1-on-1 video calling app built using **React Native**, **WebRTC**, and **Firebase** for signaling. This was developed as part of the Pocket Pay assignment.

---

## 🚀 Features

- Create or Join a room via Room ID
- 1-on-1 real-time video calling
- Firebase Realtime Database for signaling
- Responsive and clean UI

---

## 📱 How to Run the App

### 1. Clone the repository

```bash
git clone https://github.com/dikshaa13900/WebRTC-Task_Pocket-Pay.git
cd WebRTC-Task_Pocket-Pay
2. Install dependencies
bash
Copy
Edit
npm install
3. Firebase setup
Go to Firebase Console

Create a new project

Enable Realtime Database

Copy your Firebase config and add it to the project where required (e.g., firebase.js)

4. Run on Android
bash
Copy
Edit
npx react-native run-android
⚠️ Make sure an Android emulator is running or a device is connected.

📦 Libraries Used
react-native-webrtc – WebRTC for peer-to-peer media

@react-navigation/native – Navigation

@react-native-firebase/app and @react-native-firebase/database – Firebase integration

react-native-permissions – Runtime permissions

react-native-safe-area-context, react-native-gesture-handler, etc. – Navigation dependencies

🔗 Signaling Logic (Short Explanation)
Firebase Realtime Database is used as the signaling server.

When a user creates a room, it saves the offer SDP under /rooms/{roomId}.

The joining user reads that offer, creates an answer, and writes it back to the same path.

ICE candidates are exchanged under /rooms/{roomId}/callerCandidates and /calleeCandidates.

WebRTC handles the media connection once signaling is complete.

📸 Demo or Screenshots (Optional)
Screenshots Link:https://drive.google.com/drive/folders/1IBJIX0O_r8dEryKlCjlpwa5_B7R8jQSI?usp=sharing

👩‍💻 Author
Diksha
GitHub: dikshaa13900
Email: dikshaa4755@gmail.com

