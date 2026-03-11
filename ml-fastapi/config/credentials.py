from google.oauth2 import service_account
import base64
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

creds = None

encoded_creds = os.getenv("GOOGLE_CREDENTIALS_BASE64")
if encoded_creds:
    try:
        decoded_creds = base64.b64decode(encoded_creds).decode("utf-8")
        service_account_info = json.loads(decoded_creds)
        creds = service_account.Credentials.from_service_account_info(
            service_account_info
        )
    except Exception as e:
        print(f"WARNING: Failed to decode Google credentials: {e}")
        print(
            "Google Cloud authenticated endpoints will not work. "
            "Set a valid GOOGLE_CREDENTIALS_BASE64 to enable them."
        )
else:
    print(
        "WARNING: GOOGLE_CREDENTIALS_BASE64 not set. "
        "Google Cloud authenticated endpoints will not work."
    )
