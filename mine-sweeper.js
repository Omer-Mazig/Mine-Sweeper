//'use strict' ? (SyntaxError: Octal literals are not allowed in strict mode. (at mine-sweeper.js:20:13))
var gBoard

var gGame = {
    isReady: true,
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
var gLevel = {
    size: 4,
    mines: 2
}
var gMinesPlace = 2
const MINE = '*'
const FLAG = 'P'

var gSeconds = 00;
var gTens = 000;
var elTens = document.querySelector('.tens')
var elSeconds = document.querySelector('.seconds')
var gInterval;

function initGame() {
    gBoard = buildBoard()
    renderBoard(gBoard)
    resetClock()
    gGame.isReady = true
    gGame.isOn = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    console.table(gBoard);
}

function setLevel(level, mines, elBtn) {
    gLevel.size = Math.sqrt(level)
    gLevel.mines = mines
    gMinesPlace = mines
    var elBtns = document.querySelectorAll('.diff-btn')
    for (var i = 0; i < elBtns.length; i++) {
        if (elBtns[i].classList.contains('active-btn')) {
            elBtns[i].classList.remove('active-btn')
        }
    }
    elBtn.classList.add('active-btn')
    initGame()
}

function buildBoard() {
    var board = []
    var cell = {}
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell
        }
    }
    while (gMinesPlace > 0) {
        var currMineCell = board[getRandomInt(0, gLevel.size)][getRandomInt(0, gLevel.size)]
        if (!currMineCell.isMine) {
            currMineCell.isMine = true
            gMinesPlace--
        }
    }
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            currCell.minesAroundCount = setMinesNegsCount(board, i, j)
        }
    }
    return board
}


function setMinesNegsCount(board, rowIdx, colIdx) {
    var minesNegsCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue

            var currCell = board[i][j]
            if (currCell.isMine) minesNegsCount++
        }
    }
    return minesNegsCount
}


function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            if (currCell.isShown && !currCell.isMine) {
                var cell = setMinesNegsCount(board, i, j)
            } else {
                cell = ''
            }
            if (currCell.isShown && currCell.isMine) cell = MINE

            if (currCell.isMarked) cell = FLAG


            strHTML += `<td class="cell"
            data-i="${i}" data-j="${j}"
            onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellRightClicked(this,${i},${j})">${cell}
            </td>`

        }
        strHTML += `</tr>`
    }
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function expandShown(board, elCell, rowIdx, colIdx) {
    // console.log(elCell.dataset);
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue

            // var elCurrCell = elCell
            var currCell = board[i][j]
            if (!currCell.isShown && !currCell.isMarked) {
                currCell.isShown = true
                gGame.shownCount++
                // expandShown()
            }
        }
    }
}



function onCellClicked(elCell, i, j) {
    if (!gGame.isReady) return
    runClock()
    gGame.isOn = true
    var clickedCell = gBoard[i][j]
    if (clickedCell.isMarked || clickedCell.isShown) return
    if (clickedCell.isMine) checkDefeat()
    if (clickedCell.minesAroundCount === 0) {
        var i = +elCell.dataset.i
        var j = +elCell.dataset.j
        expandShown(gBoard, elCell, i, j)
    } else {
        clickedCell.isShown = true
        gGame.shownCount++
    }
    checkWin()
    renderBoard(gBoard)
}

function onCellRightClicked(elCell, i, j) {
    document.addEventListener('contextmenu',
        event => event.preventDefault());
    if (!gGame.isReady) return
    runClock()
    gGame.isOn = true
    var clickedCell = gBoard[i][j]
    if (clickedCell.isShown) return
    if (!clickedCell.isMarked) {
        clickedCell.isMarked = true
        gGame.markedCount++
    } else {
        clickedCell.isMarked = false
        gGame.markedCount--
    }
    checkWin()
    renderBoard(gBoard)
}


function checkDefeat() {
    gGame.isOn = false
    gGame.isReady = false
    stopClock()
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine) currCell.isShown = true
        }
    }
    alert('defeat')
}

function checkWin() {
    console.log(gGame.shownCount);
    if (gGame.shownCount === (gLevel.size * gLevel.size) - gLevel.mines &&
        gGame.markedCount === gLevel.mines) {
        gGame.isOn = false
        gGame.isReady = false
        stopClock()
        alert('win!')
    }
}



function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}




function cellMarked(elCell) {

}


function runClock() {
    clearInterval(gInterval);
    gInterval = setInterval(startTimer, 10);
}

function stopClock() {
    clearInterval(gInterval);
}

function resetClock() {
    clearInterval(gInterval);
    gTens = '00';
    gSeconds = '00';
    elTens.innerHTML = gTens;
    elSeconds.innerHTML = gSeconds;
}

function startTimer() {
    gTens++
    if (gTens <= 9) {
        elTens.innerHTML = '0' + gTens;
    }
    if (gTens > 9) {
        elTens.innerHTML = gTens;
    }
    if (gTens > 99) {
        gSeconds++;
        elSeconds.innerHTML = '0' + gSeconds;
        gTens = 0;
        elTens.innerHTML = '00' + 0;
    }
    if (gSeconds > 9) {
        elSeconds.innerHTML = gSeconds;
    }
}





// function revealNegs(rowIdx, colIdx) {
//     for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//         if (i < 0 || i >= gBoard.length) continue

//         for (var j = colIdx - 1; j <= colIdx + 1; j++) {
//             if (j < 0 || j >= gBoard[0].length) continue

//             var currCell = gBoard[i][j]
//             if (!currCell.isShown && !currCell.isMarked) {
//                 currCell.isShown = true
//                 gGame.shownCount++
//             }
//         }
//     }

// }