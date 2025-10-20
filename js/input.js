import { TILE_SIZE } from './config.js';

let _canvas = null;
let _onSwapCallback = null; // "Сообщить главному, что юзер хочет поменять А и Б"
let _selectedTile = null;

// Приватные функции
function _getTileCoordsFromEvent(event) {
    const rect = _canvas.getBoundingClientRect();
    // Используем clientX/Y для pointer-событий
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    return { x: tileX, y: tileY };
}

function _handlePointerDown(event) {
    event.preventDefault(); // Предотвращаем скролл страницы на Android
    
    const pos = _getTileCoordsFromEvent(event);
    
    if (!_selectedTile) {
        // 1. Первое нажатие - выбираем плитку
        _selectedTile = pos;
        
    } else {
        // 2. Второе нажатие - пытаемся поменять
        const dx = Math.abs(pos.x - _selectedTile.x);
        const dy = Math.abs(pos.y - _selectedTile.y);
        
        // Проверяем, что это "соседняя" плитка (не по диагонали)
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            // Это валидный ход, сообщаем главному модулю
            if (_onSwapCallback) {
                _onSwapCallback(_selectedTile.x, _selectedTile.y, pos.x, pos.y);
            }
        }
        
        // В любом случае сбрасываем выделение
        _selectedTile = null;
    }
}

// "Публичный" API
const Input = {
    
    // Передаем callback, который будет вызван при успешном "свайпе"
    init(canvas, onSwapCallback) {
        _canvas = canvas;
        _onSwapCallback = onSwapCallback;

        // Используем 'pointerdown' - он работает и для мыши, и для тача
        _canvas.addEventListener('pointerdown', _handlePointerDown);
    },
    
    // Дает главному модулю знать, что мы выделили (для отрисовки)
    getSelectedTile: () => _selectedTile
};

export default Input;