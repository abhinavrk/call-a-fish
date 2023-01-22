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

function setupBoardAndGame(isWhite, conn) {
  var game = createGame();

  var callback = function (source, target) {
    var whiteToMove = game.turn() === 'w';
    if (whiteToMove === isWhite) {
      onDrop(game, board, source, target);
      conn.send(JSON.stringify({
        'source': source,
        'target': target,
        'fen': game.fen()
      }));
    } else {
      console.warn('Not your move!');
      return 'snapback';
    }
  }

  conn.on('data', function (dataJson) {
    var data = JSON.parse(dataJson);
    onDrop(game, board, data.source, data.target);
  });

  var board = createBoard(game, isWhite, callback, 'chess-board');
}

function startConnection() {
  var peer = new Peer();

  peer.on('open', function (id) {
    console.log(`Your id is ${id}`);
    alert(`You're white. Share this id with your friend: ${id}`);
  });

  peer.on('connection', function (conn) {
    registerConn(conn, true);
  });

  peer.on('error', function (err) {
    console.warn(err);
  });

  return peer;
}

function connectToPeer(id) {
  var peer = new Peer();

  peer.on('error', function (err) {
    console.warn(err);
  });

  peer.on('open', function (id) {
    console.log('Your id is ' + id);

    var conn = peer.connect(id, {
      reliable: true
    });

    registerConn(conn, false);
  });


  return peer;
}

function registerConn(conn, isWhite) {
  window.conn = conn;
  setupBoardAndGame(isWhite, conn);
}

function setup(peerid) {
  if (peerid === undefined) {
    startConnection();
  } else {
    connectToPeer(peerid);
  }
} 

function parseAndConnectToPeer() {
  var peerId = document.getElementById('peerid').value;
  setup(peerId);
}

function startNewGame() {
  setup();
}