const wordLength = 5;
const maxAttempts = 5;
let chosenWord = "";
let remainingTime;
let currentRow = 0;
let wordList = [];
let winningStreak = 0; // Αρχική τιμή για το streak
let wordRevealed = false; // Νέα κατάσταση για αποκάλυψη λέξης
let timerInterval; // Μεταβλητή για αποθήκευση του ID του setInterval
const dailyGameLimit = 10; // Μέγιστο παιχνίδια ανά ημέρα
let gamesPlayedToday = 0;

// Έλεγχος αν τοπικά υπάρχει αποθηκευμένο το gamesPlayedToday
if (localStorage.getItem("gamesPlayedToday")) {
    gamesPlayedToday = parseInt(localStorage.getItem("gamesPlayedToday"));
}

// Επαναφορά ορίου ημερήσιας χρήσης τα μεσάνυχτα
const lastPlayedDate = localStorage.getItem("lastPlayedDate");
const today = new Date().toISOString().split("T")[0];
if (lastPlayedDate !== today) {
    gamesPlayedToday = 0;
    localStorage.setItem("gamesPlayedToday", gamesPlayedToday);
    localStorage.setItem("lastPlayedDate", today);
}


// Φόρτωση του winning streak από το localStorage κατά την εκκίνηση
if (localStorage.getItem("winningStreak")) {
    winningStreak = parseInt(localStorage.getItem("winningStreak"));
}

// Fetch words from the JSON file
fetch("WordsArray3103.json")
    .then(response => response.json())
    .then(data => {
        wordList = data.words.map(word => word.replace(/\"|,/g, "").toUpperCase());
        console.log("Words loaded:", wordList);
    })
    .catch(error => console.error("Error loading words:", error));

// Initialize game
document.getElementById("start-game").addEventListener("click", startGame);
document.getElementById("try-again").addEventListener("click", () => {
    location.reload(); // Επιστροφή στην αρχική σελίδα
});


function startGame() {
    if (gamesPlayedToday >= dailyGameLimit) {
        showDailyLimitMessage();
        return;
    }

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

    // Εμφάνιση του "Press Enter to Continue" από την αρχή
    document.getElementById("continue-instruction").style.display = "block";
}



function startTimer() {
    const timerDisplay = document.getElementById("timer-display");

    // Εκκίνηση νέου χρονόμετρου
    timerInterval = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(timerInterval); // Διακοπή όταν ο χρόνος λήξει
            endGame(false);
        } else {
            remainingTime--;
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }
    }, 1000);
}
function showDailyLimitMessage() {
    document.querySelector(".instructions").classList.add("hidden");
    document.getElementById("game-board").classList.add("hidden");
    document.getElementById("game-over").classList.add("hidden");
    document.getElementById("daily-limit-reached").classList.remove("hidden");
}

function setupGameBoard() {
    const gridContainer = document.getElementById("word-grid-container");
    gridContainer.innerHTML = "";

    // Δημιουργία της γραμμής Hint (πάνω-πάνω)
    const hintRow = document.createElement("div");
    hintRow.className = "hint-row";

    for (let j = 0; j < wordLength; j++) {
        const cell = document.createElement("div");
        cell.className = "word-cell";
        cell.id = `hint-cell-${j}`;

        const img = document.createElement("img");
        if (j === 2) {
            // Εμφάνιση του 3ου γράμματος της λέξης
            img.src = `assets/keys/Blue${chosenWord[j]}.jpg`;
            img.alt = chosenWord[j];
        } else {
            // Κάλυψη με ερωτηματικό
            img.src = "assets/keys/BlueQM.jpg";
            img.alt = "?";
        }
        img.style.width = "55px";
        img.style.height = "42px";
        cell.appendChild(img);
        hintRow.appendChild(cell);
    }
    gridContainer.appendChild(hintRow);

    // Δημιουργία του κύριου πλέγματος (grid)
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

let currentWord = "";

function addLetter(letter) {
    if (currentWord.length < wordLength) {
        currentWord += letter;
        const cell = document.getElementById(`cell-${currentRow}-${currentWord.length - 1}`);
        cell.textContent = letter;

        // Το "Press Enter to Continue" παραμένει ορατό
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
    if (wordRevealed) {
        endGame(currentWord === chosenWord); // Επιστροφή με το σωστό αποτέλεσμα
        return;
    }
    if (currentWord.length !== wordLength) {
        return; // Αν η λέξη δεν έχει το σωστό μήκος, επιστροφή
    }

    const cells = [];
    for (let i = 0; i < wordLength; i++) {
        cells.push(document.getElementById(`cell-${currentRow}-${i}`));
    }

    // Έλεγχος λέξης
    checkWord(currentWord, cells);

    // Εμφάνιση του μηνύματος "Press Enter to Continue"
    document.getElementById("continue-instruction").style.display = "block";

    if (currentWord === chosenWord) {
        endGame(true); // Ο χρήστης κέρδισε
        return;
    }

    currentRow++;
    currentWord = "";

    if (currentRow === maxAttempts) {
        endGame(false); // Ο χρήστης έχασε
    }
}




function checkWord(guessedWord, cells) {
    for (let i = 0; i < wordLength; i++) {
        const letter = guessedWord[i];
        let imagePath = "";

        if (letter === chosenWord[i]) {
            imagePath = `assets/keys/Blue${letter}.jpg`;
        } else if (chosenWord.includes(letter)) {
            imagePath = `assets/keys/Green${letter}.jpg`;
        } else {
            imagePath = `assets/keys/Gray${letter}.jpg`;
        }

        const img = document.createElement("img");
        img.src = imagePath;
        img.alt = letter;
        img.style.width = "55px"; // Νέο πλάτος
        img.style.height = "42px"; // Νέο ύψος
        cells[i].innerHTML = "";
        cells[i].appendChild(img);
    }
}


function endGame(won) {
    clearInterval(timerInterval); // Σταμάτημα του χρονόμετρου

    // Αν δεν έχει ήδη εμφανιστεί η απάντηση
    if (!wordRevealed) {
        for (let j = 0; j < wordLength; j++) {
            const cell = document.getElementById(`hint-cell-${j}`);
            cell.innerHTML = ""; // Καθαρισμός περιεχομένου
            const img = document.createElement("img");
            img.src = `assets/keys/Blue${chosenWord[j]}.jpg`;
            img.alt = chosenWord[j];
            img.style.width = "55px";
            img.style.height = "42px";
            cell.appendChild(img);
        }
        wordRevealed = true; // Ενημέρωση ότι η λέξη αποκαλύφθηκε
        document.getElementById("continue-instruction").style.display = "block"; // Εμφάνιση οδηγίας "Press Enter to Continue"
        return; // Αναμονή για πάτημα Enter
    }

    // Απόκρυψη του πίνακα παιχνιδιού
    document.getElementById("game-board").classList.add("hidden");

    // Εμφάνιση του αποτελέσματος
    const gameOver = document.getElementById("game-over");
    gameOver.classList.remove("hidden");

    // Επιλογή της σωστής εικόνας και μηνύματος
    const imageDiv = document.getElementById("game-over-image");
    const img = document.createElement("img");
    img.src = won ? "assets/states/LicCongratsEdt.jpg" : "assets/states/LicSorryEdt.jpg";
    img.alt = won ? "Congratulations!" : "Game Over";
    imageDiv.innerHTML = ""; // Καθαρισμός προηγούμενης εικόνας
    imageDiv.appendChild(img);

    // Ενημέρωση Winning Streak
    if (won) {
        winningStreak++;
    } else {
        winningStreak = 0;
    }
    localStorage.setItem("winningStreak", winningStreak);

    // Εμφάνιση αποτελεσμάτων
    const elapsedMinutes = Math.floor((parseInt(document.getElementById("timer").value) * 60 - remainingTime) / 60);
    const elapsedSeconds = (parseInt(document.getElementById("timer").value) * 60 - remainingTime) % 60;

    const results = document.getElementById("game-results");
    results.innerHTML = `
        <p>Your Timer Was Set At: ${parseInt(document.getElementById("timer").value)}:00</p>
        <p>Time Elapsed Was: ${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, "0")}</p>
        <p>Number Of Guesses Used: ${currentRow}</p>
        <p>Your Winning Streak: ${winningStreak}</p>
    `;
}

document.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && wordRevealed) {
        endGame(false); // Ή true αν χρειάζεται να περάσει η νίκη
    }
});






function getRandomWord() {
    return wordList[Math.floor(Math.random() * wordList.length)];
}
