import { collection, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function initAdmin(db) {
    const giveBtn = document.getElementById('adm-give');
    const resetBtn = document.getElementById('adm-reset');

    giveBtn.onclick = async () => {
        const id = parseInt(document.getElementById('adm-id').value);
        const sum = parseFloat(document.getElementById('adm-sum').value);
        
        const q = query(collection(db, "leaders"), where("id", "==", id));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
            const userRef = snap.docs[0].ref;
            const currentScore = snap.docs[0].data().score || 0;
            await updateDoc(userRef, { score: currentScore + sum });
            alert("Выдано успешно!");
        } else {
            alert("Игрок не найден");
        }
    };

    resetBtn.onclick = async () => {
        const id = parseInt(document.getElementById('adm-id').value);
        const q = query(collection(db, "leaders"), where("id", "==", id));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
            await updateDoc(snap.docs[0].ref, { score: 0, power: 1, mult: 1, auto: 0 });
            alert("Игрок обнулен");
        }
    };
}
