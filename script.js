document.addEventListener("DOMContentLoaded", () => {
    const startScreen = document.getElementById("start-screen");
    const startGameBtn = document.getElementById("start-game-btn");
    const gameContainer = document.getElementById("game-container");
    const board = document.getElementById("board");
    const turnDisplay = document.getElementById("current-turn");
    const restartBtn = document.getElementById("restart-btn");
    const undoBtn = document.getElementById("undo-btn");

    let turn = "red";
    let selectedPiece = null;
    let lastMove = null;

    startGameBtn.addEventListener("click", () => {
        startScreen.style.display = "none"; 
        gameContainer.classList.remove("hidden"); 
        createBoard(); 
    });

    function createBoard() {
        board.innerHTML = "";
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement("div");
                square.classList.add("square");
                square.dataset.row = row;
                square.dataset.col = col;

                if ((row + col) % 2 === 1) {
                    square.classList.add("dark");
                    if (row < 3) {
                        addPiece(square, "red");
                    } else if (row > 4) {
                        addPiece(square, "black");
                    }
                } else {
                    square.classList.add("light");
                }

                square.addEventListener("click", handleSquareClick);
                board.appendChild(square);
            }
        }
    }

    function addPiece(square, color) {
        const piece = document.createElement("div");
        piece.classList.add("piece", color);
        piece.dataset.color = color;
        piece.dataset.king = "false";
        piece.addEventListener("click", handlePieceClick);
        square.appendChild(piece);
    }

    function handlePieceClick(event) {
        event.stopPropagation();
        const piece = event.target;
        if (piece.dataset.color !== turn) return;

        if (selectedPiece) {
            selectedPiece.classList.remove("selected");
            clearMoveHints();
        }
        selectedPiece = piece;
        selectedPiece.classList.add("selected");
        showMoveHints(selectedPiece);
    }

    function handleSquareClick(event) {
        if (!selectedPiece) return;

        const square = event.target;
        if (square.classList.contains("piece")) return;

        const oldSquare = selectedPiece.parentElement;
        const [oldRow, oldCol] = [parseInt(oldSquare.dataset.row), parseInt(oldSquare.dataset.col)];
        const [newRow, newCol] = [parseInt(square.dataset.row), parseInt(square.dataset.col)];

        if (isValidMove(oldRow, oldCol, newRow, newCol, selectedPiece)) {
            const jumpedPiece = getJumpedPiece(oldRow, oldCol, newRow, newCol);
            if (jumpedPiece) jumpedPiece.remove();

            lastMove = {
                piece: selectedPiece,
                oldSquare: oldSquare,
                newSquare: square,
                capturedPiece: jumpedPiece || null,
            };

            square.appendChild(selectedPiece);
            selectedPiece.classList.remove("selected");
            clearMoveHints();
            checkKingPromotion(selectedPiece, newRow);

            switchTurn();
            selectedPiece = null;
        }
    }

    function isValidMove(oldRow, oldCol, newRow, newCol, piece) {
        const rowDiff = newRow - oldRow;
        const colDiff = newCol - oldCol;
        const isKing = piece.dataset.king === "true";
        const pieceColor = piece.dataset.color;
        const forwardDirection = pieceColor === "red" ? 1 : -1;

        if (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1) {
            return rowDiff === forwardDirection || isKing;
        }

        if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
            const jumpedPiece = getJumpedPiece(oldRow, oldCol, newRow, newCol);
            return jumpedPiece && jumpedPiece.dataset.color !== pieceColor;
        }

        return false;
    }

    function getJumpedPiece(oldRow, oldCol, newRow, newCol) {
        const jumpedRow = (oldRow + newRow) / 2;
        const jumpedCol = (oldCol + newCol) / 2;

        return [...document.querySelectorAll(".piece")].find(piece => {
            const parent = piece.parentElement;
            return parseInt(parent.dataset.row) === jumpedRow && parseInt(parent.dataset.col) === jumpedCol;
        });
    }

    function checkKingPromotion(piece, row) {
        if (piece.dataset.color === "red" && row == 7) {
            piece.classList.add("king");
            piece.dataset.king = "true";
        } else if (piece.dataset.color === "black" && row == 0) {
            piece.classList.add("king");
            piece.dataset.king = "true";
        }
    }

    function switchTurn() {
        turn = turn === "red" ? "black" : "red";
        turnDisplay.textContent = turn.charAt(0).toUpperCase() + turn.slice(1);
    }

    function restartGame() {
        turn = "red";
        selectedPiece = null;
        lastMove = null;
        turnDisplay.textContent = "Red";
        createBoard();
    }

    function undoMove() {
        if (!lastMove) return;

        const { piece, oldSquare, newSquare, capturedPiece } = lastMove;

        oldSquare.appendChild(piece);
        if (capturedPiece) {
            newSquare.appendChild(capturedPiece);
        }

        lastMove = null;
        switchTurn();
    }

    // Highlights valid move directions
    function showMoveHints(piece) {
        const parent = piece.parentElement;
        const row = parseInt(parent.dataset.row);
        const col = parseInt(parent.dataset.col);
        const pieceColor = piece.dataset.color;
        const forwardDirection = pieceColor === "red" ? 1 : -1;

        const potentialMoves = [
            [row + forwardDirection, col - 1],
            [row + forwardDirection, col + 1],
            [row + 2 * forwardDirection, col - 2], 
            [row + 2 * forwardDirection, col + 2] 
        ];

        potentialMoves.forEach(([r, c]) => {
            const square = document.querySelector(`.square[data-row="${r}"][data-col="${c}"]`);
            if (square && !square.querySelector(".piece")) {
                square.classList.add("highlight");
            }
        });
    }

    // Clears move hints
    function clearMoveHints() {
        document.querySelectorAll(".highlight").forEach(sq => sq.classList.remove("highlight"));
    }

    restartBtn.addEventListener("click", restartGame);
    undoBtn.addEventListener("click", undoMove);
  
  function checkKingPromotion(piece, row) {
    if (piece.dataset.color === "red" && row == 7) {
        piece.classList.add("king");
        piece.dataset.king = "true";
        piece.style.backgroundColor = "#FFD700"; // Gold for Red Kings
    } else if (piece.dataset.color === "black" && row == 0) {
        piece.classList.add("king");
        piece.dataset.king = "true";
        piece.style.backgroundColor = "#1E90FF"; // Blue for Black Kings
    }
}
 
  // Highlights valid move directions, including backward movement for Kings
function showMoveHints(piece) {
    const parent = piece.parentElement;
    const row = parseInt(parent.dataset.row);
    const col = parseInt(parent.dataset.col);
    const pieceColor = piece.dataset.color;
    const isKing = piece.dataset.king === "true";
    const forwardDirection = pieceColor === "red" ? 1 : -1;

    const potentialMoves = [
        [row + forwardDirection, col - 1],
        [row + forwardDirection, col + 1]
    ];

    // Allow Kings to move backward
    if (isKing) {
        potentialMoves.push(
            [row - forwardDirection, col - 1],
            [row - forwardDirection, col + 1]
        );
    }

    // Checking for capturing moves (jumping over opponent pieces)
    const captureMoves = [
        [row + 2 * forwardDirection, col - 2],
        [row + 2 * forwardDirection, col + 2]
    ];

    if (isKing) {
        captureMoves.push(
            [row - 2 * forwardDirection, col - 2],
            [row - 2 * forwardDirection, col + 2]
        );
    }

    [...potentialMoves, ...captureMoves].forEach(([r, c]) => {
        const square = document.querySelector(`.square[data-row="${r}"][data-col="${c}"]`);
        if (square && !square.querySelector(".piece")) {
            square.classList.add("highlight");
        }
    });
}

// Modify move validation to include King movement
function isValidMove(oldRow, oldCol, newRow, newCol, piece) {
    const rowDiff = newRow - oldRow;
    const colDiff = newCol - oldCol;
    const isKing = piece.dataset.king === "true";
    const pieceColor = piece.dataset.color;
    const forwardDirection = pieceColor === "red" ? 1 : -1;

    // Normal move (1 diagonal step)
    if (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1) {
        return isKing || rowDiff === forwardDirection;
    }

    // Jumping move (2 diagonal steps, capturing opponent)
    if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
        const jumpedPiece = getJumpedPiece(oldRow, oldCol, newRow, newCol);
        return jumpedPiece && jumpedPiece.dataset.color !== pieceColor;
    }

    return false;
}
  
  function checkKingPromotion(piece, row) {
    if (piece.dataset.color === "red" && row == 7) {
        promoteToKing(piece, "gold");
    } else if (piece.dataset.color === "black" && row == 0) {
        promoteToKing(piece, "blue");
    }
}

function promoteToKing(piece, color) {
    piece.classList.add("king");
    piece.dataset.king = "true";
    piece.style.backgroundColor = color === "gold" ? "#FFD700" : "#1E90FF"; // Gold for Red Kings, Blue for Black Kings

    // Create crown icon
    const crown = document.createElement("div");
    crown.classList.add("crown");
    piece.appendChild(crown);

    // Add animation
    crown.classList.add("crown-animation");
}
  
  // Update piece counts
function updatePieceCount() {
    const redPieces = document.querySelectorAll(".piece.red").length;
    const blackPieces = document.querySelectorAll(".piece.black").length;

    document.getElementById("red-count").textContent = redPieces;
    document.getElementById("black-count").textContent = blackPieces;
}

// Call updatePieceCount after capturing
function handleSquareClick(event) {
    if (!selectedPiece) return;

    const square = event.target;
    if (square.classList.contains("piece")) return;

    const oldSquare = selectedPiece.parentElement;
    const [oldRow, oldCol] = [parseInt(oldSquare.dataset.row), parseInt(oldSquare.dataset.col)];
    const [newRow, newCol] = [parseInt(square.dataset.row), parseInt(square.dataset.col)];

    if (isValidMove(oldRow, oldCol, newRow, newCol, selectedPiece)) {
        const jumpedPiece = getJumpedPiece(oldRow, oldCol, newRow, newCol);
        if (jumpedPiece) {
            jumpedPiece.remove();
            updatePieceCount(); // Update count when a piece is captured
        }

        square.appendChild(selectedPiece);
        selectedPiece.classList.remove("selected");
        clearMoveHints();
        checkKingPromotion(selectedPiece, newRow);
        switchTurn();
        selectedPiece = null;
    }
}

// Call updatePieceCount when the game starts or restarts
function restartGame() {
    turn = "red";
    selectedPiece = null;
    lastMove = null;
    turnDisplay.textContent = "Red";
    createBoard();
    updatePieceCount();
}

 const fetchingData = async () => {
    const url = `https://opentdb.com/api.php?amount=30&category=9&type=multiple&encode=url3986`;

    const response = await fetch(url);
    if (response) {
        const data = await response.json();
        questions = data.results.map((importedQuestion) => {
            const formattedQuestion = {
                question: importedQuestion.question,
                possible_answers: [
                    importedQuestion.correct_answer,
                    ...importedQuestion.incorrect_answers,
                ],
                correct_answer: importedQuestion.correct_answer,
                incorrect_answers: [...importedQuestion.incorrect_answers],
            };
            const answerChoices = [...formattedQuestion.incorrect_answers];
            randomNumber = Math.floor(Math.random() * 3) + 1;
            answerChoices.splice(
                randomNumber - 1,
                0,
                formattedQuestion.correct_answer
            );

            answerChoices.forEach((choice, index) => {
                formattedQuestion["choice" + (index + 1)] = choice;
            });
            return formattedQuestion;
        });
        startGame();
    }
};
const start = document.querySelector("#start");

start.addEventListener("click", fetchingData);
    
 const questions = [
    {
        question: "What is the derivative of sin(x)?",
        choices: ["A) cos(x)", "B) -sin(x)", "C) tan(x)", "D) -cos(x)"],
        answer: "A"
    },
    {
        question: "What is the chemical symbol for gold?",
        choices: ["A) Au", "B) Ag", "C) Pb", "D) Fe"],
        answer: "A"
    },
    {
        question: "True or False: The speed of light is approximately 300,000 km/s.",
        choices: ["True", "False"],
        answer: "True"
    },
    {
        question: "What is 12 × 12?",
        choices: ["A) 120", "B) 124", "C) 144", "D) 132"],
        answer: "C"
    },
    {
        question: "Which planet has the most moons?",
        choices: ["A) Mars", "B) Jupiter", "C) Saturn", "D) Neptune"],
        answer: "C"
    },
    {
        question: "What is the hardest naturally occurring mineral?",
        choices: ["A) Quartz", "B) Diamond", "C) Topaz", "D) Ruby"],
        answer: "B"
    },
    {
        question: "True or False: Sound travels faster in air than in water.",
        choices: ["True", "False"],
        answer: "False"
    },
    {
        question: "What is the square root of 256?",
        choices: ["A) 14", "B) 18", "C) 16", "D) 20"],
        answer: "C"
    },
    {
        question: "What is Newton’s First Law of Motion?",
        choices: [
            "A) An object at rest stays at rest unless acted upon by an external force.",
            "B) Force equals mass times acceleration.",
            "C) Every action has an equal and opposite reaction.",
            "D) The force of gravity is 9.8 m/s²."
        ],
        answer: "A"
    },
    {
        question: "True or False: Water boils at 90°C at sea level.",
        choices: ["True", "False"],
        answer: "False"
    }
];

// Function to show a random question
function askQuestion(callback) {
    const randomIndex = Math.floor(Math.random() * questions.length);
    const questionData = questions[randomIndex];

    const questionBox = document.createElement("div");
    questionBox.classList.add("question-popup");
    questionBox.innerHTML = `
        <p>${questionData.question}</p>
        ${questionData.choices.map(choice => `<button class="choice">${choice}</button>`).join("")}
    `;
    document.body.appendChild(questionBox);

    document.querySelectorAll(".choice").forEach(button => {
        button.addEventListener("click", function () {
            const answer = this.textContent.charAt(0);
            document.body.removeChild(questionBox);
            callback(answer === questionData.answer);
        });
    });
}

// Before moving a piece, ask a question
function handleSquareClick(event) {
    if (!selectedPiece) return;

    askQuestion(isCorrect => {
        if (!isCorrect) {
            alert("Incorrect! Your turn is skipped.");
            switchTurn();
            selectedPiece = null;
            return;
        }

        // If correct, proceed with moving
        const square = event.target;
        if (square.classList.contains("piece")) return;

        const oldSquare = selectedPiece.parentElement;
        const [oldRow, oldCol] = [parseInt(oldSquare.dataset.row), parseInt(oldSquare.dataset.col)];
        const [newRow, newCol] = [parseInt(square.dataset.row), parseInt(square.dataset.col)];

        if (isValidMove(oldRow, oldCol, newRow, newCol, selectedPiece)) {
            const jumpedPiece = getJumpedPiece(oldRow, oldCol, newRow, newCol);
            if (jumpedPiece) {
                jumpedPiece.remove();
                updatePieceCount();
            }

            square.appendChild(selectedPiece);
            selectedPiece.classList.remove("selected");
            clearMoveHints();
            checkKingPromotion(selectedPiece, newRow);
            switchTurn();
            selectedPiece = null;
        }
    });
}
});

const victoryMessage = document.getElementById("victory-message");
const winnerText = document.getElementById("winner-text");

// Check if a player has run out of pieces
function checkForWinner() {
    const redPieces = document.querySelectorAll(".piece.red").length;
    const blackPieces = document.querySelectorAll(".piece.black").length;

    if (redPieces === 0) {
        showVictoryMessage("Black Wins! 🎉");
    } else if (blackPieces === 0) {
        showVictoryMessage("Red Wins! 🎉");
    }
}

// Display victory message
function showVictoryMessage(winner) {
    winnerText.textContent = winner;
    victoryMessage.classList.remove("hidden");
}

// Call checkForWinner after every capture
function updatePieceCount() {
    const redPieces = document.querySelectorAll(".piece.red").length;
    const blackPieces = document.querySelectorAll(".piece.black").length;

    document.getElementById("red-count").textContent = redPieces;
    document.getElementById("black-count").textContent = blackPieces;

    checkForWinner();
}

// Restart game function
function restartGame() {
    victoryMessage.classList.add("hidden");
    turn = "red";
    selectedPiece = null;
    lastMove = null;
    turnDisplay.textContent = "Red";
    createBoard();
    updatePieceCount();
}

const questionContainer = document.getElementById("question-container");
const questionText = document.getElementById("question-text");
const questionChoices = document.getElementById("question-choices");

// Show a random question with a countdown timer
function showQuestion(callback) {
    const randomIndex = Math.floor(Math.random() * questions.length);
    const questionData = questions[randomIndex];

    questionText.textContent = questionData.question;
    questionChoices.innerHTML = "";
    countdownDisplay.textContent = timeLimit;

    questionData.choices.forEach(choice => {
        const button = document.createElement("button");
        button.textContent = choice;
        button.addEventListener("click", () => {
            clearInterval(countdown); // Stop timer when answered
            const selectedAnswer = button.textContent.charAt(0);
            questionContainer.classList.add("hidden");
            callback(selectedAnswer === questionData.answer);
        });
        questionChoices.appendChild(button);
    });

    questionContainer.classList.remove("hidden");

    // Start countdown timer
    let timeLeft = timeLimit;
    countdown = setInterval(() => {
        timeLeft--;
        countdownDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            questionContainer.classList.add("hidden");
            alert("Time's up! Your turn is skipped.");
            callback(false); // Treat as incorrect answer
        }
    }, 1000);
}

// Before moving a piece, ask a question with a timer
function handleSquareClick(event) {
    if (!selectedPiece) return;

    showQuestion(isCorrect => {
        if (!isCorrect) {
            switchTurn();
            selectedPiece = null;
            return;
        }

   // If correct, move the piece
        const square = event.target;
        if (square.classList.contains("piece")) return;

        const oldSquare = selectedPiece.parentElement;
        const [oldRow, oldCol] = [parseInt(oldSquare.dataset.row), parseInt(oldSquare.dataset.col)];
        const [newRow, newCol] = [parseInt(square.dataset.row), parseInt(square.dataset.col)];

        if (isValidMove(oldRow, oldCol, newRow, newCol, selectedPiece)) {
            const jumpedPiece = getJumpedPiece(oldRow, oldCol, newRow, newCol);
            if (jumpedPiece) {
                jumpedPiece.remove();
                updatePieceCount();
            }

            square.appendChild(selectedPiece);
            selectedPiece.classList.remove("selected");
            clearMoveHints();
            checkKingPromotion(selectedPiece, newRow);
            switchTurn();
            selectedPiece = null;
        }
    });
}

// Show a random question in the middle of the board
function showQuestion(callback) {
    const randomIndex = Math.floor(Math.random() * questions.length);
    const questionData = questions[randomIndex];

    questionText.textContent = questionData.question;
    questionChoices.innerHTML = "";
    countdownDisplay.textContent = timeLimit;

    questionData.choices.forEach(choice => {
        const button = document.createElement("button");
        button.textContent = choice;
        button.addEventListener("click", () => {
            clearInterval(countdown); // Stop timer when answered
            const selectedAnswer = button.textContent.charAt(0);
            questionContainer.classList.add("hidden");
            callback(selectedAnswer === questionData.answer);
        });
        questionChoices.appendChild(button);
    });

    questionContainer.classList.remove("hidden");

    // Start countdown timer
    let timeLeft = timeLimit;
    countdown = setInterval(() => {
        timeLeft--;
        countdownDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            questionContainer.classList.add("hidden");
            alert("Time's up! Your turn is skipped.");
            callback(false); // Treat as incorrect answer
        }
    }, 1000);
}

// Before moving a piece, ask a question in the middle of the board
function handleSquareClick(event) {
    if (!selectedPiece) return;

    showQuestion(isCorrect => {
        if (!isCorrect) {
            switchTurn();
            selectedPiece = null;
            return;
        }

        // If correct, move the piece
        const square = event.target;
        if (square.classList.contains("piece")) return;

        const oldSquare = selectedPiece.parentElement;
        const [oldRow, oldCol] = [parseInt(oldSquare.dataset.row), parseInt(oldSquare.dataset.col)];
        const [newRow, newCol] = [parseInt(square.dataset.row), parseInt(square.dataset.col)];

        if (isValidMove(oldRow, oldCol, newRow, newCol, selectedPiece)) {
            const jumpedPiece = getJumpedPiece(oldRow, oldCol, newRow, newCol);
            if (jumpedPiece) {
                jumpedPiece.remove();
                updatePieceCount();
            }

            square.appendChild(selectedPiece);
            selectedPiece.classList.remove("selected");
            clearMoveHints();
            checkKingPromotion(selectedPiece, newRow);
            switchTurn();
            selectedPiece = null;
        }
    });
}

// Show a question in the middle, with a countdown timer on the right
function showQuestion(callback) {
    const randomIndex = Math.floor(Math.random() * questions.length);
    const questionData = questions[randomIndex];

    questionText.textContent = questionData.question;
    questionChoices.innerHTML = "";
    countdownDisplay.textContent = timeLimit;
    timerContainer.style.display = "block"; // Show timer

    questionData.choices.forEach(choice => {
        const button = document.createElement("button");
        button.textContent = choice;
        button.addEventListener("click", () => {
            clearInterval(countdown); // Stop timer when answered
            const selectedAnswer = button.textContent.charAt(0);
            questionContainer.classList.add("hidden");
            timerContainer.style.display = "none"; // Hide timer
            callback(selectedAnswer === questionData.answer);
        });
        questionChoices.appendChild(button);
    });

    questionContainer.classList.remove("hidden");

    // Start countdown timer
    let timeLeft = timeLimit;
    countdown = setInterval(() => {
        timeLeft--;
        countdownDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            questionContainer.classList.add("hidden");
            timerContainer.style.display = "none"; // Hide timer
            alert("Time's up! Your turn is skipped.");
            callback(false); // Treat as incorrect answer
        }
    }, 1000);
}

const timerContainer = document.getElementById("timer-container");
const countdownDisplay = document.getElementById("countdown");

let countdown;  // Timer interval reference
const timeLimit = 10; // 10 seconds to answer

function updateTimerDisplay(timeLeft) {
    countdownDisplay.textContent = timeLeft;

    // Change color based on remaining time
    if (timeLeft <= 3) {
        countdownDisplay.style.color = "red"; // Critical warning
    } else if (timeLeft <= 5) {
        countdownDisplay.style.color = "orange"; // Caution
    } else {
        countdownDisplay.style.color = "yellow"; // Normal
    }
}

function startTimer(callback) {
    let timeLeft = timeLimit;

    // Ensure timer starts at 10 seconds and updates every second
    updateTimerDisplay(timeLeft);
    clearInterval(countdown); // Stop any existing timers to prevent issues

    countdown = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(countdown);
            timerContainer.style.display = "none"; // Hide timer
            questionContainer.classList.add("hidden"); // Hide question box
            alert("Time's up! Your turn is skipped.");
            callback(false); // Treat as incorrect answer
        }
    }, 1000); // Runs every second
}

function showQuestion(callback) {
    const randomIndex = Math.floor(Math.random() * questions.length);
    const questionData = questions[randomIndex];

    questionText.textContent = questionData.question;
    questionChoices.innerHTML = "";
    countdownDisplay.textContent = timeLimit;
    timerContainer.style.display = "block"; // Show timer

    questionData.choices.forEach(choice => {
        const button = document.createElement("button");
        button.textContent = choice;
        button.addEventListener("click", () => {
            clearInterval(countdown); // Stop timer when answered
            timerContainer.style.display = "none"; // Hide timer
            questionContainer.classList.add("hidden"); // Hide question box
            callback(button.textContent.charAt(0) === questionData.answer);
        });
        questionChoices.appendChild(button);
    });

    questionContainer.classList.remove("hidden");
    startTimer(callback); // Now the timer starts correctly!
}
