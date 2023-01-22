"use strict";

//var wasmSupported = typeof WebAssembly === 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
//var stockfish = new Worker(wasmSupported ? 'stockfish.wasm.js' : 'stockfish.js');

//const stockfish = require("stockfish.wasm")
//var stockfish = new Stockfish();
//var stockfish = STOCKFISH();
//var stockfish = new Worker('./stockfish.js');
//var stockfish = require("stockfish");
//var stockfish = new Worker();

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

//    stockfish.postMessage("position fen " + chess.fen());
//    stockfish.postMessage("go movetime "+3000);  // think for 3000ms
//    stockfish.onmessage = function(event) {
//      if (event.data.startsWith("bestmove")) {
//        var move = event.data.split(" ")[1];
//        var bestMove = { from: move.slice(0, 2), to: move.slice(2, 4) };
//        move(bestMove.from, bestMove.to);
//      }
//};

  // Game over logic
  var gameOver = checkGameOver(game);
    if (gameOver !== 'Game is not over') {
        alert(gameOver);
    }
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
    console.log('initial_connection_on')
    registerConn(conn, true);
  });

  peer.on('error', function (err) {
    console.warn(err);
  });

  return peer;
}

function connectToPeer(id_to_connect) {
  var peer = new Peer();

  peer.on('error', function (err) {
    console.warn(err);
  });

  peer.on('open', function (id) {
    console.log('Black, your id is ' + id);
    console.log('The id to connect is: ' + id_to_connect);
    console.log("Connection state: "+peer.connectionState);
    console.log("peer id: "+peer.id);
    var connection = peer.connect(id_to_connect);
    console.log("Connection state after connecting: "+ connection.connectionState);

    registerConn(connection, false);
  });


  return peer;
}

function registerConn(conn, isWhite) {
  window.conn = conn;
  setupBoardAndGame(isWhite, conn);
}

function setup(peerId) {
  if (peerId === undefined) {  // first person
    startConnection();
  } else {  // second person
    console.log('trying to connect to peer')
    connectToPeer(peerId);
  }
} 

function parseAndConnectToPeer() {
  var peerId = document.getElementById('peerid').value;
  setup(peerId);
}

function startNewGame() {
  setup();
}