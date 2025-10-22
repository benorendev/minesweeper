"use strict"
const gLevel = {
    size: 10,
    mines: 10,
}
const gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
}
var gBoard

function onInit() {
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
                    strHTML += `<td class="cell mine" data-i="${i}" data-j="${j}" onclick="onCellClicked(this,${i}, ${j})">💣</td>`
                } else {
                    strHTML += `<td class="cell mine hidden" data-i="${i}" data-j="${j}" onclick="onCellClicked(this,${i}, ${j})"></td>`
                }
            } else {
                if (currCell.isRevealed) {
                    strHTML += `<td class="cell" data-i="${i}" data-j="${j}" onclick="onCellClicked(this,${i}, ${j})">${currCell.minesAround}</td>`
                } else {
                    strHTML += `<td class="cell hidden" data-i="${i}" data-j="${j}" onclick="onCellClicked(this,${i}, ${j})"></td>`
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
    } else {
        elCell.innerText = clickedCell.minesAround
    }
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
    while (mineLocations.length < gLevel.mines) {
        var i = getRandomIntInclusive(0, gLevel.size - 1)
        var j = getRandomIntInclusive(0, gLevel.size - 1)
        var currCell = board[i][j]
        if (!currCell.isMine) {
            mineLocations.push({ i, j })
        }
    }
    return mineLocations
}
