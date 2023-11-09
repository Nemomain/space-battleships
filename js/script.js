//TODO: difficulty levels?? 2 player functionality(refactor aim[] into player{}) ?? READMEEE
//* Object's'

class Ship{
  constructor(type) {
    if (type === 'carrier') this.cells = 5
    if (type === 'battleship') this.cells = 4
    if (type === 'cruiser' || type === 'stealth') this.cells = 3
    if (type === 'destroyer') this.cells = 2
    this.type = type
    this.horizontal = true
    this.positions = []
    this.damagedCells = []
    this.destroyed = false
  }
}

//* Variables
// all variables are let so the restart button can do its job
let turndata // this varable is so eventlisteners for placing can work
let playerShips = []
let enemyShips = []
let occupiedPlayer = []
let shotPlayerCells = []
let hitPlayerCells = []
let occupiedEnemy = []
let shotEnemyCells = []
let hitEnemyCells = []
let hunted = []
let shipNew
let turn = true
let placementFinished = false
let continueGame = true
let targeting = [[], []]
const gameMode = localStorage.getItem('gameMode')


//* Elements

const playerGrid = document.querySelector('.player').querySelectorAll('.cell')
const enemyGrid = document.querySelector('.enemy').querySelectorAll('.cell')
const shipSelect = document.querySelector('.player').querySelectorAll('.ship')
const shipSelectEnemy = document.querySelector('.enemy').querySelectorAll('.ship')
const enemySelect = document.querySelector('.player').querySelectorAll('.ship')
const display = document.querySelector('#display')
const restart = document.getElementById('restart')


//variable generation
if (gameMode === '2p') {
  turn = !turn
  const player1 = painComingTo()
  turn = true
  const player2 = painComingTo()
  turndata = [player1, player2]
} else {
  turn = !turn
  turndata = [painComingTo()]
  turn = true
}
for (let i = 0; i < 10; i++) {
  for (let f = i * 10; f < (i + 1) * 10; f++) {
    if ((i % 2 === 0 && f % 2 === 0) || (i % 2 !== 0 && f % 2 !== 0)) {
      targeting[0].push(f)
    } else {
      targeting[1].push(f)
    }
  }
}

//* Executions
//! PLACEMENTS
function shipCells(index) {
  if (shipNew) {
    const targetCells = []
    if (shipNew.horizontal === true) {
      for (let i = 0; i < shipNew.cells; i++) {
        if (i === 0 && index % 10 === 0) {
          targetCells.push(index)
          continue
        }
        if ((index + i) % 10 !== 0) {
          targetCells.push(index + i)
        } else {
          return false
        }
      }
    } else {
      for (let i = 0; i < shipNew.cells; i++) {
        if (index + (i * 10) < 100) {
          targetCells.push(index + (i * 10))
        } else {
          return false
        }
      }
    } 
    return targetCells
  } else {
    return false
  }
}

function playerPlacement(index) { //TODO work in progress!
  const targetCells = shipCells(index)
  let aim
  if (turn) {
    aim = [playerShips, playerGrid, occupiedPlayer]
  } else {
    aim = [enemyShips, enemyGrid, occupiedEnemy]
  }
  const check = collision(targetCells)//here
  if (targetCells && !check) {
    targetCells.forEach(value => {
      aim[1][value].classList.add('positioned')
      shipNew.positions.push(value)
      aim[2].push(value)
    })
    aim[0].push(shipNew)
    shipNew = undefined
  } else if (check) {
    announcement('<p>-- NO OVERLAP ALLOWED --</p>', 1000)
  }
  if (aim[0].length === 5){
    if (gameMode !== '2p') {
      placementFinished = !placementFinished
      turn = !turn
      info('<p>-- TO WAR!! --</p>')
      announcement('<p>-- AI PLACING... --</p><p>-- PUNY HUMAN! --</p>', 2000)
      setTimeout(() => {
        enemyPlacement()
      }, 2000)
    } else if (turn) {
      obscure()
      announcement('<p>-- PLAYER 2 PLACE YOUR SHIPS! --</p>', 3000)
      setTimeout(() =>{
        turn = !turn
      }, 3000)
    } else if (!turn) {
      placementFinished = !placementFinished
      // this timeout is needed to ensure player 2 doesent shoot himself!
      obscure()
      setTimeout(() =>{
        turn = !turn
      }, 50)
      info('<p>-- TO WAR!! --</p>')
      announcement('<p>-- PLAYER 1 STARTS! --</p>', 3000)
      setTimeout(() => revisualize(), 3000)
    }
  }
} 

function enemyPlacement() {
  shipNew = undefined
  // each ship individually, from biggest to smallest
  enemySelect.forEach(spaceship => {
    const type = spaceship.classList[1]
    shipNew = new Ship(type)
    // random orientation
    Math.random() > 0.5 ? shipNew.horizontal = true : shipNew.horizontal = false
    // randomise position
    let origin = randomIndex()
    let targetCells = shipCells(origin)
    //no collision between ships
    let check = collision(targetCells)
    // randomise ship position until accepted
    while (!targetCells || check) {
      Math.random() > 0.5 ? shipNew.horizontal = true : shipNew.horizontal = false
      origin = randomIndex()
      targetCells = shipCells(origin)
      check = collision(targetCells)
    }
    // assign values where needed
    shipNew.positions = targetCells
    occupiedEnemy = occupiedEnemy.concat(targetCells)
    enemyShips.push(shipNew)
  })
  turn = !turn
}
// check for collision
function collision(targetCells) {
  const occupied = turn ? occupiedPlayer : occupiedEnemy
  if (targetCells) return targetCells.some(pos => occupied.includes(pos)) 
}
//! END OF PLACEMENTS

//! COMBAT
function shot(index){
  if (continueGame) {
    const aim = painComingTo()
    if (aim[2].includes(index) && !aim[3].includes(index)) {
      hit(index)
    } else if (aim[3].includes(index)) {
      announcement('<p>-- ENGAGE NEW TARGET --</p>', 1000)
      return
    } else if (!aim[2].includes(index) && !aim[3].includes(index)){
      miss(index)
    }
    aim[3].push(index)
    if (gameMode !== '2p') {
      turn = !turn
      setTimeout(() => enemyShot(), 750)
    } else {
      obscure()
      turn = !turn
      const who = turn ? '1' : '2'
      setTimeout(() => announcement('<p>-- PLAYER ' + who + ' TURN! --</p>', 3000), 3000)
      setTimeout(() => revisualize(), 4000)
    }
  }
}

function enemyShot() {
  //to keep computer from running wild
  if (continueGame) {
    const aim = painComingTo()

    if (targeting.length < 3) {
      targeting.push(Math.random() > 0.5 ? 0 : 1)
    }
    let index
    if (hunted.length !== 0) {
      const options = huntRandom()
      index = options[Math.floor(Math.random() * options.length)]
    } else {
      if (gameMode === 'easy') {
        index = randomIndex()
      } else {
        index = checkerboardIndex(aim)
      }
    }
    if (aim[2].includes(index) && !aim[3].includes(index)) {
      hit(index)
      hunt(index, aim)
    } else if (aim[3].includes(index)) {
      enemyShot()
    } else {
      miss(index)
    }
    aim[3].push(index)
    turn = true
  }
}

function hunt(index, aim) {
  aim[0].forEach(value => {
    if (value.positions.includes(index)){
      if (hunted.find(h => h.type === value.type)) {
        hunted.forEach((h) => {
          if (h.type === value.type) {
            h.positions.push(index)
            if (value.destroyed) hunted.splice(hunted.indexOf(h), 1)
          }
        })
      } else {
        hunted.push({ type: value.type, positions: [index] })
      }
    }
  })
}

function huntRandom(){
  let options
  const killTarget = hunted[0].positions
  if (killTarget.length === 1) {
    options = [killTarget[0] + 1, killTarget[0] - 1, killTarget[0] + 10, killTarget[0] - 10]
    for (let i = options.length - 1; i >= 0; i--) {
      if (options[i] < 0 || options[i] > 99 || shotPlayerCells.includes(options[i])) {
        options.splice(i, 1)
      }
    }
    if (killTarget[0] % 10 === 0) options.splice(1, 1)
    if (killTarget[0] % 10 === 9) options.splice(0, 1)
  } else if (hunted[0].horizontal === undefined) {
    
    if (killTarget[0] === killTarget[1] + 1 || killTarget[0] === killTarget[1] - 1) hunted[0].horizontal = true
    if (killTarget[0] === killTarget[1] + 10 || killTarget[0] === killTarget[1] - 10) hunted[0].horizontal = false
  }
  if (killTarget.length > 1){
    if (hunted[0].horizontal) {
      if (Math.max(...killTarget) % 10 !== 9 && !shotPlayerCells.includes(Math.max(...killTarget) + 1)) {
        options = [Math.max(...killTarget) + 1]
      } else {
        options = [Math.min(...killTarget) - 1]
      }
    } else {
      if (Math.max(...killTarget) + 10 < 100 && !shotPlayerCells.includes(Math.max(...killTarget) + 10)) {
        options = [Math.max(...killTarget) + 10]
      } else {
        options = [Math.min(...killTarget) - 10]
      }
    }
  }
  return options
}

function hit(index) {
  const aim = painComingTo()
  aim[0].forEach(value => {
    if (value.positions.includes(index) && !value.damagedCells.includes(index)) {
      value.damagedCells.push(index)
      info(`<p>-- ${value.type.charAt(0).toUpperCase() + value.type.slice(1)} has been hit!--</p>`)
      aim[1][index].innerHTML = '<img src="img/explosion.gif" alt=""></img>'
      if (!turn) aim[1][index].classList.add('positioned')
      aim[4].push(index)
      if (value.damagedCells.length === value.cells) {
        value.destroyed = true
        info(`<p>-- ${value.type.charAt(0).toUpperCase() + value.type.slice(1)} has been DESTROYED!--</p>`)
        if (aim[0].every(ship => ship.destroyed === true)){
          continueGame = false
          setTimeout(endGame(), 2000)
          
        } 
      }
    }
  })
  const au = new Audio('sound/explosion.mp3')
  au.volume = 0.1
  au.play()
}

function miss(index) {
  const aim = painComingTo()
  //console.log(`aim: ${aim} index: ${index}`)
  aim[1][index].style.backgroundColor = 'rgba(140 147 254 / 80%)'
  const au = new Audio('sound/miss.mp3')
  au.volume = 0.1
  au.play()
}
//! END OF COMBAT

//! GLOBAL AUXILIARIES
function checkerboardIndex(aim) {
  const index = Math.floor(Math.random() * 50)
  return !aim[3].includes(targeting[targeting[2]][index]) ? targeting[targeting[2]][index] : checkerboardIndex(aim)
}

function randomIndex() {
  return Math.floor(Math.random() * 100)
}

function painComingTo() {
  // an easy way to have all functions have a place to gather the target each turn
  return turn ? [enemyShips, enemyGrid, occupiedEnemy, shotEnemyCells, hitEnemyCells, shipSelectEnemy, false] : [playerShips, playerGrid, occupiedPlayer, shotPlayerCells, hitPlayerCells, shipSelect, true]
}

function endGame() {
  const screen = gameMode === '2p' ? ['<p>-- PLAYER 1 WINS! --</p>', '<p>-- PLAYER 2 WINS! --</p>'] : ['<p>-- CONGRATULATIONS! --</p><p>-- VICTORY! --</p>', '<p>-- PUNY HUMAN! --</p><p>-- DEFEATED! --</p>']
  turn = !turn
  revisualize()
  turn = !turn
  revisualize()
  let count = 0
  const interval = setInterval(() => {
    count++
    if (turn) {
      info(screen[0])
    } else {
      info(screen[1])
    }
    if (count === 1000) {
      clearInterval(interval)
    }
  }, 15)
}

function announcement(message, period) {
  display.innerHTML = message
  const replace = placementFinished ? '<p>-- All YOUR BASE ARE BELONG TO US!--</p>' : '<p>-- Click on ship to select --</p><p>-- Press Space to Rotate --</p><p>-- Reselect Ship to Place Again --</p>'
  if (continueGame) {
    setTimeout(() => {
      display.innerHTML = replace
    }, period)
  }
}

function info(message) {
  display.innerHTML = message
}

function cleanGrid(grid) {
  grid.forEach(cell => {
    cell.classList.remove('hover')
  })
}

function wipeGrids() {
  enemyGrid.forEach((e) => {
    e.innerHTML = ''
    e.className = 'cell'
    e.removeAttribute('style')
  })
  playerGrid.forEach((e) => {
    e.innerHTML = ''
    e.className = 'cell'
    e.removeAttribute('style')
  })
}

function obscure() {
  const wipe = turn ? playerGrid : enemyGrid
  wipe.forEach(cell => {
    cell.classList.remove('positioned')
  })
}

function revisualize() {
  const visible = turn ? playerShips : enemyShips
  const visGrid = turn ? playerGrid : enemyGrid
  visible.forEach(ship => {
    ship.positions.forEach(cell => {
      visGrid[cell].classList.add('positioned')
    })
  })
}

//! END OF EXECUTIONS
//* Events
//! PLACEMENT EVENTS

turndata.forEach((data) => {
  data[5].forEach(value => {
    value.addEventListener('click', (e) => {
      // Player clicks ON ship to select
      const type = e.target.classList[1]
      // check if ship already exists
      data[0].forEach((value, index) => {
        if (value.type === type) {
          value.positions.forEach(val => {
            data[2].splice(data[0].indexOf(val), 1)
            data[1][val].classList.remove('positioned')
          })
          data[0] = data[0].splice(index, 1)
        }
      })
      shipNew = new Ship(type)
    })
  })
  
  // player places ships
  data[1].forEach((value, index) => {
    value.addEventListener('click', () => {
      if (!placementFinished && turn === data[6]) {
        if (!shipNew) {
          announcement('<p>-- YOU MUST CHOOSE A SHIP --</p>', 2000)
        } else {
          playerPlacement(index)
        }
      }
    })
  })
  
  // Mouse on hover
  data[1].forEach((value, index) => {
    value.addEventListener('mouseover', () => {
      cleanGrid(data[1])
      if (!placementFinished && turn === data[6]) {
        // finding cells to 'hover'
        const targetCells = shipCells(index)
        // adding hover
        if (targetCells) {
          targetCells.forEach((val) => {
            data[1][val].classList.add('hover')
          })
        }
      }
    })
  })
})

document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') {
    if (shipNew) {
      shipNew.horizontal = !shipNew.horizontal
    }
  }
})

//! END OF PLACEMENT EVENTS

//! COMBAT EVENTS

enemyGrid.forEach((value, index) => {
  value.addEventListener('mouseover', () => {
    if (placementFinished && turn) {
      cleanGrid(enemyGrid)
      cleanGrid(playerGrid)
      enemyGrid[index].classList.add('hover')
    }
  })
})

enemyGrid.forEach((value, index) => {
  value.addEventListener('click', () => {
    if (turn && placementFinished) {
      shot(index)
    }
  })
})

if (gameMode === '2p') {
  playerGrid.forEach((value, index) => {
    value.addEventListener('mouseover', () => {
      if (placementFinished && !turn) {
        cleanGrid(enemyGrid)
        cleanGrid(playerGrid)
        playerGrid[index].classList.add('hover')
      }
    })
  })

  playerGrid.forEach((value, index) => {
    value.addEventListener('click', () => {
      if (!turn && placementFinished) {
        shot(index)
      }
    })
  })
}



//! AUXILIARY EVENTS

restart.addEventListener('click', () => {
  playerShips = []
  enemyShips = []
  occupiedPlayer = []
  shotPlayerCells = []
  hitPlayerCells = []
  occupiedEnemy = []
  shotEnemyCells = []
  hitEnemyCells = []
  hunted = []
  shipNew = undefined
  turn = true
  placementFinished = false
  continueGame = true
  targeting = [[], []]
  wipeGrids()
  info('<p>-- Click on ship to select --</p><p>-- Press Space to Rotate --</p><p>-- Reselect Ship to Place Again --</p>')
})