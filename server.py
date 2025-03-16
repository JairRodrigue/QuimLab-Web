from flask import Flask, request, jsonify
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, firestore
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permite requisições do front-end

# Configurar chave da API do Gemini
genai.configure(api_key="AIzaSyDTG1Qi4Shsp0H2VFG0G5emNPFiNVxBcYI")

# Instanciar modelo Gemini
model = genai.GenerativeModel("gemini-1.5-pro-latest")

# Configurar Firebase
cred = credentials.Certificate("quimlab-b35f1-firebase-adminsdk-qn8be-6379db854e.json")  
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/perguntar', methods=['POST'])
def perguntar():
    dados = request.get_json()
    pergunta = dados.get("pergunta", "")

    if not pergunta:
        return jsonify({"resposta": "Por favor, forneça uma pergunta válida."})

    resposta = model.generate_content(pergunta).text

    # Salvar no Firebase Firestore
    doc_ref = db.collection("perguntas_respostas").add({
        "pergunta": pergunta,
        "resposta": resposta
    })

    return jsonify({"resposta": resposta})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
