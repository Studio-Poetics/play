/*******************************************************
 * Word Sprint (Anagram Challenge) - Hindi Version
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
const nextBtn          = document.getElementById("nextBtn");
const soundToggle      = document.getElementById("soundToggle");
const correctAnswerDiv = document.getElementById("correctAnswer");

const dropZone = document.getElementById("dropZone");

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
let usedWordsInSession = new Set(); // Words used in the current session
let isSoundMuted = false; // Sound toggle state

// Hindi Grapheme Segmenter
const segmenter = new Intl.Segmenter('hi', { granularity: 'grapheme' });

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
    const response = await fetch("hindi_words.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json(); // array of words

    // Store all words in a Set for quick membership checks
    dictionarySet = new Set(data);

    // Sort words into difficulty buckets by grapheme length
    data.forEach(word => {
      const w = word.trim();
      const len = [...segmenter.segment(w)].length;
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

  let availableWords = bucket.filter(word => !usedWordsInSession.has(word));

  // If the current bucket is exhausted, try to find words in other buckets
  if (availableWords.length === 0) {
    const allBuckets = [wordsEasy3_4, wordsMed5_6, wordsHard7_8, wordsInsane9Up];
    for (const b of allBuckets) {
      availableWords = b.filter(word => !usedWordsInSession.has(word));
      if (availableWords.length > 0) {
        break;
      }
    }
  }
  
  // If all words have been used, reset the session
  if (availableWords.length === 0) {
      usedWordsInSession.clear();
      availableWords = bucket.length > 0 ? bucket : wordsEasy3_4; 
  }

  const randomIndex = Math.floor(Math.random() * availableWords.length);
  currentWord = availableWords[randomIndex];
  usedWordsInSession.add(currentWord);
}

/**
 * Shuffle the graphemes of the puzzle word
 */
function shuffleWord(word) {
  const graphemes = [...segmenter.segment(word)].map(s => s.segment);
  for (let i = graphemes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [graphemes[i], graphemes[j]] = [graphemes[j], graphemes[i]];
  }
  return graphemes.join("");
}

/**
 * Display scrambled word as draggable tiles
 */
function displayScrambledWord() {
  let scrambled = shuffleWord(currentWord);
  // If accidentally the same as original, reshuffle
  while (scrambled === currentWord) {
    scrambled = shuffleWord(currentWord);
  }
  
  scrambledLetters.innerHTML = ''; // Clear previous tiles
  const graphemes = [...segmenter.segment(scrambled)].map(s => s.segment);
  
  graphemes.forEach((grapheme, index) => {
    const tile = document.createElement('div');
    tile.textContent = grapheme;
    tile.className = 'letter-tile';
    tile.draggable = true;
    tile.id = `tile-${index}`;
    tile.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', e.target.id);
    });
    scrambledLetters.appendChild(tile);
  });
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
    alert("शब्द सूची अभी तक लोड नहीं हुई है!");
    return;
  }

  // Reset game variables
  score            = 0;
  streak           = 0;
  solvedWordsCount = 0;
  usedWordsInSession.clear(); // Clear used words for the new session
  baseTime         = 15;
  timeRemaining    = baseTime;
  isGameActive     = true;

  timerDisplay.textContent = `समय: ${timeRemaining}`;

  startBtn.classList.add("hidden");
  retryBtn.classList.add("hidden");
  submitBtn.classList.remove("hidden");
  nextBtn.classList.add('hidden');
  correctAnswerDiv.classList.add("hidden");
  dropZone.innerHTML = ''; // Clear the drop zone

  playStartSound();

  pickNewWord();
  displayScrambledWord();

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
  timerDisplay.textContent = `समय: ${timeRemaining}`;

  // Play tick sound for last 5 seconds
  if (timeRemaining <= 5 && timeRemaining > 0) {
    playTickSound();
  }

  if (timeRemaining <= 0) {
    failRound("समय समाप्त!");
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

  // Find all valid anagrams and display them
  const allAnagrams = findAllValidAnagrams(currentWord);
  let answerText = `एक सही शब्द था: ${currentWord}`;

  if (allAnagrams.length > 0) {
    // Limit to first 4 alternatives to avoid overwhelming display
    const limitedAnagrams = allAnagrams.slice(0, 4);
    answerText += ` | अन्य: ${limitedAnagrams.join(", ")}`;
    if (allAnagrams.length > 4) {
      answerText += ` (+${allAnagrams.length - 4} और)`;
    }
  }

  correctAnswerDiv.textContent = answerText;
  correctAnswerDiv.classList.remove("hidden");

  streak = 0;
  updateScoreDisplay();

  // Highlight the incorrect answer in the dropZone
  dropZone.querySelectorAll('.letter-tile').forEach(tile => {
      tile.classList.add('incorrect');
  });

  // Display correct word in the scrambled letters area, highlighted in green
  scrambledLetters.innerHTML = '';
  const graphemes = [...segmenter.segment(currentWord)].map(s => s.segment);
  graphemes.forEach(grapheme => {
      const tile = document.createElement('div');
      tile.textContent = grapheme;
      tile.className = 'letter-tile correct';
      scrambledLetters.appendChild(tile);
  });

  // Show Next button
  submitBtn.classList.add('hidden');
  nextBtn.classList.remove('hidden');
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
  dropZone.innerHTML = ''; // Clear the drop zone
  pickNewWord();
  displayScrambledWord();

  if (solvedWordsCount >= 10) {
    baseTime = 10; // reduce time after 10 correct solves
  }
  timeRemaining = baseTime;
  timerDisplay.textContent = `समय: ${timeRemaining}`;

  nextBtn.classList.add('hidden');
  submitBtn.classList.remove('hidden');

  timer = setInterval(countdown, 1000);
}

/**
 * Check if the user's arrangement of letters is a valid anagram
 * and is in the dictionary
 */
function checkAnswer() {
  if (!isGameActive) return;

  const tiles = dropZone.querySelectorAll('.letter-tile');
  const userGuess = Array.from(tiles).map(tile => tile.textContent).join('');

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

    // Show the correct word and alternative anagrams briefly for educational value
    const allAnagrams = findAllValidAnagrams(currentWord);
    const otherAnagrams = allAnagrams.filter(word => word !== userGuess);

    let successText = `सही! शब्द था: ${currentWord}`;

    if (otherAnagrams.length > 0) {
      const limitedAnagrams = otherAnagrams.slice(0, 3);
      successText += ` | अन्य वैध शब्द: ${limitedAnagrams.join(", ")}`;
      if (otherAnagrams.length > 3) {
        successText += ` (+${otherAnagrams.length - 3} और)`;
      }
    }

    correctAnswerDiv.textContent = successText;
    correctAnswerDiv.classList.remove("hidden");

    // Highlight the correct answer in the dropZone
    dropZone.querySelectorAll('.letter-tile').forEach(tile => {
        tile.classList.add('correct');
    });

    // Display correct word in the scrambled letters area, also highlighted
    scrambledLetters.innerHTML = '';
    const graphemes = [...segmenter.segment(currentWord)].map(s => s.segment);
    graphemes.forEach(grapheme => {
        const tile = document.createElement('div');
        tile.textContent = grapheme;
        tile.className = 'letter-tile correct';
        scrambledLetters.appendChild(tile);
    });

    // Show Next button
    submitBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');
  } else {
    // Incorrect => show correct, then next
    failRound("गलत अनुमान");
  }
}

/**
 * Helper function: checks if guess is an anagram of target
 * by comparing sorted graphemes
 */
function isValidAnagram(guess, target) {
  const guessGraphemes = [...segmenter.segment(guess)].map(s => s.segment);
  const targetGraphemes = [...segmenter.segment(target)].map(s => s.segment);

  if (guessGraphemes.length !== targetGraphemes.length) return false;

  const sortA = guessGraphemes.sort().join("");
  const sortB = targetGraphemes.sort().join("");
  return sortA === sortB;
}

/**
 * Find all valid anagrams of a word that exist in the dictionary
 * Returns array of valid anagram words (excluding the original word)
 */
function findAllValidAnagrams(word) {
  const targetGraphemes = [...segmenter.segment(word)].map(s => s.segment);
  const targetSorted = targetGraphemes.sort().join("");
  const validAnagrams = [];

  // Search through dictionary for words with same graphemes
  for (const dictWord of dictionarySet) {
    if (dictWord !== word) {
        const dictGraphemes = [...segmenter.segment(dictWord)].map(s => s.segment);
        if (dictGraphemes.length === targetGraphemes.length) {
            const dictSorted = dictGraphemes.sort().join("");
            if (dictSorted === targetSorted) {
                validAnagrams.push(dictWord);
            }
        }
    }
  }

  return validAnagrams;
}

/**
 * Update score + streak UI
 */
function updateScoreDisplay() {
  scoreDisplay.textContent  = `स्कोर: ${score}`;
  streakDisplay.textContent = `क्रम: ${streak}`;
}

/**
 * End the game (unused in this continuous-play approach)
 */
function endGame() {
  isGameActive = false;
  clearInterval(timer);
  timer = null;
  scrambledLetters.textContent = "खेल समाप्त!";
  retryBtn.classList.remove("hidden");
  submitBtn.classList.add("hidden");
  correctAnswerDiv.classList.add("hidden");
}

/* ------------ Drag and Drop Event Listeners ------------ */
function allowDrop(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  const tileId = e.dataTransfer.getData('text/plain');
  const tile = document.getElementById(tileId);
  if (tile) {
    e.currentTarget.appendChild(tile);
  }
}

scrambledLetters.addEventListener('dragover', allowDrop);
scrambledLetters.addEventListener('drop', drop);
dropZone.addEventListener('dragover', allowDrop);
dropZone.addEventListener('drop', drop);

/* ------------ Event Listeners ------------ */
startBtn.addEventListener("click", startGame);
retryBtn.addEventListener("click", startGame);
submitBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", nextRound);
soundToggle.addEventListener("click", toggleSound);

// Check guess on Enter (multiple event types for better mobile support)
answerInput.addEventListener("keyup", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    checkAnswer();
  }
});

// Also handle keydown for immediate response
answerInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent default behavior
  }
});

// Handle form submission (triggered by 'Go' button on mobile)
const answerForm = document.getElementById("answerForm");
answerForm.addEventListener("submit", function (e) {
  e.preventDefault();
  checkAnswer();
});





// Touch and mobile support
answerInput.addEventListener("input", function() {
  // No auto-uppercase for Hindi
});

// Mobile keyboard optimization
function setupMobileKeyboard() {
  const isMobile = window.innerWidth <= 480;

  if (isMobile) {
    // Optimize system keyboard for smaller size
    setupSystemKeyboardOptimizations();
  }
}

// Optimize system keyboard to be smaller
function setupSystemKeyboardOptimizations() {
  // Force compact keyboard layout
  answerInput.addEventListener('focus', function() {
    // Set input attributes that request smaller keyboard with submit action
    this.setAttribute('enterkeyhint', 'done');
    this.setAttribute('inputmode', 'text');

    // Prevent zoom by temporarily setting font size
    this.style.fontSize = '16px';

    setTimeout(() => {
      // Restore original font size after keyboard appears
      this.style.fontSize = '';
    }, 300);
  });

  // Additional mobile keyboard event handling
  answerInput.addEventListener('blur', function() {
    // Clean up when keyboard disappears
    this.style.fontSize = '';
  });
}

// Mobile keyboard handling (fallback for system keyboard)
function handleMobileKeyboard() {
  const isMobile = window.innerWidth <= 480;

  if (isMobile) {
    // Mobile keyboard scroll handling
    answerInput.addEventListener('focus', function() {
      setTimeout(() => {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn && !submitBtn.classList.contains('hidden')) {
          submitBtn.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }, 300);
    });
  }
}

// Initialize mobile keyboard
setupMobileKeyboard();

// Initialize mobile keyboard handling
handleMobileKeyboard();

// Handle window resize to update mobile keyboard
window.addEventListener('resize', function() {
  setupMobileKeyboard();
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