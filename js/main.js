// js/main.js

import { BOARD_WIDTH, BOARD_HEIGHT, TILE_SIZE } from './config.js';
import GameState from './gamestate.js';
import Board from './board.js';
import Renderer from './renderer.js';
import Input from './input.js';

// --- Инициализация ---

// Состояние "заблокирована ли игра" (пока идут анимации или расчеты)
let isLocked = false; 

// 1. Находим Canvas
const canvas = document.getElementById('game-canvas');
if (!canvas) {
    throw new Error("Не найден #game-canvas!");
}

// 2. Инициализируем модули
Renderer.init(canvas);
GameState.init(20); // 20 ходов на игру
Board.createBoard();
// Передаем в Input "что делать", когда игрок сделал ход
Input.init(canvas, handlePlayerSwap);

// --- Главный Цикл Игры (Game Loop) ---

// Этот цикл отвечает за отрисовку
function gameLoop() {
    // 1. Отрисовываем текущее состояние доски
    const grid = Board.getGrid();
    Renderer.drawBoard(grid);

    // 2. Рисуем выделение, если оно есть
    const selected = Input.getSelectedTile();
    if (selected) {
        Renderer.drawSelection(selected);
    }
    
    // Продолжаем цикл
    requestAnimationFrame(gameLoop);
}

// --- Обработчики Игровых Событий ---

/**
 * Вызывается из Input, когда игрок пытается поменять 2 плитки
 */
async function handlePlayerSwap(x1, y1, x2, y2) {
    if (isLocked) return; // Игнорируем ввод, пока игра "думает"
    
    isLocked = true;
    GameState.useMove(); // Используем ход

    // 1. Меняем плитки в логике
    Board.swapTiles(x1, y1, x2, y2);

    // 2. Проверяем, дал ли этот ход матчи
    let matches = Board.findAllMatches();
    
    // Координаты, где игрок кликнул (для создания бонуса)
    const swapPos = { x: x2, y: y2 }; 

    if (matches.length > 0) {
        // Успешный ход! Запускаем каскад
        await processGameLogic(matches, swapPos);
        
    } else {
        // Неудачный ход (нет матчей), меняем обратно
        // (В реальной игре тут будет "анимация отмены")
        Board.swapTiles(x1, y1, x2, y2); // Swap back
    }
    
    isLocked = false;
}

/**
 * Асинхронная функция для обработки каскадов
 * (В реальной игре здесь были бы анимации между шагами)
 */
async function processGameLogic(initialMatches, swapPos) {
    let currentMatches = initialMatches;
    let scoreToAdd = 0;
    
    // Цикл каскадов:
    // 1. Найти матчи
    // 2. Убрать плитки (создать бонусы)
    // 3. Уронить плитки
    // 4. Повторить с п.1, пока есть матчи
    
    while (currentMatches.length > 0) {
        // 1. Убираем плитки, создаем бонусы
        const tilesRemoved = Board.processMatches(currentMatches, swapPos);
        scoreToAdd += tilesRemoved * 10; // +10 очков за плитку
        
        // (Здесь должна быть АНИМАЦИЯ взрыва/исчезновения)
        
        // 2. "Роняем" плитки
        Board.refillBoard();
        
        // (Здесь должна быть АНИМАЦИЯ падения)

        // 3. Ищем новые матчи, созданные каскадом
        // (swapPos уже не нужен, бонусы создаются в случайных местах)
        currentMatches = Board.findAllMatches();
        swapPos = null; // Бонус от игрока создается только 1 раз
    }
    
    GameState.addScore(scoreToAdd);
}


// --- Запуск Игры ---
console.log("Игра '3 в ряд' (Модульная) запущена.");
gameLoop(); // Запускаем цикл отрисовки
