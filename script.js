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
        const square = new Square(color, rank, file, null);
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
        this.element.appendChild(squareElement);
        this.elements.push(squareElement);
      }
    }
  }

  // Methods can be added here...
}

// Square class
class Square {
  constructor(color, rank, file, piece) {
    this.color = color; // Color of the square (e.g., 'white' or 'black')
    this.rank = rank; // Rank of the square (e.g., 1 to 8)
    this.file = file; // File of the square (e.g., 'A' to 'H')
    this.piece = piece; // Optional Piece object occupying the square
  }

  createElement() {
    const squareElement = document.createElement("div");
    squareElement.classList.add("square", this.color);
    squareElement.id = `${numberToLetterMap[this.file]}${this.rank + 1}`;
    squareElement.dataset.rank = this.rank;
    squareElement.dataset.file = this.file;
    squareElement.textContent = squareElement.id;
    return squareElement;
  }
}

// Piece class
class Piece {
  constructor(rank, file, type, user) {
    this.rank = rank; // Rank of the piece (e.g., 1 to 8)
    this.file = file; // File of the piece (e.g., 'A' to 'H')
    this.type = type; // Type of the piece (e.g., 'Q' for Queen, 'P' for Pawn, etc.)
    this.user = user; // User controlling the piece (e.g., 'player' or 'computer')
  }

  // Methods can be added here...
  // For example, a method to calculate possible moves: calculateMoves() {...}
}

const board = new Board();
board.generate();
board.render();
