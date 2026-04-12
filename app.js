import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// NEW FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDXk9MbcJe2PwcS1ouaUFVEqvjpyXN1Lxc",
  authDomain: "dance-coach-a8bc4.firebaseapp.com",
  projectId: "dance-coach-a8bc4",
  storageBucket: "dance-coach-a8bc4.firebasestorage.app",
  messagingSenderId: "603967823913",
  appId: "1:603967823913:web:614741c2466626ae9dfc38",
  measurementId: "G-D43BK1KZPK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const userTag = document.getElementById('user-tag');

function handleLogin(userName) {
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    userTag.innerText = `👤 ${userName.toUpperCase()}`;
    initPoseDetection();
}

// Button Listeners
document.getElementById('google-btn').onclick = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const res = await signInWithPopup(auth, provider);
        handleLogin(res.user.displayName);
    } catch (err) { alert(err.message); }
};

document.getElementById('email-btn').onclick = async () => {
    const email = document.getElementById('email-input').value;
    const pass = document.getElementById('pass-input').value;
    if(!email || !pass) return alert("Enter credentials");

    try {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        handleLogin(res.user.email.split('@')[0]);
    } catch (err) {
        if(err.code === 'auth/user-not-found') {
            const reg = await createUserWithEmailAndPassword(auth, email, pass);
            handleLogin(reg.user.email.split('@')[0]);
        } else { alert(err.message); }
    }
};

// AI Engine
function initPoseDetection() {
    const video = document.getElementById('user-vid');
    const canvas = document.getElementById('pose-canvas');
    const ctx = canvas.getContext('2d');

    const pose = new Pose({locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`});
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5 });

    pose.onResults((res) => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (res.poseLandmarks) {
            drawConnectors(ctx, res.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
            drawLandmarks(ctx, res.poseLandmarks, {color: '#FF0000', radius: 2});
            document.getElementById('accuracy-txt').innerText = Math.round(res.poseLandmarks[0].visibility * 100) + "%";
        }
    });

    const camera = new Camera(video, {
        onFrame: async () => { await pose.send({image: video}); },
        width: 1280, height: 720
    });
    camera.start();
}

document.getElementById('vid-upload').onchange = (e) => {
    const file = e.target.files[0];
    if(file) document.getElementById('teacher-vid').src = URL.createObjectURL(file);
};
