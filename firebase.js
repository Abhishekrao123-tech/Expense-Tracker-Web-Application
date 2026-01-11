import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* Your Firebase config (this part IS correct 👍) */
const firebaseConfig = {
  apiKey: "AIzaSyC02NOl6vA4hH4VVpV8StbANPWUoKEDWJY",
  authDomain: "tracksmart-d76e6.firebaseapp.com",
  projectId: "tracksmart-d76e6",
  storageBucket: "tracksmart-d76e6.appspot.com",
  messagingSenderId: "593787653044",
  appId: "1:593787653044:web:6d7544cbb5a3dc6c8480e1",
};

/* Initialize Firebase */
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
