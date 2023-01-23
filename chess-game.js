'use strict';

function createGame() {
  return new Chess();
}

function createBoard(game, isWhite, onDropFn, boardId) {
  return new ChessBoard(boardId, {
    position: game.fen(),
    draggable: true,
    droffOffBoard: 'snapback',
    orientation: isWhite ? 'white' : 'black',
    onDrop: onDropFn,
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
    return null;
  }
}

function onDrop(game, board, source, target) {
  // Make the move in the chess.js game
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q',
  });

  console.log(`Attempted to make move ${move} from ${source} to ${target}`);

  // If the move was illegal, take back the piece
  if (move === null) {
    return 'snapback';
  }

  // Update the board position
  board.position(game.fen());

  // Game over logic
  const gameOver = checkGameOver(game);
  if (gameOver !== null) {
    document.getElementById('winstate').textContent = gameOver;
  }
}

function setupBoardAndGame(isWhite, conn) {
  const game = createGame();

  const callback = function(source, target) {
    const whiteToMove = game.turn() === 'w';
    if (whiteToMove === isWhite) {
      const retVal = onDrop(game, board, source, target);
      if (retVal !== 'snapback' && retVal !== 'trash') {
        conn.send(JSON.stringify({
          'source': source,
          'target': target,
          'fen': game.fen(),
        }));
      }
      return retVal;
    } else {
      console.warn('Not your move!');
      return 'snapback';
    }
  };

  conn.on('data', function(dataJson) {
    const data = JSON.parse(dataJson);
    onDrop(game, board, data.source, data.target);
  });

  const board = createBoard(game, isWhite, callback, 'chess-board');
}

function createPeer() {
  const peer = new Peer();

  peer.on('error', function(err) {
    console.warn(err);
  });

  return peer;
}

function startConnection() {
  const peer = createPeer();

  peer.on('open', function(id) {
    console.log(`Your id is ${id}.`);
    document.getElementById('instructions').textContent = `
    You're white. Share this id with your friend to allow them to connect
    to this game as black: ${id}.
    `;
  });

  peer.on('connection', function(conn) {
    console.log('Connection established with other player.');
    registerConn(conn, true);
  });

  return peer;
}

function connectToPeer(whitesPeerId) {
  const peer = createPeer();

  peer.on('open', function(id) {
    console.log(`Your id is ${id}.`);
    console.log(`You're black, and you're going to connect to ${whitesPeerId}`);
    const connection = peer.connect(whitesPeerId);

    registerConn(connection, false);
  });

  return peer;
}

function registerConn(conn, isWhite) {
  setupBoardAndGame(isWhite, conn);
}

function setup(whitesPeerId) {
  if (whitesPeerId === undefined) {
    console.log(`You're going to be white. Initiating connection.`);
    startConnection();
  } else { // second person
    console.log(
        `You're going to be black. Attempting to connect to peer:
        ${whitesPeerId}`);
    connectToPeer(whitesPeerId);
  }
}

// PUBLIC FUNCTIONS EXPORTED AND USED IN HTML
/* eslint-disable no-unused-vars */
function parseAndConnectToPeer() {
  const peerId = document.getElementById('peerid').value;
  setup(peerId);
}

function startNewGame() {
  setup();
}
/* eslint-enable no-unused-vars */
