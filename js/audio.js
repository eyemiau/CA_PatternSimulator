class AudioEngine {
    constructor() {
        this.sounds = {
            spawn: new Audio('../sounds/47313572-ui-pop-sound-316482.mp3'),
            pause: new Audio('../sounds/vadim_makes_sound-soft-app-button-tap-sound-2-547872.mp3'),
            start: new Audio('../sounds/creatorshome-digital-click-357350.mp3'),
            clear: new Audio('../sounds/dragon-studio-simple-whoosh-382724.mp3'),
            drone: new Audio('../sounds/Weightless_Horizon.mp3')
        };

        this.sounds.spawn.volume = 0.05; 
        this.sounds.pause.volume = 0.8;  
        this.sounds.start.volume = 0.8;
        this.sounds.clear.volume = 0.6;

        this.sounds.drone.volume = 0.3;
        this.sounds.drone.loop = true;
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            const soundClone = this.sounds[soundName].cloneNode();
            soundClone.volume = this.sounds[soundName].volume; 
            soundClone.play().catch(() => {});
        }
    }

    toggleAmbient(isPlay) {
        if (isPlay) {
            this.sounds.drone.play().catch(() => {});
        } else {
            this.sounds.drone.pause();
        }
    }

    updateAmbientByGrid(activeCellsCount, maxCells) {
        if (this.sounds.drone.paused) return;

        const ratio = Math.min(1, activeCellsCount / (maxCells * 0.3));
        // Меняем только громкость. Изменение playbackRate каждый кадр сильно грузит систему.
        const targetVolume = 0.15 + (ratio * 0.35);
        this.sounds.drone.volume = targetVolume;
    }
}

export const audioManager = new AudioEngine();