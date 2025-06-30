const boardSize = 5;
let board, currentPlayer, gameActive, score, lastMove, totalScore;
const boardElement = document.getElementById("game-board");
const statusText = document.getElementById("status");
const scoreXElement = document.getElementById("scoreX");
const scoreOElement = document.getElementById("scoreO");
const winnerText = document.getElementById("winner-text");
const newGameBtn = document.getElementById("new-game-btn");
const totalScoreXElement = document.getElementById("totalScoreX");
const totalScoreOElement = document.getElementById("totalScoreO");

// Initialize total score (game wins)
totalScore = { X: 0, O: 0 };
updateTotalScoreDisplay();

function initializeGame() {
  board = Array(boardSize)
    .fill(null)
    .map(() => Array(boardSize).fill(""));
  currentPlayer = "X";
  gameActive = true;
  score = { X: 0, O: 0 };
  lastMove = { X: null, O: null };
  updateScoreDisplay();
  statusText.textContent = "Player X's turn";
  winnerText.style.display = "none";
  newGameBtn.style.display = "none";
  createBoard();
}

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

function handleMove(event) {
  if (!gameActive) return;

  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (board[row][col] === "" && !isNextToLastMove(row, col)) {
    // 🔥 Verwijder alleen de vorige zet van dezelfde speler
    const previousMove = document.querySelector(`.last-move-${currentPlayer}`);
    if (previousMove) {
      previousMove.classList.remove(`last-move-${currentPlayer}`);
    }

    // Zet de nieuwe zet
    board[row][col] = currentPlayer;
    event.target.textContent = currentPlayer;
    event.target.classList.add("taken", `last-move-${currentPlayer}`); // 🔥 Markeer nieuwe zet

    lastMove[currentPlayer] = { row, col };

    let points = checkForPoints(row, col, currentPlayer);
    score[currentPlayer] += points;
    updateScoreDisplay();

const nextPlayer = currentPlayer === "X" ? "O" : "X";

if (!hasValidMove(nextPlayer)) {
  if (!hasValidMove(currentPlayer)) {
    gameActive = false;
    declareWinner();
    return;
  } else {
    // currentPlayer mag nog zetten, blijf bij dezelfde speler
    statusText.textContent = `Player ${currentPlayer}'s turn`;
    return;
  }
} else {
  // Beide spelers kunnen nog zetten → wissel beurt
  currentPlayer = nextPlayer;
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}


currentPlayer = nextPlayer;
statusText.textContent = `Player ${currentPlayer}'s turn`;


    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  } else if (board[row][col] !== "") {
    showWarning("This spot is already taken!");
  } else if (isNextToLastMove(row, col)) {
    showWarning("You may not make a move next to your last move.");
  }
}

function isNextToLastMove(row, col) {
  const last = lastMove[currentPlayer];
  if (!last) return false;
  return Math.abs(row - last.row) <= 1 && Math.abs(col - last.col) <= 1;
}

function showWarning(message) {
  statusText.textContent = message;
  setTimeout(() => {
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  }, 4000);
}

function checkForPoints(row, col, player) {
  const directions = [
    { r: 0, c: 1 },
    { r: 1, c: 0 },
    { r: 1, c: 1 },
    { r: 1, c: -1 },
  ];
  let totalPoints = 0;

  for (let { r, c } of directions) {
    let count = 1;
    count += countDirection(row, col, r, c, player);
    count += countDirection(row, col, -r, -c, player);

    // 🔥 New Scoring Rule: Check for 4-in-a-row first
    if (count === 4) {
      totalPoints += 1; // Give 1 point for 4 in a row
    } else if (count === 5) {
      // Check if a 4-in-a-row existed before this move
      let wasFourInARow = checkForExistingFour(row, col, r, c, player);
      totalPoints += wasFourInARow ? 1 : 2;
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
      newRow >= 0 &&
      newRow < boardSize &&
      newCol >= 0 &&
      newCol < boardSize &&
      board[newRow][newCol] === player
    ) {
      count++;
    } else break;
  }
  return count;
}

function checkForExistingFour(row, col, r, c, player) {
  let countBeforeMove = 1;
  countBeforeMove += countDirection(row - r, col - c, -r, -c, player);
  countBeforeMove += countDirection(row + r, col + c, r, c, player);

  return countBeforeMove === 4; // If there was already a 4-in-a-row, return true
}

function hasValidMove(player) {
  const last = lastMove[player];
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (
        board[row][col] === "" &&
        (!last || Math.abs(row - last.row) > 1 || Math.abs(col - last.col) > 1)
      ) {
        return true;
      }
    }
  }
  return false;
}


function isBoardFull() {
  let emptyCells = 0;

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (board[row][col] === "" && !isNextToLastMove(row, col)) {
        emptyCells++;
      }
    }
  }

  // 🔥 Stop when there is exactly ONE move left
  return emptyCells <= 1;
}

function updateScoreDisplay() {
  scoreXElement.textContent = score.X;
  scoreOElement.textContent = score.O;
}

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
  gameActive = false;
}

function endGame() {
  gameActive = false;
  declareWinner();
}

function resetGame() {
  initializeGame();
}

function resetTotalScore() {
  totalScore = { X: 0, O: 0 };
  updateTotalScoreDisplay();
}

function updateTotalScoreDisplay() {
  totalScoreXElement.textContent = totalScore.X;
  totalScoreOElement.textContent = totalScore.O;
}

initializeGame();
