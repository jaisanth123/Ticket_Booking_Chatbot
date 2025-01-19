from flask import Flask, jsonify
from flask_cors import CORS  # To handle CORS issues
import speech_recognition as sr
from deep_translator import GoogleTranslator
import io
import sounddevice as sd
import soundfile as sf
from gtts import gTTS

# Initialize recognizer and Flask app
r = sr.Recognizer()
app = Flask(__name__)
CORS(app)  # Enable CORS

# Function to record Tamil audio and recognize speech
def record_tamil_audio():
    print("Recording... Speak now in Tamil!")
    try:
        with sr.Microphone() as source:
            r.adjust_for_ambient_noise(source)
            audio = r.listen(source)
            print("Recognizing... Please wait.")
            text = r.recognize_google(audio, language="ta-IN")
            print(f"Recognized Tamil Text: {text}")
            return text
    except sr.UnknownValueError:
        print("Could not understand the audio.")
        return None
    except sr.RequestError as e:
        print(f"Error with the recognition service: {e}")
        return None

# Function to translate Tamil text to English
def translate_tamil_to_english(tamil_text):
    try:
        translated = GoogleTranslator(source="ta", target="en").translate(tamil_text)
        return translated
    except Exception as e:
        print(f"Error during translation: {e}")
        return None

# Function to generate and play speech in Tamil
def speak_text_in_tamil(text):
    try:
        # Generate speech audio with gTTS
        tts = gTTS(text=text, lang="ta")
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
        print(f"Error in generating or playing speech: {e}")

@app.route('/voice', methods=['GET'])
def get_voice_input():
    try:
        with sr.Microphone() as source:
            r.adjust_for_ambient_noise(source, duration=0.2)
            print("Listening...")
            audio = r.listen(source)
            MyText = r.recognize_google(audio).lower()
            print(f"Recognized: {MyText}")
            return jsonify({"text": MyText})

    except sr.RequestError as e:
        return jsonify({"error": f"API request error: {str(e)}"}), 500

    except sr.UnknownValueError:
        return jsonify({"error": "Unable to recognize speech"}), 400

@app.route('/tamil_voice', methods=['GET'])
def get_tamil_voice_input():
    try:
        text = record_tamil_audio()
        if text:
            return jsonify({"tamil_text": text})
        else:
            return jsonify({"error": "Unable to recognize Tamil speech"}), 400
    except Exception as e:
        return jsonify({"error": f"Error in Tamil voice recognition: {str(e)}"}), 500

@app.route('/translate_tamil_to_english', methods=['POST'])
def translate_tamil_to_english_endpoint():
    try:
        tamil_text = request.json.get("tamil_text")
        if tamil_text:
            translated_text = translate_tamil_to_english(tamil_text)
            if translated_text:
                return jsonify({"english_text": translated_text})
            else:
                return jsonify({"error": "Translation failed"}), 400
        else:
            return jsonify({"error": "No Tamil text provided"}), 400
    except Exception as e:
        return jsonify({"error": f"Error in translation: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="localhost", port=5001)
