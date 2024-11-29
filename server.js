require("dotenv").config();

const path = require("path");
process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve(__dirname, "serviceAccountKey.json");

const express = require("express");
const rotasDeImagem = require("./rotas/rotasDeImagem"); 

const app = express();
app.use(express.json());

// Use as rotas no endpoint "/api"
app.use("/api", rotasDeImagem);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
