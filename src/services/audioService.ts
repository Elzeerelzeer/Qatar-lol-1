// Comprehensive Web Audio API & Speech Synthesis Service for Qatar Lawwal
// Procedural audio generation: 100% offline, zero external dependencies, immediate responsiveness

export type AudioZone = 'gate' | 'souq' | 'sea' | 'nokhatha' | 'majlis' | 'fereej' | 'studio' | 'none';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isVoiceMuted: boolean = false;
  private isInitialized: boolean = false;
  private currentAmbientNode: { stop: () => void } | null = null;
  private currentZone: AudioZone = 'none';
  private hasArabicVoice: boolean = false;
  private onStatusChangeCallbacks: Array<(status: 'working' | 'stopped' | 'no-arabic') => void> = [];

  // Traditional Heritage Background Music (موسيقى تراثية هادئة)
  private isBGMActive: boolean = false;
  private bgmLoopTimer: any = null;
  private bgmGainNode: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Check voices when loaded
      this.initVoices();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoices();
        };
      }
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.hasArabicVoice = false;
      this.notifyStatus();
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    const arabic = voices.find(v => v.lang.startsWith('ar'));
    this.hasArabicVoice = !!arabic;
    this.notifyStatus();
  }

  public subscribeStatus(cb: (status: 'working' | 'stopped' | 'no-arabic') => void) {
    this.onStatusChangeCallbacks.push(cb);
    cb(this.getStatus());
    return () => {
      this.onStatusChangeCallbacks = this.onStatusChangeCallbacks.filter(c => c !== cb);
    };
  }

  private notifyStatus() {
    const st = this.getStatus();
    this.onStatusChangeCallbacks.forEach(cb => cb(st));
  }

  public getStatus(): 'working' | 'stopped' | 'no-arabic' {
    if (this.isMuted) return 'stopped';
    if (!this.hasArabicVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // If Web Audio works but no Arabic voice in TTS
      return 'no-arabic';
    }
    return 'working';
  }

  public init() {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.isInitialized = true;
      this.notifyStatus();
      this.preloadWelcomeAudioBuffer();
      this.preloadEntranceAudioBuffer();
    } catch {
      console.warn('AudioContext not supported');
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAmbient();
      this.stopSpeech();
      this.pauseHeritageBGM();
    } else {
      if (this.isBGMActive) {
        this.resumeHeritageBGM();
      }
    }
    this.notifyStatus();
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted) {
      this.stopAmbient();
      this.stopSpeech();
      this.pauseHeritageBGM();
    } else {
      if (this.isBGMActive) {
        this.resumeHeritageBGM();
      }
    }
    this.notifyStatus();
  }

  public toggleAudio(muted: boolean) {
    this.setMuted(muted);
  }

  public toggleVoice(muted: boolean) {
    this.isVoiceMuted = muted;
    if (this.isVoiceMuted) {
      this.stopSpeech();
    }
  }

  public stopAll() {
    this.stopAmbient();
    this.stopSpeech();
    this.stopHeritageBGM();
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public isBGMPlaying(): boolean {
    return this.isBGMActive && !this.isMuted;
  }

  public stopSpeech() {
    this.stopWelcomeAbuRashid();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  private currentWelcomeAudio: HTMLAudioElement | null = null;
  private preloadedWelcomeBuffer: AudioBuffer | null = null;
  private welcomeBufferLoading = false;

  private currentEntranceAudio: HTMLAudioElement | null = null;
  private preloadedEntranceBuffer: AudioBuffer | null = null;
  private entranceBufferLoading = false;

  // Preload authentic male voice buffer via Web Audio API
  private preloadWelcomeAudioBuffer() {
    if (this.preloadedWelcomeBuffer || this.welcomeBufferLoading || typeof window === 'undefined') return;
    this.init();
    if (!this.ctx) return;

    this.welcomeBufferLoading = true;
    fetch('/assets/abu_rashid_welcome.mp3')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch asset');
        return res.arrayBuffer();
      })
      .then(arrayBuffer => {
        if (!this.ctx) return;
        return this.ctx.decodeAudioData(arrayBuffer);
      })
      .then(audioBuffer => {
        if (audioBuffer) {
          this.preloadedWelcomeBuffer = audioBuffer;
        }
      })
      .catch(() => {
        // Retry with root path
        fetch('/abu_rashid_welcome.mp3')
          .then(res => res.arrayBuffer())
          .then(ab => this.ctx?.decodeAudioData(ab))
          .then(decoded => {
            if (decoded) this.preloadedWelcomeBuffer = decoded;
          })
          .catch(() => {
            // will rely on HTMLAudioElement
          });
      })
      .finally(() => {
        this.welcomeBufferLoading = false;
      });
  }

  // Preload captivating entrance jingle buffer via Web Audio API
  private preloadEntranceAudioBuffer() {
    if (this.preloadedEntranceBuffer || this.entranceBufferLoading || typeof window === 'undefined') return;
    this.init();
    if (!this.ctx) return;

    this.entranceBufferLoading = true;
    fetch('/assets/time_gate_entrance.mp3')
      .then(res => {
        if (!res.ok) throw new Error('Entrance asset fetch failed');
        return res.arrayBuffer();
      })
      .then(arrayBuffer => {
        if (!this.ctx) return;
        return this.ctx.decodeAudioData(arrayBuffer);
      })
      .then(audioBuffer => {
        if (audioBuffer) {
          this.preloadedEntranceBuffer = audioBuffer;
        }
      })
      .catch(() => {
        // Fallback root path
        fetch('/time_gate_entrance.mp3')
          .then(res => res.arrayBuffer())
          .then(ab => this.ctx?.decodeAudioData(ab))
          .then(decoded => {
            if (decoded) this.preloadedEntranceBuffer = decoded;
          })
          .catch(() => {
            // will synthesize or use HTMLAudioElement
          });
      })
      .finally(() => {
        this.entranceBufferLoading = false;
      });
  }

  public playWelcomeAbuRashid(onStart?: () => void, onEnd?: () => void) {
    if (this.isMuted || this.isVoiceMuted) {
      if (onEnd) onEnd();
      return;
    }

    this.init();
    this.playSoftChime();

    // إيقاف أي تشغيل حالي وإعادة التعيين لضمان التشغيل الفوري من البداية
    this.stopWelcomeAbuRashid();

    const textToSpeak = 'مَرْحَبًا بِكُمْ فِي قَطَر لَوَّل. يَلَّا، نَفْتَحْ بَوَّابَةَ الزَّمَنِ، وَنَبْدَأْ رِحْلَتَنَا فِي تُرَاثِ قَطَر.';
    let audioStarted = false;

    // 1. الخيار الأول والأساسي: تشغيل التسجيل الصوتي الأصيل لرجل (أبو راشد) عبر AudioBuffer أو HTMLAudioElement
    // إذا كان البفر الصوتي محملاً مسبقاً في Web Audio
    if (this.preloadedWelcomeBuffer && this.ctx && this.ctx.state !== 'closed') {
      try {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        const source = this.ctx.createBufferSource();
        source.buffer = this.preloadedWelcomeBuffer;
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(1.0, this.ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        source.onended = () => {
          this.currentAmbientNode = null;
          if (onEnd) onEnd();
        };

        source.start(0);
        audioStarted = true;
        if (onStart) onStart();
        return;
      } catch (e) {
        console.warn('Web Audio buffer play failed, falling back to HTMLAudioElement', e);
      }
    }

    // 2. تشغيل عبر عنصر الصوت HTMLAudioElement (ملف صوت أبو راشد الرجالي MP3/WAV)
    const playMaleSpeechSynthesisFallback = () => {
      if (audioStarted) return;
      audioStarted = true;

      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
      }

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();

        const voices = window.speechSynthesis.getVoices() || [];
        const arabicVoices = voices.filter(v => {
          const l = (v.lang || '').toLowerCase();
          const n = (v.name || '').toLowerCase();
          return l.startsWith('ar') || l.includes('arabic') || n.includes('arabic') || n.includes('عربي');
        });

        const maleKeywords = ['maged', 'tariq', 'naayf', 'hamed', 'salman', 'shakir', 'majid', 'male', 'omar', 'abdullah', 'youssef', 'bilal', 'zayd', 'rashid', 'ibrahim', 'ali', 'khalid', 'hassan'];
        const femaleKeywords = ['laila', 'zariyah', 'fatima', 'salma', 'mariam', 'hoda', 'sana', 'zeina', 'female', 'yasmin', 'nour', 'aya', 'ar-xa', 'ar_xa'];

        const definiteMaleVoice = arabicVoices.find(v => {
          const n = (v.name || '').toLowerCase();
          return maleKeywords.some(k => n.includes(k));
        });

        const nonFemaleVoice = arabicVoices.find(v => {
          const n = (v.name || '').toLowerCase();
          return !femaleKeywords.some(k => n.includes(k)) && !n.includes('female');
        });

        const selectedVoice = definiteMaleVoice || nonFemaleVoice || arabicVoices[0];

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        // ضبط حدة الصوت (Pitch) لتكون عميقة ومميزة لرجل كبير في السن (أبو راشد)
        utterance.pitch = definiteMaleVoice ? 0.82 : 0.65; // طبقة رجالية عميقة
        utterance.rate = 0.86; // سرعة وقورة ومتأنية
        utterance.volume = 1;

        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang || 'ar-QA';
        } else {
          utterance.lang = 'ar-QA';
        }

        utterance.onstart = () => {
          if (onStart) onStart();
        };

        utterance.onend = () => {
          if (onEnd) onEnd();
          (window as any).__activeAbuRashidUtterance = null;
        };

        utterance.onerror = () => {
          if (onEnd) onEnd();
          (window as any).__activeAbuRashidUtterance = null;
        };

        (window as any).__activeAbuRashidUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      } catch {
        if (onEnd) onEnd();
      }
    };

    try {
      // تجربة تشغيل ملف الصوت المسجل لصوت رجل أولاً
      const audio = new Audio('/assets/abu_rashid_welcome.mp3');
      audio.volume = 1.0;
      audio.playbackRate = 0.95;
      this.currentWelcomeAudio = audio;

      let hasTriggeredStart = false;
      audio.onplay = () => {
        audioStarted = true;
        hasTriggeredStart = true;
        if (onStart) onStart();
      };

      audio.onended = () => {
        this.currentWelcomeAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        // محاولة بديلة للمسار المباشر /abu_rashid_welcome.mp3
        const altAudio = new Audio('/abu_rashid_welcome.mp3');
        altAudio.volume = 1.0;
        altAudio.playbackRate = 0.95;
        this.currentWelcomeAudio = altAudio;

        altAudio.onplay = () => {
          audioStarted = true;
          hasTriggeredStart = true;
          if (onStart) onStart();
        };

        altAudio.onended = () => {
          this.currentWelcomeAudio = null;
          if (onEnd) onEnd();
        };

        altAudio.onerror = () => {
          this.currentWelcomeAudio = null;
          playMaleSpeechSynthesisFallback();
        };

        altAudio.play().catch(() => {
          this.currentWelcomeAudio = null;
          playMaleSpeechSynthesisFallback();
        });
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // جرب المسار الآخر أو البديل الرجالي
          const altAudio = new Audio('/abu_rashid_welcome.mp3');
          altAudio.volume = 1.0;
          this.currentWelcomeAudio = altAudio;
          altAudio.onplay = () => {
            audioStarted = true;
            if (onStart) onStart();
          };
          altAudio.onended = () => {
            this.currentWelcomeAudio = null;
            if (onEnd) onEnd();
          };
          altAudio.play().catch(() => {
            this.currentWelcomeAudio = null;
            playMaleSpeechSynthesisFallback();
          });
        });
      }

      // أمان إضافي: إذا لم يبدأ الصوت خلال 500ms
      setTimeout(() => {
        if (!audioStarted && !hasTriggeredStart) {
          playMaleSpeechSynthesisFallback();
        }
      }, 500);

    } catch (err) {
      console.warn('Audio play error, using male voice synthesis fallback:', err);
      playMaleSpeechSynthesisFallback();
    }
  }

  public stopWelcomeAbuRashid() {
    if (this.currentWelcomeAudio) {
      try {
        this.currentWelcomeAudio.pause();
        this.currentWelcomeAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentWelcomeAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }

  public speak(text: string, onEnd?: () => void, onStart?: () => void) {
    if (this.isMuted || this.isVoiceMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const performSpeak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-QA';
        utterance.rate = 0.88; // وتيرة هادئة وقورة
        utterance.pitch = 0.74; // طبقة رجالية وقورة وواضحة (صوت رجل مسن / أبو راشد)

        const voices = window.speechSynthesis.getVoices() || [];
        const arabicVoices = voices.filter(v => {
          const l = (v.lang || '').toLowerCase();
          const n = (v.name || '').toLowerCase();
          return l.startsWith('ar') || l.includes('arabic') || n.includes('arabic') || n.includes('عربي');
        });

        const maleKeywords = ['maged', 'tariq', 'naayf', 'hamed', 'salman', 'shakir', 'majid', 'male', 'omar', 'abdullah', 'youssef', 'bilal', 'zayd', 'rashid', 'ibrahim', 'ali', 'khalid', 'hassan'];
        const femaleKeywords = ['laila', 'zariyah', 'fatima', 'salma', 'mariam', 'hoda', 'sana', 'zeina', 'female', 'yasmin', 'nour', 'aya', 'ar-xa', 'ar_xa'];

        const definiteMaleVoice = arabicVoices.find(v => {
          const n = (v.name || '').toLowerCase();
          return maleKeywords.some(k => n.includes(k));
        });

        const nonFemaleVoice = arabicVoices.find(v => {
          const n = (v.name || '').toLowerCase();
          return !femaleKeywords.some(k => n.includes(k)) && !n.includes('female');
        });

        const selectedVoice = definiteMaleVoice || nonFemaleVoice || arabicVoices[0];
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang;
        }

        utterance.onstart = () => {
          if (onStart) onStart();
        };
        utterance.onend = () => {
          if (onEnd) onEnd();
          (window as any).__currentAudioServiceUtterance = null;
        };
        utterance.onerror = () => {
          if (onEnd) onEnd();
          (window as any).__currentAudioServiceUtterance = null;
        };

        (window as any).__currentAudioServiceUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
        setTimeout(() => {
          performSpeak();
        }, 70);
      } else {
        performSpeak();
      }
    } catch {
      if (onEnd) onEnd();
    }
  }

  public stopAmbient() {
    if (this.currentAmbientNode) {
      try {
        this.currentAmbientNode.stop();
      } catch {
        // ignore
      }
      this.currentAmbientNode = null;
    }
  }

  public setZone(zone: AudioZone) {
    if (this.currentZone === zone) return;
    this.stopAmbient();
    this.stopSpeech();
    this.currentZone = zone;

    if (this.isMuted) return;
    this.init();

    switch (zone) {
      case 'gate':
        this.startGateAmbient();
        break;
      case 'souq':
        this.startSouqAmbient();
        break;
      case 'sea':
        this.startSeaAmbient();
        break;
      case 'nokhatha':
        this.startNokhathaAmbient();
        break;
      case 'majlis':
        this.startMajlisAmbient();
        break;
      case 'fereej':
        this.startFereejAmbient();
        break;
      default:
        break;
    }
  }

  // --- PROCEDURAL SOUND GENERATORS & CINEMATIC ENTRANCE ---

  // 1. نغمة الدخول الجذابة والمهيبة لبوابة الزمن (Time Gate Entrance Fanfare)
  public playDoorOpen() {
    this.playTimeGateEntrance();
  }

  public playTimeGateEntrance() {
    if (this.isMuted) return;
    this.init();

    let fileAudioStarted = false;

    // أ) الأولوية الأولى: تشغيل التسجيل الصوتي السينمائي عالي النقاوة عبر Web Audio Buffer إن كان جاهزاً
    if (this.preloadedEntranceBuffer && this.ctx && this.ctx.state !== 'closed') {
      try {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        const source = this.ctx.createBufferSource();
        source.buffer = this.preloadedEntranceBuffer;
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.95, this.ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(0);
        fileAudioStarted = true;
        return;
      } catch (err) {
        console.warn('Entrance buffer playback error, trying HTMLAudioElement:', err);
      }
    }

    // ب) الأولوية الثانية: تشغيل عبر عنصر الصوت HTMLAudioElement
    try {
      const audio = new Audio('/assets/time_gate_entrance.mp3');
      audio.volume = 0.95;
      this.currentEntranceAudio = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            fileAudioStarted = true;
          })
          .catch(() => {
            // محاولة المسار المباشر
            const altAudio = new Audio('/time_gate_entrance.mp3');
            altAudio.volume = 0.95;
            this.currentEntranceAudio = altAudio;
            altAudio.play().then(() => {
              fileAudioStarted = true;
            }).catch(() => {
              if (!fileAudioStarted) {
                this.synthesizeTimeGateFanfare();
              }
            });
          });
      } else {
        fileAudioStarted = true;
      }
    } catch {
      this.synthesizeTimeGateFanfare();
      return;
    }

    // صمام أمان فوري: إن لم يبدأ الصوت خلال 250ms، قم بتوليد النغمة الجذابة فورياً عبر Web Audio
    setTimeout(() => {
      if (!fileAudioStarted) {
        this.synthesizeTimeGateFanfare();
      }
    }, 250);
  }

  // التوليد الصوتي الإجرائي الفوري لنغمة بوابة الزمن في حال عدم توفر ملف الصوت
  public synthesizeTimeGateFanfare() {
    if (this.isMuted || !this.ctx || this.ctx.state === 'closed') return;
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const t = this.ctx.currentTime;

      // 1. تدفق طاقة بوابة الزمن (Cosmic Portal Whoosh)
      const noiseDuration = 2.4;
      const bufferSize = Math.floor(this.ctx.sampleRate * noiseDuration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(280, t);
      bandpass.frequency.exponentialRampToValueAtTime(2600, t + 1.2);
      bandpass.frequency.exponentialRampToValueAtTime(600, t + 2.2);
      bandpass.Q.setValueAtTime(5, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, t);
      noiseGain.gain.linearRampToValueAtTime(0.22, t + 0.6);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 2.4);

      // 2. ارتداد الخشب التراثي العميق لفتح البوابة (Warm Cedar Resonance)
      const woodOsc = this.ctx.createOscillator();
      const woodGain = this.ctx.createGain();
      woodOsc.type = 'sine';
      woodOsc.frequency.setValueAtTime(130, t);
      woodOsc.frequency.exponentialRampToValueAtTime(55, t + 0.6);

      woodGain.gain.setValueAtTime(0.01, t);
      woodGain.gain.linearRampToValueAtTime(0.28, t + 0.08);
      woodGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      woodOsc.connect(woodGain);
      woodGain.connect(this.ctx.destination);
      woodOsc.start(t);
      woodOsc.stop(t + 1.3);

      // 3. عزف تراثي عربي بهيج (عود / قانون - Arabian Heritage Arpeggio)
      const arpeggioNotes = [
        { freq: 293.66, time: 0.10, dur: 0.9, gain: 0.22 }, // D4
        { freq: 369.99, time: 0.25, dur: 0.9, gain: 0.23 }, // F#4
        { freq: 440.00, time: 0.40, dur: 1.0, gain: 0.25 }, // A4
        { freq: 493.88, time: 0.55, dur: 1.0, gain: 0.25 }, // B4
        { freq: 587.33, time: 0.70, dur: 1.2, gain: 0.28 }, // D5
        { freq: 739.98, time: 0.86, dur: 1.4, gain: 0.30 }, // F#5
        { freq: 880.00, time: 1.02, dur: 1.8, gain: 0.32 }, // A5
        { freq: 1174.66, time: 1.20, dur: 2.0, gain: 0.35 } // D6
      ];

      arpeggioNotes.forEach(note => {
        if (!this.ctx) return;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(note.freq, t + note.time);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(note.freq * 2, t + note.time);

        gainNode.gain.setValueAtTime(0.001, t + note.time);
        gainNode.gain.linearRampToValueAtTime(note.gain, t + note.time + 0.025);
        gainNode.gain.exponentialRampToValueAtTime(0.0005, t + note.time + note.dur);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc1.start(t + note.time);
        osc2.start(t + note.time);
        osc1.stop(t + note.time + note.dur + 0.1);
        osc2.stop(t + note.time + note.dur + 0.1);
      });

      // 4. بريق الأجراس الكريستالية الذهبية (Celestial Time Chimes)
      const celestialChimes = [
        { freq: 880.00, time: 0.75 },
        { freq: 1174.66, time: 0.95 },
        { freq: 1479.98, time: 1.15 },
        { freq: 1760.00, time: 1.35 },
        { freq: 2349.32, time: 1.55 }
      ];

      celestialChimes.forEach(chime => {
        if (!this.ctx) return;
        const chimeOsc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();

        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(chime.freq, t + chime.time);

        chimeGain.gain.setValueAtTime(0.001, t + chime.time);
        chimeGain.gain.linearRampToValueAtTime(0.20, t + chime.time + 0.02);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + chime.time + 1.8);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.ctx.destination);

        chimeOsc.start(t + chime.time);
        chimeOsc.stop(t + chime.time + 1.9);
      });

      // 5. كورد العبور الاحتفالي الفخم (Triumphant Fanfare Chord Swell)
      const fanfareChord = [
        { freq: 146.83, gain: 0.20 }, // D3
        { freq: 220.00, gain: 0.18 }, // A3
        { freq: 293.66, gain: 0.22 }, // D4
        { freq: 369.99, gain: 0.20 }, // F#4
        { freq: 440.00, gain: 0.18 }, // A4
        { freq: 587.33, gain: 0.16 }  // D5
      ];

      fanfareChord.forEach((voice, idx) => {
        if (!this.ctx) return;
        const chordOsc = this.ctx.createOscillator();
        const chordGain = this.ctx.createGain();

        chordOsc.type = 'sawtooth';
        chordOsc.frequency.setValueAtTime(voice.freq, t + 0.9);
        chordOsc.detune.setValueAtTime(idx % 2 === 0 ? 5 : -5, t + 0.9);

        const chordFilter = this.ctx.createBiquadFilter();
        chordFilter.type = 'lowpass';
        chordFilter.frequency.setValueAtTime(800, t + 0.9);
        chordFilter.frequency.exponentialRampToValueAtTime(2400, t + 1.6);
        chordFilter.frequency.exponentialRampToValueAtTime(900, t + 2.7);

        chordGain.gain.setValueAtTime(0.001, t + 0.9);
        chordGain.gain.linearRampToValueAtTime(voice.gain, t + 1.3);
        chordGain.gain.exponentialRampToValueAtTime(0.0005, t + 2.8);

        chordOsc.connect(chordFilter);
        chordFilter.connect(chordGain);
        chordGain.connect(this.ctx.destination);

        chordOsc.start(t + 0.9);
        chordOsc.stop(t + 2.9);
      });

    } catch (err) {
      console.warn('synthesizeTimeGateFanfare error:', err);
    }
  }

  public playGoldenChime() {
    if (this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C E G C E

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0, t + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, t + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.08 + 1.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 1.6);
    });
  }

  // Resonant mystical gate vibration / hum on hover or touch
  private lastGateHumTime: number = 0;
  public playGateVibration() {
    const now = Date.now();
    // throttle to avoid rapid multiple triggers
    if (now - this.lastGateHumTime < 1100) return;
    this.lastGateHumTime = now;

    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    // Deep warm wooden resonance with golden harmonic shimmer
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(115, t + 0.2);
    osc.frequency.exponentialRampToValueAtTime(65, t + 0.55);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.65);

    // Subtle brass ring shimmer
    const shimmer = this.ctx.createOscillator();
    const shimmerGain = this.ctx.createGain();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(1046.5, t + 0.05);
    shimmer.frequency.exponentialRampToValueAtTime(1318.5, t + 0.2);
    shimmerGain.gain.setValueAtTime(0.005, t + 0.05);
    shimmerGain.gain.linearRampToValueAtTime(0.035, t + 0.1);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

    shimmer.connect(shimmerGain);
    shimmerGain.connect(this.ctx.destination);
    shimmer.start(t + 0.05);
    shimmer.stop(t + 0.5);
  }

  // 2. Success Fanfare and celebration clapping
  public playSuccess() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major

    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.1);

      gain.gain.setValueAtTime(0, t + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, t + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 1.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 1.1);
    });

    // Rhythmic hand clapping effect
    this.playApplause(t + 0.4, 1.8);
  }

  private playApplause(startTime: number, duration: number) {
    if (!this.ctx) return;
    const claps = 12;
    for (let c = 0; c < claps; c++) {
      const clapTime = startTime + (c * 0.12) + (Math.random() * 0.04);
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200 + Math.random() * 400, clapTime);
      filter.Q.value = 2.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, clapTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.06);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(clapTime);
      noise.stop(clapTime + 0.07);
    }
  }

  // 3. Gentle non-jarring error tone
  public playError() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [260, 220].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.18);

      gain.gain.setValueAtTime(0, t + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.18, t + idx * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.18 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.18);
      osc.stop(t + idx * 0.18 + 0.4);
    });
  }

  // 4. Pearl collect chime
  public playPearlCollect(rarity: 'normal' | 'dana' | 'rare' = 'normal') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreq = rarity === 'rare' ? 1200 : rarity === 'dana' ? 987 : 784;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.2);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  // 5. Marble click (Al-Teelah)
  public playMarbleClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Quick light interface click
  public playClick() {
    this.playMarbleClick();
  }

  // 6. Coffee pouring and cup clink
  public playCoffeePour() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Trickling liquid drops
    for (let i = 0; i < 8; i++) {
      const dropTime = t + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + i * 50 + Math.random() * 80, dropTime);
      gain.gain.setValueAtTime(0.08, dropTime);
      gain.gain.exponentialRampToValueAtTime(0.001, dropTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(dropTime);
      osc.stop(dropTime + 0.08);
    }

    // Brass finjan clink
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const ct = this.ctx.currentTime;
      const clink = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();
      clink.type = 'sine';
      clink.frequency.setValueAtTime(2400, ct);
      cGain.gain.setValueAtTime(0.2, ct);
      cGain.gain.exponentialRampToValueAtTime(0.001, ct + 0.6);

      clink.connect(cGain);
      cGain.connect(this.ctx.destination);
      clink.start(ct);
      clink.stop(ct + 0.7);
    }, 700);
  }

  // --- AMBIENT SOUNDS BY ZONE ---

  private startGateAmbient() {
    if (!this.ctx) return;
    // Lanterns gentle wind chime & subtle warmth
    let active = true;
    const interval = setInterval(() => {
      if (!active || this.isMuted || !this.ctx) {
        clearInterval(interval);
        return;
      }
      if (Math.random() > 0.4) {
        this.playSoftChime();
      }
    }, 3000);

    this.currentAmbientNode = {
      stop: () => {
        active = false;
        clearInterval(interval);
      }
    };
  }

  public playSoftChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const notes = [659.25, 783.99, 987.77, 1174.66];
    const freq = notes[Math.floor(Math.random() * notes.length)];
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 1.3);
  }

  private startSeaAmbient() {
    if (!this.ctx) return;
    // Generate pink noise waves loop
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.08;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);

    // LFO to simulate swelling ocean waves
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime); // 5 sec wave cycle
    lfoGain.gain.setValueAtTime(220, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noiseSource.start();
    lfo.start();

    this.currentAmbientNode = {
      stop: () => {
        try {
          noiseSource.stop();
          lfo.stop();
        } catch {
          // ignore
        }
      }
    };
  }

  private startNokhathaAmbient() {
    // Sea swell + wooden ship creaking
    this.startSeaAmbient();
  }

  private startSouqAmbient() {
    if (!this.ctx) return;
    // Pleasant subtle market ambient texture
    let active = true;
    const interval = setInterval(() => {
      if (!active || this.isMuted || !this.ctx) {
        clearInterval(interval);
        return;
      }
      if (Math.random() > 0.6) {
        this.playSoftChime();
      }
    }, 4000);

    this.currentAmbientNode = {
      stop: () => {
        active = false;
        clearInterval(interval);
      }
    };
  }

  private startMajlisAmbient() {
    if (!this.ctx) return;
    // Gentle quiet hospitality atmosphere
    let active = true;
    const interval = setInterval(() => {
      if (!active || this.isMuted || !this.ctx) {
        clearInterval(interval);
        return;
      }
      if (Math.random() > 0.7) {
        this.playSoftChime();
      }
    }, 5000);

    this.currentAmbientNode = {
      stop: () => {
        active = false;
        clearInterval(interval);
      }
    };
  }

  private startFereejAmbient() {
    if (!this.ctx) return;
    // Playful light percussion rhythm
    let active = true;
    const interval = setInterval(() => {
      if (!active || this.isMuted || !this.ctx) {
        clearInterval(interval);
        return;
      }
      if (Math.random() > 0.6) {
        this.playMarbleClick();
      }
    }, 3500);

    this.currentAmbientNode = {
      stop: () => {
        active = false;
        clearInterval(interval);
      }
    };
  }

  // 7. Traditional Brass Menhaz Strike (رنة المنحاز النحاسي لدق القهوة)
  public playMenhazStrike() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const harmonics = [
      { freq: 820, gain: 0.28, decay: 1.3, type: 'triangle' as OscillatorType },
      { freq: 1640, gain: 0.16, decay: 0.9, type: 'sine' as OscillatorType },
      { freq: 2465, gain: 0.12, decay: 0.6, type: 'sine' as OscillatorType },
      { freq: 3280, gain: 0.08, decay: 0.4, type: 'sine' as OscillatorType },
    ];

    harmonics.forEach(({ freq, gain: maxGain, decay, type }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      // subtle downward pitch bend from metal impact
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, t + decay);

      gainNode.gain.setValueAtTime(maxGain, t);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + decay + 0.05);
    });
  }

  // 8. Pottery clay water sound (خرير ماء الجحلة واليزلة)
  public playPotterySound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    // Hollow ceramic resonance + cool water drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.35);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  // 9. Sadu loom weaving sound (حياكة ونول السدو التراثي)
  public playSaduLoomSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    // 3 shuttle passes with wooden thumps
    for (let i = 0; i < 3; i++) {
      const beatTime = t + i * 0.22;
      // Shuttle slide whoosh
      const noise = this.ctx.createBufferSource();
      const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.12), this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) data[j] = (Math.random() * 2 - 1) * Math.sin((j / data.length) * Math.PI);
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400 + i * 150, beatTime);
      filter.Q.value = 4;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, beatTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.11);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(beatTime);
      noise.stop(beatTime + 0.12);

      // Loom wooden beater thump (المنشزة / دفة النول)
      const thump = this.ctx.createOscillator();
      const thumpGain = this.ctx.createGain();
      thump.type = 'triangle';
      thump.frequency.setValueAtTime(180, beatTime + 0.08);
      thump.frequency.exponentialRampToValueAtTime(70, beatTime + 0.18);
      thumpGain.gain.setValueAtTime(0.22, beatTime + 0.08);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.2);
      thump.connect(thumpGain);
      thumpGain.connect(this.ctx.destination);
      thump.start(beatTime + 0.08);
      thump.stop(beatTime + 0.22);
    }
  }

  // 10. Mabkhara and burning oud incense embers sound (جمر العود ورائحة الطيب)
  public playMabkharaSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    // Sizzling ember noise
    const duration = 0.8;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.85 ? 1 : 0.2);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(3500, t);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    noise.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + duration);

    // Warm fragrant brass chime
    const chime = this.ctx.createOscillator();
    const cGain = this.ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(1174.66, t + 0.15); // D6
    cGain.gain.setValueAtTime(0.15, t + 0.15);
    cGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    chime.connect(cGain);
    cGain.connect(this.ctx.destination);
    chime.start(t + 0.15);
    chime.stop(t + 1.2);
  }

  // 11. Pearl diving tools sound: sea splash, nose-clip click & oyster tap (أدوات الغواص والفطام والمفلقة)
  public playDivingToolsSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    // Deep sea plunge bubble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.35);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);

    // Fitam clip click (طقطقة الفطام العظمي على الأنف)
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const ct = this.ctx.currentTime;
      const click = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(1800, ct);
      click.frequency.exponentialRampToValueAtTime(400, ct + 0.04);
      cGain.gain.setValueAtTime(0.25, ct);
      cGain.gain.exponentialRampToValueAtTime(0.001, ct + 0.06);
      click.connect(cGain);
      cGain.connect(this.ctx.destination);
      click.start(ct);
      click.stop(ct + 0.07);
    }, 200);

    // Oyster shell tap (طرق المحار)
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const ct = this.ctx.currentTime;
      const tap = this.ctx.createOscillator();
      const tGain = this.ctx.createGain();
      tap.type = 'sine';
      tap.frequency.setValueAtTime(1100, ct);
      tGain.gain.setValueAtTime(0.18, ct);
      tGain.gain.exponentialRampToValueAtTime(0.001, ct + 0.3);
      tap.connect(tGain);
      tGain.connect(this.ctx.destination);
      tap.start(ct);
      tap.stop(ct + 0.32);
    }, 450);
  }

  // 12. Mandoos wooden chest creak & brass lock click (المندوس الخشبي التراثي)
  public playMandoosSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    // Heavy wooden creak
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.25);
    osc.frequency.linearRampToValueAtTime(80, t + 0.45);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.55);

    // Heavy brass latch clack (قفل المندوس النحاسي الثقيل)
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const ct = this.ctx.currentTime;
      const latch = this.ctx.createOscillator();
      const lGain = this.ctx.createGain();
      latch.type = 'triangle';
      latch.frequency.setValueAtTime(750, ct);
      lGain.gain.setValueAtTime(0.24, ct);
      lGain.gain.exponentialRampToValueAtTime(0.001, ct + 0.2);
      latch.connect(lGain);
      lGain.connect(this.ctx.destination);
      latch.start(ct);
      latch.stop(ct + 0.22);
    }, 400);
  }

  // 13. Al-Raha traditional stone rotary grinding sound (صوت حجر الرحى لطحن الحبوب)
  public playRahaSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    // Low stone friction rotation
    const duration = 0.9;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, t);
    filter.frequency.linearRampToValueAtTime(420, t + 0.4);
    filter.frequency.linearRampToValueAtTime(220, t + duration);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + duration);

    // Stone rumbling sub-tone
    const rumble = this.ctx.createOscillator();
    const rGain = this.ctx.createGain();
    rumble.type = 'sine';
    rumble.frequency.setValueAtTime(65, t);
    rumble.frequency.linearRampToValueAtTime(85, t + 0.4);
    rumble.frequency.linearRampToValueAtTime(55, t + duration);
    rGain.gain.setValueAtTime(0.18, t);
    rGain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    rumble.connect(rGain);
    rGain.connect(this.ctx.destination);
    rumble.start(t);
    rumble.stop(t + duration);
  }

  // 14. Old brass market scale sound: chains and weights clink (ميزان السوق القديم ورنّة الصنج)
  public playMizaanSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    // Chain links rattle
    for (let i = 0; i < 4; i++) {
      const linkTime = t + i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2200 + i * 200, linkTime);
      gain.gain.setValueAtTime(0.14, linkTime);
      gain.gain.exponentialRampToValueAtTime(0.001, linkTime + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(linkTime);
      osc.stop(linkTime + 0.07);
    }

    // Heavy brass weight balance ding (الصنجة النحاسية)
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const ct = this.ctx.currentTime;
      const bell = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(1480, ct);
      bGain.gain.setValueAtTime(0.22, ct);
      bGain.gain.exponentialRampToValueAtTime(0.001, ct + 0.9);
      bell.connect(bGain);
      bGain.connect(this.ctx.destination);
      bell.start(ct);
      bell.stop(ct + 0.95);
    }, 280);
  }

  // 15. Dust wipe / scratch brush sound (مسح الغبار)
  public playDustWipe() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const duration = 0.08;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.Q.value = 1.5;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + duration);
  }

  // 16. Chest open golden reveal sound (فتح الصندوق التراثي ببريق ذهبي)
  public playChestOpenGolden() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    // Wooden lid creak
    const creak = this.ctx.createOscillator();
    const cGain = this.ctx.createGain();
    creak.type = 'sawtooth';
    creak.frequency.setValueAtTime(110, t);
    creak.frequency.exponentialRampToValueAtTime(190, t + 0.35);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    cGain.gain.setValueAtTime(0.01, t);
    cGain.gain.linearRampToValueAtTime(0.18, t + 0.06);
    cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    creak.connect(filter);
    filter.connect(cGain);
    cGain.connect(this.ctx.destination);
    creak.start(t);
    creak.stop(t + 0.45);

    // Radiant Golden Chimes arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + 0.15 + idx * 0.08);
      g.gain.setValueAtTime(0.001, t + 0.15 + idx * 0.08);
      g.gain.linearRampToValueAtTime(0.2, t + 0.18 + idx * 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15 + idx * 0.08 + 1.2);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t + 0.15 + idx * 0.08);
      osc.stop(t + 0.15 + idx * 0.08 + 1.3);
    });
  }

  // 17. Lawwal coins collect clinking sound (نقود لوّل 20 قطعة)
  public playCoinsCollect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const coinPitches = [1760, 2093, 2349, 2637, 3135, 3520];
    coinPitches.forEach((pitch, i) => {
      if (!this.ctx) return;
      const coinTime = t + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, coinTime);
      gain.gain.setValueAtTime(0.18, coinTime);
      gain.gain.exponentialRampToValueAtTime(0.001, coinTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(coinTime);
      osc.stop(coinTime + 0.28);
    });
  }

  // 18. Correct placement celebration (وضع الأداة في مكانها الصحيح)
  public playCorrectPlacement() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const chords = [587.33, 739.99, 880, 1174.66]; // D F# A D
    chords.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      gain.gain.setValueAtTime(0.001, t + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.22, t + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.06 + 1.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 1.2);
    });
  }

  // --- CALM TRADITIONAL QATARI HERITAGE BACKGROUND MUSIC (موسيقى تراثية قطرية هادئة) ---
  public startHeritageBGM() {
    this.isBGMActive = true;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // Initialize master BGM gain node
    if (!this.bgmGainNode) {
      this.bgmGainNode = this.ctx.createGain();
      this.bgmGainNode.gain.setValueAtTime(this.isMuted ? 0.0001 : 0.22, this.ctx.currentTime);
      this.bgmGainNode.connect(this.ctx.destination);
    } else {
      this.bgmGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGainNode.gain.setValueAtTime(this.isMuted ? 0.0001 : 0.22, this.ctx.currentTime);
    }

    if (this.bgmLoopTimer) {
      return; // Already playing loop
    }

    // Heritage Qatari Maqam Bayati scale notes (Hz)
    const notes: Record<string, number> = {
      D3: 146.83,
      Eqf3: 159.0, // E Bayati quarter-flat
      F3: 174.61,
      G3: 196.00,
      A3: 220.00,
      Bb3: 233.08,
      C4: 261.63,
      D4: 293.66,
      Eqf4: 318.0,
      F4: 349.23,
    };

    // Traditional melodic phrase (Oud and Nay in gentle dialogue)
    const phrasePattern: Array<{ note: string; timeOffset: number; duration: number; instrument: 'oud' | 'nay' | 'both' }> = [
      // Phrase 1: Opening peaceful welcoming motif (نغمة الترحيب والاستهلال)
      { note: 'D3', timeOffset: 0.0, duration: 1.8, instrument: 'both' },
      { note: 'F3', timeOffset: 1.5, duration: 1.1, instrument: 'oud' },
      { note: 'G3', timeOffset: 2.7, duration: 1.3, instrument: 'oud' },
      { note: 'A3', timeOffset: 4.1, duration: 2.2, instrument: 'both' },

      // Phrase 2: Gentle descend in Bayati (انسياب هادئ لنغم البياتي)
      { note: 'G3', timeOffset: 6.5, duration: 1.2, instrument: 'oud' },
      { note: 'F3', timeOffset: 7.8, duration: 1.2, instrument: 'oud' },
      { note: 'Eqf3', timeOffset: 9.1, duration: 1.4, instrument: 'oud' },
      { note: 'D3', timeOffset: 10.6, duration: 2.4, instrument: 'both' },

      // Phrase 3: High melodic shimmer / Jawab (جواب العود والناي)
      { note: 'A3', timeOffset: 13.2, duration: 1.4, instrument: 'both' },
      { note: 'C4', timeOffset: 14.7, duration: 1.1, instrument: 'oud' },
      { note: 'D4', timeOffset: 15.9, duration: 2.0, instrument: 'both' },
      { note: 'C4', timeOffset: 18.0, duration: 1.2, instrument: 'oud' },

      // Phrase 4: Serene resolution (قرار هادئ ومريح)
      { note: 'Bb3', timeOffset: 19.3, duration: 1.3, instrument: 'oud' },
      { note: 'A3', timeOffset: 20.7, duration: 1.3, instrument: 'oud' },
      { note: 'G3', timeOffset: 22.1, duration: 1.4, instrument: 'oud' },
      { note: 'F3', timeOffset: 23.6, duration: 1.2, instrument: 'oud' },
      { note: 'Eqf3', timeOffset: 24.9, duration: 1.3, instrument: 'oud' },
      { note: 'D3', timeOffset: 26.3, duration: 3.2, instrument: 'both' },
    ];

    const cycleDuration = 30.0; // 30 seconds peaceful cycle

    const playCycle = () => {
      if (!this.ctx || this.isMuted || !this.isBGMActive) return;
      const now = this.ctx.currentTime;

      // Soft rhythmic pulse: Gentle Mirwas & Tar rhythm (إيقاع المرواس والطار التراثي الهادئ)
      const beatInterval = 1.25; // Calm ~48 BPM slow relaxed pulse
      const totalBeats = Math.floor(cycleDuration / beatInterval);

      for (let b = 0; b < totalBeats; b++) {
        const beatTime = now + (b * beatInterval);
        if (b % 4 === 0) {
          // Soft resonant Dum on beat 1
          this.synthesizeSoftMirwas(beatTime, 'dum');
        } else if (b % 4 === 2) {
          // Soft wooden Tak on beat 3
          this.synthesizeSoftMirwas(beatTime, 'tak');
        } else if (b % 4 === 3) {
          // Subtle soft shaker
          this.synthesizeSoftMirwas(beatTime, 'shaker');
        }
      }

      // Play melodic notes
      phrasePattern.forEach(item => {
        const noteFreq = notes[item.note] || 220;
        const noteTime = now + item.timeOffset;

        if (item.instrument === 'oud' || item.instrument === 'both') {
          this.synthesizeOudPluck(noteFreq, noteTime, item.duration);
        }
        if (item.instrument === 'nay' || item.instrument === 'both') {
          this.synthesizeNayDrone(noteFreq, noteTime, item.duration * 1.35);
        }
      });
    };

    playCycle();
    this.bgmLoopTimer = setInterval(() => {
      playCycle();
    }, (cycleDuration - 0.2) * 1000);
  }

  // Synthesize acoustic Oud pluck string sound
  private synthesizeOudPluck(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.bgmGainNode) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);
    // Subtle second harmonic for warm acoustic wood resonance
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    // Warm wooden soundbox lowpass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1700, startTime);
    filter.frequency.exponentialRampToValueAtTime(360, startTime + Math.min(duration * 0.7, 1.4));
    filter.Q.value = 1.3;

    // Pluck envelope: crisp natural attack, warm decay
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(0.19, startTime + 0.007);
    noteGain.gain.exponentialRampToValueAtTime(0.07, startTime + 0.14);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.bgmGainNode);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + 0.05);
    osc2.stop(startTime + duration + 0.05);
  }

  // Synthesize soft Nay flute drone
  private synthesizeNayDrone(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.bgmGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Gentle natural breath vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(4.2, startTime);
    lfoGain.gain.setValueAtTime(1.8, startTime);
    lfo.connect(osc.frequency);

    // Warm breath envelope: smooth atmospheric fade
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.045, startTime + 0.5);
    gain.gain.setValueAtTime(0.045, startTime + Math.max(0.6, duration - 0.6));
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.bgmGainNode);

    lfo.start(startTime);
    osc.start(startTime);
    lfo.stop(startTime + duration);
    osc.stop(startTime + duration);
  }

  // Synthesize soft traditional percussion beat (مرواس ودف هادئ)
  private synthesizeSoftMirwas(startTime: number, type: 'dum' | 'tak' | 'shaker') {
    if (!this.ctx || !this.bgmGainNode) return;

    if (type === 'dum') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, startTime);
      osc.frequency.exponentialRampToValueAtTime(45, startTime + 0.16);

      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

      osc.connect(gain);
      gain.connect(this.bgmGainNode);
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    } else if (type === 'tak') {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2100, startTime);
      filter.Q.value = 4.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.035, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGainNode);

      noise.start(startTime);
      noise.stop(startTime + 0.05);
    } else if (type === 'shaker') {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.03);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(5200, startTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.012, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.03);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGainNode);

      noise.start(startTime);
      noise.stop(startTime + 0.04);
    }
  }

  // Pause heritage background music smoothly
  public pauseHeritageBGM() {
    if (this.bgmGainNode && this.ctx) {
      this.bgmGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGainNode.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
    }
  }

  // Resume heritage background music smoothly
  public resumeHeritageBGM() {
    if (!this.isBGMActive) {
      this.startHeritageBGM();
      return;
    }
    if (this.bgmGainNode && this.ctx && !this.isMuted) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this.bgmGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGainNode.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 0.3);
      if (!this.bgmLoopTimer) {
        this.startHeritageBGM();
      }
    }
  }

  // Stop heritage background music completely
  public stopHeritageBGM() {
    this.isBGMActive = false;
    if (this.bgmLoopTimer) {
      clearInterval(this.bgmLoopTimer);
      this.bgmLoopTimer = null;
    }
    if (this.bgmGainNode && this.ctx) {
      this.bgmGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bgmGainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    }
  }

  // Audio test function
  public testAudio() {
    this.init();
    this.playSuccess();
    this.speak('مرحبًا بكم في قطر لوّل. تم اختبار الصوت بنجاح.');
  }

  // Dedicated Souq Lawwal audio test suite
  public testSouqAudio(onStep?: (stepName: string) => void) {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Step 1: Menhaz Strike
    this.playMenhazStrike();
    if (onStep) onStep('رنّة المنحاز النحاسي 🔔');

    // Step 2: Pouring Coffee & Finjan Clink
    setTimeout(() => {
      this.playCoffeePour();
      if (onStep) onStep('صبّة القهوة ورنّة الفنجان ☕');
    }, 700);

    // Step 3: Pottery and Water
    setTimeout(() => {
      this.playPotterySound();
      if (onStep) onStep('خرير ماء الجحلة الفخارية 🏺');
    }, 1400);

    // Step 4: Souq Golden Chime
    setTimeout(() => {
      this.playGoldenChime();
      if (onStep) onStep('نغمة معروضات السوق ✨');
    }, 2000);

    // Step 5: Abu Rashid voice announcement
    setTimeout(() => {
      if (onStep) onStep('صوت المرشد التراثي أبو راشد 🗣️');
      this.speak('صوت سوق لوّل يعمل بنجاح! مرحبًا بكم في السوق التراثي القديم.');
    }, 2700);
  }
}

export const audioEngine = new SoundEngine();
