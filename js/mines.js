'use strict';
//reveals all mines, called on game over
function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) {
                var elCell = document.querySelector(`#cell${i}-${j}`);
                elCell.innerHTML = MINE;
            }
        }
    }
}

//placing mines on first click
function placeMines(i, j, count) {
    var empties = getAllEmpties(gBoard, i, j);
    for (var i = 0; i < count; i++) {
        var cellChosen = empties.splice(getRandomInteger(0, empties.length - 1), 1);
        gBoard[cellChosen[0].i][cellChosen[0].j].isMine = true;
    }
    setMinesNegsCount();
}


//Counts how many mines are placed around each cell
function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine === false) countNegs(i, j);
        }
    }
}

function placeMineManual(i, j) {
    var currCell = gBoard[i][j];
    currCell.isMine = !currCell.isMine;
    (currCell.isMine) ? gLevel.mines++: gLevel.mines--;
    renderCell(gBoard, i, j);
    setTimeout(() => {
        hideCell(i, j);
    }, 1000);
}

function countProperty(key) {
    var count = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j][key]) count++;
        }
    }
    return count;
}