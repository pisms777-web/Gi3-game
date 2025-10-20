import { BOARD_WIDTH, BOARD_HEIGHT, TILE_TYPES, POWERUP_TYPES } from './config.js';
import { getRandomInt } from './utils.js';

// Приватная переменная: 2D массив, наша сетка
// Каждый элемент: { type: TILE_TYPES.RED, powerup: POWERUP_TYPES.NONE }
let _grid = [];

// Приватные функции
function _createTile() {
    return {
        type: getRandomInt(TILE_TYPES.RED, TILE_TYPES.PURPLE),
        powerup: POWERUP_TYPES.NONE
    };
}

// "Публичный" API модуля
const Board = {
    
    // Предоставляет безопасную копию сетки (только для чтения)
    getGrid: () => _grid,

    // Инициализация поля
    createBoard() {
        _grid = [];
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            const row = [];
            for (let x = 0; x < BOARD_WIDTH; x++) {
                row.push(_createTile());
            }
            _grid.push(row);
        }
        
        // Убедимся, что на старте нет матчей
        // (В реальной игре тут нужен цикл, который проверяет и пересоздает)
        this.findAllMatches(); 
        while(this.findAllMatches().length > 0) {
            this.processMatches();
            this.refillBoard();
        }
    },

    // Обмен двух плиток
    swapTiles(x1, y1, x2, y2) {
        if (!this.isValidTile(x1, y1) || !this.isValidTile(x2, y2)) {
            return false;
        }

        const temp = _grid[y1][x1];
        _grid[y1][x1] = _grid[y2][x2];
        _grid[y2][x2] = temp;
        
        return true;
    },
    
    // Проверка, что координаты в пределах поля
    isValidTile(x, y) {
        return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
    },

    // --- Логика Матчей и Бонусов ---

    /**
     * Ищет ВСЕ матчи на доске.
     * @returns {Array} Массив, где каждый элемент - это { tiles: [ {x, y}, ... ], type: 'h' | 'v' }
     */
    findAllMatches() {
        const allMatches = [];
        let matchedTiles = new Set(); // Чтобы не засчитывать одну плитку дважды

        // 1. Поиск горизонтальных матчей
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH - 2; x++) {
                const tile1 = _grid[y][x];
                if (tile1.type === TILE_TYPES.EMPTY) continue;

                let match = [{ x, y }];
                for (let i = x + 1; i < BOARD_WIDTH; i++) {
                    const tile2 = _grid[y][i];
                    if (tile1.type === tile2.type) {
                        match.push({ x: i, y });
                    } else {
                        break;
                    }
                }

                if (match.length >= 3) {
                    allMatches.push({ tiles: match, direction: 'h' });
                    match.forEach(t => matchedTiles.add(`${t.x},${t.y}`));
                    x += match.length - 1; // Пропускаем проверенные
                }
            }
        }
        
        // 2. Поиск вертикальных матчей
        for (let x = 0; x < BOARD_WIDTH; x++) {
            for (let y = 0; y < BOARD_HEIGHT - 2; y++) {
                const tile1 = _grid[y][x];
                if (tile1.type === TILE_TYPES.EMPTY) continue;
                
                // Проверяем, не была ли эта плитка уже частью горизонтального матча
                if (matchedTiles.has(`${x},${y}`)) continue;

                let match = [{ x, y }];
                for (let i = y + 1; i < BOARD_HEIGHT; i++) {
                    const tile2 = _grid[i][x];
                    if (tile1.type === tile2.type) {
                        match.push({ x, y: i });
                    } else {
                        break;
                    }
                }

                if (match.length >= 3) {
                    allMatches.push({ tiles: match, direction: 'v' });
                    match.forEach(t => matchedTiles.add(`${t.x},${t.y}`));
                    y += match.length - 1; // Пропускаем проверенные
                }
            }
        }
        
        return allMatches;
    },

    /**
     * Обрабатывает найденные матчи: убирает камни, создает бонусы.
     * @param {Array} matches - Результат из findAllMatches()
     * @param {Object} swapPos - Координаты {x, y} где произошел клик,
     * чтобы создать бонус именно там.
     * @returns {Number} Количество убранных плиток (для очков)
     */
    processMatches(matches, swapPos) {
        if (!matches || matches.length === 0) return 0;
        
        let tilesRemoved = 0;
        let powerupCreated = false;

        for (const match of matches) {
            tilesRemoved += match.tiles.length;
            
            // --- ЛОГИКА БОНУСОВ ---
            let powerupType = POWERUP_TYPES.NONE;
            if (match.tiles.length === 4) {
                // Матч 4: создаем Ракету
                powerupType = (match.direction === 'h') ? POWERUP_TYPES.ROCKET_V : POWERUP_TYPES.ROCKET_H;
            } 
            // (Здесь можно добавить else if для Матч 5, Бомб и т.д.)
            // -----------------------

            for (const tilePos of match.tiles) {
                // Если мы нашли место, где создать бонус, И это место - часть текущего матча
                if (!powerupCreated && powerupType !== POWERUP_TYPES.NONE && swapPos && tilePos.x === swapPos.x && tilePos.y === swapPos.y) {
                    
                    // Создаем бонус
                    _grid[tilePos.y][tilePos.x].type = _grid[tilePos.y][tilePos.x].type; // Тип тот же
                    _grid[tilePos.y][tilePos.x].powerup = powerupType; // Добавляем бонус
                    powerupCreated = true;

                } else {
                    // Просто убираем плитку
                    _grid[tilePos.y][tilePos.x].type = TILE_TYPES.EMPTY;
                    _grid[tilePos.y][tilePos.x].powerup = POWERUP_TYPES.NONE;
                }
            }
        }
        
        return tilesRemoved;
    },

    /**
     * Заставляет плитки "упасть" вниз на пустые места.
     */
    refillBoard() {
        // Логика "гравитации"
        for (let x = 0; x < BOARD_WIDTH; x++) {
            let emptyRow = BOARD_HEIGHT - 1;
            
            // Идем снизу вверх
            for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
                if (_grid[y][x].type !== TILE_TYPES.EMPTY) {
                    // Нашли плитку, "роняем" ее на первое пустое место
                    if (emptyRow !== y) {
                        _grid[emptyRow][x] = _grid[y][x];
                        _grid[y][x] = { type: TILE_TYPES.EMPTY, powerup: POWERUP_TYPES.NONE }; // Очищаем старое место
                    }
                    emptyRow--; // Следующее пустое место будет выше
                }
            }
            
            // Заполняем оставшиеся пустые места сверху новыми плитками
            for (let y = emptyRow; y >= 0; y--) {
                _grid[y][x] = _createTile();
            }
        }
    }
};

export default Board;