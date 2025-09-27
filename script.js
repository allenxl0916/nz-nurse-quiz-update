/*
 * NZ Nursing State Exam Quiz
 *
 * This JavaScript file drives the quiz application. It loads a question set
 * from a JSON file, shuffles the questions using the Fisher‑Yates algorithm
 * (see freeCodeCamp article for details【918369654936955†L31-L47】), and
 * displays one question at a time with four answer options. When an
 * option is selected the choice is marked green if correct or red if
 * incorrect. Navigation buttons allow the user to move backward and forward
 * through the quiz. At the end, the score is displayed. Questions and
 * answers are rendered as plain text to make copying easy.
 */

let quizData = null;
let currentSet = null;
let shuffledQuestions = [];
let userAnswers = [];
// Keep track of all selected option indices per question to support changing answers while
// preserving previously chosen wrong answers (red) and correct answers (green).
let selectedOptions = [];
let currentIndex = 0;

const setSelect = document.getElementById('setSelect');
const startBtn = document.getElementById('startBtn');
const quizContainer = document.getElementById('quizContainer');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const progressEl = document.getElementById('progress');
const scoreEl = document.getElementById('score');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Load quiz data from JSON file or from an embedded script tag when opened over file://
async function loadQuizData() {
  // If the data has been embedded via questions_data.js then use it. This allows the quiz
  // to work over file:// without relying on fetch or an embedded JSON script.
  if (typeof window.embeddedQuizData !== 'undefined' && window.embeddedQuizData) {
    quizData = window.embeddedQuizData;
    populateSetSelect();
    return;
  }
  // First try to read embedded JSON data from a script tag. This allows the
  // application to work when opened locally via the file:/// protocol, where
  // fetching a separate JSON file is blocked by CORS.
  const embedded = document.getElementById('embedded-questions');
  if (embedded && embedded.textContent.trim()) {
    try {
      quizData = JSON.parse(embedded.textContent);
      populateSetSelect();
      return;
    } catch (e) {
      console.warn('Failed to parse embedded questions JSON:', e);
      // Fall through to try fetch
    }
  }
  try {
    const response = await fetch('questions.json');
    // When running over file://, browsers may block fetch due to CORS. If the
    // request fails we catch and fall back to a built‑in sample question set.
    quizData = await response.json();
    populateSetSelect();
  } catch (err) {
    console.warn('Failed to load quiz data, using fallback:', err);
    // Fallback: embed a default set if the JSON file cannot be fetched (e.g. when opened over file://)
    quizData = {
      sets: [
        {
          name: 'Default Set',
          questions: [
            {
              question: 'What is the normal range of adult body temperature?',
              options: ['36.1°C to 37.2°C', '34°C to 35°C', '38°C to 39°C', '32°C to 33°C'],
              answer: 0
            },
            {
              question: 'Which of the following is an example of a pulse rate within normal limits for an adult?',
              options: ['45 beats per minute', '75 beats per minute', '120 beats per minute', '130 beats per minute'],
              answer: 1
            },
            {
              question: 'In the context of infection control, what does “aseptic technique” refer to?',
              options: ['Allowing non‑sterile contact with open wounds', 'A procedure used to minimize the risk of introducing infection during invasive procedures', 'Washing hands after each patient contact', 'Using antibiotics prophylactically'],
              answer: 1
            }
          ]
        }
      ]
    };
    populateSetSelect();
  }
}

// Populate select element with available sets
function populateSetSelect() {
  // Clear any existing options
  setSelect.innerHTML = '';
  quizData.sets.forEach((set, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = set.name;
    setSelect.appendChild(option);
  });
}

// Shuffle an array using the Fisher‑Yates algorithm【918369654936955†L31-L46】
function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Start the quiz with the selected set
function startQuiz() {
  const setIndex = parseInt(setSelect.value, 10);
  currentSet = quizData.sets[setIndex];
  // Shuffle questions for this set
  shuffledQuestions = shuffle(currentSet.questions);
  // Initialize user answers array
  userAnswers = new Array(shuffledQuestions.length).fill(null);
  // Initialize selected options list for each question
  selectedOptions = new Array(shuffledQuestions.length).fill(null).map(() => []);
  currentIndex = 0;
  // Hide setup and show quiz container
  document.getElementById('setup').hidden = true;
  quizContainer.hidden = false;
  scoreEl.hidden = true;
  renderQuestion();
}

// Render current question and options
function renderQuestion() {
  // Clear previous options
  optionsEl.innerHTML = '';
  // Update progress
  progressEl.textContent = `Question ${currentIndex + 1} of ${shuffledQuestions.length}`;
  const q = shuffledQuestions[currentIndex];
  questionEl.textContent = q.question;
  // Render options
  q.options.forEach((opt, idx) => {
    const div = document.createElement('div');
    div.classList.add('option');
    div.textContent = opt;
    div.dataset.index = idx;
    // Add click handler for selecting/changing answers
    div.addEventListener('click', () => handleAnswer(idx));
    // If this option was previously selected, apply styling
    if (selectedOptions[currentIndex].includes(idx)) {
      if (idx === q.answer) {
        div.classList.add('correct');
      } else {
        div.classList.add('incorrect');
      }
    }
    optionsEl.appendChild(div);
  });
  // Manage navigation button states
  prevBtn.disabled = currentIndex === 0;
  // Disable next if current question has not yet been answered (no selection)
  nextBtn.disabled = userAnswers[currentIndex] === null;
}

// Handle answer selection
function handleAnswer(selectedIndex) {
  const q = shuffledQuestions[currentIndex];
  const opts = selectedOptions[currentIndex];
  // If this option hasn't been selected before, record it
  if (!opts.includes(selectedIndex)) {
    opts.push(selectedIndex);
  }
  // Update final answer to last clicked
  userAnswers[currentIndex] = selectedIndex;
  // Update styling: add correct/incorrect classes to clicked option, but do not remove previous markings
  const optionDivs = optionsEl.querySelectorAll('.option');
  optionDivs.forEach((div) => {
    const idx = parseInt(div.dataset.index, 10);
    if (idx === selectedIndex) {
      if (idx === q.answer) {
        div.classList.add('correct');
      } else {
        div.classList.add('incorrect');
      }
    }
  });
  // Enable next button now that the question has a selection
  nextBtn.disabled = false;
}

// Navigate to previous question
function goPrev() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

// Navigate to next question or finish
function goNext() {
  if (currentIndex < shuffledQuestions.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    // End of quiz, show score
    showScore();
  }
}

// Calculate and display score
function showScore() {
  let correctCount = 0;
  shuffledQuestions.forEach((q, idx) => {
    if (userAnswers[idx] === q.answer) {
      correctCount++;
    }
  });
  scoreEl.textContent = `You answered ${correctCount} out of ${shuffledQuestions.length} correctly.`;
  scoreEl.hidden = false;
  // Disable the next button after finishing
  nextBtn.disabled = true;
}

// Set up event listeners
startBtn.addEventListener('click', startQuiz);
prevBtn.addEventListener('click', goPrev);
nextBtn.addEventListener('click', goNext);

// Initialise the quiz on page load
loadQuizData();