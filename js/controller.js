// js/controller.js

// Импортируем готовый экземпляр менеджера аудио
import { audioManager } from './audio.js';

export class AppController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.isRunning = false;
        this.animationId = null;
        this.gameLoop = this.gameLoop.bind(this);
    }

    init() {
        this.view.setup(this.model.cols, this.model.rows);
        this.bindEvents(); 
        const initialPhase = this.model.patternRules[this.model.currentPhaseIndex].colorPhase;
        this.view.draw(this.model.grid, initialPhase);
    }

    gameLoop() {
        if (!this.isRunning) return;

        this.model.update();
        const currentPhaseName = this.model.patternRules[this.model.currentPhaseIndex].colorPhase;
        this.view.draw(this.model.grid, currentPhaseName);

        // Расчет и передача данных для изменения громкости эмбиента
        const activeCells = this.model.countActiveCells();
        const maxCells = this.model.cols * this.model.rows;
        audioManager.updateAmbientByGrid(activeCells, maxCells);

        setTimeout(() => {
            this.animationId = requestAnimationFrame(this.gameLoop);
        }, 100); 
    }

    bindEvents() {
        // --- Кнопки управления со звуками ---
        document.getElementById('btnPlay').addEventListener('click', () => {
            if (!this.isRunning) {
                audioManager.play('start'); // Звук старта
                audioManager.toggleAmbient(true); // Включаем гул
                
                this.isRunning = true;
                this.gameLoop(); 
            }
        });

        document.getElementById('btnPause').addEventListener('click', () => {
            audioManager.play('pause'); // Звук паузы
            audioManager.toggleAmbient(false); // Выключаем гул
            
            this.isRunning = false;
            cancelAnimationFrame(this.animationId); 
        });

        document.getElementById('btnClear').addEventListener('click', () => {
            audioManager.play('clear'); // Звук очистки
            audioManager.toggleAmbient(false); 
            
            this.isRunning = false;
            cancelAnimationFrame(this.animationId);
            this.model.clear(); 
            document.getElementById('phaseIndicator').textContent = 'growth'; 
            this.view.draw(this.model.grid, 'growth'); 
        });

        document.getElementById('btnNextPhase').addEventListener('click', () => {
            const newPhaseName = this.model.nextPhase();
            document.getElementById('phaseIndicator').textContent = newPhaseName;

            if (!this.isRunning) {
                this.view.draw(this.model.grid, newPhaseName);
            }
        });

        const ageSlider = document.getElementById('ageModifier');
        const ageSpan = document.getElementById('ageModifierValue');
        
        if(ageSlider) {
            ageSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                if (val === 0) { ageSpan.textContent = 'Короткая'; this.model.globalAgeModifier = -1; }
                else if (val === 1) { ageSpan.textContent = 'Норма'; this.model.globalAgeModifier = 0; }
                else { ageSpan.textContent = 'Долгая'; this.model.globalAgeModifier = 2; }
            });
        }

        // --- Идеально точное рисование мышью ---
        const canvas = this.view.canvas;
        const seedSelector = document.getElementById('seedSelector'); 
        let isDrawing = false; 

        const handleCanvasDraw = (e) => {
            const rect = canvas.getBoundingClientRect();
            
            // Вычисляем масштаб: внутренний размер Canvas делим на внешний размер в CSS
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            // Применяем масштаб к координатам курсора
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            const colIndex = Math.floor(mouseX / this.view.cellSize);
            const rowIndex = Math.floor(mouseY / this.view.cellSize);

            const selectedSeed = seedSelector ? seedSelector.value : 'dot';
            this.model.stampSeed(colIndex, rowIndex, selectedSeed);
            
            // Воспроизводим звук посадки клеток при рисовании
            audioManager.play('spawn');

            if (!this.isRunning) {
                const currentPhaseName = this.model.patternRules[this.model.currentPhaseIndex].colorPhase;
                this.view.draw(this.model.grid, currentPhaseName);
            }
        };

        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            handleCanvasDraw(e);
        });

        canvas.addEventListener('mousemove', (e) => {
            // Чтобы звук spawn не спамил сотни раз в секунду при ведении мыши,
            // логика воспроизведения находится внутри handleCanvasDraw, 
            // которая срабатывает только если кнопка зажата.
            if (isDrawing) handleCanvasDraw(e);
        });

        window.addEventListener('mouseup', () => {
            isDrawing = false;
        });
    }
}