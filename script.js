let level = 1;
let maxNumber = 5;
let lives = 3;
let score = 0;
let coins = 0;
let timeLeft = 15;
let timer;

let highScore = Number(localStorage.getItem("highScore")) || 0;
let randomNumber = random();

const levelText = document.getElementById("level");
const rangeText = document.getElementById("range");
const livesText = document.getElementById("lives");
const scoreText = document.getElementById("score");
const coinsText = document.getElementById("coins");
const highScoreText = document.getElementById("highscore");
const timerText = document.getElementById("timer");
const input = document.getElementById("guessInput");
const message = document.getElementById("message");
const winner = document.getElementById("winner");

const guessBtn = document.getElementById("guessBtn");
const restartBtn = document.getElementById("restartBtn");

highScoreText.innerHTML = "🏆 High Score: " + highScore;
coinsText.innerHTML = "🪙 Coins: " + coins;

guessBtn.addEventListener("click", checkGuess);
restartBtn.addEventListener("click", restartGame);

function random() {
    return Math.floor(Math.random() * maxNumber) + 1;
}

function checkGuess() {

    let guess = Number(input.value);

    if (guess < 1 || guess > maxNumber) {
        message.innerHTML = "❌ Enter a number between 1 and " + maxNumber;
        return;
    }

    clearInterval(timer);

    if (guess === randomNumber) {

        score += 10;
        coins += 10;

        scoreText.innerHTML = "⭐ Score: " + score;
        coinsText.innerHTML = "🪙 Coins: " + coins;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore);
            highScoreText.innerHTML = "🏆 High Score: " + highScore;
        }

        if (level === 5) {
            winner.style.display = "block";
            message.innerHTML = "🏆 You completed all levels!";
            guessBtn.disabled = true;
            return;
        }

        level++;
        maxNumber += 5;
        lives = 3;

        randomNumber = random();

        levelText.innerHTML = "Level: " + level;
        rangeText.innerHTML = "Guess Number (1 - " + maxNumber + ")";
        livesText.innerHTML = "❤️ Lives: " + lives;

        message.innerHTML = "✅ Correct! Next Level";

        input.value = "";

        startTimer();

    } else {

        lives--;

        livesText.innerHTML = "❤️ Lives: " + lives;

        if (guess > randomNumber) {
            message.innerHTML = "📉 Too High";
        } else {
            message.innerHTML = "📈 Too Low";
        }

        input.value = "";

        if (lives <= 0) {
            message.innerHTML =
                "💀 Game Over! Correct Number was " + randomNumber;
            guessBtn.disabled = true;
            return;
        }

        startTimer();
    }
}          
function restartGame() {

    clearInterval(timer);

    level = 1;
    maxNumber = 5;
    lives = 3;
    score = 0;
    coins = 0;
    timeLeft = 15;

    randomNumber = random();

    levelText.innerHTML = "Level: 1";
    rangeText.innerHTML = "Guess Number (1 - 5)";
    livesText.innerHTML = "❤️ Lives: 3";
    scoreText.innerHTML = "⭐ Score: 0";
    coinsText.innerHTML = "🪙 Coins: 0";
    highScoreText.innerHTML = "🏆 High Score: " + highScore;

    message.innerHTML = "Good Luck!";
    winner.style.display = "none";

    guessBtn.disabled = false;

    input.value = "";

    startTimer();
}

function startTimer() {

    clearInterval(timer);

    timeLeft = 15;
    timerText.innerHTML = "⏳ Time Left: " + timeLeft;

    timer = setInterval(function () {

        timeLeft--;

        timerText.innerHTML = "⏳ Time Left: " + timeLeft;

        if (timeLeft <= 0) {

            clearInterval(timer);

            lives--;
            livesText.innerHTML = "❤️ Lives: " + lives;

            if (lives <= 0) {

                message.innerHTML =
                    "💀 Game Over! Correct Number was " + randomNumber;

                guessBtn.disabled = true;
                return;
            }

            message.innerHTML = "⏰ Time Up! Try Again!";
            startTimer();
        }

    }, 1000);
}

startTimer();
