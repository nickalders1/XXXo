const boardSize = 5;
let board, currentPlayer, gameActive, score, totalScore;
const boardElement = document.getElementById("game-board");
const statusText = document.getElementById("status");
const scoreXElement = document.getElementById("scoreX");
const scoreOElement = document.getElementById("scoreO");
const winnerText = document.getElementById("winner-text");
const newGameBtn = document.getElementById("new-game-btn");
const totalScoreXElement = document.getElementById("totalScoreX");
const totalScoreOElement = document.getElementById("totalScoreO");

totalScore = { X: 0, O: 0 };
updateTotalScoreDisplay();

// Initialisatie van het bord en instellingen
function initializeGame() {
  board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
  currentPlayer = "X";
  gameActive = true;
  score = { X: 0, O: 0 };
  updateScoreDisplay();
  statusText.textContent = "Player X's turn";
  winnerText.style.display = "none";
  newGameBtn.style.display = "none";
  createBoard();
}

// Maak het bord aan met de juiste aantal cellen
function createBoard() {
  boardElement.innerHTML = "";
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", handleMove);
      boardElement.appendChild(cell);
    }
  }
}

// Logica om een zet te doen
function handleMove(event) {
  if (!gameActive) return;

  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (board[row][col] === null) {
    board[row][col] = currentPlayer;
    event.target.textContent = currentPlayer;

    let points = checkForPoints(row, col, currentPlayer);
    score[currentPlayer] += points;
    updateScoreDisplay();

    if (checkForGameOver()) {
      gameActive = false;
      declareWinner();
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      statusText.textContent = `Player ${currentPlayer}'s turn`;
    }
  } else {
    showWarning("This spot is already taken!");
  }
}

// Controleer of een speler punten heeft behaald
function checkForPoints(row, col, player) {
  const directions = [
    { r: 0, c: 1 }, // Horizontaal
    { r: 1, c: 0 }, // Verticaal
    { r: 1, c: 1 }, // Diagonaal
    { r: 1, c: -1 } // Diagonaal
  ];

  let totalPoints = 0;

  for (let { r, c } of directions) {
    let count = 1;
    count += countDirection(row, col, r, c, player);
    count += countDirection(row, col, -r, -c, player);

    if (count >= 4) {
      totalPoints += 1; // 1 punt voor 4 op een rij
    }
  }

  return totalPoints;
}

function countDirection(row, col, r, c, player) {
  let count = 0;
  for (let i = 1; i < 5; i++) {
    let newRow = row + r * i;
    let newCol = col + c * i;
    if (
      newRow >= 0 && newRow < boardSize &&
      newCol >= 0 && newCol < boardSize &&
      board[newRow][newCol] === player
    ) {
      count++;
    } else break;
  }
  return count;
}

// Controleer of het spel afgelopen is
function checkForGameOver() {
  if (isBoardFull() || (!canPlayerMakeMove("X") && !canPlayerMakeMove("O"))) {
    return true;
  }
  return false;
}

// Controleer of het bord vol is
function isBoardFull() {
  return board.every(row => row.every(cell => cell !== null));
}

// Controleer of een speler nog een zet kan maken
function canPlayerMakeMove(player) {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (board[row][col] === null) {
        return true;
      }
    }
  }
  return false;
}

// Winnaar bepalen en tonen
function declareWinner() {
  if (score.X > score.O) {
    winnerText.textContent = "PLAYER X WINS! 🎉";
    totalScore.X++;
  } else if (score.O > score.X) {
    winnerText.textContent = "PLAYER O WINS! 🎉";
    totalScore.O++;
  } else {
    winnerText.textContent = "It's a Tie!";
  }
  winnerText.style.display = "block";
  newGameBtn.style.display = "block";
  updateTotalScoreDisplay();
}

// Waarschuwing tonen
function showWarning(message) {
  statusText.textContent = message;
  setTimeout(() => {
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  }, 4000);
}

// Score bijwerken
function updateScoreDisplay() {
  scoreXElement.textContent = score.X;
  scoreOElement.textContent = score.O;
}

// Scoreboard bijwerken
function updateTotalScoreDisplay() {
  totalScoreXElement.textContent = totalScore.X;
  totalScoreOElement.textContent = totalScore.O;
}

// Nieuwe game starten
function resetGame() {
  initializeGame();
}

// Scoreboard resetten
function resetTotalScore() {
  totalScore = { X: 0, O: 0 };
  updateTotalScoreDisplay();
}

// Game initialiseren
initializeGame();
