import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const BotMessageBubble = ({ message, isTamil, isSpeak, setIsTamil, setIsSpeak }) => {
  const [translatedMessage, setTranslatedMessage] = useState(null);
  const [audioInstance, setAudioInstance] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);

  useEffect(() => {
    const translateMessage = async () => {
      if (isTamil) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/translate-to-tamil?input_text=${message}`
          );
          if (response.data.translated_tamil) {
            setTranslatedMessage(response.data.translated_tamil);
          } else {
            setTranslatedMessage(message);
          }
        } catch (error) {
          console.error('Error translating message:', error);
          setTranslatedMessage(message);
        } finally {
          setIsTamil(false);
        }
      } else {
        setTranslatedMessage(message);
      }
    };

    translateMessage();
  }, [message, isTamil]);

  const handlePlayPause = async () => {
    if (isPlaying && audioInstance) {
      setPlaybackPosition(audioInstance.currentTime);
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

        const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0))], {
          type: 'audio/mp3',
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.currentTime = playbackPosition;
        audio.play();

        setAudioInstance(audio);
        setIsPlaying(true);

        audio.onended = () => {
          setIsPlaying(false);
        };
      } catch (error) {
        console.error('Error playing audio:', error);
      }

      setIsSpeak(false);
    }
  };

  return (
    <div>
      <div className="ml-5 font-medium text-white">Assistant</div>
      <pre className="bg-[#334155] text-white m-3 font-sans rounded-t-3xl rounded-br-3xl p-3 text-wrap shadow-lg max-w-[70%] bubble">
        <p>{translatedMessage || message}</p>
      </pre>
      <button onClick={handlePlayPause} className="play-btn">
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size="xl" color="white" />
      </button>
    </div>
  );
};

export default BotMessageBubble;