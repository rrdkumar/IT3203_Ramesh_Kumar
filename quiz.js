/* IT 3203 Milestone 2: quiz timer, answer checking, scoring, and reset behavior. */
(function () {
  "use strict";

  const QUIZ_SECONDS = 10 * 60;
  const PASS_SCORE = 7;
  const form = document.getElementById("http-quiz");
  const timerDisplay = document.getElementById("time-remaining");
  const results = document.getElementById("results");
  const submitButton = document.getElementById("submit-quiz");
  const resetButton = document.getElementById("reset-quiz");

  let secondsLeft = QUIZ_SECONDS;
  let startTime = Date.now();
  let timerId = null;
  let submitted = false;

  const questions = [
    { id: "q1", title: "Question 1", answer: "transfer", display: "Transfer (the word 'transfer' completes Hypertext Transfer Protocol).", type: "text" },
    { id: "q2", title: "Question 2", answer: "server", display: "Server.", type: "text" },
    { id: "q3", title: "Question 3", answer: "b", display: "To transfer web resources between clients and servers.", type: "radio" },
    { id: "q4", title: "Question 4", answer: "b", display: "The client, such as a browser.", type: "radio" },
    { id: "q5", title: "Question 5", answer: "c", display: "The requested resource was not found.", type: "radio" },
    { id: "q6", title: "Question 6", answer: ["get", "post", "delete"], display: "GET, POST, and DELETE. Select all three and do not select CSS.", type: "checkbox" },
    { id: "q7", title: "Question 7", answer: "true", display: "True.", type: "radio" },
    { id: "q8", title: "Question 8", answer: "true", display: "True.", type: "radio" },
    { id: "q9", title: "Question 9", answer: "a", display: "To reuse a saved copy of a resource and potentially load it faster.", type: "radio" },
    { id: "q10", title: "Question 10", answer: "tcp", display: "TCP.", type: "text" }
  ];

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function selectedValue(id) {
    const checked = form.querySelector('input[name="' + id + '"]:checked');
    return checked ? checked.value : "";
  }

  function isCorrect(question) {
    if (question.type === "text") {
      const entered = document.getElementById(question.id).value.trim().toLowerCase().replace(/[.!?]+$/g, "");
      return entered === question.answer;
    }
    if (question.type === "checkbox") {
      const selected = Array.from(form.querySelectorAll('input[name="' + question.id + '"]:checked'))
        .map(function (input) { return input.value; }).sort();
      const expected = question.answer.slice().sort();
      return selected.length === expected.length && selected.every(function (value, index) { return value === expected[index]; });
    }
    return selectedValue(question.id) === question.answer;
  }

  function userAnswer(question) {
    if (question.type === "text") {
      return document.getElementById(question.id).value.trim() || "No answer provided";
    }
    if (question.type === "checkbox") {
      const values = Array.from(form.querySelectorAll('input[name="' + question.id + '"]:checked'))
        .map(function (input) { return input.parentElement.textContent.trim(); });
      return values.length ? values.join(", ") : "No answer selected";
    }
    const checked = form.querySelector('input[name="' + question.id + '"]:checked');
    return checked ? checked.parentElement.textContent.trim() : "No answer selected";
  }

  function stopTimer() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function finishQuiz(event, timeExpired) {
    if (event) event.preventDefault();
    if (submitted) return;
    submitted = true;
    stopTimer();
    const elapsed = Math.min(QUIZ_SECONDS, Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
    let score = 0;
    const review = document.getElementById("answer-review");
    review.textContent = "";

    questions.forEach(function (question) {
      const correct = isCorrect(question);
      if (correct) score += 1;
      const item = document.createElement("div");
      item.className = "result-item";
      const title = document.createElement("h3");
      title.textContent = question.title + " — " + (correct ? "1/1 point" : "0/1 point");
      title.className = correct ? "correct" : "incorrect";
      const status = document.createElement("p");
      status.textContent = correct ? "Correct" : "Incorrect";
      status.className = correct ? "correct" : "incorrect";
      const yourAnswer = document.createElement("p");
      yourAnswer.textContent = "Your answer: " + userAnswer(question);
      const rightAnswer = document.createElement("p");
      rightAnswer.textContent = "Correct answer: " + question.display;
      item.append(title, status, yourAnswer, rightAnswer);
      review.appendChild(item);
    });

    const passed = score >= PASS_SCORE;
    results.hidden = false;
    results.className = passed ? "pass" : "fail";
    document.getElementById("overall-result").textContent = "Result: " + (passed ? "PASS" : "FAIL") + (timeExpired ? " (time limit reached)" : "");
    document.getElementById("total-score").textContent = "Total score: " + score + "/" + questions.length + " (" + Math.round(score / questions.length * 100) + "%)";
    document.getElementById("time-spent").textContent = "Time spent: " + formatTime(elapsed);
    document.getElementById("result-heading").focus();
    submitButton.disabled = true;
    form.querySelectorAll("input").forEach(function (input) { input.disabled = true; });
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateTimer() {
    secondsLeft -= 1;
    timerDisplay.textContent = formatTime(Math.max(0, secondsLeft));
    if (secondsLeft <= 0) finishQuiz(null, true);
  }

  form.addEventListener("submit", function (event) { finishQuiz(event, false); });

  form.addEventListener("reset", function () {
    /* Reset after the browser clears form values, then restart a fresh 10-minute attempt. */
    window.setTimeout(function () {
      stopTimer();
      secondsLeft = QUIZ_SECONDS;
      startTime = Date.now();
      submitted = false;
      timerDisplay.textContent = formatTime(QUIZ_SECONDS);
      results.hidden = true;
      results.className = "";
      document.getElementById("answer-review").textContent = "";
      document.getElementById("overall-result").textContent = "";
      document.getElementById("total-score").textContent = "";
      document.getElementById("time-spent").textContent = "";
      submitButton.disabled = false;
      form.querySelectorAll("input").forEach(function (input) { input.disabled = false; });
      timerId = window.setInterval(updateTimer, 1000);
    }, 0);
  });

  /* Start the countdown as soon as the quiz page loads. */
  timerDisplay.textContent = formatTime(QUIZ_SECONDS);
  timerId = window.setInterval(updateTimer, 1000);
})();
