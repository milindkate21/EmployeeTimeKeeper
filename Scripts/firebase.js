import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getDatabase, // Import Realtime Database
  ref,
  get,
  set,
  remove,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase configuration (use environment variables for sensitive data)
const firebaseConfig = {
  apiKey: "AIzaSyArU6PEyblnb7RV0jYJh5OShtc1_hMs8BM",
  authDomain: "dragonflytimesheet.firebaseapp.com",
  projectId: "dragonflytimesheet",
  storageBucket: "dragonflytimesheet.firebasestorage.app",
  messagingSenderId: "93677915002",
  appId: "1:93677915002:web:90759e5841dd2e0337a4c3",
  measurementId: "G-9809N8YMW5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Realtime Database
const db = getDatabase(app);

// Submit button
const submitlogin = document.getElementById("submitlogin");

if (submitlogin) {
  submitlogin.addEventListener("click", function (event) {
    // Inputs
    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    event.preventDefault();

    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;

        // Fetch user data from Realtime Database
        const userRef = ref(db, "users/" + user.uid);

        console.log(userRef);

        get(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.val();
              // Store user role in localStorage
              console.log("User role ---->" + userData.role);
              localStorage.setItem("userRole", userData.role);
              localStorage.setItem("userId", user.uid);

              if (userData.role === "admin") {
                window.location.href = "/Pages/Home.html";
              } else {
                window.location.href = "/Pages/EmployeeHome.html";
              }
            } else {
              console.log("No user data found in the database!");
            }
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        document.getElementById(
          "error-message"
        ).innerText = `Error: ${errorMessage}`;
      });
  });
}

export { db, ref, get, set, remove };
