// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let countdown;
let score = 0;
let timeRemaining = 30;
let possiblePoints = 0;

const gameContainer = document.getElementById("game-container");
const bucket = document.getElementById("bucket");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const startButton = document.getElementById("start-btn");
const endScreen = document.getElementById("end-screen");
const confetti = document.getElementById("confetti");
const finalMessage = document.getElementById("final-message");
const finalScoreDisplay = document.getElementById("final-score");
const possiblePointsDisplay = document.getElementById("possible-points");

// Wait for button click to start the game
startButton.addEventListener("click", () => {
  if (gameRunning) {
    resetGame();
    return;
  }

  startGame();
});
document.getElementById("return-btn").addEventListener("click", returnToMain);
document.getElementById("play-again-btn").addEventListener("click", startGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  score = 0;
  possiblePoints = 0;
  timeRemaining = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeRemaining;
  endScreen.hidden = true;
  gameRunning = true;
  startButton.textContent = "Reset";
  startButton.classList.add("reset");

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);
  countdown = setInterval(() => {
    timeRemaining -= 1;
    timeDisplay.textContent = timeRemaining;

    if (timeRemaining === 0) {
      endGame(true);
    }
  }, 1000);
  requestAnimationFrame(checkForCaughtDrops);
}

function endGame(showResults = false) {
  const roundWasRunning = gameRunning;
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(countdown);
  gameContainer.querySelectorAll(".water-drop").forEach((drop) => drop.remove());
  startButton.textContent = "Start Game";
  startButton.classList.remove("reset");

  if (showResults && roundWasRunning) showEndScreen();
}

function resetGame() {
  endGame(false);
  score = 0;
  possiblePoints = 0;
  timeRemaining = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeRemaining;
  endScreen.hidden = true;
}

function showEndScreen() {
  finalMessage.textContent = `Your total: ${score} point${Math.abs(score) === 1 ? "" : "s"}!`;
  finalScoreDisplay.textContent = score;
  possiblePointsDisplay.textContent = possiblePoints;
  confetti.replaceChildren();

  const confettiColors = ["#ffc907", "#2e9df7", "#4fcb53", "#ff902a", "#f16061"];
  for (let index = 0; index < 48; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.setProperty("--confetti-left", `${Math.random() * 100}%`);
    piece.style.setProperty("--confetti-drift", `${Math.random() * 160 - 80}px`);
    piece.style.setProperty("--confetti-delay", `${Math.random() * 2}s`);
    piece.style.setProperty("--confetti-duration", `${2.5 + Math.random() * 2}s`);
    piece.style.setProperty("--confetti-color", confettiColors[index % confettiColors.length]);
    confetti.appendChild(piece);
  }

  endScreen.hidden = false;
}

function returnToMain() {
  endScreen.hidden = true;
  score = 0;
  possiblePoints = 0;
  timeRemaining = 30;
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeRemaining;
}

function moveBucketTo(left) {
  const maxLeft = gameContainer.clientWidth - bucket.offsetWidth;
  bucket.style.left = `${Math.max(0, Math.min(left, maxLeft))}px`;
}

document.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(event.key)) return;

  event.preventDefault();
  const direction = ["ArrowLeft", "a", "A"].includes(event.key) ? -1 : 1;
  moveBucketTo(bucket.offsetLeft + direction * 24);
});

let draggingBucket = false;

gameContainer.addEventListener("pointerdown", (event) => {
  if (endScreen.contains(event.target)) return;

  draggingBucket = true;
  gameContainer.setPointerCapture(event.pointerId);
  moveBucketTo(event.clientX - gameContainer.getBoundingClientRect().left - bucket.offsetWidth / 2);
});

gameContainer.addEventListener("pointermove", (event) => {
  if (!draggingBucket) return;

  moveBucketTo(event.clientX - gameContainer.getBoundingClientRect().left - bucket.offsetWidth / 2);
});

gameContainer.addEventListener("pointerup", () => {
  draggingBucket = false;
});

function checkForCaughtDrops() {
  if (!gameRunning) return;

  const bucketBounds = bucket.getBoundingClientRect();
  document.querySelectorAll(".water-drop").forEach((drop) => {
    const dropBounds = drop.getBoundingClientRect();
    const overlaps = dropBounds.right > bucketBounds.left
      && dropBounds.left < bucketBounds.right
      && dropBounds.bottom > bucketBounds.top
      && dropBounds.top < bucketBounds.bottom;

    if (overlaps) {
      drop.remove();
      score += Number(drop.dataset.points);
      scoreDisplay.textContent = score;
    }
  });

  requestAnimationFrame(checkForCaughtDrops);
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  const isJerryCan = Math.random() < 0.2;
  drop.className = isJerryCan ? "water-drop jerry-can-drop" : "water-drop";
  drop.dataset.points = isJerryCan ? "10" : "1";
  drop.dataset.missPenalty = isJerryCan ? "5" : "1";
  possiblePoints += Number(drop.dataset.points);

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const xPosition = Math.random() * (gameContainer.clientWidth - size);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  gameContainer.appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove();
    if (!gameRunning) return;

    score -= Number(drop.dataset.missPenalty);
    scoreDisplay.textContent = score;
  });
}
