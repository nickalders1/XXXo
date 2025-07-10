function anyPotentialPoints(board, lastMove) {
  console.log("🔍 Checking for potential points...");

  // Als er nog veel lege vakjes zijn, zijn er waarschijnlijk nog punten mogelijk
  const emptyCells = countEmptyCells(board);
  if (emptyCells > 12) {
    console.log(`✅ Many empty cells (${emptyCells}), points still possible`);
    return true;
  }

  // Voor beide spelers, check realistisch of ze nog kunnen scoren
  for (const player of ["X", "O"]) {
    const last = lastMove[player];
    const opponent = player === "X" ? "O" : "X";
    console.log(`🎯 Checking player ${player}, last move:`, last);

    // Check alle lege vakjes die geldig zijn voor deze speler
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        // Skip als vakje bezet is
        if (board[row][col] !== "") continue;

        // Skip als het naast de laatste zet van deze speler is
        if (
          last &&
          Math.abs(row - last.row) <= 1 &&
          Math.abs(col - last.col) <= 1
        ) {
          continue;
        }

        // Simuleer het plaatsen van dit symbool en check direct voor punten
        const testBoard = board.map((r) => [...r]);
        testBoard[row][col] = player;
        const directPoints = checkForPoints(testBoard, row, col, player);

        if (directPoints > 0) {
          console.log(
            `✅ Player ${player} can score ${directPoints} points directly at (${row}, ${col})`
          );
          return true;
        }

        // Check ook voor potentiële lijnen (minder streng dan voorheen)
        const directions = [
          { r: 0, c: 1, name: "horizontal" },
          { r: 1, c: 0, name: "vertical" },
          { r: 1, c: 1, name: "diagonal \\" },
          { r: 1, c: -1, name: "diagonal /" },
        ];

        for (const { r, c, name } of directions) {
          // Check of we een lijn van 4 kunnen maken in deze richting
          for (let lineStart = -3; lineStart <= 0; lineStart++) {
            let playerCount = 0;
            let emptyCount = 0;
            let opponentCount = 0;
            let hasCurrentPos = false;

            // Check 4 posities in deze lijn (voor 4 op een rij)
            for (let i = 0; i < 4; i++) {
              const checkRow = row + r * (lineStart + i);
              const checkCol = col + c * (lineStart + i);

              if (
                checkRow >= 0 &&
                checkRow < BOARD_SIZE &&
                checkCol >= 0 &&
                checkCol < BOARD_SIZE
              ) {
                if (checkRow === row && checkCol === col) {
                  hasCurrentPos = true;
                  emptyCount++;
                } else if (board[checkRow][checkCol] === player) {
                  playerCount++;
                } else if (board[checkRow][checkCol] === "") {
                  emptyCount++;
                } else if (board[checkRow][checkCol] === opponent) {
                  opponentCount++;
                }
              } else {
                opponentCount++; // Buiten bord = geblokkeerd
              }
            }

            // Als deze lijn de huidige positie bevat, geen tegenstander heeft,
            // en genoeg ruimte heeft voor 4 op een rij
            if (
              hasCurrentPos &&
              opponentCount === 0 &&
              playerCount + emptyCount >= 4
            ) {
              console.log(
                `✅ Player ${player} has potential 4-in-a-row in ${name} direction at (${row}, ${col})`
              );
              console.log(
                `   - Player pieces: ${playerCount}, Empty spaces: ${emptyCount}`
              );
              return true;
            }
          }
        }
      }
    }
  }

  console.log("❌ No realistic scoring opportunities left");
  return false;
}

// Voeg ook deze helper functie toe:
function countEmptyCells(board) {
  let count = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === "") count++;
    }
  }
  return count;
}

// Update de makeMove functie om de nieuwe logica te gebruiken (vervang de bestaande makeMove functie):
function makeMove(row, col) {
  if (!gameState.gameActive) return;

  if (gameState.board[row][col] !== "") {
    updateStatus("This spot is already taken!");
    setTimeout(
      () => updateStatus(`Player ${gameState.currentPlayer}'s turn`),
      2000
    );
    return;
  }

  if (isNextToLastMove(row, col, gameState.currentPlayer)) {
    updateStatus("You may not make a move next to your last move.");
    setTimeout(
      () => updateStatus(`Player ${gameState.currentPlayer}'s turn`),
      2000
    );
    return;
  }

  const newBoard = gameState.board.map((row) => [...row]);
  newBoard[row][col] = gameState.currentPlayer;

  const points = checkForPoints(newBoard, row, col, gameState.currentPlayer);
  gameState.score[gameState.currentPlayer] += points;

  gameState.lastMove[gameState.currentPlayer] = { row, col };
  gameState.board = newBoard;

  updateBoard();
  updateScore();

  if (gameState.bonusTurn && gameState.currentPlayer === "O") {
    gameState.bonusTurn = false;
    gameState.gameActive = false;
    declareWinner();
    return;
  }

  const xCanMove = hasValidMove("X");
  const oCanMove = hasValidMove("O");

  // ✨ Check ook of er nog punten te halen zijn
  const stillPointsPossible = anyPotentialPoints(
    gameState.board,
    gameState.lastMove
  );

  // Debug logging
  console.log("🎮 Game state check:", {
    emptyCells: countEmptyCells(gameState.board),
    xCanMove,
    oCanMove,
    stillPointsPossible,
  });

  if (
    countEmptyCells(gameState.board) <= 1 ||
    (!xCanMove && !oCanMove) ||
    !stillPointsPossible
  ) {
    let endReason = "";
    if (countEmptyCells(gameState.board) <= 1) {
      endReason = "Board is full";
    } else if (!xCanMove && !oCanMove) {
      endReason = "No valid moves left";
    } else if (!stillPointsPossible) {
      endReason = "No more points possible";
    }

    console.log(`🏁 Game ended: ${endReason}`);
    gameState.gameActive = false;
    declareWinner();
    return;
  }

  if (gameState.currentPlayer === "X" && !xCanMove && oCanMove) {
    gameState.bonusTurn = true;
    gameState.currentPlayer = "O";
    updateStatus("Player O's bonus turn");
    return;
  }

  if (gameState.currentPlayer === "X" && !oCanMove) {
    gameState.gameActive = false;
    declareWinner();
    return;
  }

  gameState.currentPlayer = gameState.currentPlayer === "X" ? "O" : "X";
  updateStatus(`Player ${gameState.currentPlayer}'s turn`);
}
