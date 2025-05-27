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

// Initialiseer de score
totalScore = { X: 0, O: 0 };
updateTotalScoreDisplay();

// Initialiseer het bord en instellingen
function initializeGame() {
  board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
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

  if (board[row][col] === null && !isNextToLastMove(row, col)) {
    // Verwijder de vorige zet van dezelfde speler
    const previousMove = document.querySelector(`.last-move-${currentPlayer}`);
    if (previousMove) {
      previousMove.classList.remove(`last-move-${currentPlayer}`);
    }

    // Zet de nieuwe zet
    board[row][col] = currentPlayer;
    event.target.textContent = currentPlayer;
    event.target.classList.add("taken", `last-move-${currentPlayer}`); // Markeer nieuwe zet

    lastMove[currentPlayer] = { row, col };

    let points = checkForPoints(row, col, currentPlayer);
    score[currentPlayer] += points;
    updateScoreDisplay();

    // Controleer of het spel afgelopen is
    if (checkForGameOver()) {
      gameActive = false;
      declareWinner();
    } else {
      // Wissel van speler, maar eerst controleren of de huidige speler geen zetten meer kan doen
      if (!canPlayerMakeMove(currentPlayer)) {
        currentPlayer = currentPlayer === "X" ? "O" : "X"; // De andere speler mag nu spelen
        statusText.textContent = `Player ${currentPlayer}'s turn`;
      } else {
        statusText.textContent = `Player ${currentPlayer}'s turn`;
      }
    }
  } else if (board[row][col] !== null) {
    showWarning("This spot is already taken!");
  } else if (isNextToLastMove(row, col)) {
    showWarning("You may not make a move next to your last move.");
  }
}

// Controleer of de laatste zet naast de vorige zet ligt
function isNextToLastMove(row, col) {
  const last = lastMove[currentPlayer];
  if (!last) return false;
  return Math.abs(row - last.row) <= 1 && Math.abs(col - last.col) <= 1;
}

// Toon waarschuwingen
function showWarning(message) {
  statusText.textContent = message;
  setTimeout(() => {
    statusText.textContent = `Player ${currentPlayer}'s turn`;
  }, 4000);
}

// Controleer of er punten zijn behaald (4 of 5 op een rij)
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

    if (count === 4) {
      totalPoints += 1; // 1 punt voor 4 op een rij
    } else if (count === 5) {
      // Check of er een 4 op rij bestond voor deze zet
      let wasFourInARow = checkForExistingFour(row, col, r, c, player);
      totalPoints += wasFourInARow ? 1 : 2;
    }
  }

  return totalPoints;
}

// Tel het aantal in een bepaalde richting
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

// Check of er al een 4 op rij bestond voordat deze zet werd gedaan
function checkForExistingFour(row, col, r, c, player) {
  let countBeforeMove = 1;
  countBeforeMove += countDirection(row - r, col - c, -r, -c, player);
  countBeforeMove += countDirection(row + r, col + c, r, c, player);

  return countBeforeMove === 4; // Als er al een 4 op rij bestond, return true
}

// Controleer of het bord vol is (24 vakjes gevuld)
function isBoardFull() {
  let filledCells = 0;
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (board[row][col] !== null) {
        filledCells++;
      }
    }
  }
  return filledCells === 24; // Als er 24 vakjes gevuld zijn
}

// Controleer of het spel afgelopen is (bord vol of geen zetten meer)
function checkForGameOver() {
  // Het spel stopt als er 24 vakjes vol zijn of als de speler X geen zet meer kan doen
  if (isBoardFull()) {
    return true;
  }

  // Stop het spel als de huidige speler geen zetten meer kan doen en de andere speler ook niet
  if (!canPlayerMakeMove("X") && !canPlayerMakeMove("O")) {
    return true; // Stop het spel als beide geen zetten meer kunnen doen
  }
  return false;
}

// Controleer of een speler nog een zet kan maken
function canPlayerMakeMove(player) {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (board[row][col] === null && !isNextToLastMove(row, col)) {
        return true; // Er is nog een zet beschikbaar voor deze speler
      }
    }
  }
  return false; // Geen zetten mogelijk voor deze speler
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
