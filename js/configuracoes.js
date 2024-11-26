import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


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
const analytics = getAnalytics(app);
  
 // Função para salvar as configurações no Firestore e redirecionar para o login
function salvarConfiguracoes() {
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
  
    // Definindo as configurações
    const configuracoes = {
      nome: nome,
      email: email,
      senha: senha,
      notificacoes: notificacoes,
      tema: temaClaro ? "claro" : (temaEscuro ? "escuro" : "claro"),
    };
  
    // Salvando no Firestore
    db.collection("usuarios").doc(email).set(configuracoes)
      .then(() => {
        alert("Configurações salvas com sucesso!");
        
        // Redirecionar para a página de login
        window.location.href = "login.html"; // Substitua pelo caminho correto do seu arquivo de login
      })
      .catch((error) => {
        console.error("Erro ao salvar as configurações: ", error);
        alert("Erro ao salvar as configurações.");
      });
  }
  
  // Adicionando o evento de envio do formulário
  const form = document.querySelector(".config-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Evitar envio padrão do formulário
    salvarConfiguracoes(); // Salvar as configurações e redirecionar

});
  