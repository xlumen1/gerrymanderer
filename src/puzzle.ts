import './style.css';

const mapSize: [number, number] = [7, 7];
const cellSize: number = 20;

var drawing_district: number = 1;

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

const districtColors: string[] = [
  'rgba(0, 0, 0, 0)', // Unset
  'rgba(255, 0, 0, 1)',
  'rgba(0, 255, 0, 1)',
  'rgba(0, 0, 255, 1)',
  'rgba(255, 255, 0, 1)',
  'rgba(255, 0, 255, 1)',
  'rgba(0, 255, 255, 1)',
  'rgba(255, 255, 255, 1)',
]

const inverses: string[] = [
    'rgba(0, 0, 0, 0)', // Unset
    'rgba(0, 255, 255, 1)',
    'rgba(255, 0, 255, 1)',
    'rgba(255, 255, 0, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(0, 255, 0, 1)',
    'rgba(255, 0, 0, 1)',
    'rgba(0, 0, 0, 1)',
]

// <h1>Gerrymander</h1>
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <canvas id="c" width="${mapSize[0] * cellSize}" height="${mapSize[1] * cellSize}"></canvas>
    <div id="toolbar">
      <button id="exit">Exit</button>
      <button id="reset">Reset</button>
      <button id="submit">Submit</button>
      <button id="erase">Erase</button>
        <div class="districs">
          <button id="d0">District 0</button>
          <button id="d1">District 1</button>
          <button id="d2">District 2</button>
          <button id="d3">District 3</button>
          <button id="d4">District 4</button>
          <button id="d5">District 5</button>
          <button id="d6">District 6</button>
        </div>
    </div>
  </div>
`;

// Set the colors of the district buttons
for (let i = 0; i < 7; i++) {
    const button = document.querySelector<HTMLButtonElement>(`#d${i}`)!;
    button.style.backgroundColor = districtColors[i + 1];
    button.style.color = inverses[i + 1];
}

document.querySelector<HTMLButtonElement>('#exit')!.addEventListener('click', () => {
  window.location.href = "/browser.html";
});

document.querySelector<HTMLButtonElement>('#reset')!.addEventListener('click', () => {
  for (let i = 0; i < mapSize[0]; i++) {
    for (let j = 0; j < mapSize[1]; j++) {
      districts[i][j] = 0;
    }
  }
});

document.querySelector<HTMLButtonElement>('#submit')!.addEventListener('click', () => {
    let dists = Array(8).fill(0);
    for (let i = 0; i < mapSize[0]; i++) {
        for (let j = 0; j < mapSize[1]; j++) {
            if (districts[i][j] == 0) {
                alert("No cells can be empty.");
                return;
            }
            dists[districts[i][j]] += precincts[i][j] == 2 ? 1 : 0;
        }
    }
    let winning: number = 0;
    for (let i = 1; i < 8; i++) {
        if (dists[i] >= 4) {
            winning++;
        }
    }
    if (winning >= 4) {
        alert("Puzzle solved!");
    } else {
        alert("Failed.");
    }
});
document.querySelector<HTMLButtonElement>('#erase')!.addEventListener('click', () => {
    drawing_district = 0;
});

document.querySelector<HTMLButtonElement>('#d0')!.addEventListener('click', () => {
    drawing_district = 1;
});

document.querySelector<HTMLButtonElement>('#d1')!.addEventListener('click', () => {
    drawing_district = 2;
});
document.querySelector<HTMLButtonElement>('#d2')!.addEventListener('click', () => {
    drawing_district = 3;
});
document.querySelector<HTMLButtonElement>('#d3')!.addEventListener('click', () => {
    drawing_district = 4;
});
document.querySelector<HTMLButtonElement>('#d4')!.addEventListener('click', () => {
    drawing_district = 5;
});
document.querySelector<HTMLButtonElement>('#d5')!.addEventListener('click', () => {
    drawing_district = 6;
});
document.querySelector<HTMLButtonElement>('#d6')!.addEventListener('click', () => {
    drawing_district = 7;
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
    const districtCounts = new Array(8).fill(0);
    for (let i = 0; i < mapSize[0]; i++) {
        for (let j = 0; j < mapSize[1]; j++) {
            districtCounts[districts[i][j]]++;
        }
    }
    for (let i = 0; i < 7; i++) {
        const button = document.querySelector<HTMLButtonElement>(`#d${i}`)!;
        button.innerText = `District ${i} (${districtCounts[i + 1]})`;
    }
    const mouseX = Math.floor(mouse_over[0] / cellSize);
    const mouseY = Math.floor(mouse_over[1] / cellSize);
    if (mouse_in && mouse_down && (districtCounts[drawing_district] < 7 || drawing_district == 0) && (districtCounts[drawing_district] == 0 || adjacentDraw(mouseX, mouseY, drawing_district))) {
        if (mouseX >= 0 && mouseX < mapSize[0] && mouseY >= 0 && mouseY < mapSize[1]) {
            districts[mouseX][mouseY] = drawing_district;
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

  // Draw district dots
    for (let i = 0; i < mapSize[0]; i++) {
        for (let j = 0; j < mapSize[1]; j++) {
            ctx.fillStyle = districtColors[districts[i][j]];
            ctx.strokeStyle = "black"
            // Draw a circle in the center with a radius of cellsize/2
            ctx.beginPath();
            ctx.arc(
                i * cellSize + cellSize / 2,
                j * cellSize + cellSize / 2,
                cellSize / 4,
                0,
                2 * Math.PI
            );
            ctx.fill();
            if (districts[i][j] > 0)
                ctx.stroke();
        }
    }
}, 1000 / 60);

function adjacentDraw(x: number, y: number, dist: number) {
    if (dist == 0) {
        return true;
    }
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < mapSize[0] && ny >= 0 && ny < mapSize[1]) {
            if (districts[nx][ny] === dist) {
                return true;
            }
        }
    }
    return false;
}