"use strict"

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

function createCell(minesAround = 0, isRevealed = false, isMine = false, isMarked = false) {
    return {
        minesAround,
        isRevealed,
        isMine,
        isMarked,
    }
}

function getBoardCopy(board) {
    var boardCopy = []
    for (var i = 0; i < board.length; i++) {
        boardCopy[i] = []
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            boardCopy[i][j] = { ...currCell }
        }
    }
    return boardCopy
}

function saveHistoryState() {
    const gameCopy = { ...gGame }
    gameCopy.isFirstClick = false
    const currState = {
        board: getBoardCopy(gBoard),
        game: gameCopy,
    }
    gHistory.push(currState)
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

function handleFirstClick(i, j) {
    if (gGame.isFirstClick) {
        gTimerInterval = setInterval(updateTimer, 1000)
        const mineLocations = getRandomMineLocations(gBoard, { i, j })
        setMines(mineLocations, gBoard)
        setMinesNegsCount(gBoard)
        gGame.isFirstClick = false
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
            currCell.isMine = true
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

function checkGameOver() {
    if (gGame.correctFlags === gLevel.mines && gGame.cellsToReveal === 0) {
        gGame.isOn = false
        clearInterval(gTimerInterval)
        checkAndSaveBestScore()
    }
    updateUI()
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
        updateUI()
    }, 1500)
}

function updateUI() {
    const elLives = document.querySelector(".lives")
    elLives.innerHTML = `Lives: ${"❤️".repeat(gGame.lives)}`

    document.querySelectorAll(".hints span").forEach((el, idx) => {
        el.style.visibility = idx < gGame.hints ? "visible" : "hidden"
        if (!gGame.isHintActive) {
            el.classList.remove("active")
        }
    })

    const elBtn = document.querySelector(".safe-click button")
    elBtn.innerText = `Safe Click (${gGame.safeClicks})`

    if (!gElSmiley) gElSmiley = document.querySelector(".smiley")

    if (gGame.isOn) {
        gElSmiley.innerText = "😃"

        elBtn.disabled = gGame.safeClicks === 0
    } else {
        if (gGame.lives === 0) {
            gElSmiley.innerText = "🤯"
        } else if (gGame.correctFlags === gLevel.mines && gGame.cellsToReveal === 0) {
            gElSmiley.innerText = "😎"
        }
        elBtn.disabled = true
    }
}

function updateTimer() {
    gGame.secsPassed++
    document.querySelector(".timer").innerText = `Time: ${gGame.secsPassed}s`
}

function loadBestScore() {
    const levelKey = `bestScore-${gLevel.name}`
    const bestScore = localStorage.getItem(levelKey)
    const elBestScoreLabel = document.querySelector(".best-score")

    const levelName = gLevel.name

    if (bestScore) {
        elBestScoreLabel.innerText = `Best Score (${levelName}) : ${bestScore}s`
    } else {
        elBestScoreLabel.innerText = `Best Score (${levelName}) : N/A`
    }
}

function checkAndSaveBestScore() {
    const levelKey = `bestScore-${gLevel.name}`
    const currentBestScore = +localStorage.getItem(levelKey)

    const newScore = gGame.secsPassed
    if (!currentBestScore || newScore < currentBestScore) {
        localStorage.setItem(levelKey, newScore)
        loadBestScore()
    }
}
