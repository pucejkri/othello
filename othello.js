// othello.js

/** The state of the game */
var state = {
  over: false,
  turn: 'b',
  skipped: false,
  board: [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, 'w' , 'b' , null, null, null],
    [null, null, null, 'b' , 'w' , null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null]
  ],
  pieces: {b: 2, w: 2}
}

var ctx;

/** @function checkNeighbors()
  * Improves efectivity of legal position checking - filters out such squares that
  * has no neghboring pieces already placed.
  */
function checkNeighbors(x, y){
  for(var i = -1; i < 2; i++){
    fx = x+i;
    if (!(fx<0 || fx>7)) {
      for(var j = -1; j < 2; j++) {
        fy = y+j;
        if (!(fy<0 || fy>7)) {
          if(state.board[fy][fx]){
            return true;
          }
        }
      }
    }
  }
  return false;
}

/** @function isLegalPos()
  * Check whether current position is legal for piece placement.
  */
function isLegalPos(x,y) {
  if(state.board[y][x]){
    return false;
  } else if (checkNeighbors(x, y)) {
    if(checkFlip(x, y)) return true;
  }
  return false;
}

/** @function checkFlip()
  * Checks whether from current position any flip is available. Uses checkLine()
  * with last parameter 'false' in order to supper applying flips.
  */
function checkFlip(x,y) {
  for(var i = -1; i < 2; i++) {
    for (var j = -1; j < 2; j ++) {
      if (checkLine(x, y, i, j, false)) return true;
    }
  }
}

/** @function applyMove()
  * Applies move. Uses the checkLine() function with last parameter 'true' in order
  * to apply flips.
  */
function applyMove(x,y) {
  for(var i = -1; i < 2; i++) {
    for (var j = -1; j < 2; j ++) {
      checkLine(x, y, i, j, true);
    }
  }
  state.pieces.b = countPieces('b');
  state.pieces.w = countPieces('w');

  console.log("black: " + state.pieces.b.toString());
  console.log("white: " + state.pieces.w.toString());
}


/** @function countPieces()
  * Counts pieces for both players and saves into arguments of global state variable.
  */
function countPieces(type) {
  var count = 0;
  state.board.forEach(function(row, index) {
    row.forEach(function(piece, index) {
      if(piece == type) count++;
    });
  });
  return count
}


/** @function checkLine()
  * Checks in all 8 directions whether the line with new piece yields acceptable
  * move with at least one flip.
  */
function checkLine(x, y, dirX, dirY, apply) {
  var flip = false;
  fx = x+dirX;
  fy = y+dirY;
  if((!(fx<0 || fx>7) && !(fy<0 || fy>7)) && (!state.board[fy][fx] || state.board[fy][fx] == state.turn)) return flip;
  for(var i = 1; i < 8; i++) {
    fx = x+dirX*i;
    fy = y+dirY*i;
    if (!(fx<0 || fx>7) && !(fy<0 || fy>7)) {
      if(state.board[fy][fx] == state.turn) {
        flip = true;
        if(apply) {
          for(var j = 1; j < i; j++) {
            fx = x+dirX*j;
            fy = y+dirY*j;
            state.board[fy][fx] = state.turn;
          }
        }

        return flip;
      }
    }
  }
  return flip;
}



/** @function checkForGameOver()
  * Checks to see game is over
  */
function checkForGameOver() {
  if(!hasLegalMove()) {
    if(state.skipped || (state.pieces.b + state.pieces.w == 64)) {
      console.log('Game Over');
      state.over = true;
    } else {
      console.log(state.turn + ' has no legal moves. Skipping to the next turn.');
      state.skipped = true;
      nextTurn();
    }
  }
}

/** @function nextTurn()
  * Starts the next turn by changing the
  * turn property of state.
  */
function nextTurn() {
  if(state.turn === 'b') state.turn = 'w';
  else state.turn = 'b';
}

/** @function renderChecker()
  * Renders a checker at the specified position
  */
function renderPiece(piece, x, y) {
  ctx.beginPath();
  if(piece.charAt(0) === 'w') {
    ctx.fillStyle = '#fff';
  } else {
    ctx.fillStyle = '#000';
  }
  ctx.arc(x*100+50, y*100+50, 40, 0, Math.PI * 2, false);
  ctx.fill();
}


/** @function renderSquare()
  * Renders a single square on the game board
  * as well as any checkers on it.
  */
function renderSquare(x,y) {
  ctx.fillStyle = '#33cc33';
  ctx.fillRect(x*100, y*100, 100, 100);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(x*100, y*100, 100, 100);
  if(state.board[y][x]) {
    renderPiece(state.board[y][x], x, y);
  }
}

/** @function renderBoard()
  * Renders the entire game board.
  */
function renderBoard() {
  if(!ctx) return;
  for(var y = 0; y < 8; y++) {
    for(var x = 0; x < 8; x++) {
      renderSquare(x, y);
    }
  }
}

function boardPosition(x, y) {
  var boardX = Math.floor(x / 50);
  var boardY = Math.floor(y / 50);
  return {x: boardX, y: boardY}
}

function handleMouseClick(event) {
  if(state.over) return;
  var position = boardPosition(event.clientX, event.clientY);
  var x = position.x;
  var y = position.y;
  if(x < 0 || y < 0 || x > 7 || y > 7) return;
  // Make sure we're over the current player
  if(isLegalPos(x, y)) {
    // pick up piece
    state.board[y][x] = state.turn;
    renderBoard();
    applyMove(x, y);
    renderBoard();
    nextTurn();
  }
  checkForGameOver();
  if(state.over) {
    renderOver();
    window.addEventListener('keydown', ()=>{
      location.reload();
    }, {once: true})
  }
}

function checkWinner(){
  if(state.pieces.b > state.pieces.w) {
    return 'Black';
  } else if(state.pieces.b < state.pieces.w) {
    return 'White';
  } else {
    return 'tie';
  }
}

function renderOver() {
  if(!ctx) return;
  var text = '';
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,800,800);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "ivory";
  ctx.font = '60px sans-serif';
  if(checkWinner() == 'tie'){
    text = 'It is a tie!'
  } else {
    var text = checkWinner() + ' wins!'
  }
  ctx.fillText("Game Over, " + text, 80, 300);
  ctx.font = '50px sans-serif';
  ctx.fillText("Points:  Black - " + state.pieces.b.toString()
    + ",  White - " + state.pieces.w.toString(), 60, 450);
  ctx.font = '40px sans-serif';
  ctx.fillText("-Press any key for new game-", 150, 700);
  return;
}

function hasLegalMove(){
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      if(isLegalPos(i, j)) return true;
    }
  }
  return false;
}



function handleMouseMove(event) {
  if(state.over) return;
  renderBoard();
  hoverOverSquare(event);
}

/** @function hoverOverSquare
  * Event handler for when a player is deciding
  * where to move.
  */
function hoverOverSquare(event) {
  if(!ctx) return;
  var x = Math.floor(event.clientX / 50);
  var y = Math.floor(event.clientY / 50);
  if(x < 0 || y < 0 || x > 7 || y > 7) return;
  renderBoard();
  if(!state.board[y][x] && isLegalPos(x, y)) {
    renderPiece(state.turn, x, y);
  }
}

function setup() {
  var canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 800;
  canvas.onmousedown = handleMouseClick;
  canvas.onmousemove = handleMouseMove;
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  renderBoard();
}

setup();
