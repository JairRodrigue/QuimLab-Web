// Importando os módulos do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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

// Inicializando Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Selecionando elementos do DOM
const form = document.querySelector('.form');
const editTextFullName = document.getElementById('editTextFullName');
const editTextEmail = document.getElementById('editTextEmail');
const editTextPassword = document.getElementById('editTextPassword');
const editTextConfirmPassword = document.getElementById('editTextConfirmPassword');
const buttonSignup = document.getElementById('buttonSignup');

// Função para exibir mensagens de erro
function mostrarMensagemErro(mensagem) {
  alert(mensagem);
}

// Validação de e-mail
function isEmailValido(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

// Evento de envio do formulário
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const nome = editTextFullName.value.trim();
  const email = editTextEmail.value.trim();
  const senha = editTextPassword.value.trim();
  const confirmarSenha = editTextConfirmPassword.value.trim();

  // Validações de campos
  if (!nome || !email || !senha || !confirmarSenha) {
    mostrarMensagemErro("Por favor, preencha todos os campos.");
    return;
  }
  if (!isEmailValido(email)) {
    mostrarMensagemErro("E-mail inválido.");
    return;
  }
  if (senha.length < 6 || !/[A-Za-z]/.test(senha) || !/[0-9]/.test(senha)) {
    mostrarMensagemErro("A senha deve ter pelo menos 6 caracteres, incluindo uma letra e um número.");
    return;
  }
  if (senha !== confirmarSenha) {
    mostrarMensagemErro("As senhas não coincidem.");
    return;
  }

  try {
    // Criando o usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Enviando e-mail de verificação
    await sendEmailVerification(user);
    
    // Salvando os dados do usuário no Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      nome: nome,
      email: email
    });

    alert("Cadastro realizado com sucesso! Verifique seu e-mail para ativação.");
    form.reset();

  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      mostrarMensagemErro("Esse e-mail já está em uso por outra conta.");
    } else {
      mostrarMensagemErro(error.message || "Erro desconhecido.");
    }
  }
});
