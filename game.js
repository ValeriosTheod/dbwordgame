const wordLength = 5;
const maxAttempts = 5;
let chosenWord = "";
let remainingTime;
let currentRow = 0;
let wordList = [];
let winningStreak = 0;
let wordRevealed = false;
let timerInterval;
const dailyGameLimit = 5;
let gamesPlayedToday = 0;

if (localStorage.getItem("gamesPlayedToday")) {
    gamesPlayedToday = parseInt(localStorage.getItem("gamesPlayedToday"));
}

const lastPlayedDate = localStorage.getItem("lastPlayedDate");
const today = new Date().toISOString().split("T")[0];
if (lastPlayedDate !== today) {
    gamesPlayedToday = 0;
    localStorage.setItem("gamesPlayedToday", gamesPlayedToday);
    localStorage.setItem("lastPlayedDate", today);
}

if (localStorage.getItem("winningStreak")) {
    winningStreak = parseInt(localStorage.getItem("winningStreak"));
}

fetch("WordsArray3103.json")
    .then(response => response.json())
    .then(data => {
        wordList = data.words.map(word => word.replace(/\"|,/g, "").toUpperCase());
        console.log("Words loaded:", wordList);
    })
    .catch(error => console.error("Error loading words:", error));

function isTouchDevice() {
    return ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

document.addEventListener("DOMContentLoaded", () => {
    if (isTouchDevice()) {
        document.getElementById("virtual-keyboard").style.display = "none";
        document.addEventListener("keydown", (event) => {
            const key = event.key.toUpperCase();
            if (key === "BACKSPACE") {
                removeLetter();
            } else if (key === "ENTER") {
                submitWord();
            } else if (/^[A-Z]$/.test(key)) {
                addLetter(key);
            }
        });
    }

    document.getElementById("start-game").addEventListener("click", startGame);
    document.getElementById("try-again").addEventListener("click", () => {
        location.reload();
    });
});

function startGame() {
    if (gamesPlayedToday >= dailyGameLimit) {
        showDailyLimitMessage();
        return;
    }

    gamesPlayedToday++;
    localStorage.setItem("gamesPlayedToday", gamesPlayedToday);

    const timerSelect = document.getElementById("timer");
    remainingTime = parseInt(timerSelect.value) * 60;

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    chosenWord = getRandomWord().toUpperCase();
    console.log("Chosen Word:", chosenWord);

    setupGameBoard();
    document.getElementById("game-board").classList.remove("hidden");
    document.querySelector(".instructions").classList.add("hidden");
    startTimer();
}

function setupGameBoard() {
    const gridContainer = document.getElementById("word-grid-container");
    gridContainer.innerHTML = "";

    const hintRow = document.createElement("div");
    hintRow.className = "hint-row";

    for (let j = 0; j < wordLength; j++) {
        const cell = document.createElement("div");
        cell.className = "word-cell";
        cell.id = `hint-cell-${j}`;

        const img = document.createElement("img");
        if (j === 2) {
            img.src = `assets/keys/Blue${chosenWord[j]}.jpg`;
            img.alt = chosenWord[j];
        } else {
            img.src = "assets/keys/BlueQM.jpg";
            img.alt = "?";
        }
        img.style.width = "55px";
        img.style.height = "42px";
        cell.appendChild(img);
        hintRow.appendChild(cell);
    }
    gridContainer.appendChild(hintRow);

    const mainGrid = document.createElement("div");
    mainGrid.id = "main-grid";
    mainGrid.className = "grid";
    for (let i = 0; i < maxAttempts; i++) {
        for (let j = 0; j < wordLength; j++) {
            const cell = document.createElement("div");
            cell.className = "word-cell";
            cell.id = `cell-${i}-${j}`;
            mainGrid.appendChild(cell);
        }
    }
    gridContainer.appendChild(mainGrid);

    setupKeyboard();
}

function setupKeyboard() {
    const keyboard = document.getElementById("virtual-keyboard");
    keyboard.innerHTML = "";

    const rows = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Backspace"],
        ["Z", "X", "C", "V", "B", "N", "M", "Enter"]
    ];

    rows.forEach((row) => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";
        row.forEach((key) => {
            const keyButton = document.createElement("button");

            if (key === "Backspace") {
                keyButton.innerHTML = "&#x232b;";
                keyButton.addEventListener("click", () => removeLetter());
            } else if (key === "Enter") {
                keyButton.innerHTML = "&#x21b5;";
                keyButton.addEventListener("click", submitWord);
            } else {
                keyButton.textContent = key;
                keyButton.addEventListener("click", () => addLetter(key));
            }

            keyButton.dataset.letter = key;
            if (key === "Enter" || key === "Backspace") {
                keyButton.classList.add("special-key");
            }

            rowDiv.appendChild(keyButton);
        });
        keyboard.appendChild(rowDiv);
    });
}

function addLetter(letter) {
    if (currentWord.length < wordLength) {
        currentWord += letter;
        const cell = document.getElementById(`cell-${currentRow}-${currentWord.length - 1}`);
        cell.textContent = letter;
    }
}

function removeLetter() {
    if (currentWord.length > 0) {
        const cell = document.getElementById(`cell-${currentRow}-${currentWord.length - 1}`);
        cell.textContent = "";
        currentWord = currentWord.slice(0, -1);
    }
}

function submitWord() {
    if (currentWord.length !== wordLength) {
        return;
    }

    const cells = [];
    for (let i = 0; i < wordLength; i++) {
        cells.push(document.getElementById(`cell-${currentRow}-${i}`));
    }

    checkWord(currentWord, cells);

    if (currentWord === chosenWord) {
        endGame(true);
        return;
    }

    currentRow++;
    currentWord = "";

    if (currentRow === maxAttempts) {
        endGame(false);
    }
}

function endGame(won) {
    clearInterval(timerInterval);
    const gameOver = document.getElementById("game-over");
    gameOver.classList.remove("hidden");

    if (won) {
        document.getElementById("game-results").textContent = "You Win!";
    } else {
        document.getElementById("game-results").textContent = "You Lose!";
    }
}
