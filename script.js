let coins = 0;
let timeLeft = 15;
let timer;
let level = 1;
let maxNumber = 5;
let lives = 3;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

let randomNumber = random();

const levelText = document.getElementById("level");
const rangeText = document.getElementById("range");
const livesText = document.getElementById("lives");
const scoreText = document.getElementById("score");
const highScoreText = document.getElementById("highscore");
const input = document.getElementById("guessInput");
const message = document.getElementById("message");
const winner = document.getElementById("winner");
const timerText = document.getElementById("timer");
const coinsText = document.getElementById("coins");
highScoreText.innerHTML = "🏆 High Score: " + highScore;
startTimer();
document.getElementById("guessBtn").addEventListener("click", checkGuess);
document.getElementById("restartBtn").addEventListener("click", restartGame);

function random(){
    return Math.floor(Math.random() * maxNumber) + 1;
}

function checkGuess(){

    let guess = Number(input.value);

    if(guess < 1 || guess > maxNumber){
        message.innerHTML = "❌ Enter a number between 1 and " + maxNumber;
        return;
    }

    if(guess === randomNumber){

        score += 10;
        coins += 10;
coinsText.innerHTML = "🪙 Coins: " + coins;

clearInterval(timer);
        if(score > highScore){
            highScore = score;
            localStorage.setItem("highScore", highScore);
            highScoreText.innerHTML = "🏆 High Score: " + highScore;
        }

        if(level == 5){
            winner.style.display = "block";
            message.innerHTML = "🎉 You completed the game!";
            return;
        }

        level++;
        maxNumber += 5;
        lives = 3;

        randomNumber = random();

        levelText.innerHTML = "Level: " + level;
        rangeText.innerHTML = "Guess Number (1 - " + maxNumber + ")";
        livesText.innerHTML = "❤️ Lives: " + lives;
        scoreText.innerHTML = "⭐ Score: " + score;

        message.innerHTML = "✅ Correct! Next Level";
        startTimer();
    }else{

        lives--;

        if(guess > randomNumber){
            message.innerHTML = "📉 Too High";
        }else{
            message.innerHTML = "📈 Too Low";
        }

        livesText.innerHTML = "❤️ Lives: " + lives;

        if(lives == 0){
            message.innerHTML =
            "💀 Game Over! Correct Number was " + randomNumber;

            document.getElementById("guessBtn").disabled = true;
        }
    }

    input.value = "";
}

function restartGame(){

    level = 1;
    maxNumber = 5;
    lives = 3;
    score = 0;

    randomNumber = random();

    levelText.innerHTML = "Level: 1";
    rangeText.innerHTML = "Guess Number (1 - 5)";
    livesText.innerHTML = "❤️ Lives: 3";
    scoreText.innerHTML = "⭐ Score: 0";
    highScoreText.innerHTML = "🏆 High Score: " + highScore;

    message.innerHTML = "Good Luck!";
    winner.style.display = "none";

    document.getElementById("guessBtn").disabled = false;

    input.value = "";
    startTimer();
}
function startTimer(){

    clearInterval(timer);

    timeLeft = 15;

    timerText.innerHTML = "⏳ Time Left: " + timeLeft;

    timer = setInterval(function(){

        timeLeft--;

        timerText.innerHTML = "⏳ Time Left: " + timeLeft;

        if(timeLeft <= 0){

            clearInterval(timer);

            lives--;

            livesText.innerHTML = "❤️ Lives: " + lives;

            if(lives > 0){

                message.innerHTML = "⏰ Time Up! Try Again.";

                startTimer();

            }else{

                message.innerHTML =
                "💀 Game Over! Correct Number was " + randomNumber;

                document.getElementById("guessBtn").disabled = true;

            }

        }

    },1000);

}
