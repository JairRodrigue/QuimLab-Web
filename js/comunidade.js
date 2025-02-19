// Obtendo os elementos necessários
const publishButton = document.querySelector("#publishBtn"); // Botão de publicação
const tweetContent = document.querySelector("#tweetContent"); // Área de texto para o tweet
const tweetsArea = document.querySelector("#tweetsArea"); // Área onde os tweets aparecerão

// Função para criar um tweet e adicioná-lo ao feed
function createTweet(content) {
  const tweetElement = document.createElement("div");
  tweetElement.classList.add("card", "mb-3");

  // HTML do tweet
  tweetElement.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">Você</h5>
      <p class="card-text">${content}</p>
      <button class="btn btn-outline-primary btn-sm" onclick="showReplyBox(this)">Responder</button>
      <div class="reply-section" style="display: none;">
        <textarea class="form-control mt-2" placeholder="Escreva sua resposta..."></textarea>
        <button class="btn btn-primary btn-sm mt-2" onclick="publishReply(this)">Responder</button>
      </div>
    </div>
  `;

  // Adiciona o tweet no topo da área de conteúdo
  tweetsArea.prepend(tweetElement);
}

// Função para mostrar a caixa de resposta
function showReplyBox(button) {
  const replySection = button.closest('.card-body').querySelector('.reply-section');
  replySection.style.display = 'block'; // Exibe a caixa de resposta
}

// Função para publicar uma resposta
function publishReply(button) {
  const replyText = button.closest('.card-body').querySelector('textarea').value.trim();

  if (replyText) {
    const replyElement = document.createElement("div");
    replyElement.classList.add("card", "mb-2", "ml-4"); // Adiciona um estilo para as respostas

    // HTML da resposta
    replyElement.innerHTML = `
      <div class="card-body">
        <h6 class="card-title">Você (Resposta)</h6>
        <p class="card-text">${replyText}</p>
      </div>
    `;

    // Adiciona a resposta abaixo do tweet
    button.closest('.card-body').appendChild(replyElement);
    button.closest('.reply-section').style.display = 'none'; // Oculta a caixa de resposta após responder
    button.closest('.reply-section').querySelector('textarea').value = ''; // Limpa o campo de resposta
  } else {
    alert("Por favor, escreva algo para responder.");
  }
}

// Adiciona o evento de clique no botão de "Publicar"
publishButton.addEventListener("click", function() {
  const tweetText = tweetContent.value.trim(); // Captura o texto do campo

  // Verifica se o campo de texto não está vazio
  if (tweetText) {
    createTweet(tweetText); // Cria e adiciona o tweet
    tweetContent.value = ""; // Limpa o campo de texto após a publicação
  } else {
    alert("Por favor, escreva algo para publicar."); // Alerta se o campo estiver vazio
  }
});
