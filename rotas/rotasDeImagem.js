import express from "express";
import multer from "multer";
import cors from "cors";
import { db, bucket } from "../config/firebaseConfig.js";
import gerarDescricaoComGemini from "../js/geminiServices.js";

const rota = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

rota.use(cors({
    origin: "http://127.0.0.1:5500", // Se a porta do front-end mudar, tem que mudar aqui
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

rota.post("/upload", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("Nenhuma imagem enviada.");
    }

    try {
        const fileName = `uploads/${Date.now()}_${req.file.originalname}`;
        const fileUpload = bucket.file(fileName);

        await fileUpload.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype },
        });

        const fileURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        // Analisar a imagem com o Gemini usando a função importada
        const descricaoImagem = await gerarDescricaoComGemini(req.file.buffer);

        // Salvar a análise no Firestore
        await db.collection("analyses").add({
            imageUrl: fileURL,
            descricaoImagem,
            timestamp: new Date(),
        });

        res.send({
            message: "Imagem analisada e salva com sucesso!",
            url: fileURL,
            descricaoImagem,
        });
    } catch (error) {
        console.error("Erro durante o processamento da imagem:", error);
        res.status(500).send({
            error: "Erro durante o processamento da imagem.",
            details: error.message,
        });
    }
});

export default rota;
