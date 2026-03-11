import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GOOGLE_API_KEY')
print(f"Testing API Key: {api_key[:20]}...")

# Check available models
url = f'https://generativelanguage.googleapis.com/v1beta/models?key={api_key}'
response = requests.get(url)

print(f"\nAPI Response Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    print(f"\nAvailable models with generateContent:")
    models = [m for m in data.get('models', []) if 'generateContent' in m.get('supportedGenerationMethods', [])]
    for model in models[:15]:
        name = model.get('name', 'N/A')
        display_name = model.get('displayName', 'N/A')
        print(f"  - {name} ({display_name})")
else:
    print(f"Error: {response.text}")
