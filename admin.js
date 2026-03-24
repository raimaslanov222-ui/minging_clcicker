import { collection, query, where, getDocs, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function initAdmin(db) {
    const getTarget = async () => {
        const input = document.getElementById('adm-target').value;
        let q;
        if (input.startsWith('#')) {
            q = query(collection(db, "leaders"), where("id", "==", parseInt(input.replace('#',''))));
        } else {
            q = query(collection(db, "leaders"), where("name", "==", input));
        }
        const s = await getDocs(q);
        return s.empty ? null : s.docs[0];
    };

    // ВЫДАТЬ
    document.getElementById('adm-give').onclick = async () => {
        const target = await getTarget();
        const val = parseFloat(document.getElementById('adm-val').value);
        if(target) {
            await updateDoc(target.ref, { score: target.data().score + val });
            alert("Успешно зачислено!");
        } else alert("Игрок не найден");
    };

    // ШТРАФ
    document.getElementById('adm-fine').onclick = async () => {
        const target = await getTarget();
        const val = parseFloat(document.getElementById('adm-val').value);
        if(target) {
            await updateDoc(target.ref, { score: Math.max(0, target.data().score - val) });
            alert("Штраф применен");
        }
    };

    // ОБНУЛИТЬ
    document.getElementById('adm-reset').onclick = async () => {
        if(!confirm("Удалить весь прогресс?")) return;
        const target = await getTarget();
        if(target) {
            await updateDoc(target.ref, { score: 0, power: 1, mult: 1, auto: 0, c1: 10, c2: 100, c3: 500 });
            alert("Игрок сброшен до нуля");
        }
    };

    // БАН (по времени)
    document.getElementById('adm-ban').onclick = async () => {
        const target = await getTarget();
        const mins = parseInt(document.getElementById('adm-val').value);
        if(target) {
            const until = Date.now() + (mins * 60000);
            await updateDoc(target.ref, { banUntil: until });
            alert(`Игрок забанен на ${mins} мин.`);
        }
    };
}
