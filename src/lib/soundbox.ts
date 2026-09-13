// Soundbox Voice Announcement Utility for UPI Gateway
export function playSoundboxAnnouncement(amount: number, merchantName: string = 'Robin UPI') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Cancel any current speech

    const text = `${merchantName} par ${Math.round(amount)} rupaye prapt hue.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Try finding Hindi voice if available, else standard
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.name.toLowerCase().includes('india'));
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Soundbox speech error:', err);
  }
}
