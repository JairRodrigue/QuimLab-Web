// Importando Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, updateEmail, updatePassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

// Função para salvar configurações
async function salvarConfiguracoes(user) {
  const nome = document.getElementById("nome").value;
  const novoEmail = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmar-senha").value;
  const notificacoes = document.getElementById("notificacoes").checked;

  // Validação dos campos
  if (!nome || !novoEmail) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  if (senha && senha !== confirmarSenha) {
    alert("As senhas não coincidem.");
    return;
  }

  try {
    // Atualizar e-mail no Firebase Authentication
    if (novoEmail !== user.email) {
      await updateEmail(user, novoEmail);
      console.log("Email atualizado com sucesso!");
    }

    // Atualizar senha no Firebase Authentication
    if (senha) {
      await updatePassword(user, senha);
      console.log("Senha atualizada com sucesso!");
    }
  } catch (error) {
    console.error("Erro ao atualizar dados do usuário:", error);
    alert("Erro ao atualizar os dados. Faça login novamente e tente novamente.");
    return;
  }

  // Definindo dados a serem salvos no Firestore
  const configuracoes = {
    nome: nome,
    email: novoEmail,
    notificacoes: notificacoes
  };

  try {
    await setDoc(doc(db, "usuarios", user.uid), configuracoes, { merge: true });
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
    console.log("Usuário autenticado:", user.uid);
    document.querySelector(".config-form").addEventListener("submit", (e) => {
      e.preventDefault();
      salvarConfiguracoes(user);
    });
  } else {
    console.error("Nenhum usuário autenticado.");
    alert("Usuário não autenticado. Redirecionando para login.");
    window.location.href = "login.html";
  }
});

// Função para logout
document.getElementById("logout-btn").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("Você saiu da sua conta.");
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Erro ao sair:", error);
    });
});
