class Tile {
    constructor() {
        this.isMine = false;
        this.isRevealed = false;
        this.neighboringMines = 0;
    }
}

class Board {
    constructor(size, mines) {
        this.size = size;
        this.mines = mines;
        this.tiles = this.createBoard();
    }

    createBoard() {
        const tiles = Array.from({ length: this.size }, () => 
            Array(this.size).fill().map(() => new Tile())
        );
        this.placeMines(tiles);
        this.calculateNeighboringMines(tiles);
        return tiles;
    }

    placeMines(tiles) {
        let placedMines = 0;
        while (placedMines < this.mines) {
            const [x, y] = [Math.floor(Math.random() * this.size), Math.floor(Math.random() * this.size)];
            if (!tiles[x][y].isMine) {
                tiles[x][y].isMine = true;
                placedMines++;
            }
        }
    }

    calculateNeighboringMines(tiles) {
        const directions = [-1, 0, 1];
        tiles.forEach((row, x) => {
            row.forEach((tile, y) => {
                if (tile.isMine) {
                    directions.forEach(dx => {
                        directions.forEach(dy => {
                            const [nx, ny] = [x + dx, y + dy];
                            if ((dx || dy) && this.isValidTile(nx, ny)) {
                                tiles[nx][ny].neighboringMines++;
                            }
                        });
                    });
                }
            });
        });
    }

    isValidTile(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }
}


let board, timer, seconds = 0, currentTheme = 'light', revealedTilesCount = 0;
let timerStarted = false; // To track if the timer has started

function startGame(size = 10, mines = 10) {
    const boardElement = document.getElementById('board');
    boardElement.style.gridTemplateColumns = `repeat(${size}, 40px)`;
    boardElement.style.gridTemplateRows = `repeat(${size}, 40px)`;

    board = new Board(size, mines);
    document.getElementById('minesCount').innerText = mines;
    revealedTilesCount = 0;
    renderBoard();
    resetTimer(); // Reset timer when a new game starts
    timerStarted = false; // Timer hasn't started yet
}

function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    board.tiles.forEach(row => {
        row.forEach(tile => {
            const tileElement = document.createElement('div');
            tileElement.className = 'tile';
            tileElement.addEventListener('click', () => handleTileClick(tile, tileElement));
            boardElement.appendChild(tileElement);
        });
    });
}

function handleTileClick(tile, tileElement) {
    if (!timerStarted) {
        startTimer(); // Start the timer when the first tile is clicked
        timerStarted = true;
    }

    if (tile.isRevealed) return;

    tile.isRevealed = true;
    tileElement.classList.add('revealed');
    revealedTilesCount++;

    if (tile.isMine) {
        triggerExplosion(tileElement);
    } else {
        updateTileContent(tile, tileElement);
        if (checkWin()) endGame(true);
    }
}

function triggerExplosion(tileElement) {
    document.getElementById('mineSound').play();
    revealAllMines();
    endGame(false);
}

function updateTileContent(tile, tileElement) {
    if (tile.neighboringMines > 0) {
        tileElement.innerText = tile.neighboringMines;
        tileElement.style.color = getColorForNumber(tile.neighboringMines);
    } else {
        revealAdjacentTiles(tile);
    }
}

function revealAllMines() {
    board.tiles.flat().forEach((tile, index) => {
        if (tile.isMine) {
            const tileElement = document.querySelectorAll('.tile')[index];
            tileElement.classList.add('mine', 'exploding');
            tileElement.innerText = '💣';
            tileElement.style.backgroundColor = 'red';
            tile.isRevealed = true;
        }
    });
}

function revealAdjacentTiles(tile) {
    const [x, y] = getTileCoordinates(tile);
    [-1, 0, 1].forEach(dx => {
        [-1, 0, 1].forEach(dy => {
            if (dx || dy) {
                const [nx, ny] = [x + dx, y + dy];
                if (board.isValidTile(nx, ny)) {
                    const adjacentTile = board.tiles[nx][ny];
                    const adjacentTileElement = document.querySelectorAll('.tile')[nx * board.size + ny];
                    if (!adjacentTile.isRevealed) {
                        handleTileClick(adjacentTile, adjacentTileElement);
                    }
                }
            }
        });
    });
}

function getTileCoordinates(tile) {
    for (let x = 0; x < board.size; x++) {
        const y = board.tiles[x].indexOf(tile);
        if (y !== -1) return [x, y];
    }
}

function getColorForNumber(number) {
    const colors = {
        1: 'blue', 2: 'green', 3: 'red',
        4: 'darkblue', 5: 'darkred', 6: 'cyan',
        7: 'black', 8: 'gray'
    };
    return colors[number] || 'black';
}

function checkWin() {
    const winCondition = document.querySelector('input[name="winCondition"]:checked').value;
    return board.tiles.flat().every(tile => tile.isRevealed || (winCondition === 'clear' && tile.isMine));
}

function endGame(won) {
    clearInterval(timer); // Stop the timer when the game ends
    document.getElementById('gameMusic').pause();
    setTimeout(() => {
        alert(`Game Over! Your score: ${calculateScore()}`);
        startGame(10, 10);
    }, 1000);
    resetTimer(); // Reset the timer after the game ends
}

function calculateScore() {
    return revealedTilesCount - seconds;
}

function startTimer() {
    seconds = 0;
    document.getElementById('time').innerText = seconds;
    timer = setInterval(() => {
        document.getElementById('time').innerText = ++seconds;
    }, 1000);
}

function resetTimer() {
    clearInterval(timer); // Clear the interval if it's running
    seconds = 0;
    document.getElementById('time').innerText = seconds; // Reset displayed time to 0
}

function switchTheme() {
    const body = document.body;
    const tiles = document.querySelectorAll('.tile');
    const themes = ['dark', 'nature', 'ocean', 'sunset'];

    body.classList.remove(...themes);
    tiles.forEach(tile => tile.classList.remove(...themes));

    currentTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
    body.classList.add(currentTheme);
    tiles.forEach(tile => tile.classList.add(currentTheme));
}

document.getElementById('optionsBtn').addEventListener('click', () => {
    document.getElementById('optionsMenu').classList.toggle('hidden');
});

document.getElementById('applyOptions').addEventListener('click', () => {
    const gridSize = parseInt(document.getElementById('gridSize').value);
    const numMines = gridSize === 10 ? 10 : gridSize === 15 ? 40 : 99;
    startGame(gridSize, numMines);
    document.getElementById('optionsMenu').classList.add('hidden');
});

document.getElementById('closeOptions').addEventListener('click', () => {
    document.getElementById('optionsMenu').classList.add('hidden');
});

document.getElementById('themeBtn').addEventListener('click', switchTheme);
document.getElementById('startBtn').addEventListener('click', () => {
    startGame();
    document.getElementById('gameMusic').play();
});
