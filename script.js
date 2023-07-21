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

// Board class

class Board {
  constructor() {
    this.turn = 0; // Current turn (e.g., 'player' or 'computer')
    this.squares = this.generate();
    this.pieces = [];
    this.elements = [];
    this.element = document.getElementById("board");
  }
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

  loadPiecesFromFen(fen) {
    // split fen by '/'
    let fenArray = fen.split("/");
    console.log("loading pieces: ", fenArray);
    // iterate throught the squares
    for (let rank = 0; rank < 8; rank++) {
      board.pieces[rank] = [];

      for (let file = 0; file < 8; file++) {
        // skip numbers

        if (isNaN(parseInt(fenArray[rank][file]))) {
          // char = index into fen by [rank][file]
          const char = fenArray[rank][file];
          // create new piece
          const piece = new Piece(rank, file);
          // set the type and user  based on char
          piece.setType(char);
          console.log(`type set ${piece.type}_${piece.user}`);
          // save the piece in the board
          board.squares[rank][file].piece = piece;
        } else {
          // increment file by the number of empty squares
          file += parseInt(fenArray[rank][file]);
        }
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
  }

  createElement() {
    const squareElement = document.createElement("div");
    squareElement.classList.add("square", this.color);
    squareElement.id = `${numberToLetterMap[this.file]}${this.rank + 1}`;
    squareElement.dataset.rank = this.rank;
    squareElement.dataset.file = this.file;
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
  }

  setType(char) {
    // fen for pawn is p or P (white is capital)
    // fen for knight is n or N
    console.log(char);
    // set color based on char case
    this.user = char === char.toUpperCase() ? "white" : "black";
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

  createElement() {
    const pieceElement = document.createElement("img");
    pieceElement.classList.add("piece", this.user);
    pieceElement.dataset.rank = this.rank;
    pieceElement.dataset.file = this.file;
    console.log(`${this.type}_${this.user}.png`);
    pieceElement.src = `./images/${this.type}_${this.user}.png`;
    return pieceElement;
  }
  // Methods can be added here...
  // For example, a method to calculate possible moves: calculateMoves() {...}
}

const board = new Board();
board.generate();
board.loadPiecesFromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
board.render();
