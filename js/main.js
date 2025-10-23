"use strict"
const gLevel = {
    size: 4,
    mines: 2,
}
const gGame = {
    isOn: false,
    markedCount: 0,
    secsPassed: 0,
    cellsToReveal: 0,
    correctFlags: 0,
    isFirstClick: true,
    lives: 3,
    hints: 3,
    isHintActive: false,
    safeClicks: 3,
}

var gBoard
var gElSmiley

function onInit() {
    gGame.cellsToReveal = gLevel.size ** 2 - gLevel.mines
    gGame.correctFlags = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.isFirstClick = true
    gGame.lives = 3
    gGame.hints = 3
    gGame.safeClicks = 3

    const elBtn = document.querySelector(".safe-click button")
    elBtn.innerText = `Safe Click (${gGame.safeClicks})`
    document.querySelectorAll(".hints span").forEach((el) => {
        el.style.visibility = "visible"
        el.classList.remove("active")
    })
    document.querySelector(".lives").innerHTML = `Lives: ❤️❤️❤️`

    gBoard = buildBoard()

    renderBoard(gBoard)

    gElSmiley = document.querySelector(".smiley")
    gElSmiley.innerText = "😃"

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

    if (gGame.isHintActive) {
        if (gGame.isFirstClick) {
            const mineLocations = getRandomMineLocations(gBoard, { i, j })
            setMines(mineLocations, gBoard)
            setMinesNegsCount(gBoard)
            gGame.isFirstClick = false
        }

        showHint(gBoard, i, j)
        return
    }

    if (gGame.isFirstClick) {
        const mineLocations = getRandomMineLocations(gBoard, { i, j })
        setMines(mineLocations, gBoard)
        setMinesNegsCount(gBoard)
        gGame.isFirstClick = false
    }

    if (clickedCell.isMine) {
        gGame.lives--

        const elLives = document.querySelector(".lives")
        elLives.innerHTML = `Lives: ${"❤️".repeat(gGame.lives)}`

        const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
        elCell.classList.add("mine-hit")
        elCell.innerText = "💥"

        setTimeout(() => {
            if (gGame.isOn) {
                elCell.classList.remove("mine-hit")
                elCell.innerText = ""
            }
        }, 500)

        if (gGame.lives === 0) {
            elCell.classList.remove("mine-hit")
            gGame.isOn = false
            revealAllMines(gBoard)

            document.querySelector(".smiley").innerText = "🤯"
        }
        return
    }

    revealCell(clickedCell, i, j)

    if (clickedCell.minesAround === 0) {
        expandReveal(gBoard, i, j)
    }

    checkGameOver()
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
    if (gGame.correctFlags === gLevel.mines && gGame.cellsToReveal === 0) {
        gElSmiley.innerText = "😎"
        gGame.isOn = false
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
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue

            var currCell = board[i][j]

            if (currCell.isMine || currCell.isMarked || currCell.isRevealed) continue
            revealCell(currCell, i, j)
        }
    }
    checkGameOver()
}

function revealCell(cell, i, j) {
    if (cell.isRevealed) return

    const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
    if (!elCell) return

    cell.isRevealed = true
    gGame.cellsToReveal--
    elCell.classList.remove("hidden")
    elCell.innerText = cell.isMine ? "💣" : cell.minesAround === 0 ? "" : cell.minesAround
}

function revealAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]

            if (cell.isMine && !cell.isRevealed) {
                const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                if (elCell) {
                    elCell.classList.remove("hidden")
                    elCell.innerText = "💣"
                }
            }
        }
    }
}

function setLevel(level) {
    switch (level) {
        case "easy":
            gLevel.size = 4
            gLevel.mines = 2
            break
        case "medium":
            gLevel.size = 8
            gLevel.mines = 12
            break
        case "hard":
            gLevel.size = 12
            gLevel.mines = 30
            break
    }
    onInit()
}

function showHint(board, rowIdx, colIdx) {
    const cellsToShow = []

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue

            var currCell = board[i][j]

            if (!currCell.isRevealed) {
                const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                elCell.classList.remove("hidden")
                elCell.innerText = currCell.isMine ? "💣" : currCell.minesAround || ""
                cellsToShow.push(elCell)
            }
        }
    }

    setTimeout(() => {
        cellsToShow.forEach((el) => {
            el.classList.add("hidden")
            el.innerText = ""
        })
        gGame.isHintActive = false
        gGame.hints--
        updateHintsDisplay()
    }, 1500)
}

function updateHintsDisplay() {
    document.querySelectorAll(".hints span").forEach((el, idx) => {
        el.style.visibility = idx < gGame.hints ? "visible" : "hidden"
        el.classList.remove("active")
    })
}

function onHintClick(elHint) {
    if (!gGame.isOn || gGame.isHintActive || gGame.hints === 0) return

    gGame.isHintActive = true
    elHint.classList.add("active")
}

function onSafeClick() {
    if (!gGame.isOn) return

    if (gGame.safeClicks === 0) return

    gGame.safeClicks--

    const elBtn = document.querySelector(".safe-click button")
    elBtn.innerText = `Safe Click (${gGame.safeClicks})`

    if (gGame.safeClicks === 0) document.querySelector(".safe-click button").disabled = true
    const safeCells = []
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var currCell = gBoard[i][j]

            if (!currCell.isMine && !currCell.isMarked && !currCell.isRevealed) safeCells.push({ i, j })
        }
    }

    if (!safeCells.length) return

    const randIdx = getRandomIntInclusive(0, safeCells.length - 1)
    const safePos = safeCells[randIdx]

    const elCell = document.querySelector(`[data-i="${safePos.i}"][data-j="${safePos.j}"]`)
    elCell.classList.add("safe-cell")

    setTimeout(() => {
        elCell.classList.remove("safe-cell")
    }, 1500)
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode")
}
