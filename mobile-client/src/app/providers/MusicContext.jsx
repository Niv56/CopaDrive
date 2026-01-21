import React, { createContext, useState, useContext, useEffect } from "react";
import { Audio } from "expo-av";

// וודא שהנתיב לקובץ נכון לפי מה שכתבת
import songFile from "../../assets/videos/Song.mp3"; 

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // הגדרות סאונד (כדי שיפעל גם במצב שקט באייפון)
    async function configureAudio() {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        await loadSound();
      } catch (e) {
        console.error("Audio setup failed", e);
      }
    }
    configureAudio();

    return () => {
      // ניקוי ביציאה מהאפליקציה לגמרי
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  async function loadSound() {
    const { sound: newSound } = await Audio.Sound.createAsync(
       songFile,
       { isLooping: true } // שהשיר יחזור על עצמו
    );
    setSound(newSound);
  }

  const toggleMusic = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  return (
    <MusicContext.Provider value={{ isPlaying, toggleMusic }}>
      {children}
    </MusicContext.Provider>
  );
};
export default MusicProvider;