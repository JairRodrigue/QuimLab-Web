import dotenv from "dotenv";
dotenv.config();

import { resolve } from "path";
process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS || resolve(__dirname, "serviceAccountKey.json");

import express, { json } from "express";
import rotasDeImagem from "./rotas/rotasDeImagem.js"; 

const app = express();
app.use(json());

// Use as rotas no endpoint "/api"
app.use("/api", rotasDeImagem);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
