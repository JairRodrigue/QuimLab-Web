const { db, bucket } = require("../config/firebaseConfig");
const express = require("express");
const multer = require("multer");
const admin = require("firebase-admin");
const vision = require("@google-cloud/vision");

const rota = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const client = new vision.ImageAnnotatorClient();

// Rota para upload e análise
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

        // Analise a imagem
        const [result] = await client.labelDetection(fileURL);
        const labels = result.labelAnnotations.map(label => label.description);

        // Salvar no Firestore
        await db.collection("analyses").add({
            imageUrl: fileURL,
            analysis: labels,
            timestamp: new Date(),
        });

        res.send({
            message: "Imagem analisada e salva com sucesso!",
            url: fileURL,
            analysis: labels,
        });
    } catch (error) {
        console.error("Erro:", error);
        res.status(500).send("Erro durante o processamento da imagem.");
    }
});

// Rota para consultar análises
rota.get("/analyses", async (req, res) => {
    try {
        const snapshot = await db.collection("analyses").get();
        const analyses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.send(analyses);
    } catch (error) {
        console.error("Erro ao buscar análises:", error);
        res.status(500).send("Erro ao buscar análises.");
    }
});

module.exports = rota;
