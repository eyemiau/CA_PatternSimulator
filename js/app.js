import { AutomatonModel } from './model.js';
import { AutomatonView } from './view.js';
import { AppController } from './controller.js';

// Настройки игры
const COLS = 110; // Количество колонок (ширина сетки)
const ROWS = 70;  // Количество строк (высота сетки)
const CELL_SIZE = 8; // Размер одной клетки в пикселях (холст будет 800x480)

// Получаем canvas из DOM
const canvas = document.getElementById('gameCanvas');

// Создаем объекты MVC
const model = new AutomatonModel(COLS, ROWS);
const view = new AutomatonView(canvas, CELL_SIZE);

// Связываем их контроллером
const controller = new AppController(model, view);

// Запускаем!
controller.init();