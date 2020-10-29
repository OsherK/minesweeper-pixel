'use strict';


function useHint(elCell) {
    if (gGame.hintOn || elCell.dataset.used === 'true' || !gGame.isOn) return;
    gGame.hintOn = true;
    elCell.dataset.used = 'true';
    elCell.src = USED_HINT;
}


function createHints() {
    var elHints = document.querySelector('.hints');
    var strHtml = '';
    for (var i = 0; i < 3; i++) {
        strHtml += `<img data-used="false" onclick="useHint(this)" src=${UN_USED_HINT} id="hint${i+1}">`;
    }
    elHints.innerHTML = strHtml;
}


function safeClick() {
    if (!gGame.isOn) return;
    saveState();
    if (gGame.safeClicks <= 0) return;
    var empties = getAllEmpties(gBoard);
    var chosenCell = empties.splice(getRandomInteger(0, empties.length), 1)[0];
    var elCell = document.querySelector(`#cell${chosenCell.i}-${chosenCell.j}`);
    elCell.classList.add('safeClick');
    gGame.safeClicks--;
    document.querySelector('.safe').innerText = `Safe clicks left: ${gGame.safeClicks}`;
    setTimeout(() => {
        elCell.classList.remove('safeClick');
    }, 1000 * 2.5)
}


function undo() {
    if (!gGame.isOn || !gGameStates.length) return;
    var gameState = gGameStates.pop();
    console.log(gGameStates);
    console.log(gameState);
    gGame = Object.assign({}, gameState[0]);
    gBoard = copy2DArr(gameState[1]);
    // debugger;
    renderBoard(gBoard);
    addHearts();
    document.querySelector('.safe').innerText = `Safe clicks left: ${gGame.safeClicks}`

}