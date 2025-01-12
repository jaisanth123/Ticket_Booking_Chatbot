from flask import Flask, jsonify
from flask_cors import CORS  # To handle CORS issues
import speech_recognition as sr
from deep_translator import GoogleTranslator

# Initialize recognizer and Flask app
r = sr.Recognizer()
app = Flask(__name__)
CORS(app)  # Enable CORS

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

# Function to record Tamil audio and recognize speech
def record_tamil_audio():
    print("Recording... Speak now in Tamil!")
    recognizer = sr.Recognizer()
    try:
        with sr.Microphone() as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.2)
            audio = recognizer.listen(source)
            print("Recognizing Tamil speech... Please wait.")
            text = recognizer.recognize_google(audio, language="ta-IN")
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
        print(f"Translated to English: {translated}")
        return translated
    except Exception as e:
        print(f"Error during translation: {e}")
        return None

# Route to handle Tamil voice input and translation
@app.route('/tamil-voice', methods=['GET'])
def tamil_voice_to_english():
    try:
        # Step 1: Capture Tamil speech input
        tamil_text = record_tamil_audio()
        if tamil_text:
            # Step 2: Translate Tamil text to English
            translated_english = translate_tamil_to_english(tamil_text)
            if translated_english:
                return jsonify({
                    "recognized_tamil": tamil_text,
                    "translated_english": translated_english
                })
            else:
                return jsonify({"error": "Translation failed"}), 500
        else:
            return jsonify({"error": "Speech recognition failed"}), 400
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(host="localhost", port=5001)
