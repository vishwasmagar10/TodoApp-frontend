TodoApp Frontend - README
Project Overview
This is the frontend mobile application for the TodoApp project, built using React Native. The app allows users to register, login, and manage their personal tasks securely.
Tech Stack
• React Native
• TypeScript
• Axios (API requests)
• AsyncStorage (Token storage)
• React Navigation
Features
• User Registration
• User Login with JWT Authentication
• Add Task
• Update Task
• Delete Task
• View Active & Completed Tasks
• Secure API integration with backend
Project Structure
src/
  ├── screens/
  ├── components/
  ├── navigation/
  ├── services/
android/
ios/
App.tsx
package.json
Backend Integration
The frontend communicates with the deployed backend API using Axios. JWT tokens are stored securely using AsyncStorage and sent in request headers for protected routes.
How to Run the Project
1. Install dependencies:
   npm install
2. Start Metro server:
   npx react-native start
3. Run on Android:
   npx react-native run-android
4. Build release APK:
   cd android
   gradlew assembleRelease
Release APK Location
android/app/build/outputs/apk/release/app-release.apk
Author
Vishwas Magar
