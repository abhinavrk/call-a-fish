"use strict";
var game = new Chess();

// Create a new chess board
var board = ChessBoard('chess-board', {
  position: game.fen(), // Use the FEN from the chess.js game
  draggable: true,
  droffOffBoard: 'snapback',
  onDrop: function(source, target) {
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
});