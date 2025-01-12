import speech_recognition as sr
import pyttsx3

# Initialize the recognizer
r = sr.Recognizer()

# Function to convert text to speech
def SpeakText(command):
    # Initialize the engine
    engine = pyttsx3.init()
    engine.say(command)
    engine.runAndWait()

# Loop infinitely for user to speak
while True:
    try:
        # Use the microphone as source for input
        with sr.Microphone() as source2:
            # Adjust the energy threshold based on ambient noise
            r.adjust_for_ambient_noise(source2, duration=0.2)

            # Listen for user input
            print("Listening...")
            audio2 = r.listen(source2)

            # Recognize speech using Google API
            MyText = r.recognize_google(audio2)
            MyText = MyText.lower()

            print("Did you say:", MyText)
            SpeakText(MyText)

    except sr.RequestError as e:
        print(f"Could not request results; {e}")

    except sr.UnknownValueError:
        print("Unknown error occurred")
