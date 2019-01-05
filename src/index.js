import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  return (
    <button className="square" onClick={props.onClick} style={props.style}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    let style = this.props.highlightSquare.includes(i)
      ? { backgroundColor: "yellow" }
      : null;
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        style={style}
      />
    );
  }

  createBoard() {
    let board = [];
    for (let i = 0; i < 3; i++) {
      let squares = [];
      for (let n = 0; n < 3; n++) {
        squares.push(this.renderSquare(n + 3 * i));
      }
      board.push(
        <div className="board-row" key={i}>
          {squares}
        </div>
      );
    }
    return board;
  }

  render() {
    return <div>{this.createBoard()}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{ squares: Array(9).fill(null) }],
      stepNumber: 0,
      xIsNext: true,
      highlightSquare: [],
      winner: "",
      reverse: false
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (this.state.winner || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? "X" : "0";
    let x = null;
    let y = null;
    if (i <= 2) {
      y = 1;
    } else if (i >= 3 && i <= 5) {
      y = 2;
    } else {
      y = 3;
    }
    if (i % 3 === 0) {
      x = 1;
    } else if (i % 3 === 1) {
      x = 2;
    } else {
      x = 3;
    }

    this.setState({
      history: history.concat([{ squares: squares, location: `(${x}, ${y})` }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
    this.calculateWinner(squares);
  }

  jumpTo(step) {
    if (this.state.history.length > this.state.stepNumber) {
      this.setState({ winner: "" });
    }
    this.setState(prevState => {
      return Object.assign({}, { stepNumber: step, xIsNext: step % 2 === 0 });
    });
    let squares = this.state.history.slice();
    this.calculateWinner(squares[step].squares);
  }

  reverseHistory = () => {
    if (this.state.history.length === 1) {
      return;
    }
    const reversedHistory = this.state.history.slice().reverse();
    this.setState({
      history: reversedHistory,
      stepNumber: reversedHistory.length - this.state.stepNumber - 1,
      reverse: !this.state.reverse
    });
  };

  calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        // if (this.state.highlightSquare.length === this.state.stepNumber) {
        this.setState({ highlightSquare: lines[i], winner: squares[a] });
        return;
        // }
      }
    }
    this.setState({ highlightSquare: [] });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.state.winner;

    const moves = history.map((step, move) => {
      let index = null;
      if (this.state.reverse) {
        index = history.length - move - 1;
      }
      const desc = index ? "Go to move #" + index : "Go to game start";
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {handleBold(this.state.stepNumber, move, desc)}
          </button>
          <span>{step.location}</span>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else if (!winner && this.state.history.length === 10) {
      status = "draw!";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "0");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            highlightSquare={this.state.highlightSquare}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <button onClick={this.reverseHistory}>reverse history</button>
        </div>
      </div>
    );
  }
}

function handleBold(step, index, elem) {
  if (step === index) {
    return <b>{elem}</b>;
  } else {
    return elem;
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
