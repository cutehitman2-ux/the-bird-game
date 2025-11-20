const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game variables
let bird = { x: 50, y: canvas.height / 2, width: 15, height: 15, gravity: 0.5, lift: -5, velocity: 0 };
let pipes = [];
let score = 0;
let gameOver = false;

// Load images
const birdImg = new Image();
birdImg.src = "bird.png";

const pipeImg = new Image();
pipeImg.src = "pipe.png";

// Draw the bird
function drawBird() {
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

// Draw pipes
function drawPipes() {
    pipes.forEach(pipe => {
        // Top pipe
        ctx.drawImage(pipeImg, pipe.x, pipe.y, 50, 300);
        // Bottom pipe
        ctx.drawImage(pipeImg, pipe.x, pipe.y + 400, 50, 300);
    });
}

// Update bird position
function updateBird() {
    bird.velocity += bird.gravity; // Apply gravity
    bird.y += bird.velocity; // Update bird's vertical position

    // Prevent bird from going out of bounds
    if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
        gameOver = true;
    }
}

// Update pipes
function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= 2; // Move pipes to the left

        // Check for collision with the bird
        if (
            bird.x < pipe.x + 50 &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.y + 300 || bird.y + bird.height > pipe.y + 400)
        ) {
            gameOver = true;
        }

        // Increment score when the bird passes a pipe
        if (pipe.x + 50 === bird.x) {
            score++;
        }
    });

    // Remove pipes that are off-screen
    pipes = pipes.filter(pipe => pipe.x > -50);

    // Add new pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        const pipeY = Math.random() * -150; // Randomize pipe height
        pipes.push({ x: canvas.width, y: pipeY });
    }
}

// Draw score
function drawScore() {
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 20);
}

// Game loop
function gameLoop() {
    if (gameOver) {
        alert(`Wapas khel BKL: ${score}`);
        document.location.reload(); // Reload the game
        return;
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawBird();
    drawPipes();
    drawScore();

    // Update game elements
    updateBird();
    updatePipes();

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

// Control the bird
document.addEventListener("keydown", () => {
    bird.velocity = bird.lift; // Make the bird jump
});

// Start the game
gameLoop();