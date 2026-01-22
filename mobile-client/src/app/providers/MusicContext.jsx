import React, { createContext, useState, useContext, useEffect } from "react";
import { Audio } from "expo-av";

import songFile from "../../assets/videos/Song.mp3";

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

/**
 * Manages background music playback and audio session configuration.
 */
export const MusicProvider = ({ children }) => {
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    /** * Configures the global audio session to allow background playback 
     * and ensures audio plays even when the device is in silent mode.
     */
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
      }
    }
    configureAudio();

    // Clean up: Unload the sound from memory when the provider unmounts
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  /** Initial sound loading with loop enabled */
  async function loadSound() {
    const { sound: newSound } = await Audio.Sound.createAsync(
      songFile,
      { isLooping: true }
    );
    setSound(newSound);
  }

  /** Global toggle to play or pause the audio track */
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