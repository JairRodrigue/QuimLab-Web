// Importando as funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Configuração do Firebase
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

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Função para enviar o e-mail de recuperação de senha
document.getElementById('buttonSendEmail').addEventListener('click', (event) => {
    event.preventDefault();
    
    const email = document.getElementById('editTextEmail').value.trim();
    const progressBar = document.getElementById('progressBar');

    if (!email) {
        alert('Por favor, insira um e-mail válido.');
        return;
    }

    // Exibe a barra de progresso
    progressBar.style.display = 'block';

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert('E-mail de recuperação enviado!');
            document.getElementById('editTextEmail').value = ''; // Limpa o campo de e-mail
        })
        .catch((error) => {
            let errorMessage;
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Esse e-mail não está cadastrado.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Formato de e-mail inválido.';
            } else {
                errorMessage = 'Erro ao enviar o e-mail. Tente novamente.';
            }
            alert(errorMessage);
        })
        .finally(() => {
            // Esconde a barra de progresso
            progressBar.style.display = 'none';
        });
});
