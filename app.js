// Firebase CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDXk9MbcJe2PwcS1ouaUFVEqvjpyXN1Lxc",
  authDomain: "dance-coach-a8bc4.firebaseapp.com",
  projectId: "dance-coach-a8bc4",
  storageBucket: "dance-coach-a8bc4.firebasestorage.app",
  messagingSenderId: "603967823913",
  appId: "1:603967823913:web:614741c2466626ae9dfc38"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// UI
const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("appPage");

const video = document.getElementById("video");
const scoreText = document.getElementById("score");


// LOGIN
document.getElementById("emailLogin").onclick = async () => {
  await signInWithEmailAndPassword(auth, email.value, password.value);
};

document.getElementById("googleLogin").onclick = async () => {
  await signInWithPopup(auth, provider);
};

window.logout = async () => {
  await signOut(auth);
};

// SESSION
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginPage.classList.add("hidden");
    appPage.classList.remove("hidden");
  } else {
    loginPage.classList.remove("hidden");
    appPage.classList.add("hidden");
  }
});


// 📊 CHART
const ctx = document.getElementById("chart").getContext("2d");
let dataPoints = [];

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{ label: "Score", data: [] }]
  }
});


// 🤖 FIXED POSE (IMPORTANT FIX)
let pose;

function initPose() {
  pose = new Pose({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
  });

  pose.onResults(onResults);
}


// 🎥 CAMERA
window.startCamera = async () => {
  initPose();

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  const camera = new Camera(video, {
    onFrame: async () => {
      await pose.send({ image: video });
    },
    width: 640,
    height: 480
  });

  camera.start();
};


// 🎥 VIDEO UPLOAD
window.useUploadedVideo = () => {
  initPose();

  const file = document.getElementById("uploadVideo").files[0];
  if (!file) {
    alert("Upload a video first!");
    return;
  }

  video.srcObject = null;
  video.src = URL.createObjectURL(file);
  video.play();

  video.onplay = () => {
    processVideo();
  };
};

async function processVideo() {
  while (!video.paused && !video.ended) {
    await pose.send({ image: video });
    await new Promise(r => setTimeout(r, 100));
  }
}


// 🧠 SCORE
function calculateScore(landmarks) {
  let score = 0;
  landmarks.forEach(l => score += l.visibility);
  return Math.floor((score / landmarks.length) * 100);
}


// 🎯 RESULTS
function onResults(results) {
  if (!results.poseLandmarks) return;

  const score = calculateScore(results.poseLandmarks);
  scoreText.innerText = score;

  dataPoints.push(score);
  if (dataPoints.length > 20) dataPoints.shift();

  chart.data.labels = dataPoints.map((_, i) => i);
  chart.data.datasets[0].data = dataPoints;
  chart.update();
}
