import { AutomatonModel } from './model.js';
import { AutomatonView } from './view.js';
import { AppController } from './controller.js';

const COLS = 100; 
const ROWS = 60;  
const CELL_SIZE = 8; 

const canvas = document.getElementById('gameCanvas');
const model = new AutomatonModel(COLS, ROWS);
const view = new AutomatonView(canvas, CELL_SIZE);
const controller = new AppController(model, view);

controller.init();