// Wait for the HTML page to load completely before running JavaScript
document.addEventListener("DOMContentLoaded", () => {
  
  // ================== GET ALL HTML ELEMENTS ==================
  // Find and store references to all the buttons we need
  const startBtn = document.getElementById("start-btn");           // Button to start the quiz
  const nextBtn = document.getElementById("next-btn");             // Button to go to next question
  const restartBtn = document.getElementById("restart-btn");       // Button to restart quiz
  
  // Find and store references to different screen containers
  const questionContainer = document.getElementById("question-container");  // Container for question screen
  const resultContainer = document.getElementById("result-container");      // Container for results screen
  const startContainer = document.getElementById("start-container");        // Container for start screen
  
  // Find and store references to question-related elements
  const questionText = document.getElementById("question-text");             // Where we show the question
  const questionNumber = document.getElementById("question-number");         // Shows "Question 1 of 10"
  const choicesContainer = document.getElementById("choices-container");     // Container for answer choices
  
  // Find and store references to other UI elements
  const scoreDisplay = document.getElementById("score");                     // Shows final score
  const progress = document.getElementById("progress");                      // Progress bar
  const loadingDiv = document.getElementById("loading");                     // Loading spinner
  const categorySelect = document.getElementById("category-select");         // Category dropdown
  const difficultySelect = document.getElementById("difficulty-select");     // Difficulty dropdown

  // ================== QUIZ DATA VARIABLES ==================
  let questions = [];              // Array to store all quiz questions
  let currentQuestionIndex = 0;    // Track which question we're currently on (starts at 0)
  let score = 0;                   // Track how many questions answered correctly
  let selectedAnswer = null;       // Track what answer the user selected

  // ================== ADD EVENT LISTENERS ==================
  // When buttons are clicked, run these functions
  startBtn.addEventListener("click", startQuiz);       // Start quiz when start button clicked
  nextBtn.addEventListener("click", nextQuestion);     // Go to next question when next button clicked
  restartBtn.addEventListener("click", restartQuiz);   // Restart quiz when restart button clicked

  // ================== HELPER FUNCTIONS ==================
  
  /**
   * Decode HTML entities (like &quot; becomes ")
   * The API sometimes sends HTML-encoded text, so we need to decode it
   */
  function decodeHtml(html) {
    const txt = document.createElement("textarea");  // Create a temporary textarea element
    txt.innerHTML = html;                           // Put the HTML text inside it
    return txt.value;                              // Get the decoded text back
  }

  /**
   * Shuffle an array randomly (Fisher-Yates algorithm)
   * We use this to mix up the answer choices so they're in random order
   */
  function shuffleArray(array) {
    const newArray = [...array];  // Make a copy of the array so we don't change the original
    
    // Loop through array backwards and swap each element with a random earlier element
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));           // Pick random index
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap elements
    }
    return newArray;
  }

  /**
   * Show or hide the loading spinner
   * Also disable/enable the start button and change its text
   */
  function showLoading(show) {
    if (show) {
      // Show loading state
      loadingDiv.classList.remove("hidden");   // Make loading spinner visible
      startBtn.disabled = true;                // Disable start button so user can't click it
      startBtn.textContent = "Loading...";     // Change button text to show it's loading
    } else {
      // Hide loading state
      loadingDiv.classList.add("hidden");      // Hide loading spinner
      startBtn.disabled = false;               // Enable start button again
      startBtn.textContent = "Start Quiz";     // Change button text back to normal
    }
  }

  /**
   * Show an error message to the user
   * Creates a red error box that disappears after 5 seconds
   */
  function showError(message) {
    const errorDiv = document.createElement('div');  // Create a new div element
    errorDiv.className = 'error-message';            // Give it the error-message CSS class
    errorDiv.textContent = message;                  // Put the error text inside it
    startContainer.appendChild(errorDiv);            // Add it to the start screen
    
    // Remove the error message after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {  // Check if it's still on the page
        errorDiv.remove();        // Remove it from the page
      }
    }, 5000);
  }

  // ================== API FUNCTIONS ==================
  
  /**
   * Fetch quiz questions from the Open Trivia Database API
   * Returns true if successful, false if failed
   */
  async function fetchQuestions() {
    // Get the selected category and difficulty from dropdown menus
    const category = categorySelect.value;
    const difficulty = difficultySelect.value;
    
    try {
      showLoading(true);  // Show loading spinner
      
      // Build the API URL with our parameters
      // amount=10 means we want 10 questions
      // type=multiple means we want multiple choice questions
      const response = await fetch(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`);
      
      // Check if the API request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Convert the response to JSON format
      const data = await response.json();
      
      // Check if we actually got questions back
      if (data.results && data.results.length > 0) {
        // Process each question from the API
        questions = data.results.map(q => ({
          question: decodeHtml(q.question),  // Decode the question text
          // Mix the correct answer with wrong answers and shuffle them
          choices: shuffleArray([...q.incorrect_answers, q.correct_answer].map(a => decodeHtml(a))),
          answer: decodeHtml(q.correct_answer)  // Store the correct answer
        }));
        return true;  // Success!
      } else {
        throw new Error('No questions found for this category/difficulty');
      }
    } catch (error) {
      // Something went wrong - log it and show error to user
      console.error('API failed:', error);
      showError('Failed to load questions. Please check your internet connection and try again.');
      return false;  // Failed
    } finally {
      // Always hide loading spinner, whether we succeeded or failed
      showLoading(false);
    }
  }

  // ================== QUIZ FLOW FUNCTIONS ==================
  
  /**
   * Start a new quiz
   * Gets questions from API and shows first question
   */
  async function startQuiz() {
    // Clear any previous error messages from the screen
    const errorMsg = startContainer.querySelector('.error-message');
    if (errorMsg) {
      errorMsg.remove();
    }

    // Try to get questions from the API
    const success = await fetchQuestions();
    if (!success) return;  // If failed, stop here

    // Reset all quiz variables to starting values
    currentQuestionIndex = 0;  // Start with first question
    score = 0;                 // No correct answers yet
    selectedAnswer = null;     // No answer selected yet
    
    // Hide start screen and show question screen
    startContainer.classList.add("hidden");
    questionContainer.classList.remove("hidden");
    
    // Show the first question
    showQuestion();
  }

  /**
   * Display the current question and its answer choices
   */
  function showQuestion() {
    // Reset variables for new question
    selectedAnswer = null;              // No answer selected yet
    nextBtn.classList.add("hidden");    // Hide next button until answer is selected
    nextBtn.disabled = true;            // Disable next button
    
    // Get the current question data
    const currentQuestion = questions[currentQuestionIndex];
    
    // Update the question number display (e.g., "Question 1 of 10")
    questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    
    // Show the question text
    questionText.textContent = currentQuestion.question;
    
    // Update the progress bar
    updateProgress();
    
    // Clear any previous answer choices
    choicesContainer.innerHTML = "";
    
    // Create a clickable button for each answer choice
    currentQuestion.choices.forEach((choice) => {
      const choiceDiv = document.createElement("div");  // Create a div for this choice
      choiceDiv.className = "choice";                   // Give it the choice CSS class
      choiceDiv.textContent = choice;                   // Put the answer text inside
      
      // When this choice is clicked, select it as the answer
      choiceDiv.addEventListener("click", () => selectAnswer(choice, choiceDiv));
      
      // Add this choice to the choices container
      choicesContainer.appendChild(choiceDiv);
    });
  }

  /**
   * Handle when user selects an answer choice
   * Shows feedback and enables next button
   */
  function selectAnswer(choice, choiceElement) {
    // If user already selected an answer, don't allow selecting again
    if (selectedAnswer) return;
    
    // Store what the user selected
    selectedAnswer = choice;
    
    // Remove highlighting from all choices and disable clicking
    document.querySelectorAll(".choice").forEach(el => {
      el.classList.remove("selected");    // Remove selected highlighting
      el.style.pointerEvents = 'none';    // Disable clicking on choices
    });
    
    // Highlight the choice the user selected
    choiceElement.classList.add("selected");
    
    // Wait a moment, then show whether answer was correct or wrong
    setTimeout(() => {
      showFeedback();
    }, 200);
  }

  /**
   * Show feedback after user selects an answer
   * Colors choices green (correct) or red (incorrect)
   */
  function showFeedback() {
    // Get the correct answer for this question
    const correctAnswer = questions[currentQuestionIndex].answer;
    
    // Get all the choice elements
    const choices = document.querySelectorAll(".choice");
    
    // Color each choice based on whether it's correct or wrong
    choices.forEach(choice => {
      if (choice.textContent === correctAnswer) {
        // This is the correct answer - color it green
        choice.classList.add("correct");
      } else if (choice.textContent === selectedAnswer && selectedAnswer !== correctAnswer) {
        // This is the wrong answer the user selected - color it red
        choice.classList.add("incorrect");
      }
    });
    
    // If user got it right, increase their score
    if (selectedAnswer === correctAnswer) {
      score++;
    }
    
    // Wait a moment, then show the next button
    setTimeout(() => {
      nextBtn.classList.remove("hidden");  // Make next button visible
      nextBtn.disabled = false;            // Enable next button
    }, 300);
  }

  /**
   * Move to the next question or show final results
   */
  function nextQuestion() {
    // Re-enable clicking on choices for next question
    document.querySelectorAll(".choice").forEach(el => {
      el.style.pointerEvents = 'auto';
    });
    
    // Move to next question
    currentQuestionIndex++;
    
    // Check if there are more questions
    if (currentQuestionIndex < questions.length) {
      showQuestion();  // Show next question
    } else {
      showResult();    // No more questions - show final results
    }
  }

  /**
   * Show the final quiz results
   */
  function showResult() {
    // Hide question screen and show results screen
    questionContainer.classList.add("hidden");
    resultContainer.classList.remove("hidden");
    
    // Calculate percentage score
    const percentage = Math.round((score / questions.length) * 100);
    
    // Display the score (e.g., "7/10 (70%)")
    scoreDisplay.textContent = `${score}/${questions.length} (${percentage}%)`;
    
    // Fill progress bar to 100%
    progress.style.width = "100%";
  }

  // ================== UTILITY FUNCTIONS ==================
  
  /**
   * Update the progress bar based on current question
   */
  function updateProgress() {
    // Calculate what percentage of questions we've completed
    const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
    
    // Update the progress bar width
    progress.style.width = `${progressPercentage}%`;
  }

  /**
   * Reset everything and go back to start screen
   */
  function restartQuiz() {
    // Reset all variables to starting values
    currentQuestionIndex = 0;  // Back to first question
    score = 0;                 // Reset score to zero
    selectedAnswer = null;     // No answer selected
    questions = [];            // Clear questions array
    
    // Hide results screen and show start screen
    resultContainer.classList.add("hidden");
    startContainer.classList.remove("hidden");
    
    // Reset progress bar to empty
    progress.style.width = "0%";
    
    // Re-enable clicking on any remaining choice elements
    document.querySelectorAll(".choice").forEach(el => {
      el.style.pointerEvents = 'auto';
    });
    
    // Clear any error messages from previous attempts
    const errorMsg = startContainer.querySelector('.error-message');
    if (errorMsg) {
      errorMsg.remove();
    }
  }
});