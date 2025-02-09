// Importando Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, updateEmail } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Função para salvar configurações
async function salvarConfiguracoes(user) {
  const nome = document.getElementById("nome").value;
  const novoEmail = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmar-senha").value;
  const notificacoes = document.getElementById("notificacoes").checked;
  const temaClaro = document.getElementById("tema-claro").checked;
  const temaEscuro = document.getElementById("tema-escuro").checked;

  // Validação dos campos
  if (!nome || !novoEmail || !senha || !confirmarSenha) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem.");
    return;
  }

  // Atualizar email no Firebase Authentication
  try {
    await updateEmail(user, novoEmail);
    console.log(" Email atualizado com sucesso!");
  } catch (error) {
    console.error(" Erro ao atualizar email:", error);
    alert("Erro ao atualizar email.");
    return;
  }

  // Definindo dados a serem salvos no Firestore
  const configuracoes = {
    nome: nome,
    email: novoEmail,
    senha: senha,
    notificacoes: notificacoes,
    tema: temaClaro ? "claro" : (temaEscuro ? "escuro" : "claro"),
  };

  // Salvando configurações no Firestore usando UID como identificador
  try {
    await setDoc(doc(db, "usuarios", user.uid), configuracoes);
    alert("Configurações salvas com sucesso!");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    alert("Erro ao salvar as configurações.");
  }
}

// Verifica se o usuário está autenticado e adiciona evento ao formulário
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log(" Usuário autenticado:", user.uid);
    document.querySelector(".config-form").addEventListener("submit", (e) => {
      e.preventDefault();
      salvarConfiguracoes(user);
    });
  } else {
    console.error(" Nenhum usuário autenticado.");
    alert("Usuário não autenticado. Redirecionando para login.");
    window.location.href = "login.html";
  }
});
