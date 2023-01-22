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