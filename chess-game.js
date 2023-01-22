"use strict";

function createGame() {
  return new Chess();
}

function createBoard(game, isWhite, onDrop, boardId) {
  return ChessBoard(boardId, {
    position: game.fen(), // Use the FEN from the chess.js game
    draggable: true,
    droffOffBoard: 'snapback',
    orientation: isWhite ? 'white' : 'black',
    onDrop: onDrop,
    sparePieces: true,
  });
}

// check if the game is over
function checkGameOver(game) {
    if (game.game_over()) {
        if (game.in_checkmate()) {
            return 'Checkmate';
        } else if (game.in_draw()) {
            return 'Draw';
        } else if (game.in_stalemate()) {
            return 'Stalemate';
        } else if (game.in_threefold_repetition()) {
            return 'Threefold repetition';
        } else if (game.insufficient_material()) {
            return 'Insufficient material';
        }
    } else {
        return 'Game is not over';
    }
}


function onDrop(game, board, source, target) {
  // Make the move in the chess.js game
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // Always promote to a queen
  });

  // If the move was illegal, take back the piece
  if (move === null) {
    return 'snapback';
  }

  // Update the board position
  board.position(game.fen());

  // Game over logic
  var gameOver = checkGameOver(game);
    if (gameOver !== 'Game is not over') {
        alert(gameOver);
    }
}

function setup(isWhite) {
  var game = createGame();

  var callback = function (source, target) {
    var whiteToMove = game.turn() === 'w';
    console.log(game.turn(), isWhite, whiteToMove);
    if (whiteToMove === isWhite) {
      onDrop(game, board, source, target);
    } else {
      alert('Not your move!');
      return 'snapback';
    }
  }

  var board = createBoard(game, isWhite, callback, 'chess-board');

}

setup(true);