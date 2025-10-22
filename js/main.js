"use strict"
const gLevel = {
    size: 4,
    mines: 2,
}
const gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    cellsToReveal: 0,
    correctFlags: 0,
    isFirstClick: true,
}

var gBoard

function onInit() {
    gGame.cellsToReveal = gLevel.size ** 2 - gLevel.mines
    gGame.correctFlags = 0
    gGame.revealedCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.isFirstClick = true

    gBoard = buildBoard()
    renderBoard(gBoard)
    gGame.isOn = true
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
                    strHTML += `<td class="cell mine" data-i="${i}" data-j="${j}" onclick="onCellClicked(${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j},event)">💣</td>`
                } else {
                    strHTML += `<td class="cell mine hidden" data-i="${i}" data-j="${j}" onclick="onCellClicked(${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j},event)"></td>`
                }
            } else {
                if (currCell.isRevealed) {
                    strHTML += `<td class="cell" data-i="${i}" data-j="${j}" onclick="onCellClicked(${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j},event)">${currCell.minesAround}</td>`
                } else {
                    strHTML += `<td class="cell hidden" data-i="${i}" data-j="${j}" onclick="onCellClicked(${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j},event)"></td>`
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

function onCellClicked(i, j) {
    const clickedCell = gBoard[i][j]
    if (!gGame.isOn) return
    if (clickedCell.isRevealed || clickedCell.isMarked) return

    if (gGame.isFirstClick) {
        const mineLocations = getRandomMineLocations(gBoard, { i, j })
        setMines(mineLocations, gBoard)
        setMinesNegsCount(gBoard)
        gGame.isFirstClick = false
        revealCell(clickedCell, i, j)
        gGame.cellsToReveal--
        if (clickedCell.minesAround === 0) expandReveal(gBoard, i, j)
        return
    }
    if (clickedCell.isMine) {
        console.log("Game Over !")
        gGame.isOn = false
        revealAllMines(gBoard)
        return
    }

    revealCell(clickedCell, i, j)
    gGame.cellsToReveal--

    if (clickedCell.minesAround === 0) {
        expandReveal(gBoard, i, j)
    }

    if (gGame.cellsToReveal === 0) checkGameOver()
}

function onCellMarked(elCell, i, j, event) {
    event.preventDefault()
    if (!gGame.isOn) return
    const clickedCell = gBoard[i][j]

    if (!clickedCell.isMarked && gGame.markedCount === gLevel.mines) return

    if (clickedCell.isRevealed) return

    if (!clickedCell.isMarked) {
        clickedCell.isMarked = true
        gGame.markedCount++
        elCell.innerText = "🚩"
        if (clickedCell.isMine) gGame.correctFlags++
    } else {
        if (clickedCell.isMine) gGame.correctFlags--
        clickedCell.isMarked = false
        gGame.markedCount--
        elCell.innerText = ""
    }
    checkGameOver()
}

function checkGameOver() {
    if (gGame.correctFlags === gLevel.mines || gGame.cellsToReveal === 0) console.log("Winner")
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

function getRandomMineLocations(board, firstClickPos) {
    var mineLocations = []
    while (mineLocations.length < gLevel.mines) {
        var i = getRandomIntInclusive(0, gLevel.size - 1)
        var j = getRandomIntInclusive(0, gLevel.size - 1)
        if (i === firstClickPos.i && j === firstClickPos.j) continue
        var currCell = board[i][j]
        if (!currCell.isMine) {
            mineLocations.push({ i, j })
        }
    }
    return mineLocations
}

function expandReveal(board, rowIdx, colIdx) {
    var cell = board[rowIdx][colIdx]
    if (cell.isRevealed || cell.isMine || cell.isMarked) return

    cell.isRevealed = true
    revealCell(cell, rowIdx, colIdx)

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine || currCell.isRevealed) continue
            revealCell(currCell, i, j)
            gGame.cellsToReveal--
            if (currCell.minesAround === 0) expandReveal(board, i, j)
        }
    }
    checkGameOver()
}

function revealCell(cell, i, j) {
    if (cell.isRevealed) return
    const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
    if (!elCell) return
    elCell.classList.remove("hidden")
    elCell.innerText = cell.isMine ? "💣" : cell.minesAround === 0 ? "" : cell.minesAround
}

function revealAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            if (cell.isMine && !cell.isRevealed) revealCell(cell, i, j)
        }
    }
}
