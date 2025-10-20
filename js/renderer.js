// js/renderer.js

import { 
    TILE_SIZE, 
    TILE_TYPES, 
    TILE_COLORS, 
    POWERUP_TYPES 
} from './config.js';

let _ctx = null; // Приватный контекст canvas

// "Публичный" API
const Renderer = {
    
    init(canvas) {
        // Задаем физический размер canvas
        canvas.width = TILE_SIZE * TILE_SIZE; // Ширина
        canvas.height = TILE_SIZE * TILE_SIZE; // Высота
        
        // Задаем CSS размер (чтобы он вписался в `style.css`)
        canvas.style.width = `${TILE_SIZE * TILE_SIZE}px`;
        canvas.style.height = `${TILE_SIZE * TILE_SIZE}px`;

        _ctx = canvas.getContext('2d');
        
        if (!_ctx) {
            console.error("Не удалось получить 2D контекст canvas!");
            return false;
        }
        return true;
    },

    // Очистка
    clear() {
        _ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
    },

    /**
     * Рисует всю доску на основе данных из Board.getGrid()
     * @param {Array} grid 
     */
    drawBoard(grid) {
        this.clear();
        if (!_ctx) return;

        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                const tile = grid[y][x];
                const px = x * TILE_SIZE;
                const py = y * TILE_SIZE;

                // --- ИЗМЕНЕНИЕ ---
                // 1. Рисуем плитку (цветной квадрат)
                _ctx.fillStyle = TILE_COLORS[tile.type];
                _ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

                // 2. Рисуем бонус (простые белые полосы)
                if (tile.powerup !== POWERUP_TYPES.NONE) {
                    _ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // Белая "метка"
                    
                    if (tile.powerup === POWERUP_TYPES.ROCKET_H) {
                        // Горизонтальная ракета -> рисуем полосу посередине
                        _ctx.fillRect(px, py + TILE_SIZE / 2 - 5, TILE_SIZE, 10);
                    } else if (tile.powerup === POWERUP_TYPES.ROCKET_V) {
                        // Вертикальная ракета -> рисуем полосу посередине
                         _ctx.fillRect(px + TILE_SIZE / 2 - 5, py, 10, TILE_SIZE);
                    }
                }
                // --------------------
                
                // Обводка для наглядности
                _ctx.strokeStyle = '#666';
                _ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
            }
        }
    },
    
    /**
     * Рисует выделение
     * @param {Object} tile {x, y}
     */
    drawSelection(tile) {
        if (!tile || !_ctx) return;
        
        _ctx.strokeStyle = '#FFFFFF'; // Ярко-белый
        _ctx.lineWidth = 3;
        _ctx.strokeRect(
            tile.x * TILE_SIZE + 2, 
            tile.y * TILE_SIZE + 2, 
            TILE_SIZE - 4, 
            TILE_SIZE - 4
        );
        _ctx.lineWidth = 1; // Сбрасываем
    }
};

export default Renderer;
