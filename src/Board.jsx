import React from 'react';
import { coordinates } from '../constants';
import serverFetch from '../serverFetch';

const dallas = new Image();
const houston = new Image();
const dmz = new Image();
const deltaCity = new Image();
const gotham = new Image();
const monterrey = new Image();
dallas.src = '/images/Dallas.png';
houston.src = '../images/Houston.png';
dmz.src = '/images/DMZ.png';
deltaCity.src = '/images/DeltaCity.png';
gotham.src = '/images/Gotham.png';
monterrey.src = '/images/Monterrey.png';

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      players: [],
      board: []
    };
  }

  componentDidMount() {
    this.getCurrentData();
    // poll once per minute for new data
    setInterval(this.getCurrentData, 60000);
  }

  renderPieces = () => {
    const canvas = document.getElementById('game-pieces');
    const context = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, canvas.width, canvas.height);

    this.renderPiece(0, deltaCity, context);
    this.renderPiece(1, gotham, context);
    this.renderPiece(2, dmz, context);
    this.renderPiece(3, houston, context);
    this.renderPiece(4, dallas, context);
    this.renderPiece(5, monterrey, context);
  }

  getCurrentData = () => {
    serverFetch.get()
    .then(async (result) => {
      this.setState({
        players: result.body._private.monopolyPlayers,
        board: result.body._private.monopolyBoard
      }, this.renderPieces);
    }).catch(err => console.error(err));
  }

  renderPiece = (playerIndex, image, context) => {
    const player = this.state.players[playerIndex];
    if (!player.isBankrupt) {
      const x = this.calculateX(playerIndex, player.location);
      const y = this.calculateY(playerIndex, player.location);
      context.drawImage(image, x, y, 60, 60);
    }
  }

  calculateX = (index, location) => {
    const inJail = this.state.players[index].inJail;
    let position = inJail ? 28 : coordinates[location].x;
    let piecesAtThatLocation = 0;
    for (let i = 0; i < index; i += 1) {
      const checkPlayer = this.state.players[i];
      if (checkPlayer.location === location && !checkPlayer.isBankrupt &&
          checkPlayer.inJail === inJail) {
        piecesAtThatLocation += 1;
      }
    }
    if (piecesAtThatLocation > 0) {
      if (location === 0 || (location > 10 && location <= 20) || (!inJail && location === 10)) {
        // stack left to right
        position += piecesAtThatLocation * 50;
      } else if (location > 30) {
        // stack right to left
        position -= piecesAtThatLocation * 50;
      } else if (inJail) {
        position += piecesAtThatLocation * 10;
      }
    }
    return position;
  }

  calculateY = (index, location) => {
    const inJail = this.state.players[index].inJail;
    let position = inJail ? 600 : coordinates[location].y;
    let piecesAtThatLocation = 0;
    for (let i = 0; i < index; i += 1) {
      const checkPlayer = this.state.players[i];
      if (checkPlayer.location === location && !checkPlayer.isBankrupt) {
        piecesAtThatLocation += 1;
      }
    }
    if (piecesAtThatLocation > 0) {
      if (location < 10 && location > 0) {
        // stack above
        position -= piecesAtThatLocation * 50;
      } else if (location < 30 && location > 20) {
        // stack below
        position += piecesAtThatLocation * 50;
      }
    }
    return position;
  }

  renderStatus = () => this.state.players.map((player) => {
    let location = `is on ${this.state.board[player.location].name}`;
    if (player.isBankrupt) {
      location = 'is bankrupt 😢';
    } else if (player.inJail) {
      location = 'is In Jail';
    }
    return <div key={player.name} className="team-status">{player.name} {location}</div>;
  })

  render() {
    return (
      <div>
        <img alt="board" className="board" src="/images/HeadspringopolyBoard.png" />
        <canvas id="game-pieces" height="700" width="700" />
        <div className="status">
          {this.renderStatus()}
        </div>
      </div>
    );
  }
}

export default Board;
