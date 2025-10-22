"use strict"
const gLevel = {
    size: 4,
    minesCount: 2,
}
const gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    cellsToReveal: 0,
    correctFlags: 0,
}
var gBoard

function onInit() {
    gGame.cellsToReveal = gLevel.size ** 2 - gLevel.minesCount
    gGame.correctFlags = 0
    gGame.revealedCount = 0
    gGame.markedCount = 0
    gGame.secsPassed - 0

    gBoard = buildBoard()
    const mineLocations = getRandomMineLocations(gBoard)
    setMines(mineLocations, gBoard)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
}
function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.size; i++) {
        board.push([])
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j] = createCell()
        }
    }
    return board
}

function renderBoard(board) {
    const elBoard = document.querySelector(".board")
    var strHTML = ""

    for (var i = 0; i < board.length; i++) {
        strHTML += "<tr>\n"
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            if (currCell.isMine) {
                if (currCell.isRevealed) {
                    strHTML += `<td class="cell mine" data-i="${i}" data-j="${j}" onclick="onCellClicked(this,${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j},event)">💣</td>`
                } else {
                    strHTML += `<td class="cell mine hidden" data-i="${i}" data-j="${j}" onclick="onCellClicked(this,${i}, ${j})"oncontextmenu="onCellMarked(this, ${i}, ${j},event)"></td>`
                }
            } else {
                if (currCell.isRevealed) {
                    strHTML += `<td class="cell" data-i="${i}" data-j="${j}" onclick="onCellClicked(this,${i}, ${j})"oncontextmenu="onCellMarked(this, ${i}, ${j},event)">${currCell.minesAround}</td>`
                } else {
                    strHTML += `<td class="cell hidden" data-i="${i}" data-j="${j}" onclick="onCellClicked(this,${i}, ${j})"oncontextmenu="onCellMarked(this, ${i}, ${j},event)"></td>`
                }
            }
        }
        strHTML += "</tr>\n"
    }
    elBoard.innerHTML = strHTML
}

function createCell(minesAround = 0, isRevealed = false, isMine = false, isMarked = false) {
    return {
        minesAround,
        isRevealed,
        isMine,
        isMarked,
    }
}

function onCellClicked(elCell, i, j) {
    var clickedCell = gBoard[i][j]
    clickedCell.isRevealed = true
    elCell.classList.remove("hidden")
    if (clickedCell.isMine) {
        elCell.innerText = "💣"
        console.log("Game Over !")
    } else {
        elCell.innerText = clickedCell.minesAround
        gGame.cellsToReveal--
        console.log(gGame.cellsToReveal)
        // if (gGame.cellsToReveal === 0) checkGameOver()
    }
}

function onCellMarked(elCell, i, j, event) {
    event.preventDefault()
    const clickedCell = gBoard[i][j]

    if (!clickedCell.isMarked && gGame.markedCount === gLevel.minesCount) return

    if (clickedCell.isRevealed) return

    if (!clickedCell.isMarked) {
        clickedCell.isMarked = true
        gGame.markedCount++
        elCell.innerText = "🚩"
        if (clickedCell.isMine) gGame.correctFlags++
        if (gGame.cellsToReveal === 0) checkGameOver()
    } else {
        if (clickedCell.isMine) gGame.correctFlags--
        clickedCell.isMarked = false
        gGame.markedCount--
        elCell.innerText = ""
    }
}

function checkGameOver() {
    if (gGame.correctFlags === gLevel.minesCount && gGame.cellsToReveal === 0) alert("Winner")
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var currCell = board[i][j]
            if (!currCell.isMine) {
                countMinesAround(currCell, i, j, board)
            }
        }
    }
}

function countMinesAround(cell, rowIdx, colIdx, board) {
    cell.minesAround = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) cell.minesAround++
        }
    }
}

function setMines(locations, board) {
    locations.forEach((location) => {
        board[location.i][location.j].isMine = true
    })
}

function getRandomMineLocations(board) {
    var mineLocations = []
    while (mineLocations.length < gLevel.minesCount) {
        var i = getRandomIntInclusive(0, gLevel.size - 1)
        var j = getRandomIntInclusive(0, gLevel.size - 1)
        var currCell = board[i][j]
        if (!currCell.isMine) {
            mineLocations.push({ i, j })
        }
    }
    return mineLocations
}
