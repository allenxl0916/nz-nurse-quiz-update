// Quiz application script

let quizSets = [];
let currentSetIndex = null;
let questions = [];
let currentQuestion = 0;
let answeredCount = 0;
let correctCount = 0;
let selectedAnswers = {};
let startTime = null;
let timerInterval = null;

// Populate the set selection dropdown
function populateSelect() {
  const select = document.getElementById('setSelect');
  select.innerHTML = '';
  if (typeof quizData !== 'undefined' && quizData.sets) {
    quizSets = quizData.sets;
  }
  quizSets.forEach((set, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = set.name;
    select.appendChild(option);
  });
}

// Shuffle array using Fisher-Yates
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Start the quiz when user clicks start
function startQuiz() {
  const select = document.getElementById('setSelect');
  const selected = parseInt(select.value, 10);
  if (isNaN(selected) || !quizSets[selected]) return;
  currentSetIndex = selected;
  // Copy and shuffle questions
  questions = shuffleArray(quizSets[selected].questions);
  currentQuestion = 0;
  answeredCount = 0;
  correctCount = 0;
  selectedAnswers = {};
  // Hide main screen and show quiz screen
  document.getElementById('main-screen').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'block';
  // Start timer
  startTime = Date.now();
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
  // Show first question
  showQuestion();
}

// Display question and options
function showQuestion() {
  const q = questions[currentQuestion];
  const questionEl = document.getElementById('question');
  const optionsEl = document.getElementById('options');
  questionEl.textContent = `Q${currentQuestion + 1}. ${q.question}`;
  optionsEl.innerHTML = '';
  // For each option create button
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.textContent = `${String.fromCharCode(65 + idx)}. ${opt}`;
    btn.addEventListener('click', () => selectOption(idx));
    // If this question has been answered, show class
    if (selectedAnswers.hasOwnProperty(currentQuestion)) {
      const record = selectedAnswers[currentQuestion];
      if (record.selected === idx) {
        // Mark color based on correctness of first choice
        btn.classList.add(record.correct ? 'correct' : 'incorrect');
      }
    }
    optionsEl.appendChild(btn);
  });
  // Update navigation buttons
  document.getElementById('prevButton').disabled = currentQuestion === 0;
  document.getElementById('nextButton').disabled = currentQuestion === questions.length - 1;
  // Update scoreboard
  updateScoreboard();
  // Clear explanation when loading a new question
  const expEl = document.getElementById('explanation');
  if (expEl) {
    // Reset explanation; it may be set below if explanation was previously shown
    expEl.textContent = '';
  }
  // If this question has been answered and explanation should be shown, display it
  if (selectedAnswers[currentQuestion] && selectedAnswers[currentQuestion].showExplanation) {
    if (expEl) {
      expEl.textContent = q.explanation || '';
    }
  }
}

// Handle option selection
function selectOption(optionIndex) {
  const q = questions[currentQuestion];
  const optionsEl = document.getElementById('options');
  // Determine if first time answering
  let firstAttempt = !selectedAnswers.hasOwnProperty(currentQuestion);
  // Determine correctness for display based on the option clicked
  const correctForDisplay = optionIndex === q.answer;
  if (firstAttempt) {
    // First attempt: record answer and update score
    answeredCount++;
    const correct = correctForDisplay;
    if (correct) correctCount++;
    // Initialize showExplanation flag; will be set when correct option is chosen
    selectedAnswers[currentQuestion] = { selected: optionIndex, correct, showExplanation: correct };
  } else {
    // Subsequent attempts: do not change score but update selected index
    selectedAnswers[currentQuestion].selected = optionIndex;
    // If selecting a correct option later, enable explanation
    if (optionIndex === q.answer) {
      selectedAnswers[currentQuestion].showExplanation = true;
    }
  }
  // Update option button classes: highlight current selection based on whether it is correct
  Array.from(optionsEl.children).forEach((btn, idx) => {
    btn.classList.remove('correct', 'incorrect');
    if (selectedAnswers[currentQuestion] && selectedAnswers[currentQuestion].selected === idx) {
      // Use current click correctness for display, not stored correctness
      btn.classList.add(correctForDisplay ? 'correct' : 'incorrect');
    }
  });
  // Update scoreboard
  updateScoreboard();

  // Show or hide explanation based on whether the correct option has been chosen
  const expEl = document.getElementById('explanation');
  if (selectedAnswers[currentQuestion].showExplanation) {
    if (expEl) {
      expEl.textContent = q.explanation || '';
    }
  } else {
    // Only clear explanation if it hasn't been shown previously
    if (expEl) {
      expEl.textContent = '';
    }
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion();
  }
}

function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion();
  }
}

function updateScoreboard() {
  const scoreboard = document.getElementById('scoreboard');
  scoreboard.textContent = `Answered: ${answeredCount} of ${questions.length} | Correct: ${correctCount}`;
}

function updateTimer() {
  if (!startTime) return;
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');
  document.getElementById('timer').textContent = `Time: ${minutes}:${seconds}`;
}

function exitQuiz() {
  // Stop timer
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  // Show main screen
  document.getElementById('quiz-screen').style.display = 'none';
  document.getElementById('main-screen').style.display = 'block';
  // Reset timer display and scoreboard
  document.getElementById('timer').textContent = 'Time: 00:00';
  document.getElementById('scoreboard').textContent = '';
}

document.addEventListener('DOMContentLoaded', () => {
  populateSelect();
  document.getElementById('startButton').addEventListener('click', startQuiz);
  document.getElementById('prevButton').addEventListener('click', prevQuestion);
  document.getElementById('nextButton').addEventListener('click', nextQuestion);
  document.getElementById('exitButton').addEventListener('click', exitQuiz);
  // Register service worker if supported
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch((err) => {
      console.error('Service worker registration failed:', err);
    });
  }
});