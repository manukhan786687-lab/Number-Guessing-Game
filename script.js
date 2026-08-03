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
const hintBtn = document.getElementById("hintBtn");
const shopBtn = document.getElementById("shopBtn");
const closeShop = document.getElementById("closeShop");

const shopOverlay = document.getElementById("shopOverlay");

highScoreText.textContent = "🏆 High Score: " + highScore;
coinsText.textContent = "🪙 Coins: " + coins;

guessBtn.addEventListener("click", checkGuess);
restartBtn.addEventListener("click", restartGame);
hintBtn.addEventListener("click", useHint);
shopBtn.addEventListener("click", openShop);
closeShop.addEventListener("click", closeShopMenu);

function random() {
    return Math.floor(Math.random() * maxNumber) + 1;
}

function checkGuess() {

    let guess = Number(input.value);

    if (guess < 1 || guess > maxNumber) {
        message.textContent =
        "❌ Enter a number between 1 and " + maxNumber;
        return;
    }

    clearInterval(timer);

    if (guess === randomNumber) {

        score += 10;
        coins += 10;

        scoreText.textContent = "⭐ Score: " + score;
        coinsText.textContent = "🪙 Coins: " + coins;

        if (score > highScore) {

            highScore = score;

            localStorage.setItem(
                "highScore",
                highScore
            );

            highScoreText.textContent =
            "🏆 High Score: " + highScore;
        }

        if (level === 5) {

            winner.style.display = "block";

            message.textContent =
            "🏆 You completed all levels!";

            guessBtn.disabled = true;

            return;
        }

        level++;
        maxNumber += 5;
        lives = 3;

        randomNumber = random();

        levelText.textContent =
        "Level: " + level;

        rangeText.textContent =
        "Guess Number (1 - " + maxNumber + ")";

        livesText.textContent =
        "❤️ Lives: " + lives;

        scoreText.textContent =
        "⭐ Score: " + score;

        message.textContent =
        "✅ Correct! Next Level";

        input.value = "";

        startTimer();

    } else {

        lives--;

        livesText.textContent =
        "❤️ Lives: " + lives;

        if (guess > randomNumber) {

            message.textContent =
            "📉 Too High";

        } else {

            message.textContent =
            "📈 Too Low";

        }

        input.value = "";

        if (lives <= 0) {

            message.textContent =
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

    levelText.textContent = "Level: 1";
    rangeText.textContent = "Guess Number (1 - 5)";
    livesText.textContent = "❤️ Lives: 3";
    scoreText.textContent = "⭐ Score: 0";
    coinsText.textContent = "🪙 Coins: 0";
    highScoreText.textContent =
    "🏆 High Score: " + highScore;

    message.textContent = "Good Luck!";

    winner.style.display = "none";

    guessBtn.disabled = false;

    input.value = "";

    startTimer();
}
function startTimer() {

    clearInterval(timer);

    timeLeft = 15;
    timerText.textContent = "⏳ Time Left: " + timeLeft;

    timer = setInterval(function () {

        timeLeft--;

        timerText.textContent = "⏳ Time Left: " + timeLeft;

        if (timeLeft <= 0) {

            clearInterval(timer);

            lives--;

            livesText.textContent =
            "❤️ Lives: " + lives;

            if (lives <= 0) {

                message.textContent =
                "💀 Game Over! Correct Number was " + randomNumber;

                guessBtn.disabled = true;

                return;
            }

            message.textContent =
            "⏰ Time Up! Try Again!";

            startTimer();
        }

    }, 1000);

}

function useHint() {

    if (coins < 10) {

        message.textContent =
        "❌ Not enough Coins!";

        return;
    }

    coins -= 10;

    coinsText.textContent =
    "🪙 Coins: " + coins;

    if (randomNumber % 2 === 0) {

        message.textContent =
        "💡 Hint: Number is EVEN";

    } else {

        message.textContent =
        "💡 Hint: Number is ODD";

    }

}

function openShop() {

    shopOverlay.style.display = "flex";

}

function closeShopMenu() {

    shopOverlay.style.display = "none";

}

startTimer();
