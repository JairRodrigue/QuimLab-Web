import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAHwBhe-JQDNkbgr5wF-Ap8eWbHRw8tqzc",
    authDomain: "quimlab-b35f1.firebaseapp.com",
    databaseURL: "https://quimlab-b35f1-default-rtdb.firebaseio.com",
    projectId: "quimlab-b35f1",
    storageBucket: "quimlab-b35f1.appspot.com",
    messagingSenderId: "847530528705",
    appId: "1:847530528705:web:8ecce3728d69b9b0b06940",
    measurementId: "G-0LBVK3RHRC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

async function loadProfileData(userId) {
    try {
        const userDoc = await getDoc(doc(db, "usuarios", userId));

        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log(" Dados do usuário encontrados:", userData); 

            document.getElementById('user-name').textContent = userData.nome || "Nome do Usuário";
            document.getElementById('user-email').textContent = `Email: ${userData.email || ""}`;

            if (userData.imageUrl) {
                console.log("🖼️ URL da imagem salva no Firestore:", userData.imageUrl); 
                const profilePicRef = ref(storage, userData.imageUrl);
                try {
                    const url = await getDownloadURL(profilePicRef);
                    document.getElementById('profile-pic').src = url;
                } catch (error) {
                    console.warn(" Erro ao carregar imagem:", error);
                }
            }
        } else {
            console.warn(" Usuário não encontrado no Firestore.");
        }
    } catch (error) {
        console.error(" Erro ao carregar perfil:", error);
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadProfileData(user.uid);
    } else {
        console.error("Nenhum usuário autenticado. Redirecionando...");
        window.location.href = "login.html";
    }
});

document.querySelector(".alterar-btn[href='login.html']").addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
        alert("Você saiu da sua conta.");
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Erro ao sair:", error);
    });
});
