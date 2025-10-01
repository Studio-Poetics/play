/*******************************************************
 * Word Sprint (Anagram Challenge)
 * 
 * - Accepts any valid anagram of the chosen word,
 *   as long as it's in the dictionary.
 * - Difficulty ramps from short words (3-4 letters),
 *   medium (5-6), hard (7-8), to insane (9+).
 * - Timer starts at 15s, drops to 10s after 10 correct words.
 * - Shows correct answer if guess is wrong or time runs out.
 *******************************************************/

/* ------------ DOM Selectors ------------ */
const scrambledLetters = document.getElementById("scrambledLetters");
const answerInput      = document.getElementById("answerInput");
const timerDisplay     = document.getElementById("timer");
const scoreDisplay     = document.getElementById("score");
const streakDisplay    = document.getElementById("streak");
const startBtn         = document.getElementById("startBtn");
const retryBtn         = document.getElementById("retryBtn");
const submitBtn        = document.getElementById("submitBtn");
const soundToggle      = document.getElementById("soundToggle");
const correctAnswerDiv = document.getElementById("correctAnswer");

/* ------------ Word Buckets ------------ */
let wordsEasy3_4    = [];
let wordsMed5_6     = [];
let wordsHard7_8    = [];
let wordsInsane9Up  = [];

/* ------------ Master Dictionary Set ------------ */
let dictionarySet = new Set(); // Will store all valid words for membership checks

/* ------------ Game Variables ------------ */
let currentWord      = "";
let timer            = null;
let timeRemaining    = 15; // Start with 15s
let baseTime         = 15; // Switches to 10 after 10 correct solutions
let score            = 0;
let streak           = 0;
let isGameActive     = false;
let solvedWordsCount = 0; // How many words the player solved correctly so far
let isSoundMuted = false; // Sound toggle state

/* ------------ Sound Effects ------------ */
function playSound(frequency, duration, type = 'sine') {
  if (isSoundMuted) return; // Don't play if muted

  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.log('Audio not supported or blocked');
  }
}

function playCorrectSound() {
  // Happy ascending sound
  setTimeout(() => playSound(523, 0.2), 0);   // C5
  setTimeout(() => playSound(659, 0.2), 100); // E5
  setTimeout(() => playSound(784, 0.3), 200); // G5
}

function playWrongSound() {
  // Sad descending sound
  setTimeout(() => playSound(400, 0.3, 'sawtooth'), 0);
  setTimeout(() => playSound(300, 0.3, 'sawtooth'), 150);
}

function playTickSound() {
  // Clock tick for timer
  playSound(800, 0.1, 'square');
}

function playStartSound() {
  // Game start sound
  setTimeout(() => playSound(440, 0.2), 0);
  setTimeout(() => playSound(554, 0.2), 100);
  setTimeout(() => playSound(659, 0.3), 200);
}

/* ------------ Sound Toggle Function ------------ */
function toggleSound() {
  isSoundMuted = !isSoundMuted;
  soundToggle.textContent = isSoundMuted ? '🔇' : '🔊';
  soundToggle.classList.toggle('muted', isSoundMuted);

  // Save preference to localStorage
  localStorage.setItem('wordSprintMuted', isSoundMuted);

  // Play a test sound when unmuting
  if (!isSoundMuted) {
    playSound(440, 0.2);
  }
}

/**
 * Load the dictionary, segment by difficulty, and build a Set for membership checks.
 */
async function loadWords() {
  try {
    // Adjust path/filename as needed
    const response = await fetch("words_filtered.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json(); // array of words (3-9 letters or whichever you have)

    // Store all words in a Set for quick membership checks
    dictionarySet = new Set(data);

    // Sort words into difficulty buckets by length
    data.forEach(word => {
      const w = word.trim().toLowerCase();
      const len = w.length;
      if (len >= 3 && len <= 4) {
        wordsEasy3_4.push(w);
      } else if (len <= 6) {
        wordsMed5_6.push(w);
      } else if (len <= 8) {
        wordsHard7_8.push(w);
      } else {
        wordsInsane9Up.push(w);
      }
    });

    console.log("Easy (3-4):", wordsEasy3_4.length);
    console.log("Medium (5-6):", wordsMed5_6.length);
    console.log("Hard (7-8):", wordsHard7_8.length);
    console.log("Insane (9+):", wordsInsane9Up.length);

    // Enable the Start button once dictionary is loaded
    startBtn.disabled = false;
  } catch (error) {
    console.error("Failed to load words:", error);
  }
}

/**
 * Pick a new word from the correct difficulty bucket based on solvedWordsCount
 */
function pickNewWord() {
  // Difficulty progression example:
  //   0-4   => Easy3_4
  //   5-9   => Med5_6
  //   10-14 => Hard7_8
  //   15+   => Insane9Up
  let bucket = [];
  if (solvedWordsCount < 5) {
    bucket = wordsEasy3_4;
  } else if (solvedWordsCount < 10) {
    bucket = wordsMed5_6;
  } else if (solvedWordsCount < 15) {
    bucket = wordsHard7_8;
  } else {
    bucket = wordsInsane9Up;
  }

  // Fallback if bucket is empty (unlikely if you have many words)
  if (bucket.length === 0) {
    const allBuckets = [wordsEasy3_4, wordsMed5_6, wordsHard7_8, wordsInsane9Up];
    const nonEmpty = allBuckets.filter(b => b.length > 0);
    bucket = nonEmpty[Math.floor(Math.random() * nonEmpty.length)];
  }

  const randomIndex = Math.floor(Math.random() * bucket.length);
  currentWord = bucket[randomIndex];
}

/**
 * Shuffle the letters of the puzzle word
 */
function shuffleWord(word) {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

/**
 * Display scrambled word
 */
function displayScrambledWord() {
  let scrambled = shuffleWord(currentWord);
  // If accidentally the same as original, reshuffle
  while (scrambled === currentWord) {
    scrambled = shuffleWord(currentWord);
  }
  scrambledLetters.textContent = scrambled.split("").join(" ");
}

/**
 * Start the game
 */
function startGame() {
  // Ensure we have words loaded
  if (
    wordsEasy3_4.length === 0 &&
    wordsMed5_6.length === 0 &&
    wordsHard7_8.length === 0 &&
    wordsInsane9Up.length === 0
  ) {
    alert("Word list not loaded yet!");
    return;
  }

  // Reset game variables
  score            = 0;
  streak           = 0;
  solvedWordsCount = 0;
  baseTime         = 15;
  timeRemaining    = baseTime;
  isGameActive     = true;

  updateScoreDisplay();
  timerDisplay.textContent = `Time: ${timeRemaining}`;

  startBtn.classList.add("hidden");
  retryBtn.classList.add("hidden");
  submitBtn.classList.remove("hidden");
  correctAnswerDiv.classList.add("hidden");

  playStartSound();

  pickNewWord();
  displayScrambledWord();

  answerInput.value = "";
  answerInput.focus();

  if (timer) clearInterval(timer);
  timer = setInterval(countdown, 1000);
}

/**
 * Timer countdown
 */
function countdown() {
  // Guard against multiple timers or inactive game
  if (!isGameActive || timer === null) {
    return;
  }

  timeRemaining--;
  timerDisplay.textContent = `Time: ${timeRemaining}`;

  // Play tick sound for last 5 seconds
  if (timeRemaining <= 5 && timeRemaining > 0) {
    playTickSound();
  }

  if (timeRemaining <= 0) {
    failRound("Time's up!");
  }
}

/**
 * Show correct answer, reset streak, move to next word
 */
function failRound(reason) {
  // Prevent multiple calls to failRound
  if (!isGameActive || timer === null) {
    return;
  }

  clearInterval(timer);
  timer = null;

  playWrongSound();

  correctAnswerDiv.textContent = `Correct word was: ${currentWord}`;
  correctAnswerDiv.classList.remove("hidden");

  streak = 0;
  updateScoreDisplay();

  // After short delay, continue
  setTimeout(() => {
    if (isGameActive) {
      nextRound();
    }
  }, 2000);
}

/**
 * Move to the next round (pick new puzzle word, reset time, etc.)
 */
function nextRound() {
  // Clear any existing timer first to prevent multiple intervals
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  correctAnswerDiv.classList.add("hidden");
  pickNewWord();
  displayScrambledWord();

  if (solvedWordsCount >= 10) {
    baseTime = 10; // reduce time after 10 correct solves
  }
  timeRemaining = baseTime;
  timerDisplay.textContent = `Time: ${timeRemaining}`;

  answerInput.value = "";
  answerInput.focus();

  timer = setInterval(countdown, 1000);
}

/**
 * Check if userGuess is a valid anagram of the puzzle word
 * and is in the dictionary
 */
function checkAnswer() {
  if (!isGameActive) return;

  const userGuess = answerInput.value.trim().toLowerCase();

  if (isValidAnagram(userGuess, currentWord) && dictionarySet.has(userGuess)) {
    // Correct guess
    clearInterval(timer);
    timer = null;

    playCorrectSound();

    score++;
    streak++;
    solvedWordsCount++;
    updateScoreDisplay();

    if (solvedWordsCount >= 10) {
      baseTime = 10; // reduce base time after 10 correct words
    }

    nextRound();
  } else {
    // Incorrect => show correct, then next
    failRound("Incorrect guess");
  }
}

/**
 * Helper function: checks if guess is an anagram of target
 * by comparing sorted letters
 */
function isValidAnagram(guess, target) {
  if (guess.length !== target.length) return false;
  const sortA = guess.split("").sort().join("");
  const sortB = target.split("").sort().join("");
  return sortA === sortB;
}

/**
 * Update score + streak UI
 */
function updateScoreDisplay() {
  scoreDisplay.textContent  = `Score: ${score}`;
  streakDisplay.textContent = `Streak: ${streak}`;
}

/**
 * End the game (unused in this continuous-play approach)
 */
function endGame() {
  isGameActive = false;
  clearInterval(timer);
  timer = null;
  scrambledLetters.textContent = "Game Over!";
  retryBtn.classList.remove("hidden");
  submitBtn.classList.add("hidden");
  correctAnswerDiv.classList.add("hidden");
}

/* ------------ Event Listeners ------------ */
startBtn.addEventListener("click", startGame);
retryBtn.addEventListener("click", startGame);
submitBtn.addEventListener("click", checkAnswer);
soundToggle.addEventListener("click", toggleSound);

// Check guess on Enter
answerInput.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    checkAnswer();
  }
});

// Touch and mobile support
answerInput.addEventListener("input", function() {
  // Auto-uppercase on mobile
  this.value = this.value.toUpperCase();
});

// Prevent zoom on double-tap for mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// Initialize sound preference from localStorage
const savedMuteState = localStorage.getItem('wordSprintMuted');
if (savedMuteState !== null) {
  isSoundMuted = savedMuteState === 'true';
  soundToggle.textContent = isSoundMuted ? '🔇' : '🔊';
  soundToggle.classList.toggle('muted', isSoundMuted);
}

// Disable Start until words load
startBtn.disabled = true;

// Load words on script execution
loadWords();
