let audioContext;
let analyser;

export const initAudio = async (stream) => {
    try {
        audioContext = new window.AudioContext();
        audioContext.resume();
        // Microphone source
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        source.connect(analyser);
    } catch (error) {
        console.error("Error initializing audio:", error);
    }
};

// Get volume level from player's mic ALTERNATE METHOD
export const getVolumeLevel = () => {
    if (!analyser) return 0;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Find the maximum volume level from the frequency bins
    const maxVol = Math.max(...dataArray);

    // Normalize to 0-1 range
    const normalizedVolume = maxVol / 255;

    // Set a threshold to ignore irrelevant volumes
    const threshold = 0.6; // Adjust this threshold as needed

    return normalizedVolume > threshold ? normalizedVolume : 0;
}

// Get volume level from player's mic
// export const getVolumeLevel = () => {
//     if (!analyser) return 0;

//     const dataArray = new Uint8Array(analyser.frequencyBinCount);
//     analyser.getByteFrequencyData(dataArray);

//     const avg = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
//     const max = Math.max(...dataArray)
//     const normalizedVol = max > 0 ? avg / max : 0;

//     return normalizedVol;
// }