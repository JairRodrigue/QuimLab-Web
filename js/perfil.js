import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

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
            console.log("Dados do usuário encontrados:", userData);

            document.getElementById('user-name').textContent = userData.nome || "Nome do Usuário";
            document.getElementById('user-email').textContent = `Email: ${userData.email || ""}`;

            if (userData.imageUrl) {
                console.log("🖼️ URL da imagem salva no Firestore:", userData.imageUrl);
                document.getElementById('profile-pic').src = userData.imageUrl;
            }
        } else {
            console.warn("Usuário não encontrado no Firestore.");
        }
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
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

// Função para fazer o upload da foto de perfil
document.getElementById("save-profile").addEventListener("click", async () => {
    const user = auth.currentUser;
    const fileInput = document.getElementById("profile-pic-upload");
    const file = fileInput.files[0];

    if (file && user) {
        // Cria um nome único para a foto
        const fileName = `profile_pictures/${user.uid}_${Date.now()}`;
        const storageRef = ref(storage, fileName);

        // Faz o upload do arquivo para o Firebase Storage
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on("state_changed", 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Progresso do upload: " + progress + "%");
            }, 
            (error) => {
                console.error("Erro no upload da imagem:", error);
            }, 
            async () => {
                // Obtém a URL da imagem
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log("Imagem carregada com sucesso:", downloadURL);

                // Atualiza a URL da imagem no Firestore
                await updateDoc(doc(db, "usuarios", user.uid), {
                    imageUrl: downloadURL
                });

                // Atualiza a imagem de perfil na página
                document.getElementById('profile-pic').src = downloadURL;

                alert("Foto de perfil atualizada com sucesso!");
            }
        );
    } else {
        alert("Por favor, selecione uma foto.");
    }
});

// Função para fazer logout corretamente
document.getElementById("logout-btn").addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
        alert("Você saiu da sua conta.");
        window.location.href = "login.html";
        // Impede que o usuário volte para a página anterior
        history.pushState(null, null, "login.html");
    }).catch((error) => {
        console.error("Erro ao sair:", error);
    });
});
