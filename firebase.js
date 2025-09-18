const firebaseConfig = {
  apiKey: secretapikey,
  authDomain: "avaliacao2-8c668.firebaseapp.com",
  projectId: "avaliacao2-8c668",
  storageBucket: "avaliacao2-8c668.firebasestorage.app",
  messagingSenderId: "286742107299",
  appId: "1:286742107299:web:d61e3cb40d43cdfac99b16"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();