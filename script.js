const textElement = document.getElementById("text");

const numberToLetterMap = {
  0: "A",
  1: "B",
  2: "C",
  3: "D",
  4: "E",
  5: "F",
  6: "G",
  7: "H",
};

const directions = {
  Left: { x: -1, y: 0 },
  Right: { x: 1, y: 0 },
  Top: { x: 0, y: 1 },
  Bottom: { x: 0, y: -1 },
  TopLeft: { x: -1, y: 1 },
  TopRight: { x: 1, y: 1 },
  BottomLeft: { x: -1, y: -1 },
  BottomRight: { x: 1, y: -1 },
};

const knightDirections = [
  { x: -1, y: 2 },
  { x: 1, y: 2 },
  { x: -1, y: -2 },
  { x: 1, y: -2 },
  { x: -2, y: 1 },
  { x: 2, y: 1 },
  { x: -2, y: -1 },
  { x: 2, y: -1 },
];

// gamecontroller class

class GameController {
  constructor(board) {
    this.board = board;
    this.checkStatus = "none";
    this.checkmateStatus = "none";
    // generate moves for all pieces
  }
  alternateTurn() {
    this.board.turn = this.board.turn === "white" ? "black" : "white";
  }
  // this will be called to check a new board state for a move
  // TODO: implement check/checkmate detection
  updateCheckStatus(color) {
    //  get all piece of the opposite color
    const opponentPieces = [
      ...board.pieces.flat().filter((piece) => piece.color !== color),
    ];
    //  iterate through all of the pieces
    for (let i = 0; i < opponentPieces.length; i++) {
      const piece = opponentPieces[i];
      // iterate through all of the moves
      for (let j = 0; j < piece.moves.length; j++) {
        const move = piece.moves[j];
        // of some move lands on the king, then the king is in check
        if (
          move.endSquare.piece &&
          move.endSquare.piece.type === "king" &&
          move.endSquare.piece.color === color
        ) {
          this.checkStatus = color;
          // if the player has no moves to remove this check, then the player is in checkmate
          if (this.checkmateStatus === "none") {
            this.updateCheckmateStatus(color);
          }
        }
      }
    }
  }

  // if there is no move which removes the check, then the player is in checkmate
  updateCheckmateStatus(color) {
    if (board.controller.isSimulating) return;
    if (board.turn !== board.controller.checkStatus) {
      board.controller.checkmateStatus = "checkmate";
      return;
    }
    console.log("updating checkmate status");
    // iterate through all of the pieces for this player
    const playerPieces = [
      ...board.pieces.flat().filter((piece) => piece.color === color),
    ];
    // get all the moves of this player
    const playerMoves = [];
    playerPieces.forEach((piece) => {
      playerMoves.push(...piece.moves);
    });
    const initialCheckStatus = board.controller.checkStatus;

    // iterate through all the moves of this player, see if any remove the check
    for (let i = 0; i < playerMoves.length; i++) {
      const move = playerMoves[i];
      // simulate the move
      board.controller.isSimulating = true;
      console.log("is simulating");
      // save position
      const { rank, file } = move.piece;
      // make move
      move.piece.rank = move.endSquare.rank;
      move.piece.file = move.endSquare.file;
      const oldSquare = board.squares[rank][file];
      const newSquare = board.squares[move.endSquare.rank][move.endSquare.file];
      oldSquare.removePiece();
      // remove piece at this square
      newSquare.removePiece();
      // set the new piece
      newSquare.setPiece(droppedPiece);
      // update board state for any piece which may be affected by this move
      board.updateAllMoves();
      // check if king is in check
      board.controller.updateCheckStatus(color);
      if (board.controller.checkStatus !== initialCheckStatus) {
        // if the check is removed, then return
        board.controller.checkmateStatus = "none";
        break;
      }
      // undo move
      move.piece.rank = rank;
      move.piece.file = file;
      // update board state
      board.updateAllMoves();
      board.controller.isSimulating = false;
    }
    // update the checkmate status
    if (board.controller.checkmateStatus !== "none") {
      board.controller.checkmateStatus = "checkmate";
    }
  }
}

// Board class

class Board {
  constructor() {
    this.turn = "white"; // Current turn (e.g., 'player' or 'computer')
    this.squares = this.generate();
    this.pieces = [];
    this.elements = [];
    this.element = document.getElementById("board");
    this.controller = new GameController(this);
  }

  updateAllMoves() {
    const pieces = this.pieces.flat();

    pieces.forEach((piece) => {
      piece.getValidMoves();
    });
  }

  removePiece(piece) {
    const { rank, file } = piece;
    // find piece in square array, then remove piece from square
    const square = this.squares[rank][file];
    square.removePiece();
  }

  alternateTurn() {
    this.turn = this.turn === "white" ? "black" : "white";

    // TODO: implement check/checkmate detection
  }

  // create squares
  generate() {
    // define data structure
    const grid = [];
    const colors = ["dark", "light"];

    for (let rank = 0; rank < 8; rank++) {
      // even rows start lgiht, odd rows start dark
      const row = [];
      const startColor = colors[rank % 2];

      for (let file = 0; file < 8; file++) {
        const squareColor = colors[(file + rank) % 2];
        const color =
          squareColor === startColor
            ? squareColor
            : colors.find((c) => c !== startColor);
        const square = new Square(color, rank, file);
        row.push(square);
      }

      grid.push(row);
    }
    return grid;
  }

  render() {
    // create a square element for each square
    this.element.innerHTML = "";
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const square = this.squares[rank][file];
        const squareElement = square.createElement();
        // if there is a piece at square, render it
        if (board.squares[rank][file].piece !== null) {
          const piece = board.squares[rank][file].piece;

          const pieceElement = piece.createElement();
          squareElement.appendChild(pieceElement);
        }

        this.element.appendChild(squareElement);
        this.elements.push(squareElement);
      }
    }
  }

  renderValidMoves() {
    // modify the square elements to show valid moves
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const square = this.squares[rank][file];
        const squareElement = square.element;
        if (square.isMove) {
          squareElement.classList.add("move");
        } else {
          squareElement.classList.remove("move");
        }
      }
    }
  }

  clearMoves() {
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const square = this.squares[rank][file];
        square.isMove = false;
      }
    }
  }

  loadPiecesFromFen(fen) {
    // split fen by '/'
    let fenArray = fen.split("/");

    // iterate throught the squares
    for (let rank = 0; rank < 8; rank++) {
      board.pieces[rank] = [];
      let file = 0;
      for (let i = 0; i < fenArray[rank].length; i++) {
        // if this position has a piece, then create a piece
        if (isNaN(parseInt(fenArray[rank][i]))) {
          // char = index into fen by [rank][file]
          const char = fenArray[rank][i];

          // create new piece
          const piece = new Piece(rank, file);

          // set the type and user  based on char
          piece.setColor(char);
          piece.setType(char);

          // get moves for the piece
          piece.getValidMoves();
          // save the piece in the square
          const square = board.squares[rank][file];
          square.setPiece(piece);

          // save the piece in the board
          board.pieces[rank][file] = piece;
        } else {
          // if its a number, then increment the file(not idx) by that number
          // subtract 1 because the file is already incremented by 1 at next step
          file += parseInt(fenArray[rank][i]) - 1;
        }
        // increment file by 1
        file++;
      }
    }
  }

  // Methods can be added here...
}

// Square class
class Square {
  constructor(color, rank, file) {
    this.color = color; // Color of the square (e.g., 'white' or 'black')
    this.rank = rank; // Rank of the square (e.g., 1 to 8)
    this.file = file; // File of the square (e.g., 'A' to 'H')
    this.piece = null; // Optional Piece object occupying the square
    this.element = null; // Optional DOM element for the square
    this.isMove = false;
  }

  handleDropEvent() {
    this.element.addEventListener("dragover", (e) => {
      // by default, data can't be dropped in other elements
      e.preventDefault();
    });

    // if a piece is dropped on this square, then move the piece
    this.element.addEventListener("drop", (e) => {
      e.preventDefault();
      // return if not your turn

      // get the data that was dropped
      const [oldRank, oldFile] = e.dataTransfer.getData("Text").split(",");
      const oldSquare = board.squares[oldRank][oldFile];
      // so you can save the piece that was dropped

      const droppedPiece = oldSquare.piece;
      // return if not your turn
      if (droppedPiece.color !== board.turn) return;
      const newSquare = board.squares[this.rank][this.file];
      // use this piece and square to check for move
      // if move is valid, move piece
      // if move is not valid, return piece to original square
      const move = droppedPiece.moves.find(
        (move) => move.endSquare === newSquare
      );
      // KEY LOGIC
      if (move) {
        droppedPiece.move(move);
        // and remove it from prev position

        oldSquare.removePiece();
        // remove piece at this square
        newSquare.removePiece();
        // set the new piece
        newSquare.setPiece(droppedPiece);
        // update the board state and view
        board.render();
        board.updateAllMoves();

        board.controller.alternateTurn();
        // update the board
        const initialCheckStatus = board.controller.checkStatus;
        board.controller.updateCheckStatus("white");
        board.controller.updateCheckStatus("black");

        // generate new moves for that previous piece based on new board state
        droppedPiece.getValidMoves();
        // if now in check, then alert
        if (
          initialCheckStatus !== board.controller.checkStatus &&
          board.controller.checkStatus !== "none"
        ) {
          alert(`${board.controller.checkStatus} is in check!`);
        }
        if (
          board.controller.checkmateStatus !== "none" &&
          initialCheckStatus !== board.controller.checkmateStatus
        ) {
          alert(`${board.controller.checkStatus} is in checkmate!`);
        }
      }
    });
  }

  setPiece(piece) {
    this.piece = piece;
  }

  removePiece() {
    this.piece = null;
  }

  setIsMove() {
    this.isMove = !this.isMove;
  }

  createElement() {
    const squareElement = document.createElement("div");
    squareElement.classList.add("square", this.color);
    if (this.isMove) squareElement.classList.add("move");
    squareElement.id = `${numberToLetterMap[this.file]}${this.rank + 1}`;
    squareElement.dataset.rank = this.rank;
    squareElement.dataset.file = this.file;
    this.element = squareElement;
    this.handleDropEvent();

    return squareElement;
  }
}

// Piece class
class Piece {
  constructor(rank, file) {
    this.rank = rank; // Rank of the piece (e.g., 1 to 8)
    this.file = file; // File of the piece (e.g., 'A' to 'H')
    this.type = ""; // Type of the piece (e.g., 'Q' for Queen, 'P' for Pawn, etc.)
    this.color = ""; // User controlling the piece ('light', 'dark')
    this.element = null; // Optional DOM element for the piece
    this.moves = []; // Array of legal moves
  }

  setColor(char) {
    this.color = char === char.toUpperCase() ? "black" : "white";
  }
  setType(char) {
    // fen for pawn is p or P (black is uppercase)
    // fen for knight is n or N

    // set color based on char case, (reversed typical fen colring because board is flipped)
    // switch steatment, sets type to the correct piece
    switch (char.toLowerCase()) {
      case "p":
        this.type = "pawn";
        break;
      case "r":
        this.type = "rook";
        break;
      case "n":
        this.type = "knight";
        break;
      case "b":
        this.type = "bishop";
        break;
      case "q":
        this.type = "queen";
        break;
      case "k":
        this.type = "king";
        break;
    }
  }

  getValidMoves() {
    // clear previous moves
    this.moves = [];
    // initialize moves for a queen piece
    if (this.type === "knight") {
      this.generateKnightMoves();
    } else {
      this.generateSlidingMoves();
    }

    // filter the moves based on type of piece
    this.filterMovesByType();
  }

  handleDragDrop(pieceElement) {
    // the piece is being dragged
    pieceElement.addEventListener("dragstart", (e) => {
      // set the data that will be dropped
      e.dataTransfer.setData("Text", `${this.rank},${this.file}`);

      // return if not your turn
      if (this.color !== board.turn) return;

      // clear previous moves
      board.clearMoves();
      // get the valid moves
      this.getValidMoves();

      // update the board configuration to show valid moves
      this.moves.forEach((move) => {
        move.endSquare.setIsMove();
      });
      // update board
      board.renderValidMoves();
    });

    // the piece has been dropped
    pieceElement.addEventListener("dragend", (e) => {
      // update the ui
      board.clearMoves();
      board.renderValidMoves();
    });
  }

  // is called to finalize a move
  move(move) {
    const { rank, file } = move.endSquare;

    // set rank and file to that of the end square
    this.rank = rank;
    this.file = file;
    // check for the king
    const endSquare = board.squares[rank][file];
    console.log(endSquare.piece);
    if (
      endSquare.piece !== null &&
      endSquare.piece.type === "king" &&
      endSquare.piece.color !== this.color
    ) {
      alert("game over");
      window.location.reload();
    }
    // handle edge cases for pawns
    if (this.type === "pawn") {
      if (move.direction === "enPassant") {
        this.handleEnPassant();
      }
      if (
        (this.rank === 0 && this.color === "black") ||
        (this.rank === 7 && this.color === "white")
      ) {
        this.handlePromotion();
      }
    }
  }

  handlePromotion() {
    this.type = "queen";
  }

  handleEnPassant() {
    if (this.color === "white") {
      // remove the piece one rank above
      const square = board.squares[this.rank - 1][this.file];
      square.removePiece();
    } else {
      const square = board.squares[this.rank + 1][this.file];
      square.removePiece();
    }
  }

  createElement() {
    const pieceElement = document.createElement("img");
    pieceElement.classList.add("piece", this.color);
    pieceElement.dataset.rank = this.rank;
    pieceElement.dataset.file = this.file;
    pieceElement.src = `./images/${this.type}_${this.color}.png`;
    // add drag events
    this.handleDragDrop(pieceElement);
    this.element = pieceElement;
    return pieceElement;
  }

  // goal is to add valid moves to piece.moves
  generateSlidingMoves() {
    const startSquare = board.squares[this.rank][this.file];
    //iterate through directionis
    for (let direction in directions) {
      const numMoves = this.getNumMovesInDirection(
        startSquare,
        directions[direction]
      );
      const { x, y } = directions[direction];
      for (let i = 1; i <= numMoves; i++) {
        // if the this square in this direction is a piece of my color,  break
        const targetSquare =
          board.squares[this.rank + y * i][this.file + x * i];
        const targetPiece = targetSquare.piece;

        if (targetPiece !== null && targetPiece.color === this.color) break;
        // add the move to moves2
        const move = new Move(direction, this, startSquare, targetSquare);
        this.moves.push(move);
        // if the this square in this direction is a piece of the opposite color, break
        if (targetPiece !== null && targetPiece.color !== this.color) break;
      }
    }
  }

  generateKnightMoves() {
    // first, iterate through the knight direcitons
    for (let i = 0; i < knightDirections.length; i++) {
      const direction = knightDirections[i];
      // then get a coords using piece rank and file offset by the knight direction
      const x = direction.x + this.file;
      const y = direction.y + this.rank;
      // check whether the coords are in bounds
      if (x < 0 || x > 7 || y < 0 || y > 7) continue;
      // if there is a piece of the same color, break
      const targetSquare = board.squares[y][x];
      if (targetSquare.piece && targetSquare.piece.color === this.color) break;
      // else, add the move to moves
      this.moves.push(
        new Move(
          "knight",
          this,
          board.squares[this.rank][this.file],
          targetSquare
        )
      );
    }
    // else, add the move to moves
  }

  getPawnAttack() {
    let positions = [];
    // generate diag moves for either color
    if (this.color === "white") {
      positions = [
        { x: -1, y: 1 },
        { x: 1, y: 1 },
      ];
    } else {
      positions = [
        { x: -1, y: -1 },
        { x: 1, y: -1 },
      ];
    }

    for (let i = 0; i < positions.length; i++) {
      const x = positions[i].x + this.file;
      const y = positions[i].y + this.rank;
      // check whether the coords are in bounds
      if (x < 0 || x > 7 || y < 0 || y > 7) continue;
      const targetSquare = board.squares[y][x];
      // if there is a piece of opposite color on this square, add it to moves
      if (targetSquare.piece && targetSquare.piece.color !== this.color) {
        this.moves.push(
          new Move(
            "pawn",
            this,
            board.squares[this.rank][this.file],
            targetSquare
          )
        );
      }
    }
  }

  getEnPassant() {
    let otherPawn = null;

    // check if there is an inbound pawn of opposite color on the left or right
    const xOffset = {
      left: -1 + this.file,
      right: 1 + this.file,
    };
    if (xOffset.left >= 0) {
      const leftSquare = board.squares[this.rank][xOffset.left];
      if (
        leftSquare.piece &&
        leftSquare.piece.color !== this.color &&
        leftSquare.piece.type === "pawn"
      ) {
        otherPawn = leftSquare.piece;
      }
    }
    if (xOffset.right <= 7) {
      const rightSquare = board.squares[this.rank][xOffset.right];

      if (
        rightSquare.piece &&
        rightSquare.piece.color !== this.color &&
        rightSquare.piece.type === "pawn"
      ) {
        otherPawn = rightSquare.piece;
      }
    }
    // no pawn on either side
    if (otherPawn === null) return;
    // find whether or not the pawn  could have moved a distance of 2
    const lastMove = otherPawn.moves.find(
      (move) => Math.abs(move.endSquare.rank - move.startSquare.rank) === 2
    );
    if (!lastMove) return;
    // if so, then check whether or not the pawn DID move a distance of 2
    if (lastMove.endSquare.rank !== otherPawn.rank) return;

    // now determine the exact location of the move
    // therefore, get the color of the piece that moved
    let tempRank = otherPawn.rank;
    if (otherPawn.color === "white") {
      tempRank--;
    } else {
      tempRank++;
    }
    const move = new Move(
      "enPassant",
      this,
      board.squares[this.rank][this.file],
      board.squares[tempRank][otherPawn.file]
    );
    this.moves.push(move);
  }

  filterMovesByType() {
    if (this.type === "pawn") {
      // filter moves out for vertical direction using color
      if (this.color === "black") {
        this.moves = this.moves.filter((move) => move.direction === "Bottom");
        this.moves = this.moves.filter((move) => move.endSquare.piece === null);
      } else {
        this.moves = this.moves.filter((move) => move.direction === "Top");
        this.moves = this.moves.filter((move) => move.endSquare.piece === null);
      }
      // get all valid diagonal moves
      this.getPawnAttack();
      // get a valid en passant move if possible
      this.getEnPassant();
      // the move must be one square difference in rank
      // and if the pawn hasn't moved, then the move can be 2 squares away
      let limit = 1;
      if (
        (this.color === "white" && this.rank === 1) ||
        (this.color === "black" && this.rank === 6)
      ) {
        limit = 2;
      }
      this.moves = this.moves.filter(
        (move) => Math.abs(move.endSquare.rank - move.startSquare.rank) <= limit
      );
    }

    if (this.type === "rook") {
      // if the drection is left, right, top, bottom, then it is valid
      this.moves = this.moves.filter(
        (move) =>
          move.direction === "Left" ||
          move.direction === "Right" ||
          move.direction === "Top" ||
          move.direction === "Bottom"
      );
    }
    if (this.type === "bishop") {
      // if the direction is topleft, topright, bottomleft, bottomright, then it is valid
      this.moves = this.moves.filter(
        (move) =>
          move.direction === "TopLeft" ||
          move.direction === "TopRight" ||
          move.direction === "BottomLeft" ||
          move.direction === "BottomRight"
      );
    }
    if (this.type === "queen") {
      // all moves are valid
    }
    if (this.type === "king") {
      // cehck difference in rank and file
      // if both are 1 or less, then it is valid
      this.moves = this.moves.filter(
        (move) =>
          Math.abs(move.endSquare.rank - move.startSquare.rank) <= 1 &&
          Math.abs(move.endSquare.file - move.startSquare.file) <= 1
      );
      // remove any moves which would put the king in check
      return;
    }
    if (this.type === "knight") {
      // moves are generated in generateKnightMoves
    }
  }

  getNumMovesInDirection(startSquare, direction) {
    let numMoves = 0;
    let { x, y } = direction;
    let { rank, file } = startSquare;
    while (true) {
      // continue in this direction
      rank += y;
      file += x;
      // exit if square is out of bounds
      if (rank < 0 || rank > 7 || file < 0 || file > 7) {
        break;
      }
      numMoves++;
    }
    return numMoves;
  }
}

class Move {
  constructor(direction, piece, startSquare, endSquare) {
    this.direction = direction;
    this.piece = piece;
    this.startSquare = startSquare;
    this.endSquare = endSquare;
  }
}

// FEN strings for testings:
// READ from bottom to top AND left to right
const fenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
const kingCapture = "rnbpkppr/ppppqppp/8/8/8/8/PPPPQPPP/RNB1RBNR";
const board = new Board();
board.generate();
board.loadPiecesFromFen(fenString);
console.log(board);
console.log(fenString);
board.render();
