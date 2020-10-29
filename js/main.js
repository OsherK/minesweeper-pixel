'use strict';

const MINE = '<img src ="img/mine.png">',
    USED_HINT = 'img/hintUsed.png',
    UN_USED_HINT = 'img/hintUnused.png',
    FLAG = '<img src ="img/flag.png">',
    HEART = '<img src="img/heart.png">',
    HEART_BROKEN = '<img src="img/heartLost.png">',
    GAME_ON = '😀',
    GAME_OVER = '😭',
    GAME_WON = '😎',
    OUCH = '😫',
    TREE = '<img src="img/tree.png">';


var gBoard,
    gLevel,
    gGame,
    gTimerInterval,
    gDifficulties,
    gRestartBtn,
    gGameOverSound,
    gElLives,
    gGameStates,
    gModalText;


//sets the board
function init() {
    gModalText = document.querySelector('#modalText');
    resetTimer();
    gGameStates = [];
    gElLives = document.querySelector('.lives');
    gElLives.innerHTML = 'Lives left: 3';
    clearInterval(gTimerInterval);
    gTimerInterval = null;
    gDifficulties = [{ size: 4, mines: 2, diff: 'easy' }, { size: 8, mines: 12, diff: 'normal' },
        { size: 12, mines: 30, diff: 'hard' }, { size: 12, mines: 0, diff: 'manual' }
    ]
    gLevel = { size: 4, mines: 2, diff: 'easy' }
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        hintOn: false,
        livesLeft: 3,
        safeClicks: 3,
        isPlacingMines: false
    }
    printHighscore();
    gBoard = createBoard(gLevel.size);
    renderBoard(gBoard);
    createHints();
    gRestartBtn = document.querySelector('.restart');
    gRestartBtn.innerText = GAME_ON;
    document.querySelector('.safe').innerText = `Safe clicks left: ${gGame.safeClicks}`;
    addHearts();
    setModal();
}

//creates the board mat
function createBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                isShown: false,
                isMine: false,
                isMarked: false,
                negsCount: 0,
                i,
                j
            }
        }
    }
    return board;
}



//Cell left clicked
function cellClicked(elCell, i, j, event) {
    //don't start if the game is over!
    if (!gGame.isOn) return;
    //If the player is currently placing mines, 
    if (gGame.isPlacingMines) {
        if (event.button) return;
        placeMineManual(i, j);
        return;
    }
    //if the player used a hint:
    if (gGame.hintOn) {
        revealNegs(gBoard, i, j);
        gGame.hintOn = false;
        return;
    }
    //on the first click, places the mines and starts the game.
    if (!gTimerInterval) {
        setTimer();
        if (gLevel.diff === 'manual') setMinesNegsCount();
        else placeMines(i, j, gLevel.mines);
        gGame.isOn = true;
    }
    saveState();
    var currCell = gBoard[i][j];
    (event.button) ? cellMarked(elCell, currCell): expandShown(elCell, currCell);
}


//Cell right clicked
function cellMarked(elCell, currCell) {
    if (currCell.isShown) return;
    if (currCell.isMarked) {
        currCell.isMarked = false;
        gGame.markedCount--;
        elCell.classList.remove('revealed');
        hideCell(currCell.i, currCell.j);
    } else {
        currCell.isMarked = true;
        renderCell(gBoard, currCell.i, currCell.j);
        gGame.markedCount++;
        checkVictory();
    }
}

//Shows the content of the clicked cell(if it's not a mine)
function expandShown(elCell, currCell) {
    //if the cell has already been clicked: stop
    if (currCell.isMarked || currCell.isShown) return;
    currCell.isShown = true;
    if (currCell.isMine) {
        new Audio('sfx/wrong.mp3').play();
        elCell.classList.add('clickedBomb');
        gGame.livesLeft--;
        addHearts();
        (gGame.livesLeft) ? lifeLost(currCell.i, currCell.j, elCell): gameOver(elCell);
    } else {
        gGame.shownCount++;
        if (currCell.negsCount === 0) {
            for (var i = currCell.i - 1; i <= currCell.i + 1; i++) {
                if (i < 0 || i >= gBoard.length) continue;
                for (var j = currCell.j - 1; j <= currCell.j + 1; j++) {
                    if (j < 0 || j >= gBoard[0].length || gBoard[i][j].isMine) continue;
                    var elNegCell = document.querySelector(`#cell${i}-${j}`);
                    expandShown(elNegCell, gBoard[i][j]);
                }
            }
        }
    }
    checkVictory();
    renderCell(gBoard, currCell.i, currCell.j);
}


function gameOver() {
    gRestartBtn.innerText = GAME_OVER;
    gGame.isOn = false;
    console.log('Game over!');
    clearInterval(gTimerInterval);
    revealMines();
}

function checkVictory() {
    if (gLevel.mines === gGame.markedCount &&
        gGame.markedCount + gGame.shownCount === gLevel.size ** 2) {
        var diff = gLevel.diff;
        //if your current score is your highest one or if you did not have a previous score, set the current one as highscore
        if (!localStorage.getItem(diff) || localStorage.getItem(diff) > gGame.secsPassed) localStorage.setItem(gLevel.diff, gGame.secsPassed);
        gRestartBtn.innerText = GAME_WON;
        gGame.isOn = false;
        clearInterval(gTimerInterval);
        gModalText.innerText = `You won!\n it took you ${gGame.secsPassed} seconds.`;
        document.querySelector('.undo').style.display = 'none';
    }
}

function saveState() {
    gGameStates.push([Object.assign({}, gGame), copy2DArr(gBoard)]);
    console.log(gGameStates[gGameStates.length - 1]);
}

function restart() {
    document.querySelector('.undo').style.display = '';
    resetTimer();
    gGameStates = [];
    gElLives = document.querySelector('.lives');
    gElLives.innerHTML = 'Lives left: 3';
    clearInterval(gTimerInterval);
    gTimerInterval = null;
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        hintOn: false,
        livesLeft: 3,
        safeClicks: 3,
        isPlacingMines: false
    }
    printHighscore();
    gBoard = createBoard(gLevel.size);
    renderBoard(gBoard);
    createHints();
    gRestartBtn = document.querySelector('.restart');
    gRestartBtn.innerText = GAME_ON;
    document.querySelector('.safe').innerText = `Safe clicks left: ${gGame.safeClicks}`;
    addHearts();
    setModal();
}