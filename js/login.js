// Importa as funções necessárias do Firebase
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

// Configurações do Firebase
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

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Função para lidar com o login
document.getElementById("buttonLogin").addEventListener("click", (e) => {
    e.preventDefault(); // Previne o comportamento padrão de submit do form

    // Obtém os valores dos campos de email e senha
    const email = document.getElementById("editTextUsername").value;
    const password = document.getElementById("editTextPassword").value;

    // Realiza o login com email e senha
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Login bem-sucedido
            window.location.href = "/html/inicio.html"; // Redireciona para a página inicial
        })
        .catch((error) => {
            // Em caso de erro, exibe uma mensagem apropriada
            const errorMessage = error.message;
            alert("Erro ao fazer login: " + errorMessage);
        });
});
