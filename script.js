const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const popup = document.getElementById("popup");
const popupImage = document.getElementById("popupImage");
const popupText = document.getElementById("popupText");
const restartBtn = document.getElementById("restartBtn");

// === Detect mobile ===
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// === Images ===
const birdImg = new Image();
birdImg.src = "icon.png";
const poleImg = new Image();
poleImg.src = "pole.png";
const loseImg = "lose.png";
const winImg = "win.png";

// === Sounds ===
const bgMusic = new Audio("song.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;
const loseSound = new Audio("lose.mp3");
const winSound = new Audio("win.mp3");

// === Game Variables ===
let bird, poles, score, gameOver, gameWon, frame, started;
let speed = 1.2; // balanced speed for both PC and mobile

// === Init Game ===
function initGame() {
  bird = {
    x: 60,
    y: canvas.height / 2,
    width: 34,
    height: 34,
    gravity: 0.27,
    lift: isMobile ? -5.8 : -7.0, // mobile softer jump
    velocity: 0,
  };
  poles = [];
  score = 0;
  gameOver = false;
  gameWon = false;
  frame = 0;
  popup.classList.add("hidden");
  started = true;

  // Generate poles
  let distance = 280;
  for (let i = 0; i < 25; i++) {
    let gap = i < 10 ? 180 : i < 20 ? 160 : 140; // easy to medium
    let top = Math.random() * 100 + 70;
    poles.push({
      x: distance,
      width: 50,
      top: top,
      bottom: canvas.height - top - gap,
    });
    distance += 250 - i * 2; // gradually closer
  }
  poles.push({ x: distance, finish: true }); // finish line

  stopAllAudio();
  bgMusic.currentTime = 0;
  try {
    bgMusic.play(); // Safe play for GitHub Pages
  } catch (err) {
    console.warn("Autoplay blocked until user interaction:", err);
  }

  gameLoop();
}

// === Jump ===
function jump() {
  if (!started) return;
  if (!gameOver && !gameWon) {
    bird.velocity = bird.lift;
  }
}

// === Restart ===
function restartGame() {
  popup.classList.add("hidden");
  stopAllAudio();
  try {
    bgMusic.play();
  } catch (err) {
    console.warn("Autoplay blocked until user interaction:", err);
  }
  initGame();
}

// === Stop All Sounds ===
function stopAllAudio() {
  [bgMusic, loseSound, winSound].forEach((s) => {
    s.pause();
    s.currentTime = 0;
  });
}

// === Draw Bird ===
function drawBird() {
  ctx.drawImage(birdImg, bird.x - bird.width / 2, bird.y - bird.height / 2, bird.width, bird.height);
}

// === Draw Poles ===
function drawPoles() {
  poles.forEach((p) => {
    if (p.finish) {
      ctx.fillStyle = "lime";
      ctx.fillRect(p.x, 0, 10, canvas.height);
      ctx.font = "20px Arial";
      ctx.fillText("FINISH", p.x - 25, 40);
    } else {
      ctx.drawImage(poleImg, p.x, 0, p.width, p.top);
      ctx.drawImage(poleImg, p.x, canvas.height - p.bottom, p.width, p.bottom);
    }
  });
}

// === Update Poles ===
function updatePoles() {
  poles.forEach((p) => {
    p.x -= speed;
    if (!p.finish && p.x + p.width < bird.x && !p.passed) {
      p.passed = true;
      score++;
    }
  });

  if (poles[25].x < bird.x) {
    gameWon = true;
    showPopup(true);
  }
}

// === Collision Detection ===
function checkCollision() {
  for (let p of poles) {
    if (p.finish) continue;
    if (
      bird.x + bird.width / 2 > p.x &&
      bird.x - bird.width / 2 < p.x + p.width &&
      (bird.y - bird.height / 2 < p.top ||
        bird.y + bird.height / 2 > canvas.height - p.bottom)
    ) {
      gameOver = true;
      showPopup(false);
      return;
    }
  }

  // hit top or bottom
  if (bird.y + bird.height / 2 > canvas.height || bird.y - bird.height / 2 < 0) {
    gameOver = true;
    showPopup(false);
  }
}

// === Show Popup ===
function showPopup(won) {
  stopAllAudio();
  popup.classList.remove("hidden");

  if (won) {
    popupImage.src = winImg;
    popupText.textContent = "Abe Tu Jeet Kise Gya";
    winSound.play();
  } else {
    popupImage.src = loseImg;
    popupText.textContent = "You lost my friend, Try Again";
    loseSound.play();
  }
}

// === Game Loop ===
function gameLoop() {
  if (gameOver || gameWon) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  drawBird();
  drawPoles();
  updatePoles();
  checkCollision();

  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  frame++;
  requestAnimationFrame(gameLoop);
}

// === Event Listeners ===
startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  initGame();
});

restartBtn.addEventListener("click", restartGame);
document.addEventListener("keydown", jump);
canvas.addEventListener("touchstart", jump);
canvas.addEventListener("mousedown", jump);





