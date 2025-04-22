import './style.css';

const mapSize: [number, number] = [7, 7];
const cellSize: number = 20;

var drawing_color: number = 0;

var mouse_over: [number, number] = [0, 0];
var mouse_in: boolean = false;
var mouse_down: boolean = false;

var precincts: number[][] = [];

for (let i = 0; i < mapSize[0]; i++) {
  precincts[i] = [];
  for (let j = 0; j < mapSize[1]; j++) {
    precincts[i][j] = 0;
  }
}

const partyColors: string[] = [
  'rgba(0, 0, 0, 0)', // Unset
  'rgba(255, 255, 0, 1)',
  'rgba(255, 0, 255, 1)',
]

// <h1>Gerrymander</h1>
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <canvas id="c" width="${mapSize[0] * cellSize}" height="${mapSize[1] * cellSize}"></canvas>
    <div id="toolbar">
      <button id="browser">Back</button>
      <button id="reset">Reset</button>
      <button id="save">Save</button>
      <button id="load">Load</button>
      <button id="pyellow">Draw Yellow</button>
      <button id="pblue">Draw Purple</button>
      <button id="run">Start Puzzle</button>
    </div>
  </div>
`;

document.querySelector<HTMLButtonElement>('#browser')!.addEventListener('click', () => {
  window.location.href = '/';
});

document.querySelector<HTMLButtonElement>('#reset')!.addEventListener('click', () => {
  for (let i = 0; i < mapSize[0]; i++) {
    for (let j = 0; j < mapSize[1]; j++) {
      precincts[i][j] = 0;
    }
  }
});
document.querySelector<HTMLButtonElement>('#save')!.addEventListener('click', () => {
  const data = JSON.stringify(precincts);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'precincts.json';
  a.click();
  URL.revokeObjectURL(url);
});
document.querySelector<HTMLButtonElement>('#load')!.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files![0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target!.result as string);
      for (let i = 0; i < mapSize[0]; i++) {
        for (let j = 0; j < mapSize[1]; j++) {
          precincts[i][j] = data[i][j];
        }
      }
    };
    reader.readAsText(file);
  });
  input.click();
});
document.querySelector<HTMLButtonElement>('#pyellow')!.addEventListener('click', () => {
  drawing_color = 1;
});
document.querySelector<HTMLButtonElement>('#pblue')!.addEventListener('click', () => {
  drawing_color = 2;
});
document.querySelector<HTMLButtonElement>('#run')!.addEventListener('click', () => {
  // Switch to /puzzle with the precincts passed as a query parameter
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
  if (mouse_in && mouse_down) {
    const mouseX = Math.floor(mouse_over[0] / cellSize);
    const mouseY = Math.floor(mouse_over[1] / cellSize);
    if (mouseX >= 0 && mouseX < mapSize[0] && mouseY >= 0 && mouseY < mapSize[1]) {
      precincts[mouseX][mouseY] = drawing_color;
    }
  }

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
