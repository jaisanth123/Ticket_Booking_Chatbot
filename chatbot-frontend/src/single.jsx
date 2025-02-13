import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons'; // Play icon
import { useSpeechRecognition } from 'react-speech-recognition';
import SpeechRecognition from 'react-speech-recognition'; // Add this import
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import {
  faMessage,
  faFileDownload,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import logo from './assets/keclogo.png'
import razor from './assets/razor.jpeg'
import concert_people from './assets/c2.jpg'
import artist from './assets/artist.avif'
const PaymentMessageBubble = ({ order_id, setMessages }) => {
  const handlePayment = () => {
    var options = {
      key: import.meta.env.VITE_RAZORPAY,
      amount: "50000",
      name: "Concert",
      description: "Test Transaction",
      order_id: order_id,
      handler: async function (response) {
        try {
          const res = await axios.post(
            import.meta.env.VITE_BACKEND_URL + "/validate",
            {
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              razor_signature: response.razorpay_signature,
            }
          );
          if (res.status === 200) {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                user: "bot",
                type: "content",
                pdf: res.data.pdf,
                message: res.data.message,
              },
            ]);
          } else {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                user: "bot",
                type: "message",
                message: "Validation failed",
              },
            ]);
          }
        } catch (e) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              user: "bot",
              type: "message",
              message: "Some error has occurred",
            },
          ]);
        }
      },
      prefill: {
        name: "Gaurav Kumar",
        email: "gaurav.kumar@example.com",
        contact: "9000090000",
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };
    var rzp1 = new Razorpay(options);
    rzp1.on("payment.failed", function (response) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          user: "bot",
          type: "message",
          message: "Some error has occurred",
        },
      ]);
    });
    rzp1.open();
  };

  return (
    <button
      onClick={handlePayment}>
      <img
        src={razor}
        className="sm:h-[5vh] rounded-md ml-2 border-2 hover:shadow-lg border-black sm:w-[8vw] h-[8vh]"
      />
    </button>
  );
};

const BotMessageBubble = ({ message, isTamil,isSpeak,setIsTamil,setIsSpeak }) => {
  const [translatedMessage, setTranslatedMessage] = useState(null);
  const [audioInstance, setAudioInstance] = useState(null); // Add state to keep track of audio instance
  const [isPlaying, setIsPlaying] = useState(false); // Add state to keep track of play/pause status
  const [playbackPosition, setPlaybackPosition] = useState(0); 
  useEffect(() => {
    const translateMessage = async () => {
      if (isTamil) {
        try {
          // Send the message to the ba
          // ckend to translate it to Tamil
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/translate-to-tamil?input_text=${message}`);
          console.log("ehllo");
          // If translation is successful, set translated message
          if (response.data.translated_tamil) {
            setTranslatedMessage(response.data.translated_tamil);
          } else {
            setTranslatedMessage(message); // If no translation available, fallback to original message
          }
        } catch (error) {
          console.error("Error translating message:", error);
          setTranslatedMessage(message); // If there's an error, fallback to original message
        }
        finally{
          setIsTamil(false);// Set listening to true when the microphone button is clicked
        }
      } else {
        setTranslatedMessage(message); // If not Tamil, use the original message
      }
    };

    translateMessage();
  }, [message]); // Re-run the effect when message or isTamil changes
 
  const handlePlayPause = async () => {
    if (isPlaying && audioInstance) {
      setPlaybackPosition(audioInstance.currentTime); // Track the current playback position
      audioInstance.pause();
      setIsPlaying(false);
    } else {
      const msg = translatedMessage || message;
      const lang = isSpeak ? 'ta' : 'en';

      try {
        const formData = new FormData();
        formData.append('text', msg);
        formData.append('lang', lang);

        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/speak`, formData);
        const audioBase64 = response.data.audio;

        // Create a Blob from the base64-encoded audio string
        const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: 'audio/mp3' });

        // Create a URL for the Blob and play the audio
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.currentTime = playbackPosition; // Resume playback from the previous position
        audio.play();

        // Update state with the current audio instance
        setAudioInstance(audio);
        setIsPlaying(true);

        audio.onended = () => {
          setIsPlaying(false); // Reset play status when audio ends
        };
      } catch (error) {
        console.error('Error playing audio:', error);
      }

      setIsSpeak(false); // Reset speak mode
    }
  };

  return (
    <div>
      <div className="ml-5 font-medium text-white">Assistant</div>
      <pre className="bg-[#334155] text-white m-3 font-sans rounded-t-3xl rounded-br-3xl p-3 text-wrap shadow-lg max-w-[70%] bubble">
        <p>{translatedMessage || message}</p> {/* Display translated message if available, else the original message */}
      </pre>
      <button onClick={handlePlayPause} className="play-btn">
      <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size="xl" color="white" ba />
      </button>
      
    </div>
  );
};

const UserMessageBubble = ({ message }) => {
  return (
    <div className="max-w-[70%] ml-auto">
      <div className="m-2 font-medium text-white">User</div>
      <p className="bg-[#6b7280] text-white m-2 rounded-t-2xl rounded-bl-2xl p-3 shadow-lg bubble">{message}</p>
    </div>
  );
};

const LoadingBubble = () => {
  return (
    <div>
      <div className="ml-3 font-medium text-white">Assistant</div>
      <pre className="bg-[#334155] text-white m-3 font-sans rounded-t-3xl rounded-br-3xl p-3 text-wrap shadow-lg max-w-[70%] bubble">
        <p className="loading-bubble bubble">Loading</p>
      </pre>
    </div>
  );
};

const DownloadTicket = ({ pdfBase64 }) => {
  const handleDownload = () => {
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length)
    .fill()
    .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });

    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "ticket.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="mr-auto ml-2 text-left rounded-lg p-2 flex flex-row items-center justify-start bg-[#334155] text-white" 
    >
      <div className="mr-2 text-base font-light">Ticket.pdf</div>
      <FontAwesomeIcon icon={faFileDownload} color="white" />
    </button>
  );
};

function App() {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("");
  const [input, setInput] = useState('');
  const [inputBox,setInputBox]=useState('');
  const [disableInput, setDisableInput] = useState(false);
  const messageEndRef = useRef(null);
  const [isTamil,setIsTamil]=useState(false);
  const [isSpeak,setIsSpeak]=useState(false);
 
  useEffect(() => {
    const generatedUserId = uuidv4();
    setUserId(generatedUserId);
  }, []);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      console.log("messageEndRef is not set");
    }
  }, [messages]);


  const sendMessage = async (e) => {
    e.preventDefault();
    const messageToSend = input.trim() === "" ? inputBox : input;
    if (messageToSend.trim() === "") {
      return;
    }
  
    setInput('')
    setInputBox('')
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        user: "user",
        type: "message",
        message: inputBox,
      },
      {
        user: "bot",
        type: "loading",
        message: "Loading",
      },
    ]);

    try {
      setDisableInput(true);
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/chatbot",
        {
          message: messageToSend,
          user_id: userId,
          prompt: "concert"
        }
      );
      if (response.status === 200) {
        setMessages((prevMessages) =>[
          ...prevMessages.filter((msg) => msg.type !== "loading"),
          response.data
        ])
        setInput('');
        setInputBox('')
        setDisableInput(false);
      }else{
        setMessages((prevMessages) => [
          ...prevMessages.filter((msg) => msg.type !== "loading"),
          {
            user: "bot",
            type: "message",
            message: "Some Error has occurred",
          },
        ]); 
        setDisableInput(false);
        setInput('')
        setInputBox('')

      }
    } catch (e) {
      console.error(e);
      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => msg.type !== "loading"),
        {
          user: "bot",
          type: "message",
          message: "Some Error has occurred",
        },
      ]);
      setInput('')
      setInputBox('')
      setDisableInput(false);
    }
  };

  const [response, setResponse] = useState('');
  const { transcript, resetTranscript,browserSupportsSpeechRecognition } = useSpeechRecognition(); 
  const [listening, setListening] = useState(false);
  const [tamilListening, setTamilListening] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [listeningLanguage, setListeningLanguage] = useState('');

    const startEnglishListening = () => {
      resetTranscript();
      setListening(true);
        setIsTamil(false);  // Make sure we're not in Tamil mode
      setListeningLanguage('en-US'); // Set listening language
      SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
      const validateUrl = `${import.meta.env.VITE_BACKEND_URL}/voice`;
      console.log(`Validate URL for English: ${validateUrl}`);
      resetInactivityTimer();
    };
    
    const startTamilListening = () => {
      resetTranscript();
      setTamilListening(true);
      setIsTamil(true);  // Set Tamil mode
      setIsSpeak(true);  // Set speak mode
      setListeningLanguage('ta-IN'); // Set listening language
      SpeechRecognition.startListening({ continuous: true, language: 'ta-IN' });
      const validateUrlTamil = `${import.meta.env.VITE_BACKEND_URL}/tamil-voice`;
      console.log(`Validate URL for Tamil: ${validateUrlTamil}`);
      resetInactivityTimer();
    };
    
    const resetInactivityTimer = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const newTimeoutId = setTimeout(() => {
        SpeechRecognition.stopListening(); // Reset speak mode
      }, 3000); // Adjust the duration (5000 ms = 5 seconds) as needed
      setTimeoutId(newTimeoutId);
     // setListening(false);
     // setTamilListening(false);

    };
    
    useEffect(() => {
      const handleTranscript = setTimeout(() => {
        if (transcript) {
          if (listeningLanguage === 'ta-IN') {
            sendTranscriptToBackendTamil(transcript);
          } else if (listeningLanguage === 'en-US') {
            sendTranscriptToBackendEnglish(transcript);
          }
        }
      }, 500); // Debounce for 500ms
    
      return () => clearTimeout(handleTranscript);
    }, [transcript, listeningLanguage]);
    
    
    const sendTranscriptToBackendEnglish = async (text) => {
      try {
        setListening(true);
      setIsTamil(false);  // Make sure we're not in Tamil mode
      setIsSpeak(false);
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/voice`, { text });
        console.log("ehllo");
        const data = res.data;
        if (data.text) {
          setInputBox(data.text);
          setInput(data.text);
          setResponse(data.text);
        }
      } catch (error) {
        console.error('Error sending transcript to backend:', error);
      } finally {
        setListening(false);
        setIsTamil(false); // Ensure to reset Tamil mode
      }
    };
    
    const sendTranscriptToBackendTamil = async (text) => {
      try {
      setTamilListening(true);
      setIsTamil(true);  // Set Tamil mode
      setIsSpeak(true);
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/tamil-voice`, { text });
        console.log("ehllo tamil");
        const data = res.data;
        if (data.recognized_tamil && data.translated_english) {
          setInputBox(data.recognized_tamil);
          setInput(data.translated_english);
          setResponse(data.recognized_tamil);
        }
      } catch (error) {
        console.error('Error sending transcript to backend:', error);
      } finally {
        setTamilListening(false);
      }
    };
    

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
<><nav class="fixed bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700 w-full">
        <div class="flex flex-wrap mx-auto p-4  justify-between items-center">
          <a href="#" class="flex items-center space-x-3 rtl:space-x-reverse">
            <img
              src="https://flowbite.com/docs/images/logo.svg"
              class="h-8"
              alt="Flowbite Logo"
            />
            <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            KEC Concert
            </span>
          </a>
          <button
            data-collapse-toggle="navbar-dropdown"
            type="button"
            class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-dropdown"
            aria-expanded="false"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
          <div class="hidden w-full md:block md:w-auto" id="navbar-dropdown">
            <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <a
                  href="#"
                  class="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500 dark:bg-blue-600 md:dark:bg-transparent"
                  aria-current="page"
                >
                  Home
                </a>
              </li>

              <li>
                <a
                  href="#"
                  class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >
                  Ticket & Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >
                  Upcoming Concerts
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >
                  About
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div
  className="bg-gray-900 bg-center bg-no-repeat bg-cover bg-opacity-20"
  style={{
    backgroundImage: `url(${concert_people})`,
    backgroundBlendMode: 'multiply', 
  }}
>
        <div class="px-4 mx-auto max-w-screen-xl text-center py-24 lg:py-56">
    
          <h1 class="mb-96 text-4xl font-extrabold tracking-tight leading-none text-amber-500 md:text-5xl lg:text-6xl mt-24">
          Experience the Power of Live Music !!
          </h1>
          <div class="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
            <a
              href="#"
              class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
            >
              Get started
              <svg
                class="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </a>
            <a
              href="#"
              class="inline-flex justify-center hover:text-gray-900 items-center py-3 px-5 sm:ms-4 text-base font-medium text-center text-white rounded-lg border border-white hover:bg-gray-100 focus:ring-4 focus:ring-gray-400"
            >
              Learn more
            </a>
          </div>
        </div>
      </div>
      <div class="bg-gray-900 text-white py-6">
        <div class="max-w-screen-xl mx-auto px-4">
          <h2 class="text-2xl font-bold mb-4">About KEC Concerts</h2>
          <p class="text-lg">
          At KEC concerts, we’re passionate about bringing live music to life.
           Our venue is the heart of the local music scene, showcasing the best artists across 
           genres, from rock and pop to indie and electronic. We offer a unique concert experience 
           with top-tier sound systems, immersive lighting, and an atmosphere that amplifies the energy 
           of every performance.

          </p>
          <p class="mt-4">
          Whether you're here for an intimate acoustic set or a sold-out stadium show, 
          KEC concerts is the place to be. Our team is dedicated to making
           every event unforgettable, offering fans exclusive experiences, VIP access, 
           and a community space where music lovers can unite.

          </p>
          <p class="mt-4">
          With a rich calendar of events, there’s always something happening at
          KEC concerts. Join us for incredible performances, 
           special events, and music festivals that celebrate the power of live music.

            life.
          </p>
          <p class="mt-8 text-xl font-bold mb-4">
            Visit KEC concerts to experience the art of music . and dive into a different world full of dopamin
          </p>
        </div>
      </div>
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
          backgroundImage: `url(${artist})`, // Specify the image path or URL here
          backgroundSize: 'cover', // Ensures the image covers the entire background
          backgroundPosition: 'center', // Centers the background image
          backgroundBlendMode: 'multiply', // Blends the gradient and image for a better effect
        }}
      >            
          <div className="h-[8vh] bg-[#0f172a] rounded-t-xl flex items-center justify-center shadow-md">
            <div className="text-2xl font-bold text-white">Concert Chatbot</div>
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
                      <BotMessageBubble message={item.message} isTamil={isTamil} isSpeak={isSpeak} setIsSpeak={setIsSpeak} setIsTamil={setIsTamil}/>
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
                    <BotMessageBubble message={item.message} isTamil={isTamil} key={index}setIsSpeak={setIsSpeak} isSpeak={isSpeak} setIsTamil={setIsTamil}/>
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
            <form onSubmit={sendMessage} className="flex flex-row items-center p-2">
              <input
                onChange={(e)=>{setInputBox(e.target.value)}}
                type="text"
                disabled = {disableInput}
                value={inputBox}
                placeholder="Enter your message"
                className="ml-2 rounded-lg w-auto px-3 h-10 flex items-center justify-center  bg-[#3f3f46] text-[#d4d4d8] shadow-lg transition-colors duration-300 ease-in-out"
                />
              <button
                type="button"
                onClick={startEnglishListening}
                className="ml-2 rounded-lg w-auto px-3 h-10 flex items-center justify-center  bg-[#3f3f46] text-[#d4d4d8] shadow-lg transition-colors duration-300 ease-in-out"
                >

                <FontAwesomeIcon icon={faMicrophone} color="#d4d4d8" />
                  English
              </button>
              
              <button
                type="button"
                onClick={startTamilListening}
                className="ml-2 rounded-lg w-auto px-4 h-10 flex items-center justify-center hover:bg-[#94a3b8] bg-[#3f3f46] text-[#d4d4d8] shadow-lg transition-colors duration-300 ease-in-out"
              >
                <FontAwesomeIcon icon={faMicrophone} color="#d4d4d8" className="mr-2" />
                தமிழ்

              </button>
              <button
                type = 'submit'
                onClick={sendMessage}
                disabled={disableInput}
                className="ml-2 rounded-lg w-10 h-10 flex items-center justify-center hover:bg-[#94a3b8] bg-[#3f3f46] text-[#d4d4d8] shadow-lg transition-colors duration-300 ease-in-out">
                <FontAwesomeIcon icon={faPaperPlane} color="#d4d4d8" />
              </button>
            </form> 
          </div>
        </div>
      )}
    </>
  );
}

export default App;
