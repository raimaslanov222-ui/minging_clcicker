import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// КОНФИГУРАЦИЯ (Вставь свою)
const firebaseConfig = {
    apiKey: "AIzaSyA6v-Qacyh1dDl7J8-XsQY6NxcGcNzBt9o",
    authDomain: "mindingclicker.firebaseapp.com",
    projectId: "mindingclicker",
    storageBucket: "mindingclicker.firebasestorage.app",
    messagingSenderId: "484824275063",
    appId: "1:484824275063:web:b98565344eea2760a34e72"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "raimaslanov222@gmail.com";

// Состояние игрока
let player = {
    balance: 0,
    power: 1,
    mult: 1,
    auto: 0,
    lvl: 1,
    xp: 0,
    gameId: 0
};

// --- СИСТЕМА ВХОДА ---
document.getElementById('btn-login').onclick = async () => {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    if(!email || !pass) return alert("Fill fields!");
    
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) { alert("Error: " + e.message); }
};

document.getElementById('btn-register').onclick = async () => {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        const newPlayer = { ...player, email: email, gameId: Math.floor(1000 + Math.random() * 9000) };
        await setDoc(doc(db, "leaders", res.user.uid), newPlayer);
    } catch (e) { alert("Registration failed"); }
};

// --- ГЛАВНЫЙ ЦИКЛ ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'flex';
        
        // Загрузка данных
        const snap = await getDoc(doc(db, "leaders", user.uid));
        if (snap.exists()) player = snap.data();
        
        // Проверка на админа
        if (user.email === ADMIN_EMAIL) {
            document.getElementById('admin-nav').style.display = 'block';
            import('./admin.js').then(module => module.initAdmin(db, player));
        }
        
        startHeartbeat();
        uiLoop();
    }
});

function uiLoop() {
    document.getElementById('balance').innerText = Math.floor(player.balance).toLocaleString();
    document.getElementById('stat-power').innerText = player.power;
    document.getElementById('stat-mult').innerText = "x" + player.mult;
    document.getElementById('stat-auto').innerText = player.auto;
    requestAnimationFrame(uiLoop);
}

// Клик
document.getElementById('click-target').onclick = () => {
    player.balance += (player.power * player.mult);
    player.xp += 1;
    checkLevel();
};

function checkLevel() {
    const nextXp = player.lvl * 500;
    if(player.xp >= nextXp) {
        player.lvl++;
        player.xp = 0;
        alert("Level Up: " + player.lvl);
    }
}

// Выход
document.getElementById('btn-logout').onclick = () => signOut(auth).then(() => location.reload());

// Сохранение раз в 10 сек
function startHeartbeat() {
    setInterval(() => {
        if(auth.currentUser) {
            updateDoc(doc(db, "leaders", auth.currentUser.uid), player);
        }
    }, 10000);
}
