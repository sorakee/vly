let audioContext;
let analyser;

export const initAudio = async (stream) => {
    try {
        audioContext = new window.AudioContext();
        // Microphone source
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        source.connect(analyser);
    } catch (error) {
        console.error("Error initializing audio:", error);
    }
};

// Get volume level from player's mic
export const getVolumeLevel = () => {
    if (!analyser) return 0;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const avg = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    // Normalize to 0-1 range
    return avg / 255;
}