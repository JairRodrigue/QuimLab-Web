import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, updatePassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAHwBhe-JQDNkbgr5wF-Ap8eWbHRw8tqzc",
  authDomain: "quimlab-b35f1.firebaseapp.com",
  databaseURL: "https://quimlab-b35f1-default-rtdb.firebaseio.com",
  projectId: "quimlab-b35f1",
  storageBucket: "quimlab-b35f1.appspot.com",
  messagingSenderId: "847530528705",
  appId: "1:847530528705:web:8ecce3728d69b9b0b06940",
  measurementId: "G-0LBVK3RHRC",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Função para salvar as configurações e redirecionar para o login
async function salvarConfiguracoes() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmar-senha").value;
  const notificacoes = document.getElementById("notificacoes").checked;
  const temaClaro = document.getElementById("tema-claro").checked;
  const temaEscuro = document.getElementById("tema-escuro").checked;

  // Validação dos campos
  if (!nome || !email || !senha || !confirmarSenha) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem.");
    return;
  }

  // Atualizando a senha do usuário autenticado
  try {
    const user = auth.currentUser;
    if (user) {
      await updatePassword(user, senha);
    } else {
      alert("Usuário não autenticado. Faça login novamente.");
      return;
    }
  } catch (error) {
    console.error("Erro ao alterar a senha: ", error);
    alert("Erro ao alterar a senha. Tente novamente.");
    return;
  }

  // Salvando configurações no Firestore
  const configuracoes = {
    nome: nome,
    email: email,
    notificacoes: notificacoes,
    tema: temaClaro ? "claro" : temaEscuro ? "escuro" : "claro",
  };

  try {
    const docRef = doc(db, "usuarios", email);
    await setDoc(docRef, configuracoes);
    alert("Configurações salvas com sucesso!");

    // Armazenar a preferência de tema no localStorage
    localStorage.setItem("tema", configuracoes.tema);

    // Redirecionar para a página de login com mensagem
    window.location.href = "login.html?mensagem=senha_alterada_sucesso";
  } catch (error) {
    console.error("Erro ao salvar as configurações: ", error);
    alert("Erro ao salvar as configurações.");
  }
}

// Função para aplicar o tema com base no localStorage
function aplicarTema() {
  const tema = localStorage.getItem("tema") || "claro";
  document.body.className = tema;
}

// Adicionando o evento de envio do formulário
document.addEventListener("DOMContentLoaded", () => {
  aplicarTema();

  const form = document.querySelector(".config-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Evitar envio padrão do formulário
    salvarConfiguracoes(); // Salvar as configurações e redirecionar
  });
});
