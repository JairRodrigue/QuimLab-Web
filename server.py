from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permite requisições do front-end

# Configurar chave da API do Gemini
genai.configure(api_key="AIzaSyDTG1Qi4Shsp0H2VFG0G5emNPFiNVxBcYI")

# Instanciar modelo Gemini
model = genai.GenerativeModel("gemini-pro")

@app.route('/perguntar', methods=['POST'])
def perguntar():
    dados = request.get_json()
    pergunta = dados.get("pergunta", "")

    if not pergunta:
        return jsonify({"resposta": "Por favor, forneça uma pergunta válida."})

    resposta = model.generate_content(pergunta)
    
    return jsonify({"resposta": resposta.text})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

