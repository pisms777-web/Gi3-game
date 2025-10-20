// Размеры поля
export const BOARD_WIDTH = 8;
export const BOARD_HEIGHT = 8;

// Размер одной плитки в пикселях
export const TILE_SIZE = 40; 

// Типы камней
export const TILE_TYPES = {
    EMPTY: 0,
    RED: 1,
    GREEN: 2,
    BLUE: 3,
    YELLOW: 4,
    PURPLE: 5,
};

// Цвета для рендера
export const TILE_COLORS = {
    [TILE_TYPES.EMPTY]: '#222',
    [TILE_TYPES.RED]: '#e74c3c',
    [TILE_TYPES.GREEN]: '#2ecc71',
    [TILE_TYPES.BLUE]: '#3498db',
    [TILE_TYPES.YELLOW]: '#f1c40f',
    [TILE_TYPES.PURPLE]: '#9b59b6',
};

// --- Новое для геймплея ---
// Типы бонусов
export const POWERUP_TYPES = {
    NONE: 0,
    ROCKET_H: 1, // Горизонтальная ракета
    ROCKET_V: 2, // Вертикальная ракета
};