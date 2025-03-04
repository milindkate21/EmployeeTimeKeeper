import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getDatabase, // Import Realtime Database
  ref,
  get,
  set,
  remove,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase configuration (use environment variables for sensitive data)
// const firebaseConfig = {
//   apiKey: "AIzaSyAq6b4Y26h8bqO4LbeahGYXjuL-sluZc8U",
//   authDomain: "employeetimesheetdemo.firebaseapp.com",
//   projectId: "employeetimesheetdemo",
//   storageBucket: "employeetimesheetdemo.firebasestorage.app",
//   messagingSenderId: "864588906259",
//   appId: "1:864588906259:web:6e0ab3c1ff73add281e4e6",
//   measurementId: "G-YXBQ3GJP25",
// };

//Testing purpose connection start ----
const firebaseConfig = {
  apiKey: "AIzaSyAN7_DJKfesa99kwPDyWOXj3LncA2Ye4X8",
  authDomain: "testingtimesheet-ae67a.firebaseapp.com",
  projectId: "testingtimesheet-ae67a",
  storageBucket: "testingtimesheet-ae67a.firebasestorage.app",
  messagingSenderId: "123762253279",
  appId: "1:123762253279:web:fe472a348b76136b80f86a",
  measurementId: "G-YEDT86GR69",
};
//Testing purpose connection end ----

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

        console.log("User Reference" + userRef);

        get(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.val();
              // Store user role in localStorage
              console.log("User role ---->" + userData.role);
              localStorage.setItem("userRole", userData.role);
              localStorage.setItem("userId", user.uid);
              localStorage.setItem("username", userData.username);

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

export { db, ref, get, set, remove, getAuth, onAuthStateChanged };
