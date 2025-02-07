const correcaoComponentes = require("../js/correcao.js");
const { db, bucket } = require("../config/firebaseConfig");
const express = require("express");
const multer = require("multer");
const vision = require("@google-cloud/vision"); 
const axios = require("axios");

const rota = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const client = new vision.ImageAnnotatorClient();

const fetchCompoundInfo = async (compound) => {
    try {
        const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${compound}/JSON`;
        const response = await axios.get(url);
        const properties = response.data.PropertyTable?.Properties[0];

        if (properties) {
            return {
                name: properties.IUPACName || "Nome desconhecido",
                molecularFormula: properties.MolecularFormula || "Fórmula desconhecida",
                molecularWeight: properties.MolecularWeight || "Peso molecular desconhecido",
                smiles: properties.CanonicalSMILES || "SMILES desconhecido",
            };
        }
    } catch (error) {
        console.error(`Erro ao buscar ${compound} no PubChem:`, error);
    }
    return null;
};

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

        // Extrair texto da imagem usando a API
        const [result] = await client.textDetection(req.file.buffer);
        const extractedText = result.textAnnotations[0]?.description || "";

        // Corrigir os compostos
        let compounds = extractedText.match(/[A-Z][a-z]?\d*(?:[A-Z][a-z]?\d*)*/g) || [];
        compounds = compounds.map(correcaoComponentes);

        // Procurar compostos químicos no banco de dados 
        const analysis = await Promise.all(
            compounds.map(async (compound) => {
                const info = await fetchCompoundInfo(compound);
                return info ? { compound, info } : { compound, info: "Não encontrado" };
            })
        );

        // Salvar a análise no Firestore
        await db.collection("analyses").add({
            imageUrl: fileURL,
            extractedText,
            analysis,
            timestamp: new Date(),
        });

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

module.exports = rota;
