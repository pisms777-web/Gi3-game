// Получаем элементы UI (мы сделаем это один раз здесь)
const scoreElement = document.getElementById('score');
const movesElement = document.getElementById('moves');

// Приватные переменные модуля
let _score = 0;
let _moves = 20;

const GameState = {
    getScore: () => _score,
    getMoves: () => _moves,

    init(startMoves) {
        _moves = startMoves;
        _score = 0;
        this.updateUI();
    },
    
    addScore(points) {
        _score += points;
        this.updateUI();
    },

    useMove() {
        _moves--;
        this.updateUI();
        if (_moves <= 0) {
            this.gameOver();
        }
    },

    // Обновляет HTML
    updateUI() {
        scoreElement.textContent = _score;
        movesElement.textContent = _moves;
    },

    gameOver() {
        console.log("GAME OVER");
        alert(`Игра окончена! Ваш счет: ${_score}`);
        // Тут можно перезапускать игру
        location.reload(); 
    }
};

// Экспортируем "публичный" API
export default GameState;