import './style.css';

const mapSize: [number, number] = [7, 7];
const cellSize: number = 20;

const puzzles: string[] = ["01", "02", "Impossible"];
var selected_puzzle: number = 0;

var mouse_over: [number, number] = [0, 0];
var mouse_in: boolean = false;
var mouse_down: boolean = false;

var precincts: number[][] = [];
// get the precincts from url params
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('precincts')) {
  const precinctsString = urlParams.get('precincts')!;
  const precinctsArray = JSON.parse(precinctsString);
  for (let i = 0; i < mapSize[0]; i++) {
    precincts[i] = [];
    for (let j = 0; j < mapSize[1]; j++) {
      precincts[i][j] = precinctsArray[i][j];
    }
  }
}

var districts: number[][] = [];
for (let i = 0; i < mapSize[0]; i++) {
    districts[i] = [];
    for (let j = 0; j < mapSize[1]; j++) {
      districts[i][j] = 0;
    }
}

const partyColors: string[] = [
  'rgba(0, 0, 0, 0)', // Unset
  'rgba(255, 255, 0, 1)',
  'rgba(255, 0, 255, 1)',
]

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <canvas id="c" width="${mapSize[0] * cellSize}" height="${mapSize[1] * cellSize}"></canvas>
    <div id="toolbar">
      <button id="last">Last</button>
      <button id="open">Play</button>
      <button id="next">Next</button>
      <button id="editor">Editor</button>
    </div>
  </div>
`;

let prc;
fetch(`/puzzles/${puzzles[selected_puzzle]}.json`)
      .then(response => response.json())
      .then(data => {
        prc = JSON.stringify(data);
        const precinctsArray = JSON.parse(prc);
        for (let i = 0; i < mapSize[0]; i++) {
          precincts[i] = [];
          for (let j = 0; j < mapSize[1]; j++) {
            precincts[i][j] = precinctsArray[i][j];
          }
        }
      });

document.querySelector<HTMLButtonElement>('#editor')!.addEventListener('click', () => {
  window.location.href = '/editor.html';
});

document.querySelector<HTMLButtonElement>('#last')!.addEventListener('click', () => {
  if (selected_puzzle > 0) {
    selected_puzzle--;
    let precinctsString;
    fetch(`/puzzles/${puzzles[selected_puzzle]}.json`)
      .then(response => response.json())
      .then(data => {
        precinctsString = JSON.stringify(data);
        const precinctsArray = JSON.parse(precinctsString);
        for (let i = 0; i < mapSize[0]; i++) {
          precincts[i] = [];
          for (let j = 0; j < mapSize[1]; j++) {
            precincts[i][j] = precinctsArray[i][j];
          }
        }
      });
  }
});

document.querySelector<HTMLButtonElement>('#next')!.addEventListener('click', () => {
  if (selected_puzzle < puzzles.length - 1) {
    selected_puzzle++;
    let precinctsString;
    fetch(`/puzzles/${puzzles[selected_puzzle]}.json`)
      .then(response => response.json())
      .then(data => {
        precinctsString = JSON.stringify(data);
        const precinctsArray = JSON.parse(precinctsString);
        for (let i = 0; i < mapSize[0]; i++) {
          precincts[i] = [];
          for (let j = 0; j < mapSize[1]; j++) {
            precincts[i][j] = precinctsArray[i][j];
          }
        }
      });
  }
});

document.querySelector<HTMLButtonElement>('#open')!.addEventListener('click', () => {
  // Load the precincts from a server file
  const precinctsString = JSON.stringify(precincts);
  const encodedPrecincts = encodeURIComponent(precinctsString);
  const url = `/puzzle.html?precincts=${encodedPrecincts}`;
  window.location.href = url;
});

const canvas: HTMLCanvasElement = document.querySelector<HTMLCanvasElement>('#c')!;
let ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  mouse_over = [x, y]
});

canvas.addEventListener('mouseleave', () => {
  mouse_in = false;
});

canvas.addEventListener('mouseenter', () => {
  mouse_in = true;
});

document.addEventListener('mousedown', () => {
  mouse_down = true;
});

document.addEventListener('mouseup', () => {
  mouse_down = false;
});

setInterval(() => {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw the precincts
  for (let i = 0; i < mapSize[0]; i++) {
    for (let j = 0; j < mapSize[1]; j++) {
      ctx.fillStyle = partyColors[precincts[i][j]];
      ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
  // Draw the grid lines
  ctx.strokeStyle = 'black';
  for (let i = 0; i <= mapSize[0]; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, mapSize[1] * cellSize);
    ctx.stroke();
  }
  for (let j = 0; j <= mapSize[1]; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * cellSize);
    ctx.lineTo(mapSize[0] * cellSize, j * cellSize);
    ctx.stroke();
  }
    // Draw the hovered cell
  if (mouse_in) {
    const mouseX = Math.floor(mouse_over[0] / cellSize);
    const mouseY = Math.floor(mouse_over[1] / cellSize);
    ctx.strokeStyle = mouse_down ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, 1)';
    ctx.strokeRect(mouseX * cellSize, mouseY * cellSize, cellSize, cellSize);
  }
}, 1000 / 60);