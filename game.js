const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ------------------------------
// LOAD IMAGES
// ------------------------------
const birdImg = new Image();
birdImg.src = "bird.png";   // your bird

const pipeImg = new Image();
pipeImg.src = "pipe.png";   // your pipe image

const bgImg = new Image();
bgImg.src = "background.png";  // optional background

let bgX = 0; // background movement

// ------------------------------
// LOAD AUDIO
// ------------------------------
const bgMusic = new Audio("audio.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.9;

const coinSound = new Audio();
coinSound.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="; // very short beep placeholder
coinSound.volume = 0.10;

// ------------------------------
// BIRD PROPERTIES
// ------------------------------
let bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    gravity: 0.5,
    lift: -7,
    velocity: 0,
    angle: 0
};

// ------------------------------
// GAME VARIABLES
// ------------------------------
let pipes = [];
let coins = [];
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

let gameOver = false;
let gameStarted = false;
let paused = false;

let pipeSpeed = 2;
let pipeGap = 150;

// ------------------------------
// COUNTDOWN
// ------------------------------
let countdown = 3;
function startCountdown() {
    let timer = setInterval(() => {
        countdown--;
        if (countdown === 0) {
            clearInterval(timer);
            gameStarted = true;
            bgMusic.play(); // Start music after countdown
        }
    }, 1000);
}
startCountdown();

// ------------------------------
// DRAW ROTATING BIRD
// ------------------------------
function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.angle * Math.PI / 180);
    ctx.drawImage(birdImg, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
    ctx.restore();
}

// ------------------------------
// DRAW MOVING BACKGROUND
// ------------------------------
function drawBackground() {
    bgX -= 0.5;
    if (bgX <= -canvas.width) bgX = 0;

    if (!bgImg.complete) {
        ctx.fillStyle = "#70c5ce";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }

    ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);
}

// ------------------------------
// ADD PIPES + COIN
// ------------------------------
function addPipe() {
    let offset = Math.floor(Math.random() * 180) - 120;
    let pipe = { x: canvas.width, y: offset };
    pipes.push(pipe);

    coins.push({
        x: canvas.width + 60,
        y: pipe.y + 300 + pipeGap / 2,
        radius: 12,
        angle: 0,
        collected: false
    });
}

// ------------------------------
// DRAW PIPES
// ------------------------------
function drawPipes() {
    pipes.forEach(pipe => {
        ctx.drawImage(pipeImg, pipe.x, pipe.y, 50, 300);
        ctx.drawImage(pipeImg, pipe.x, pipe.y + 300 + pipeGap, 50, 300);
    });
}

// ------------------------------
// DRAW COINS
// ------------------------------
function drawCoins() {
    ctx.fillStyle = "yellow";
    coins.forEach(c => {
        c.angle += 0.1;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.radius * Math.abs(Math.sin(c.angle)), c.radius, 0, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// ------------------------------
// UPDATE BIRD
// ------------------------------
function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.velocity < 0) bird.angle = -20;
    else {
        bird.angle += 2;
        if (bird.angle > 60) bird.angle = 60;
    }

    if (bird.y <= 0 || bird.y + bird.height >= canvas.height) {
        gameOver = true;
    }
}

// ------------------------------
// UPDATE PIPES + COINS + DIFFICULTY
// ------------------------------
function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;

        // Collision with bird
        if (bird.x < pipe.x + 50 &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.y + 300 ||
             bird.y + bird.height > pipe.y + 300 + pipeGap)) {
            gameOver = true;
        }

        if (pipe.x + 50 === bird.x) {
            score++;
            if (score % 5 === 0) {
                pipeSpeed += 0.3;
                if (pipeGap > 100) pipeGap -= 5;
            }
        }
    });

    // Coin collection
    coins.forEach(coin => {
        coin.x -= pipeSpeed;

        if (!coin.collected &&
            bird.x < coin.x + coin.radius &&
            bird.x + bird.width > coin.x - coin.radius &&
            bird.y < coin.y + coin.radius &&
            bird.y + bird.height > coin.y - coin.radius) {
            score += 5; // bonus
            coin.collected = true;
            coinSound.currentTime = 0;
            coinSound.play();
        }
    });

    coins = coins.filter(c => !c.collected && c.x > -20);
    pipes = pipes.filter(pipe => pipe.x > -60);

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 220) {
        addPipe();
    }
}

// ------------------------------
// SCORE
// ------------------------------
function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Best: ${bestScore}`, 10, 50);
}

// ------------------------------
// COUNTDOWN
// ------------------------------
function drawCountdown() {
    if (!gameStarted) {
        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.fillText(countdown, canvas.width / 2 - 10, canvas.height / 2);
    }
}

// ------------------------------
// CONTROLS
// ------------------------------
document.addEventListener("keydown", (e) => {
    if (e.key === "p") {
        paused = !paused;
        if (paused) bgMusic.pause();
        else if (gameStarted && !gameOver) bgMusic.play();
    }
    if (e.key === " ") {
        bird.velocity = bird.lift;
        bird.angle = -20;
    }
});

// ------------------------------
// GAME OVER SCREEN
// ------------------------------
function drawGameOverScreen() {
    bgMusic.pause();
    bgMusic.currentTime = 0;

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2 - 30);
    ctx.fillText(`Score: ${score}`, canvas.width / 2 - 50, canvas.height / 2 + 10);

    ctx.fillStyle = "#00ff00";
    ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 50, 120, 40);

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("RESTART", canvas.width / 2 - 45, canvas.height / 2 + 78);

    canvas.addEventListener("click", (e) => {
        const x = e.offsetX, y = e.offsetY;
        if (x > canvas.width / 2 - 60 &&
            x < canvas.width / 2 + 60 &&
            y > canvas.height / 2 + 50 &&
            y < canvas.height / 2 + 90) {
            document.location.reload();
        }
    });
}

// ------------------------------
// MAIN GAME LOOP
// ------------------------------
function gameLoop() {
    if (!paused) {
        drawBackground();
        drawBird();
        drawPipes();
        drawCoins();
        drawScore();
        drawCountdown();

        if (gameStarted && !gameOver) {
            updateBird();
            updatePipes();
        }

        if (gameOver) {
            if (score > bestScore) {
                localStorage.setItem("bestScore", score);
            }
            drawGameOverScreen();
            return;
        }
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();
