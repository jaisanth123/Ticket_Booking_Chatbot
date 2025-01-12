from fastapi import FastAPI,Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from routes.chatbot import Chatbot
from routes.qr_validate import qr_validate_in, qr_validate_out
from routes.validate import Validate

from models.model import ValidateRequest, ChatRequest, QRRequest

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import speech_recognition as sr
from deep_translator import GoogleTranslator

import io
import soundfile as sf
import sounddevice as sd
from fastapi import HTTPException
from gtts import gTTS

import os
import uuid
from playsound import playsound
load_dotenv()

import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI()
# Initialize recognizer and FastAPI app
r = sr.Recognizer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/heartbeat")
def read_heartbeat():
    return {"status": "alive"}

@app.post("/chatbot")
async def chatbot(request: ChatRequest):
    chatbot_instance = Chatbot()
    return await chatbot_instance.post(request)

@app.post("/validate")
async def validate(request: ValidateRequest):
    validate  = Validate()
    return await validate.post(request)

@app.post('/qr/in')
async def qr_in(request: QRRequest):
    return await qr_validate_in(request)

@app.post('/qr/out')
async def qr_out(request: QRRequest):
    return await qr_validate_out(request)

# Function to record audio and recognize speech
async def recognize_speech(language="en-US"):
    try:
        with sr.Microphone() as source:
            r.adjust_for_ambient_noise(source, duration=0.2)
            print("Listening...")
            audio = r.listen(source, timeout=4, phrase_time_limit=3)
            recognized_text = r.recognize_google(audio, language=language)
            print(f"Recognized Text: {recognized_text}")
            return recognized_text
    except sr.UnknownValueError:
        raise HTTPException(status_code=400, detail="Unable to recognize speech")
    except sr.RequestError as e:
        raise HTTPException(status_code=500, detail=f"API request error: {str(e)}")

# Function to translate text
async def translate_text(text, source_lang="ta", target_lang="en"):
    try:
        translated = GoogleTranslator(source=source_lang, target=target_lang).translate(text)
        print(f"Translated Text: {translated}")
        return translated
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")
# Endpoint for voice input in English
@app.get("/voice")
async def get_voice_input():
    try:
        recognized_text = await recognize_speech(language="en-US")
        return JSONResponse(content={"text": recognized_text})
    except HTTPException as e:
        raise e

# Endpoint for Tamil voice input and translation to English
@app.get("/tamil-voice")
async def tamil_voice_to_english():
    try:
        # Step 1: Capture Tamil speech input
        recognized_tamil = await recognize_speech(language="ta-IN")
        # Step 2: Translate Tamil text to English
        translated_english = await translate_text(recognized_tamil, source_lang="ta", target_lang="en")
        return JSONResponse(content={
            "recognized_tamil": recognized_tamil,
            "translated_english": translated_english
        })
    except HTTPException as e:
        raise e

# Function to translate text to Tamil
async def translate_to_tamil(text: str, source_lang="en", target_lang="ta"):
    try:
        translated = GoogleTranslator(source=source_lang, target=target_lang).translate(text)
        print(f"Translated Text (English to Tamil): {translated}")
        return translated
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")

# Endpoint to handle translation from English to Tamil
@app.get("/translate-to-tamil")
async def translate_to_tamil_endpoint(input_text: str):
    try:
        translated_text = await translate_to_tamil(input_text)
        return {"translated_tamil": translated_text}
    except Exception as e:
        return {"error": str(e)}
    
# Function to generate and play speech
async def speak_text(text, language="en"):
    try:
        # Generate speech audio with gTTS
        tts = gTTS(text=text, lang=language)
        # Save the generated audio to an in-memory file
        buffer = io.BytesIO()
        tts.write_to_fp(buffer)
        buffer.seek(0)
        # Load the audio data as raw PCM
        data, samplerate = sf.read(buffer, dtype='float32')
        # Play the audio
        sd.play(data, samplerate)
        sd.wait()  # Wait until the audio is finished playing
    except Exception as e:
        print(f"Error in generating or playing speech:g {e}")


@app.post("/speak")
async def speak(text: str = Form(...), lang: str = Form("ta")):
    """
    Generate and play an audio file from the given text using gTTS.
    
    - `text`: The text to convert to speech.
    - `lang`: The language code (default is Tamil).
    """    
    try:
        # Generate a unique filename
        filename = f"{uuid.uuid4()}.mp3"

        # Use gTTS to generate the audio
        tts = gTTS(text=text, lang=lang)
        tts.save(filename)

        # Play the audio file
        playsound(filename)

        # Return a success message to the frontend
        return {"status": "Audio played successfully!"}
    except Exception as e:
        return {"error": str(e)}
    finally:
        # Cleanup: Remove the file after playing
        if os.path.exists(filename):
            os.remove(filename)