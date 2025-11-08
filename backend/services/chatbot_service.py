import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from dotenv import load_dotenv
import os

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_gemini_response(user_message):
    url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"
    params = {"key": GEMINI_API_KEY}
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_message}]
            }
        ]
    }

    try:
        session = requests.Session()
        retries = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
        session.mount("https://", HTTPAdapter(max_retries=retries))
        
        response = session.post(url, params=params, json=payload, timeout=30)
        print("API Response:", response.text)  # Log for debugging
        response.raise_for_status()
        result = response.json()

        if "candidates" in result and result["candidates"]:
            return result["candidates"][0]["content"]["parts"][0]["text"]
        return "Sorry, I couldn't get a valid response from the API."
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP Error: {http_err}")
        return f"Error: {http_err.response.status_code} - {http_err.response.reason}"
    except requests.exceptions.Timeout:
        print("Timeout Error")
        return "Error: The request to the Gemini API timed out. Please try again."
    except requests.exceptions.RequestException as e:
        print(f"Request Error: {e}")
        return "Sorry, there was an error contacting the Gemini API."
    except (KeyError, IndexError) as e:
        print(f"Response Parsing Error: {e}")
        return "Error: Unexpected response format from the API."