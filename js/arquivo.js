function clickUploadButton(){
    document.getElementById('responseBox').style.display = 'none';
    document.getElementById('fileInput').click();
};

// Aparecer a prévia da foto selecionada
document.getElementById('fileInput').addEventListener('change', function (event) {
    const files = event.target.files;
    const preview = document.getElementById('preview');

    preview.innerHTML = '';

    for (const file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = "150px";
                img.style.maxHeight = "150px";
                img.style.margin = "5px";
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    }
});

// Função para enviar a imagem para a API
document.getElementById('sendButton').addEventListener('click', async function () {
    const fileInput = document.getElementById('fileInput');
    const responseBox = document.getElementById('responseBox');

    if (fileInput.files.length === 0) {
        responseBox.innerHTML = "<p style='color: red;'>Nenhuma imagem selecionada.</p>";
        responseBox.style.display = 'block';
        return;
    }

    const file = fileInput.files[0]; // Pega o primeiro arquivo
    const formData = new FormData();
    formData.append('image', file); // Nome do campo deve ser 'image' conforme a API

    try {
        document.getElementById('sendButton').innerText = "Carregando...";
        
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        document.getElementById('sendButton').innerText = "Enviar Imagem";

        if (response.ok) {
            responseBox.innerHTML = `
                <p style="color: green;"><strong>${result.message}</strong></p>
                <p><strong>Descrição:</strong> ${result.descricaoImagem}</p>
            `;
        } else {
            responseBox.innerHTML = `<p style="color: red;">Erro: ${result.error}</p>`;
        }
    } catch (error) {
        console.error("Erro ao enviar imagem:", error);
        responseBox.innerHTML = `<p style="color: red;">Erro ao conectar com o servidor.</p>`;
    }

    responseBox.style.display = 'block';
});
