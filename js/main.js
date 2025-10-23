"use strict"
const gLevel = {
    size: 4,
    mines: 2,
    name: "easy",
    topPlayer: null,
}
var gGame = {
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

var gHistory
var gBoard
var gTimerInterval = null
var gElSmiley

function onInit() {
    if (gTimerInterval) clearInterval(gTimerInterval)
    gTimerInterval = null

    gHistory = []
    gGame = {
        isOn: true,
        markedCount: 0,
        secsPassed: 0,
        cellsToReveal: gLevel.size ** 2 - gLevel.mines,
        correctFlags: 0,
        isFirstClick: true,
        lives: 3,
        hints: 3,
        isHintActive: false,
        safeClicks: 3,
    }

    gBoard = buildBoard()

    renderBoard(gBoard)

    gElSmiley = document.querySelector(".smiley")

    document.querySelector(".timer").innerText = "Time: 0s"

    loadBestScore()

    updateUI()
}

function onCellClicked(i, j) {
    const clickedCell = gBoard[i][j]

    if (!gGame.isOn) return

    if (clickedCell.isRevealed || clickedCell.isMarked) return

    handleFirstClick(i, j)

    saveHistoryState()

    if (gGame.isHintActive) {
        showHint(gBoard, i, j)
        return
    }

    if (clickedCell.isMine) {
        gGame.lives--

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
            clearInterval(gTimerInterval)
        }
        updateUI()
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
    const clickedCell = gBoard[i][j]

    if (!gGame.isOn) return

    if (!clickedCell.isMarked && gGame.markedCount === gLevel.mines) return

    if (clickedCell.isRevealed) return

    handleFirstClick(i, j)

    saveHistoryState()

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

function setLevel(level) {
    gLevel.name = level
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

function onUndo() {
    if (gHistory.length === 0 || !gGame.isOn) return
    const currentTime = gGame.secsPassed
    const lastState = gHistory.pop()

    gBoard = lastState.board
    gGame = lastState.game

    gGame.secsPassed = currentTime

    renderBoard(gBoard)
    updateUI()
}
