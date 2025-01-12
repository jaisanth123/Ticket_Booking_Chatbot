import React, { useState } from "react";
import "./App.css"; 

function App() {
  const [inputText, setInputText] = useState(""); // State for the input text
  const [isListening, setIsListening] = useState(false); // State for tracking listening status
  const [error, setError] = useState(null); // State for tracking errors

  // Function to fetch voice input from the backend
  const getVoiceInput = async () => {
    setIsListening(true); // Start the listening indicator
    setError(null); // Clear previous errors

    try {
      const response = await fetch("http://127.0.0.1:5001/voice");
      const data = await response.json();

      if (data.text) {
        setInputText(data.text); // Update input field with recognized text
      } else {
        setError(data.error || "Could not understand the input.");
      }
    } catch (error) {
      setError("Error fetching voice input. Please try again.");
      console.error(error);
    }

    setIsListening(false); // Stop the listening indicator
  };

  // Handler for input change
  const handleInputChange = (e) => setInputText(e.target.value);

  return (
    <div className="app-container"> {/* Use the CSS class for styling */}
      <h1>Chatbot with Voice Input</h1>

      {/* Text input box */}
      <input
        type="text"
        value={inputText} // Value is controlled by the state
        onChange={handleInputChange} // Update state on change
        placeholder="Type here or use the Speak button"
      />

      <br />

      {/* Voice input button */}
      <button onClick={getVoiceInput} disabled={isListening}>
        🎙️ Speak
      </button>

      <br /><br />

      {/* Show "Listening..." message or error */}
      {isListening && <p style={{ fontStyle: "italic", color: "blue" }}>Listening...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;
