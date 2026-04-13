// 🔥 Firebase CDN (WORKS IN BROWSER)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ✅ YOUR FIREBASE CONFIG (ADDED CORRECTLY)
const firebaseConfig = {
  apiKey: "AIzaSyDXk9MbcJe2PwcS1ouaUFVEqvjpyXN1Lxc",
  authDomain: "dance-coach-a8bc4.firebaseapp.com",
  projectId: "dance-coach-a8bc4",
  storageBucket: "dance-coach-a8bc4.firebasestorage.app",
  messagingSenderId: "603967823913",
  appId: "1:603967823913:web:614741c2466626ae9dfc38",
  measurementId: "G-D43BK1KZPK"
};


// 🔥 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


// 📌 UI ELEMENTS
const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("appPage");

const email = document.getElementById("email");
const password = document.getElementById("password");

const scoreText = document.getElementById("score");
const video = document.getElementById("video");


// ✅ EMAIL LOGIN (WITH ERROR HANDLING)
document.getElementById("emailLogin").onclick = async () => {
  try {
    if (!email.value || !password.value) {
      alert("Enter email & password");
      return;
    }

    await signInWithEmailAndPassword(auth, email.value, password.value);
  } catch (err) {
    alert("Login Error: " + err.message);
  }
};


// ✅ GOOGLE LOGIN
document.getElementById("googleLogin").onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    alert("Google Login Error: " + err.message);
  }
};


// ✅ LOGOUT
window.logout = async () => {
  await signOut(auth);
};


// ✅ SESSION HANDLING (VERY IMPORTANT)
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginPage.classList.add("hidden");
    appPage.classList.remove("hidden");
  } else {
    loginPage.classList.remove("hidden");
    appPage.classList.add("hidden");
  }
});


// 📊 CHART SETUP
const ctx = document.getElementById("chart").getContext("2d");
let dataPoints = [];

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Dance Score",
      data: [],
      borderWidth: 2
    }]
  }
});


// 🤖 MEDIAPIPE POSE SETUP
let pose;

window.startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    pose = new Pose.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.onResults(onResults);

    const camera = new Camera(video, {
      onFrame: async () => {
        await pose.send({ image: video });
      },
      width: 640,
      height: 480
    });

    camera.start();

  } catch (err) {
    alert("Camera Error: " + err.message);
  }
};


// 🧠 AI SCORE LOGIC
function calculateScore(landmarks) {
  let score = 0;

  landmarks.forEach((lm) => {
    score += lm.visibility;
  });

  return Math.floor((score / landmarks.length) * 100);
}


// 🎯 RESULTS HANDLER
function onResults(results) {
  if (!results.poseLandmarks) return;

  const score = calculateScore(results.poseLandmarks);

  scoreText.innerText = score;

  // Update graph
  dataPoints.push(score);
  if (dataPoints.length > 20) dataPoints.shift();

  chart.data.labels = dataPoints.map((_, i) => i);
  chart.data.datasets[0].data = dataPoints;
  chart.update();
}
