import google.generativeai as genai

genai.configure(api_key="AIzaSyDTG1Qi4Shsp0H2VFG0G5emNPFiNVxBcYI")

models = genai.list_models()
for model in models:
    print(model.name)
