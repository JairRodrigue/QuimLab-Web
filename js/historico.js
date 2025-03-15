import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
    import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
  
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
    const db = getFirestore(app);
  
    async function carregarHistorico() {
      const querySnapshot = await getDocs(collection(db, "perguntas_respostas"));
      let historicoHTML = "";
      
      querySnapshot.forEach((doc) => {
        const dados = doc.data();
        historicoHTML += `<div class="p-2 border-bottom">
                            <strong>Pergunta:</strong> ${dados.pergunta} <br>
                            <strong>Resposta:</strong> ${dados.resposta}
                          </div>`;
      });
  
      document.getElementById("historico").innerHTML = historicoHTML;
    }
  
    window.onload = carregarHistorico;
