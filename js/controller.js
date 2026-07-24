import { audioManager } from './audio.js';
export class AppController {
    // В конструктор передаем Модель и View
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        // Флаг состояния (идет ли анимация)
        this.isRunning = false;
        
        // Переменная для хранения ID анимации (чтобы уметь её останавливать)
        this.animationId = null;

        // Связываем методы с контекстом (this), чтобы они не потеряли класс 
        // при вызове из событий браузера (аналог bind в старом JS).
        // Используем стрелочные функции для сохранения контекста.
        this.gameLoop = this.gameLoop.bind(this);
    }

    // Метод инициализации: настраивает всё и запускает первое отображение
    init() {
        this.view.setup(this.model.cols, this.model.rows);
        this.bindEvents(); // Подключаем слушатели событий
        this.view.draw(this.model.grid); // Отрисовываем начальное (пустое) состояние
    }

    // Главный игровой цикл (tick)
    gameLoop() {
        if (!this.isRunning) return;

        this.model.update();
        
        // 1. Узнаем у Модели, какая сейчас фаза ('growth', 'crystal', 'decay')
        const currentRule = this.model.patternRules[this.model.currentPhaseIndex];
        const phaseName = currentRule.colorPhase;

        // 2. Передаем сетку И название фазы во View
        this.view.draw(this.model.grid, phaseName);

        setTimeout(() => {
            this.animationId = requestAnimationFrame(this.gameLoop);
        }, 100); 
    }

    // Обработка событий UI
    bindEvents() {
        // Кнопки управления
        const btnPlay = document.getElementById('btnPlay');
        const btnPause = document.getElementById('btnPause');
        const btnClear = document.getElementById('btnClear');

        btnPlay.addEventListener('click', () => {
            if (!this.isRunning) {
                this.isRunning = true;
                audioManager.play('start');        // Звук клика
                audioManager.toggleAmbient(true);  // Включаем фоновую музыку
                this.gameLoop(); 
            }
        });

        btnPause.addEventListener('click', () => {
            this.isRunning = false;
            audioManager.play('pause');         // Звук паузы
            audioManager.toggleAmbient(false);  // Ставим фон на паузу
            cancelAnimationFrame(this.animationId); 
        });

        btnClear.addEventListener('click', () => {
            this.isRunning = false;
            audioManager.play('clear');         // Звук "вжух"
            audioManager.toggleAmbient(false);  // Выключаем фон
            cancelAnimationFrame(this.animationId);
            this.model.clear(); 
            this.view.draw(this.model.grid); 
        
        });

        // Ползунки правил
        const ageSlider = document.getElementById('ageModifier');
        const ageSpan = document.getElementById('ageModifierValue');

        ageSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            
            // Меняем текст в интерфейсе для наглядности
            if (val === 0) ageSpan.textContent = 'Короткая';
            else if (val === 1) ageSpan.textContent = 'Норма';
            else ageSpan.textContent = 'Долгая';

            // Контроллер переводит значение ползунка в модификатор для Модели
            // 0 -> -1 (отнять тик), 1 -> 0 (без изменений), 2 -> +2 (добавить два тика)
            if (val === 0) this.model.globalAgeModifier = -3;
            else if (val === 1) this.model.globalAgeModifier = 0;
            else if (val === 2) this.model.globalAgeModifier = 2;
        });

        // Рисование по холсту
        // ВАЖНО: Мы перехватываем клик на холсте, вычисляем координаты и передаем их Модели.
        // View вообще не знает, что на него кликнули.
        const canvas = this.view.canvas;
        // 1. Находим выпадающий список в DOM
        const seedSelector = document.getElementById('seedSelector'); 
        let isDrawing = false; 

        const handleCanvasDraw = (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const colIndex = Math.floor(mouseX / this.view.cellSize);
            const rowIndex = Math.floor(mouseY / this.view.cellSize);

            const selectedSeed = seedSelector.value;

            // Вызываем метод Модели
            this.model.stampSeed(colIndex, rowIndex, selectedSeed);
            
            // Включаем звук "бульк" при рисовании!
            audioManager.play('spawn'); 
            
            if (!this.isRunning) {
                const currentRule = this.model.patternRules[this.model.currentPhaseIndex];
                this.view.draw(this.model.grid, currentRule.colorPhase);
            }
        };

        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            handleCanvasDraw(e);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (isDrawing) {
                handleCanvasDraw(e);
            }
        });

        window.addEventListener('mouseup', () => {
            isDrawing = false;
        });
    }
}