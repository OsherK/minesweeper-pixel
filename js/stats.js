'use strict';


function setTimer() {
    gTimerInterval = setInterval(() => {
        gGame.secsPassed++;
        var num = gGame.secsPassed;
        var strHtml = getAsImgNum(num);
        var elTimer = document.querySelector('.timer');
        elTimer.innerHTML = strHtml;
    }, 1000);
}

//choose difficulty, the default is easy

function setDifficulty(diff) {
    if (gTimerInterval || !gGame.isOn) return;
    if (diff === 3) {
        if (!gGame.isPlacingMines) {
            gLevel = gDifficulties[3];
            gBoard = createBoard(gLevel.size);
            renderBoard(gBoard);
            gGame.isPlacingMines = true;
        } else {
            gGame.isPlacingMines = false;
        }
        setModal();
        return;
    }
    gLevel = gDifficulties[diff];
    gBoard = createBoard(gLevel.size);
    renderBoard(gBoard);
    gGame.isPlacingMines = false;
    setModal();
}

function resetTimer() {
    var elTimer = document.querySelector('.timer');
    var strHtml = '';
    for (var i = 0; i < 3; i++) {
        strHtml += `<img src="img/numbers/0.png">`;
    }
    elTimer.innerHTML = strHtml;
}



function lifeLost(i, j, elCell) {
    gRestartBtn.innerText = OUCH;
    gGame.isOn = false;
    setTimeout(() => {
        gRestartBtn.innerText = GAME_ON;
        var currCell = gBoard[i][j];
        currCell.isShown = false;
        elCell.classList.remove('clickedBomb');
        gGame.isOn = true;
        hideCell(i, j);
    }, 1000);
}


function addHearts() {
    console.log(gGame.livesLeft);
    var strHtml = 'Lives Left:<br>';
    for (var i = 0; i < gGame.livesLeft; i++) {
        strHtml += HEART;
    }
    for (var i = gGame.livesLeft; i < 3; i++) {
        strHtml += HEART_BROKEN;
    }
    document.querySelector('.lives').innerHTML = strHtml;
}

function printHighscore() {
    var strHtml = 'Highscores:<br>';
    var difficulties = ['easy', 'normal', 'hard']
    for (var i = 0; i < difficulties.length; i++) {
        var diff = difficulties[i];
        if (localStorage.getItem(diff)) strHtml += `${diff}: ${getAsImgNum( localStorage.getItem(diff))}<br>`;
    }
    document.querySelector('.highscore').innerHTML = strHtml;
}

function getAsImgNum(num) {
    var strHtml = '';
    for (var i = 0; i < 3; i++) {
        strHtml = `<img src="img/numbers/${num % 10}.png">` + strHtml;
        num = Math.floor(num / 10);
    }
    return strHtml;
}

function setModal() {
    var strHtml = '';
    strHtml = `Minesweeper:\n difficulty: ${gLevel.diff}\n mines: ${gLevel.mines}`;
    gModalText.innerText = strHtml;
}