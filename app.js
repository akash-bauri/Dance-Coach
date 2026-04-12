import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Vetted Config for dance-coach-a8bc4
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

// Google Sign-In Logic
const googleBtn = document.getElementById('google-btn');
if (googleBtn) {
    googleBtn.onclick = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const res = await signInWithPopup(auth, provider);
            alert("Welcome " + res.user.displayName);
            window.location.reload(); 
        } catch (err) {
            alert("Firebase Error: " + err.message);
        }
    };
}

// Email Sign-In / Sign-Up Logic
const emailBtn = document.getElementById('email-btn');
if (emailBtn) {
    emailBtn.onclick = async () => {
        const email = document.getElementById('email-input').value;
        const pass = document.getElementById('pass-input').value;

        if (!email || !pass) return alert("Fill in all fields");

        try {
            await signInWithEmailAndPassword(auth, email, pass);
            alert("Logged in!");
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                try {
                    await createUserWithEmailAndPassword(auth, email, pass);
                    alert("Account created and logged in!");
                } catch (e) { alert(e.message); }
            } else {
                alert(err.message);
            }
        }
    };
}
