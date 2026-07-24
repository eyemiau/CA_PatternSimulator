class AudioEngine {
    constructor() {
        this.sounds = {
            // Рождение клетки (мягкий поп)
            spawn: new Audio('../sounds/47313572-ui-pop-sound-316482.mp3'),
            
            // Кнопка Пауза (мягкий тап)
            pause: new Audio('../sounds/vadim_makes_sound-soft-app-button-tap-sound-2-547872.mp3'),
            
            // Кнопка Старт (четкий цифровой клик)
            start: new Audio('../sounds/creatorshome-digital-click-357350.mp3'),
            
            // Кнопка Очистить (звук взмаха/whoosh)
            clear: new Audio('../sounds/dragon-studio-simple-whoosh-382724.mp3'),
            
            // Фоновая музыка (эмбиент)
            drone: new Audio('../sounds/Weightless_Horizon.mp3')
        };

        // РАЗДЕЛЬНАЯ ГРОМКОСТЬ
        // Клетки делаем тихими, чтобы при массовом рисовании они не оглушали
        this.sounds.spawn.volume = 0.05; 
        
        // Интерфейс
        this.sounds.pause.volume = 0.8;  
        this.sounds.start.volume = 0.8;
        this.sounds.clear.volume = 0.6;

        // Фоновая музыка
        this.sounds.drone.volume = 0.3;
        this.sounds.drone.loop = true; // Зацикливаем трек навсегда
    }

    // Метод для коротких звуков
    play(soundName) {
        if (this.sounds[soundName]) {
            const soundClone = this.sounds[soundName].cloneNode();
            soundClone.volume = this.sounds[soundName].volume; 
            soundClone.play().catch(() => {});
        }
    }

    // Отдельный метод для фоновой музыки (включаем/выключаем)
    toggleAmbient(isPlay) {
        if (isPlay) {
            this.sounds.drone.play().catch(() => {});
        } else {
            this.sounds.drone.pause();
        }
    }
}

// Обязательно экспортируем!
export const audioManager = new AudioEngine();