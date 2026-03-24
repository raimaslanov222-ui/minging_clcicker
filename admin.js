import { collection, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function initAdmin(db, currentPlayer) {
    const adminTab = document.getElementById('admin-tab');
    
    adminTab.innerHTML = `
        <div class="admin-panel" style="background:#000; padding:20px; border-radius:15px; border:1px solid red;">
            <h2 style="color:red; margin-bottom:20px;">SYSTEM OVERRIDE</h2>
            <input type="number" id="adm-target-id" placeholder="User Game ID" style="width:100%; padding:10px; margin-bottom:10px; background:#111; color:#fff; border:1px solid #333;">
            <input type="number" id="adm-amount" placeholder="Amount" style="width:100%; padding:10px; margin-bottom:10px; background:#111; color:#fff; border:1px solid #333;">
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <button id="adm-give" style="background:green; color:#fff; padding:10px; border:none; border-radius:5px;">GIVE MONEY</button>
                <button id="adm-take" style="background:orange; color:#fff; padding:10px; border:none; border-radius:5px;">TAKE MONEY</button>
                <button id="adm-ban" style="background:red; color:#fff; padding:10px; border:none; border-radius:5px; grid-column: span 2;">BAN USER (RESET)</button>
            </div>
        </div>
    `;

    document.getElementById('adm-give').onclick = () => runCommand('give', db);
    document.getElementById('adm-take').onclick = () => runCommand('take', db);
    document.getElementById('adm-ban').onclick = () => runCommand('ban', db);
}

async function runCommand(type, db) {
    const targetId = parseInt(document.getElementById('adm-target-id').value);
    const amount = parseFloat(document.getElementById('adm-amount').value) || 0;
    
    const q = query(collection(db, "leaders"), where("gameId", "==", targetId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return alert("User not found!");
    
    const userDoc = querySnapshot.docs[0];
    const userRef = userDoc.ref;
    const userData = userDoc.data();
    
    let update = {};
    if(type === 'give') update.balance = (userData.balance || 0) + amount;
    if(type === 'take') update.balance = Math.max(0, (userData.balance || 0) - amount);
    if(type === 'ban') update = { balance: 0, power: 1, mult: 1, xp: 0 };

    await updateDoc(userRef, update);
    alert("Command Executed!");
}
