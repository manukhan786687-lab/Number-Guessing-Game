            /* =========================================================
   GALAXY GUESS - GAME LOGIC
   Beginner-friendly, well-commented, no frameworks.
   ========================================================= */

/* ---------------------------------------------------------
   1. CONFIGURATION
   --------------------------------------------------------- */
const CONFIG = {
  totalLevels: 5,          // total number of levels in the game
  rangeStep: 5,             // range grows by 5 each level (1-5, 1-10, 1-15...)
  startingLives: 3,         // lives the player starts with
  startingTime: 15,         // seconds per level
  correctScore: 10,         // score earned for a correct guess
  correctCoins: 10,         // coins earned for a correct guess
  hintCost: 10,              // coins needed to buy a hint
  shop: {
    life: { cost: 30 },
    time: { cost: 20, seconds: 10 },
    skip: { cost: 100 },
    shield: { cost: 75 },
  },
};

/* ---------------------------------------------------------
   2. GAME STATE
   --------------------------------------------------------- */
let state = {
  level: 1,
  lives: CONFIG.startingLives,
  score: 0,
  coins: 0,
  highScore: 0,
  secretNumber: 0,
  timeLeft: CONFIG.startingTime,
  shieldActive: false,
  hintUsedThisLevel: false,
  gameActive: true,
};

let timerInterval = null;   // holds the setInterval reference for the countdown
let audioCtx = null;         // Web Audio context (created on first interaction)

/* ---------------------------------------------------------
   3. DOM REFERENCES
   --------------------------------------------------------- */
const el = {
  levelValue: document.getElementById('levelValue'),
  livesBox: document.getElementById('livesBox'),
  scoreValue: document.getElementById('scoreValue'),
  coinValue: document.getElementById('coinValue'),
  coinBox: document.getElementById('coinBox'),
  highScoreValue: document.getElementById('highScoreValue'),

  rangeText: document.getElementById('rangeText'),
  timerBarFill: document.getElementById('timerBarFill'),
  timerText: document.getElementById('timerText'),

  guessInput: document.getElementById('guessInput'),
  guessBtn: document.getElementById('guessBtn'),
  feedbackText: document.getElementById('feedbackText'),
  hintText: document.getElementById('hintText'),

  hintBtn: document.getElementById('hintBtn'),
  shopBtn: document.getElementById('shopBtn'),
  restartBtn: document.getElementById('restartBtn'),
  gameCard: document.getElementById('gameCard'),

  shopOverlay: document.getElementById('shopOverlay'),
  closeShopBtn: document.getElementById('closeShopBtn'),
  shopCoinValue: document.getElementById('shopCoinValue'),

  gameOverOverlay: document.getElementById('gameOverOverlay'),
  finalScoreValue: document.getElementById('finalScoreValue'),
  finalCoinValue: document.getElementById('finalCoinValue'),
  finalHighScoreValue: document.getElementById('finalHighScoreValue'),
  gameOverRestartBtn: document.getElementById('gameOverRestartBtn'),

  winOverlay: document.getElementById('winOverlay'),
  winScoreValue: document.getElementById('winScoreValue'),
  winCoinValue: document.getElementById('winCoinValue'),
  winHighScoreValue: document.getElementById('winHighScoreValue'),
  winRestartBtn: document.getElementById('winRestartBtn'),

  starsContainer: document.getElementById('stars-container'),
  meteorContainer: document.getElementById('meteor-container'),
  confettiContainer: document.getElementById('confetti-container'),
  fxContainer: document.getElementById('fx-container'),
};

/* ---------------------------------------------------------
   4. LOCAL STORAGE (persistence)
   --------------------------------------------------------- */
function loadStorage() {
  const savedHigh = localStorage.getItem('galaxyGuess_highScore');
  const savedCoins = localStorage.getItem('galaxyGuess_coins');
  state.highScore = savedHigh ? parseInt(savedHigh, 10) : 0;
  state.coins = savedCoins ? parseInt(savedCoins, 10) : 0;
}

function saveHighScore() {
  localStorage.setItem('galaxyGuess_highScore', state.highScore);
}

function saveCoins() {
  localStorage.setItem('galaxyGuess_coins', state.coins);
}

/* ---------------------------------------------------------
   5. AUDIO (simple synthesized sound effects - no files needed)
   --------------------------------------------------------- */
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// Play a short beep. type = 'sine'|'square'|'triangle', freq in Hz, duration in seconds
function beep(freq, duration = 0.15, type = 'sine', volume = 0.15) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    /* Audio not available - fail silently */
  }
}

const sounds = {
  correct: () => { beep(660, 0.12, 'triangle'); setTimeout(() => beep(880, 0.15, 'triangle'), 100); },
  wrong: () => { beep(160, 0.25, 'sawtooth', 0.12); },
  coin: () => { beep(1000, 0.08, 'square', 0.08); },
  click: () => { beep(400, 0.05, 'sine', 0.06); },
  levelUp: () => {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.15, 'triangle'), i * 90));
  },
  win: () => {
    [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'triangle'), i * 120));
  },
  gameOver: () => {
    [400, 300, 200].forEach((f, i) => setTimeout(() => beep(f, 0.3, 'sawtooth', 0.1), i * 180));
  },
};

// Mobile vibration helper (silently ignored on unsupported devices)
function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

/* ---------------------------------------------------------
   6. SPACE BACKGROUND ANIMATIONS
   --------------------------------------------------------- */
function createStars(count = 70) {
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2.5 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;
    star.style.animationDuration = `${2 + Math.random() * 3}s, ${20 + Math.random() * 30}s`;
    star.style.animationDelay = `${Math.random() * 4}s, ${Math.random() * 10}s`;
    el.starsContainer.appendChild(star);
  }
}

function spawnMeteor() {
  const meteor = document.createElement('div');
  meteor.className = 'meteor';
  meteor.style.top = `${Math.random() * 30}vh`;
  meteor.style.left = `${50 + Math.random() * 40}vw`;
  el.meteorContainer.appendChild(meteor);
  setTimeout(() => meteor.remove(), 1500);
}

// Spawn a meteor every 4-9 seconds
function startMeteorLoop() {
  setInterval(spawnMeteor, 4000 + Math.random() * 5000);
}

/* ---------------------------------------------------------
   7. CORE GAME FUNCTIONS
   --------------------------------------------------------- */

// Returns the max number for the current level (1-5, 1-10, 1-15...)
function getRangeMax() {
  return state.level * CONFIG.rangeStep;
}

// Generates a new secret number for the current level
function generateSecretNumber() {
  const max = getRangeMax();
  state.secretNumber = Math.floor(Math.random() * max) + 1;
}

// Renders the hearts (lives) in the HUD
function renderLives() {
  el.livesBox.innerHTML = '';
  for (let i = 0; i < state.lives; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart-icon';
    heart.textContent = '❤️';
    el.livesBox.appendChild(heart);
  }
  if (state.shieldActive) {
    const shield = document.createElement('span');
    shield.className = 'heart-icon';
    shield.textContent = '🛡';
    el.livesBox.appendChild(shield);
  }
}

// Updates all HUD text values
function updateHUD() {
  el.levelValue.textContent = state.level;
  el.scoreValue.textContent = state.score;
  el.coinValue.textContent = state.coins;
  el.shopCoinValue.textContent = state.coins;
  el.highScoreValue.textContent = state.highScore;
  renderLives();
}

// Starts (or restarts) the level: new number, fresh timer, reset UI text
function startLevel() {
  generateSecretNumber();
  state.timeLeft = CONFIG.startingTime;
  state.hintUsedThisLevel = false;
  el.rangeText.textContent = `Guess a number between 1 and ${getRangeMax()}`;
  el.hintText.textContent = '';
  el.feedbackText.textContent = 'Enter a number and hit guess!';
  el.feedbackText.className = 'feedback';
  el.guessInput.value = '';
  updateTimerDisplay();
  restartTimer();
  updateHUD();
}

/* ---------- Timer logic ---------- */
function restartTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    state.timeLeft--;
    updateTimerDisplay();
    if (state.timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeUp();
    }
  }, 1000);
}

function updateTimerDisplay() {
  el.timerText.textContent = `${state.timeLeft}s`;
  const percent = Math.max(0, (state.timeLeft / CONFIG.startingTime) * 100);
  el.timerBarFill.style.width = `${percent}%`;
  el.timerBarFill.classList.toggle('low', state.timeLeft <= 5);
}

function handleTimeUp() {
  if (!state.gameActive) return;
  el.feedbackText.textContent = "⏳ Time's up!";
  el.feedbackText.className = 'feedback wrong';
  loseLife('time');
  if (state.gameActive) {
    // give the player a fresh timer to keep trying the same secret number
    state.timeLeft = CONFIG.startingTime;
    updateTimerDisplay();
    restartTimer();
  }
}

/* ---------- Guessing logic ---------- */
function handleGuess() {
  if (!state.gameActive) return;
  sounds.click();

  const value = parseInt(el.guessInput.value, 10);
  const max = getRangeMax();

  if (isNaN(value) || value < 1 || value > max) {
    el.feedbackText.textContent = `Please enter a number between 1 and ${max}`;
    el.feedbackText.className = 'feedback info';
    return;
  }

  if (value === state.secretNumber) {
    handleCorrectGuess();
  } else {
    const direction = value < state.secretNumber ? 'higher ⬆️' : 'lower ⬇️';
    el.feedbackText.textContent = `Wrong! Try ${direction}`;
    el.feedbackText.className = 'feedback wrong';
    el.gameCard.classList.remove('shake');
    void el.gameCard.offsetWidth; // restart animation trick
    el.gameCard.classList.add('shake');
    loseLife('wrong');
  }
}

function handleCorrectGuess() {
  clearInterval(timerInterval);
  sounds.correct();
  vibrate(40);

  state.score += CONFIG.correctScore;
  addCoins(CONFIG.correctCoins, el.guessBtn);

  el.feedbackText.textContent = '🎯 Correct! Well guessed, pilot!';
  el.feedbackText.className = 'feedback correct';
  el.gameCard.classList.remove('pulse-success');
  void el.gameCard.offsetWidth;
  el.gameCard.classList.add('pulse-success');

  if (state.score > state.highScore) {
    state.highScore = state.score;
    saveHighScore();
  }
  updateHUD();

  setTimeout(() => {
    if (state.level >= CONFIG.totalLevels) {
      winGame();
    } else {
      state.level++;
      flashLevelUp();
      sounds.levelUp();
      startLevel();
    }
  }, 900);
}

// Deduct a life (or consume shield instead). reason: 'wrong' | 'time'
function loseLife(reason) {
  if (state.shieldActive) {
    state.shieldActive = false;
    el.feedbackText.textContent = '🛡 Shield absorbed the damage!';
    el.feedbackText.className = 'feedback info';
    updateHUD();
    return;
  }

  state.lives--;
  sounds.wrong();
  vibrate([60, 40, 60]);
  flyHeart();
  updateHUD();

  if (state.lives <= 0) {
    triggerGameOver();
  }
}

/* ---------- Hint system ---------- */
function useHint() {
  if (!state.gameActive) return;
  if (state.hintUsedThisLevel) {
    el.hintText.textContent = 'You already used your hint this level!';
    return;
  }
  if (state.coins < CONFIG.hintCost) {
    el.feedbackText.textContent = 'Not enough coins for a hint!';
    el.feedbackText.className = 'feedback info';
    return;
  }
  state.coins -= CONFIG.hintCost;
  saveCoins();
  state.hintUsedThisLevel = true;
  sounds.click();

  const parity = state.secretNumber % 2 === 0 ? 'EVEN' : 'ODD';
  el.hintText.textContent = `💡 Hint: The number is ${parity}`;
  updateHUD();
}

/* ---------- Coins & FX ---------- */
function addCoins(amount, sourceEl) {
  state.coins += amount;
  saveCoins();
  sounds.coin();
  el.coinBox.classList.remove('bump');
  void el.coinBox.offsetWidth;
  el.coinBox.classList.add('bump');
  flyCoin(sourceEl);
}

function flyCoin(sourceEl) {
  if (!sourceEl) return;
  const startRect = sourceEl.getBoundingClientRect();
  const endRect = el.coinBox.getBoundingClientRect();
  const coin = document.createElement('div');
  coin.className = 'fx-coin';
  coin.textContent = '🪙';
  coin.style.left = `${startRect.left + startRect.width / 2}px`;
  coin.style.top = `${startRect.top}px`;
  coin.style.setProperty('--dx', `${endRect.left - startRect.left}px`);
  coin.style.setProperty('--dy', `${endRect.top - startRect.top}px`);
  el.fxContainer.appendChild(coin);
  setTimeout(() => coin.remove(), 700);
}

function flyHeart() {
  const rect = el.livesBox.getBoundingClientRect();
  const heart = document.createElement('div');
  heart.className = 'fx-heart';
  heart.textContent = '💔';
  heart.style.left = `${rect.left + rect.width / 2}px`;
  heart.style.top = `${rect.top}px`;
  el.fxContainer.appendChild(heart);
  setTimeout(() => heart.remove(), 1000);
}

function flashLevelUp() {
  const flash = document.createElement('div');
  flash.className = 'level-up-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 800);
}

/* ---------- Confetti (winner screen) ---------- */
function launchConfetti() {
  const colors = ['#00e5ff', '#b452ff', '#ff4fd8', '#ffd23f', '#34ffb0'];
  for (let i = 0; i < 90; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${2 + Math.random() * 2.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.confettiContainer.appendChild(piece);
    setTimeout(() => piece.remove(), 5200);
  }
}

/* ---------------------------------------------------------
   8. GAME OVER / WIN
   --------------------------------------------------------- */
function triggerGameOver() {
  state.gameActive = false;
  clearInterval(timerInterval);
  sounds.gameOver();
  vibrate([100, 60, 100, 60, 200]);

  el.finalScoreValue.textContent = state.score;
  el.finalCoinValue.textContent = state.coins;
  el.finalHighScoreValue.textContent = state.highScore;
  openModal(el.gameOverOverlay);
}

function winGame() {
  state.gameActive = false;
  clearInterval(timerInterval);
  sounds.win();
  vibrate([80, 40, 80, 40, 200]);

  el.winScoreValue.textContent = state.score;
  el.winCoinValue.textContent = state.coins;
  el.winHighScoreValue.textContent = state.highScore;
  el.guessBtn.disabled = true;
  openModal(el.winOverlay);
  launchConfetti();
}

/* ---------------------------------------------------------
   9. SHOP SYSTEM
   --------------------------------------------------------- */
function openModal(modalEl) {
  modalEl.classList.add('active');
}
function closeModal(modalEl) {
  modalEl.classList.remove('active');
}

function buyItem(itemType) {
  sounds.click();
  const shopConfig = CONFIG.shop[itemType];
  if (!shopConfig) return;

  if (state.coins < shopConfig.cost) {
    el.feedbackText.textContent = 'Not enough coins for that item!';
    el.feedbackText.className = 'feedback info';
    return;
  }

  switch (itemType) {
    case 'life':
      state.coins -= shopConfig.cost;
      state.lives += 1;
      break;

    case 'time':
      state.coins -= shopConfig.cost;
      state.timeLeft += shopConfig.seconds;
      updateTimerDisplay();
      break;

    case 'skip':
      // Only allow skipping if not already on the final level
      if (state.level >= CONFIG.totalLevels) {
        el.feedbackText.textContent = 'You are already on the final level!';
        el.feedbackText.className = 'feedback info';
        return;
      }
      state.coins -= shopConfig.cost;
      state.level++;
      flashLevelUp();
      sounds.levelUp();
      startLevel();
      break;

    case 'shield':
      if (state.shieldActive) {
        el.feedbackText.textContent = 'Shield already active!';
        el.feedbackText.className = 'feedback info';
        return;
      }
      state.coins -= shopConfig.cost;
      state.shieldActive = true;
      break;
  }

  saveCoins();
  updateHUD();
}

/* ---------------------------------------------------------
   10. RESTART
   --------------------------------------------------------- */
function restartGame() {
  sounds.click();
  clearInterval(timerInterval);

  // Reset everything EXCEPT high score
  state.level = 1;
  state.lives = CONFIG.startingLives;
  state.score = 0;
  state.coins = 0;
  state.shieldActive = false;
  state.hintUsedThisLevel = false;
  state.gameActive = true;
  saveCoins(); // persist the coin reset

  el.guessBtn.disabled = false;
  closeModal(el.gameOverOverlay);
  closeModal(el.winOverlay);
  closeModal(el.shopOverlay);

  startLevel();
}

/* ---------------------------------------------------------
   11. EVENT LISTENERS
   --------------------------------------------------------- */
el.guessBtn.addEventListener('click', handleGuess);
el.guessInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleGuess();
});

el.hintBtn.addEventListener('click', useHint);
el.restartBtn.addEventListener('click', restartGame);
el.gameOverRestartBtn.addEventListener('click', restartGame);
el.winRestartBtn.addEventListener('click', restartGame);

el.shopBtn.addEventListener('click', () => {
  sounds.click();
  updateHUD();
  openModal(el.shopOverlay);
});
el.closeShopBtn.addEventListener('click', () => closeModal(el.shopOverlay));
el.shopOverlay.addEventListener('click', (e) => {
  if (e.target === el.shopOverlay) closeModal(el.shopOverlay);
});

document.querySelectorAll('.btn-buy').forEach((btn) => {
  btn.addEventListener('click', () => buyItem(btn.dataset.item));
});

/* ---------------------------------------------------------
   12. INIT
   --------------------------------------------------------- */
function init() {
  loadStorage();
  createStars();
  startMeteorLoop();
  updateHUD();
  startLevel();
}

init();
      
