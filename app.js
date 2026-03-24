import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = { /* ТВОЙ КОНФИГ ТУТ */ };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "raimaslanov222@gmail.com";

let user = {
    score: 0, power: 1, mult: 1, auto: 0, 
    c1: 10, c2: 100, c3: 500, name: "Игрок", id: 0
};

// --- АВТОРИЗАЦИЯ И ПРОВЕРКА АДМИНА ---
onAuthStateChanged(auth, async (u) => {
    if (u) {
        // Если зашел ты - показываем кнопку админки
        if (u.email === ADMIN_EMAIL) {
            document.getElementById('open-admin').style.display = 'block';
            import('./admin.js').then(m => m.initAdmin(db)); // Динамически грузим админку
        }

        const snap = await getDoc(doc(db, "leaders", u.uid));
        if (snap.exists()) {
            user = { ...user, ...snap.data() };
        } else {
            user.id = Math.floor(1000 + Math.random() * 9000);
            await setDoc(doc(db, "leaders", u.uid), user);
        }
        updateUI();
        startAutoLoop();
    }
});

// --- ГЕЙМПЛЕЙ ---
document.getElementById('main-clicker').onclick = () => {
    user.score += (user.power * user.mult);
    updateUI();
};

function updateUI() {
    document.getElementById('balance').innerText = formatNum(user.score);
    document.getElementById('click-val').innerText = "+" + formatNum(user.power * user.mult);
    document.getElementById('mult-val').innerText = "x" + user.mult;
    document.getElementById('auto-val').innerText = formatNum(user.auto);
    document.getElementById('user-tag').innerText = `${user.name} | ID: #${user.id}`;
    
    document.getElementById('cost-p').innerText = formatNum(user.c1);
    document.getElementById('cost-m').innerText = formatNum(user.c2);
    document.getElementById('cost-a').innerText = formatNum(user.c3);
}

function formatNum(n) {
    if (n >= 1e6) return (n/1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n/1e3).toFixed(1) + "K";
    return Math.floor(n);
}

// --- МАГАЗИН ---
document.getElementById('buy-power').onclick = () => buy('power');
document.getElementById('buy-mult').onclick = () => buy('mult');
document.getElementById('buy-auto').onclick = () => buy('auto');

function buy(type) {
    if (type === 'power' && user.score >= user.c1) {
        user.score -= user.c1; user.power++; user.c1 *= 2;
    }
    // ... логика для остальных
    updateUI();
    save();
}

// --- ОКНА ---
document.querySelectorAll('.close-modal').forEach(b => {
    b.onclick = () => document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
});

document.getElementById('open-settings').onclick = () => document.getElementById('modal-settings').style.display = 'flex';
document.getElementById('open-admin').onclick = () => document.getElementById('modal-admin').style.display = 'flex';

function save() {
    if (auth.currentUser) updateDoc(doc(db, "leaders", auth.currentUser.uid), user);
}
