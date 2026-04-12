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

function onLogin(name) {
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    userTag.innerText = name;
    startAI();
}

// GOOGLE SIGN-IN
document.getElementById('google-btn').onclick = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const res = await signInWithPopup(auth, provider);
        onLogin(res.user.displayName);
    } catch (err) { alert(err.message); }
};

// EMAIL SIGN-IN
document.getElementById('email-btn').onclick = async () => {
    const email = document.getElementById('email-input').value;
    const pass = document.getElementById('pass-input').value;
    try {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        onLogin(res.user.email);
    } catch (err) {
        if (err.code === 'auth/user-not-found') {
            const reg = await createUserWithEmailAndPassword(auth, email, pass);
            onLogin(reg.user.email);
        } else { alert(err.message); }
    }
};

// MEDIA PIPE POSE LOGIC
function startAI() {
    const videoElement = document.getElementById('user-vid');
    const canvasElement = document.getElementById('pose-canvas');
    const canvasCtx = canvasElement.getContext('2d');

    const pose = new Pose({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`});
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5 });

    pose.onResults((results) => {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        if (results.poseLandmarks) {
            drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
            drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#FF0000', lineWidth: 2});
            document.getElementById('accuracy-txt').innerText = Math.round(results.poseLandmarks[0].visibility * 100) + "%";
        }
    });

    const camera = new Camera(videoElement, {
        onFrame: async () => { await pose.send({image: videoElement}); },
        width: 1280, height: 720
    });
    camera.start();
}
