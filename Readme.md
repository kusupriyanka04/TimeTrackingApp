TimeTracker — 24-Hour Daily Activity & Productivity Logger

TimeTracker is a modern web app that helps users track, analyze, and visualize their daily activities using a clean Material-inspired UI.
The app uses Firebase Authentication + Firebase Realtime Database, and it is fully responsive across all devices.

🚀 Live Demo

👉 Live Website: https://github.com/kusupriyanka04/TimeTrackingApp/deployments/github-pages
👉 GitHub Repository: https://github.com/kusupriyanka04/TimeTrackingApp

🎥 Video Walkthrough

👉 Full 2–5 Minute Demo Video: https://drive.google.com/file/d/1P9lU3Fvwg-EuxbP_78vhpelyp0QWorqN/view?usp=drivesdk

The video shows:

Login & Signup (Email + Google Login)

Dashboard with No Data State

Adding activity data + editing + deleting

The 24-hour timeline visual

How AI tools helped in development

🛠️ Tech Stack
Frontend

HTML5

CSS3 (Material-inspired theme)

JavaScript (ES Modules)

Backend

Firebase Authentication

Firebase Realtime Database

Firebase Hosting (optional)

Tools

VS Code

AI Help (ChatGPT) for UI + Structuring + Debugging

Git & GitHub

⭐ Features
✔️ Authentication

Signup with Email & Password

Login with Email

One-click Google Login

Auth-guarded pages

Logout

✔️ Activity Tracking

Add daily activities (with time slots)

Edit / delete activity entries

Stored per-user in Firebase Realtime Database

Real-time updates

✔️ Dashboard

Summary of today’s time usage

Activity categories

“No data available” empty state

Clean analytics UI

✔️ Timeline Visualization

24-hour timeline bar

Highlights activity blocks

Auto-color per category

Responsive layout

✔️ UI/UX

Clean Material-style classic UI

Mobile-friendly

Smooth interactions

⚙️ How to Run the Project Locally
1️⃣ Clone the Repository
git clone <your-repo-url>
cd timetracker

2️⃣ Install Dependencies

If you're using Firebase Hosting or a local server:

npm install


If no Node tools are used → skip.

3️⃣ Add Your Firebase Configuration

Create:

/js/firebase.js


Paste your Firebase config:

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

4️⃣ Start Local Server

You CANNOT open index.html directly — Firebase modules WILL FAIL.

Run:

npx live-server


or

npx http-server


or use VS Code Live Server

Open:

http://localhost:5500/

🖼️ Screenshots

(Add screenshots here)

Example:

Login Page	Dashboard	Timeline

	
	
🔮 Future Improvements

Dark mode

Export weekly/monthly reports

AI-generated productivity suggestions

Multi-device sync enhancements

Offline mode (IndexedDB)