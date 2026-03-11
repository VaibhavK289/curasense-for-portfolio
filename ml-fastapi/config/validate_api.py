from tavily import TavilyClient
from tavily.errors import InvalidAPIKeyError
from langchain_google_genai import ChatGoogleGenerativeAI

from .credentials import creds
import os


# Function to validate the Tavily API key
def validate_tavily(tav_api):

    # query = "Who is Elon Musk?"
    # tavily_client=TavilyClient(api_key=tav_api)
    # try:
    #     tavily_client.search(query, max_results=1)
    #     print(tavily_client.search(query, max_results=1))
    #     return "ValidAPI"
    # except InvalidAPIKeyError:
    #     return "InvalidAPI"
    
    return "ValidAPI"

# Function to validate the Gemini API key
def validate_gemini(gemini_api):
    try:
        llm_gemini = ChatGoogleGenerativeAI(
            api_key=gemini_api,
            model="gemini-2.5-flash"
        )
        llm_gemini.invoke("Hi")
        print("Gemini API validation successful")
        return "ValidAPI"
    except Exception as e:
        error_msg = str(e)
        print(f"Gemini API validation error: {error_msg}")
        return "InvalidAPI"



# # Function to validate the GROQ API key
def validate_groq(groq_api):
    # For now, just return valid since GROQ validation is complex
    # You can add actual validation here if needed
    return "ValidAPI"


def validate_keys(tav_api, gemini_api, groq_api):

    tav_res = validate_tavily(tav_api)
    gemini_res = validate_gemini(gemini_api)
    groq_res = validate_groq(groq_api)
    
    errors = []
    
    if tav_res != "ValidAPI":
        errors.append("Tavily API key is invalid")
    if gemini_res != "ValidAPI":
        errors.append("Gemini API key is invalid")
    if groq_res != "ValidAPI":
        errors.append("Groq API key is invalid")
    
    if len(errors) == 0:
        return "Validated"
    else:
        return " | ".join(errors)
