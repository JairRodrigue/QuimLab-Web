const { db, bucket } = require("../config/firebaseConfig");
const express = require("express");
const multer = require("multer");
const admin = require("firebase-admin");
const vision = require("@google-cloud/vision");
const axios = require("axios");

const rota = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const client = new vision.ImageAnnotatorClient();

// Função para normalizar cadeias químicas mal interpretadas
const normalizeChain = (chain) => {
    const corrections = {
        HO: "OH",        // Corrige HO para OH
        HCO: "CHO",      // Corrige HCO para CHO (aldeído)
        COH: "CHO",      // Corrige COH para CHO (aldeído)
        H2N: "NH2",      // Corrige H2N para NH2 (amina)
        COHO: "COOH",    // Corrige COHO para COOH (ácido carboxílico)
        OHCO: "COOH",    // Corrige OHCO para COOH (ácido carboxílico)
        CNH2: "NH2",     // Corrige CNH2 para NH2 (amina)
        HC: "CH",        // Corrige HC para CH (cadeia base de hidrocarbonetos)
        H3C: "CH3",      // Corrige H3C para CH3 (metil)
        CH2: "CH2",      // Adiciona CH2 como uma cadeia válida
    };

    return corrections[chain] || chain; // Retorna a correção ou a cadeia original
};

// Função para limpar o texto extraído
const cleanExtractedText = (text) => {
    // Remover espaços extras, quebras de linha e caracteres não desejados
    return text.replace(/[^A-Za-z0-9\s\(\)\-]/g, '').replace(/\s+/g, ' ').trim();
};

// Função para interpretar cadeias químicas
const interpretChains = (text) => {
    const regex = /\b(C\d*H\d*[-CH\d]*)\b|OH|HO|COOH|CHO|NH2|CH2|CH3/g; // Modificado para capturar CH2 e CH3
    const chains = new Set(); // Usar Set para evitar duplicatas
    let match;

    while ((match = regex.exec(text)) !== null) {
        const normalizedChain = normalizeChain(match[0]); // Normaliza a cadeia
        chains.add(normalizedChain); // Adiciona ao Set para garantir unicidade
    }

    const functionalGroups = {
        OH: "Álcool",
        COOH: "Ácido carboxílico",
        CHO: "Aldeído",
        NH2: "Amina",
    };

    // Mapear cada cadeia para sua explicação
    return Array.from(chains).map((chain) => {
        const group = Object.keys(functionalGroups).find((key) => chain.includes(key));
        return group
            ? { chain, explanation: `${chain}: ${functionalGroups[group]} (possui grupo ${group}).` }
            : { chain, explanation: `${chain}: Estrutura não reconhecida.` };
    });
};

// Função para buscar informações no PubChem
const getChemicalInfoFromPubChem = async (compound) => {
    try {
        // Primeiramente, tenta buscar o nome exato
        const response = await axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${compound}/property/MolecularFormula,Description/JSON`);
        const data = response.data;

        if (data && data.PropertyTable && data.PropertyTable.Properties[0]) {
            const compoundData = data.PropertyTable.Properties[0];
            return {
                name: compound,
                formula: compoundData.MolecularFormula,
                description: compoundData.Description || "Descrição não encontrada.",
            };
        }

        // Se não encontrar, tenta uma busca mais ampla com o mesmo padrão
        const fallbackResponse = await axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/structure/${compound}/property/MolecularFormula,Description/JSON`);
        const fallbackData = fallbackResponse.data;

        if (fallbackData && fallbackData.PropertyTable && fallbackData.PropertyTable.Properties[0]) {
            const compoundData = fallbackData.PropertyTable.Properties[0];
            return {
                name: compound,
                formula: compoundData.MolecularFormula,
                description: compoundData.Description || "Descrição não encontrada.",
            };
        }

        return null;
    } catch (error) {
        console.error("Erro ao buscar informação do PubChem:", error);
        return null;
    }
};

// Rota de teste para a Vision API
rota.get("/test-vision", async (req, res) => {
    try {
        const testImageUrl = "https://example.com/sample-image.jpg";

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

// Rota para upload e análise de imagem
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

        // Limpar o texto extraído
        const cleanedText = cleanExtractedText(extractedText);

        // Exibir o texto extraído para debug
        console.log("Texto extraído:", cleanedText);

        // Interpretar as cadeias carbônicas no texto extraído
        const analysis = cleanedText ? interpretChains(cleanedText) : [];

        // Validar dados antes de salvar no Firestore
        if (!fileURL || !extractedText) {
            throw new Error("Dados incompletos: URL da imagem ou texto extraído está vazio.");
        }

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

// Rota para buscar análises salvas
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