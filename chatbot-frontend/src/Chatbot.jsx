import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useSpeechRecognition } from "react-speech-recognition";
import SpeechRecognition from "react-speech-recognition";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import UserMessageBubble from "./UserMessageBubble";
import BotMessageBubble from "./BotMessageBubble";
import LoadingBubble from "./LoadingBubble";
import PaymentMessageBubble from "./PaymentMessageBubble";
import DownloadTicket from "./DownloadTicket";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import artist from "./assets/artist.avif";
//import artist from './assets/ver.webp'

const Chatbot = ({ visible, setVisible }) => {
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("");
  const [input, setInput] = useState("");
  const [inputBox, setInputBox] = useState("");
  const [disableInput, setDisableInput] = useState(false);
  const messageEndRef = useRef(null);
  const [isTamil, setIsTamil] = useState(false);
  const [isSpeak, setIsSpeak] = useState(false);
  const [listening, setListening] = useState(false);
  const [tamilListening, setTamilListening] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [listeningLanguage, setListeningLanguage] = useState("");
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  useEffect(() => {
    const generatedUserId = uuidv4();
    setUserId(generatedUserId);
  }, []);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const messageToSend = input.trim() === "" ? inputBox : input;
    if (messageToSend.trim() === "") return;

    setInput("");
    setInputBox("");
    setMessages((prevMessages) => [
      ...prevMessages,
      { user: "user", type: "message", message: inputBox },
      { user: "bot", type: "loading", message: "Loading" },
    ]);

    try {
      setDisableInput(true);
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/chatbot",
        {
          message: messageToSend,
          user_id: userId,
          //prompt: "farm"
          prompt: "concert",
        }
      );

      if (response.status === 200) {
        setMessages((prevMessages) => [
          ...prevMessages.filter((msg) => msg.type !== "loading"),
          response.data,
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages.filter((msg) => msg.type !== "loading"),
          { user: "bot", type: "message", message: "Some Error has occurred" },
        ]);
      }
    } catch (e) {
      console.error(e);
      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => msg.type !== "loading"),
        { user: "bot", type: "message", message: "Some Error has occurred" },
      ]);
    } finally {
      setDisableInput(false);
    }
  };

  const startEnglishListening = () => {
    resetTranscript();
    setListening(true);
    setIsTamil(false);
    setListeningLanguage("en-US");
    SpeechRecognition.startListening({ continuous: false, language: "en-US" });
    resetInactivityTimer();
  };

  const startTamilListening = () => {
    resetTranscript();
    setTamilListening(true);
    setIsTamil(true);
    setIsSpeak(true);
    setListeningLanguage("ta-IN");
    SpeechRecognition.startListening({ continuous: true, language: "ta-IN" });
    resetInactivityTimer();
  };

  const resetInactivityTimer = () => {
    if (timeoutId) clearTimeout(timeoutId);
    const newTimeoutId = setTimeout(() => {
      SpeechRecognition.stopListening();
    }, 3000);
    setTimeoutId(newTimeoutId);
  };

  useEffect(() => {
    const handleTranscript = setTimeout(() => {
      if (transcript) {
        if (listeningLanguage === "ta-IN") {
          sendTranscriptToBackendTamil(transcript);
        } else if (listeningLanguage === "en-US") {
          sendTranscriptToBackendEnglish(transcript);
        }
      }
    }, 500);

    return () => clearTimeout(handleTranscript);
  }, [transcript, listeningLanguage]);

  const sendTranscriptToBackendEnglish = async (text) => {
    try {
      setListening(true);
      setIsTamil(false);
      setIsSpeak(false);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/voice`,
        { text }
      );
      const data = res.data;
      if (data.text) {
        setInputBox(data.text);
        setInput(data.text);
      }
    } catch (error) {
      console.error("Error sending transcript to backend:", error);
    } finally {
      setListening(false);
      setIsTamil(false);
    }
  };

  const sendTranscriptToBackendTamil = async (text) => {
    try {
      setTamilListening(true);
      setIsTamil(true);
      setIsSpeak(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/tamil-voice`,
        { text }
      );
      const data = res.data;
      if (data.recognized_tamil && data.translated_english) {
        setInputBox(data.recognized_tamil);
        setInput(data.translated_english);
      }
    } catch (error) {
      console.error("Error sending transcript to backend:", error);
    } finally {
      setTamilListening(false);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <>
      <button
        className="fixed flex items-center justify-center m-2 rounded-full shadow-lg right-2 bottom-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 w-14 h-14"
        onClick={() => setVisible((prevVisible) => !prevVisible)}
      >
        <FontAwesomeIcon icon={faMessage} color="white" />
      </button>
      {visible && (
        <div
          className="bg fixed bg-gray-900 bg-center bg-no-repeat bg-cover bg-opacity-20 sm:right-[2vw] sm:bottom-[12vh] h-[80vh] sm:w-[30vw] w-[90vw] rounded-xl bottom-[11vh] right-4 shadow-2xl border border-gray-700"
          style={{
            backgroundImage: `url(${artist})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "multiply",
          }}
        >
          <div className="h-[8vh] bg-[#0f172a] rounded-t-xl flex items-center justify-center shadow-md">
            <div className="text-2xl font-bold text-white">
              Farm2Bag Chatbot
            </div>
          </div>
          <div className="h-[72vh] flex-grow rounded-b-xl grid">
            <div className="overflow-y-auto h-[65vh] flex flex-col p-2 space-y-2">
              {messages.map((item, index) => {
                if (item.user === "user") {
                  return (
                    <UserMessageBubble message={item.message} key={index} />
                  );
                } else if (item.type === "content") {
                  return (
                    <div key={index}>
                      <BotMessageBubble
                        message={item.message}
                        isTamil={isTamil}
                        isSpeak={isSpeak}
                        setIsSpeak={setIsSpeak}
                        setIsTamil={setIsTamil}
                      />
                      <DownloadTicket pdfBase64={item.pdf} />
                    </div>
                  );
                } else if (item.type === "order_id") {
                  return (
                    <PaymentMessageBubble
                      order_id={item.message}
                      setMessages={setMessages}
                      key={index}
                    />
                  );
                } else if (item.type === "loading") {
                  return <LoadingBubble key={index} />;
                } else {
                  return (
                    <BotMessageBubble
                      message={item.message}
                      isTamil={isTamil}
                      key={index}
                      setIsSpeak={setIsSpeak}
                      isSpeak={isSpeak}
                      setIsTamil={setIsTamil}
                    />
                  );
                }
              })}
              {listening && (
                <div className="p-2 text-black bg-gray-200 rounded-lg">
                  Listening...
                </div>
              )}
              {tamilListening && (
                <div className="p-2 text-black bg-gray-200 rounded-lg">
                  நான் கேட்டுக் கொண்டிருக்கிறேன்...
                </div>
              )}
              <div ref={messageEndRef}></div>
            </div>
            <form
              onSubmit={sendMessage}
              className="flex flex-row items-center p-2"
            >
              <input
                onChange={(e) => setInputBox(e.target.value)}
                type="text"
                disabled={disableInput}
                value={inputBox}
                placeholder="Enter your message"
                className="ml-2 rounded-lg w-auto px-3 h-10 flex items-center justify-center bg-[#3f3f46] text-[#d4d4d8] shadow-lg transition-colors duration-300 ease-in-out"
              />
              <button
                type="button"
                onClick={startEnglishListening}
                className="ml-2 rounded-lg w-auto px-3 h-10 flex items-center justify-center bg-[#3f3f46] text-[#d4d4d8] shadow-lg transition-colors duration-300 ease-in-out"
              >
                <FontAwesomeIcon icon={faMicrophone} color="#d4d4d8" />
                English
              </button>
              <button
                type="button"
                onClick={startTamilListening}
                className="ml-2 rounded-lg w-auto px-4 h-10 flex items-center justify-center hover:bg-[#94a3b8] bg-[#3f3f46] text-[#d4d4d8] shadow-lg transition-colors duration-300 ease-in-out"
              >
                <FontAwesomeIcon
                  icon={faMicrophone}
                  color="#d4d4d8"
                  className="mr-2"
                />
                தமிழ்
              </button>
              <button
                type="submit"
                onClick={sendMessage}
                disabled={disableInput}
                className="ml-2 rounded-lg w-10 h-10 flex items-center justify-center hover:bg-[#94a3b8] bg-[#3f3f46] text-[#d4d4d8] shadow-lg transition-colors duration-300 ease-in-out"
              >
                <FontAwesomeIcon icon={faPaperPlane} color="#d4d4d8" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
