const { db, bucket } = require("../config/firebaseConfig");
const express = require("express");
const multer = require("multer");
const admin = require("firebase-admin");
const vision = require("@google-cloud/vision");

const rota = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const client = new vision.ImageAnnotatorClient();

// Rota de teste para a Vision API
rota.get("/test-vision", async (req, res) => {
    try {
        // URL de uma imagem pública para teste
        const testImageUrl = "https://example.com/sample-image.jpg";

        // Testa a Vision API com a detecção de rótulos
        const [result] = await client.labelDetection(testImageUrl);
        const labels = result.labelAnnotations.map(label => ({
            description: label.description,
            score: label.score,
        }));

        res.send({
            message: "API Vision funcionando corretamente!",
            labels,
        });
    } catch (error) {
        console.error("Erro ao testar a Vision API:", error);
        res.status(500).send({
            error: "Erro ao testar a Vision API.",
            details: error.message,
        });
    }
});

rota.post("/upload", upload.single("image"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("Nenhuma imagem enviada.");
    }

    try {
        // Salvar a imagem no Google Cloud Storage
        const fileName = `uploads/${Date.now()}_${req.file.originalname}`;
        const fileUpload = bucket.file(fileName);

        await fileUpload.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype },
        });

        const fileURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        // Extrair texto da imagem usando a API
        const [result] = await client.textDetection(req.file.buffer);
        const extractedText = result.textAnnotations[0]?.description || "";

        // Interpretar as cadeias carbônicas no texto extraído
        const interpretChains = (text) => {
            const chains = [];
            const regex = /\b(C\d*H\d*[-CH\d]*)\b/g; // Regex para identificar cadeias carbônicas
            let match;

            while ((match = regex.exec(text)) !== null) {
                chains.push(match[1]); // Adiciona a cadeia identificada
            }

            return chains.map((chain) => {
                // Adicionar regras químicas para identificar a estrutura
                if (chain.includes("OH")) {
                    return { chain, explanation: `${chain}: Álcool (possui grupo OH).` };
                } else if (chain.includes("COOH")) {
                    return { chain, explanation: `${chain}: Ácido carboxílico (possui grupo COOH).` };
                }
                return { chain, explanation: `${chain}: Estrutura desconhecida.` }; // Default para estruturas não reconhecidas
            });
        };

        const analysis = extractedText ? interpretChains(extractedText) : [];

        // Validar dados antes de salvar no Firestore
        if (!fileURL || !extractedText) {
            throw new Error("Dados incompletos: URL da imagem ou texto extraído está vazio.");
        }

        // Salvar a análise no Firestore
        await db.collection("analyses").add({
            imageUrl: fileURL, // URL da imagem no bucket do Cloud Storage
            extractedText,     // Texto extraído da imagem
            analysis,          // Resultado da análise
            timestamp: new Date(), // Data e hora da análise
        });

        // Retornar a análise para o cliente
        res.send({
            message: "Imagem analisada e salva com sucesso!",
            url: fileURL,
            extractedText,
            analysis,
        });
    } catch (error) {
        console.error("Erro durante o processamento da imagem:", error);
        res.status(500).send({
            error: "Erro durante o processamento da imagem.",
            details: error.message,
        });
    }
});

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