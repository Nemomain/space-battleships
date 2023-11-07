//TODO: difficulty levels?? READMEEE
//TODO: create announcements for the type of ship that has been hit/destroyed
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
let control = 0 //TODO control variable for testing

//* Elements

const playerGrid = document.querySelector('.player').querySelectorAll('.cell')
const enemyGrid = document.querySelector('.enemy').querySelectorAll('.cell')
const shipSelect = document.querySelector('.player').querySelectorAll('.ship')
const enemySelect = document.querySelector('.player').querySelectorAll('.ship')
const display = document.querySelector('#display')
const restart = document.getElementById('restart')


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

function playerPlacement(index) {
  const targetCells = shipCells(index)
  const check = collision(targetCells)
  if (targetCells && !check) {
    targetCells.forEach(value => {
      playerGrid[value].classList.add('positioned')
      shipNew.positions.push(value)
      occupiedPlayer.push(value)
    })
    playerShips.push(shipNew)
    shipNew = undefined
  } else if (check) {
    announcement('<p>-- NO OVERLAP ALLOWED --</p>', 1000)
  }
  if (playerShips.length === 5){
    placementFinished = !placementFinished
    turn = !turn
    info('<p>-- TO WAR!! --</p>')
    announcement('<p>-- AI PLACING... --</p><p>-- PUNY HUMAN! --</p>', 2000)
    setTimeout(() => {
      enemyPlacement()
    }, 2000)
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
    turn = !turn
    setTimeout(() => enemyShot(), 750)
  }
}

function enemyShot() {
  //to keep computer from running wild
  let index
  if (hunted.length !== 0) {
    const options = huntRandom()
    index = options[Math.floor(Math.random() * options.length)]
  } else {
    index = randomIndex()
  } 
  
  if (continueGame) {
    const aim = painComingTo()
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
      if (i < 0 || i > 99 || shotPlayerCells.includes(i)) {
        options.splice(i, 1)
      }
    }
    // options.forEach((i, p) => {
    // })
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
      value.damagedCells.push(index)//ok
      aim[1][index].innerHTML = '<img src="img/explosion.gif" alt=""></img>'
      if (!turn) aim[1][index].classList.add('positioned')
      aim[4].push(index)
      if (value.damagedCells.length === value.cells) {
        value.destroyed = true
        if (aim[0].every(ship => ship.destroyed === true)) endGame()
      }
    }
  })
  const au = new Audio('sound/explosion.mp3')
  au.play()
}

function miss(index) {
  const aim = painComingTo()
  //console.log(`aim: ${aim} index: ${index}`)
  aim[1][index].style.backgroundColor = 'rgba(140 147 254 / 80%)'
  const au = new Audio('sound/miss.mp3')
  au.play()
}
//! END OF COMBAT

//! GLOBAL AUXILIARIES
function randomIndex() {
  return Math.floor(Math.random() * 100)
}

function painComingTo() {
  // an easy way to have all functions have a place to gather the target each turn
  return turn ? [enemyShips, enemyGrid, occupiedEnemy, shotEnemyCells, hitEnemyCells] : [playerShips, playerGrid, occupiedPlayer,shotPlayerCells,hitPlayerCells ]
}

function endGame() {
  if (turn) {
    // disallowing playes further input
    info('<p>-- CONGRATULATIONS! --</p><p>-- VICTORY! --</p>')
  } else {
    // this turn change goes here because as soon as endGame finishes hit() will change it again to false //blocking the player from further input
    turn = !turn
    info('<p>-- PUNY HUMAN! --</p><p>-- DEFEATED! --</p>')
  }
  continueGame = false
}

function announcement(message, period) {
  display.innerHTML = message
  const replace = placementFinished ? '<p>-- War Spares No One --</p>' : '<p>-- Click on ship to select --</p><p>-- Press Space to Rotate --</p><p>-- Reselect Ship to Place Again --</p>'
  setTimeout(() => {
    display.innerHTML = replace
  }, period)
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

//! END OF EXECUTIONS
//* Events
//! PLACEMENT EVENTS
// Player clicks ON ship to select
shipSelect.forEach(value => {
  value.addEventListener('click', (e) => {
    const type = e.target.classList[1]
    // check if ship already exists
    playerShips.forEach((value, index) => {
      if (value.type === type) {
        value.positions.forEach(val => {
          occupiedPlayer.splice(occupiedPlayer.indexOf(), 1)
          playerGrid[val].classList.remove('positioned')
        })
        playerShips = playerShips.splice(index, 1)
      }
    })
    shipNew = new Ship(type)
  })
})

// player places ships
playerGrid.forEach((value, index) => {
  value.addEventListener('click', () => {
    if (!placementFinished) {
      if (!shipNew) {
        announcement('<p>-- YOU MUST CHOOSE A SHIP --</p>', 2000)
      } else {
        playerPlacement(index)
      }
    }
  })
})
 

// Mouse on hover
playerGrid.forEach((value, index) => {
  value.addEventListener('mouseover', () => {
    cleanGrid(playerGrid)
    if (!placementFinished) {
      // finding cells to 'hover'
      const targetCells = shipCells(index)
      // adding hover
      if (targetCells) {
        targetCells.forEach((val) => {
          playerGrid[val].classList.add('hover')
        })
      }
    }
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
    if (placementFinished) {
      cleanGrid(enemyGrid)
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
  wipeGrids()
  info('<p>-- Click on ship to select --</p><p>-- Press Space to Rotate --</p><p>-- Reselect Ship to Place Again --</p>')
})
/*
enemyPlacement() (find positions of already placed ships to avoid collision and ships touching)
shipPlacement()
shipRemove()

battle()(recursive) when enemy turn starts 0.5 seconds timeout to give some breathing room
enemyShot() if ship has been hit, find adjacent cells if not, randomise shot

shot() find out if hit or miss, and pass corresponding cell to the appropriate function
hit(cell) change data of ship object, play explosion sound and if possible dislay fire on top of ship in the cell. If ship is destroyed shipDestroyed()
miss(cell) play spacey pewpew sound, color cell a non aggressive color and
shipDestroyed()
gameEnd()

*/
/*
onkeyup to rotate the ships when placing and placementFinished === false
ships selection onclick
click on all cells in enemyGrid to be activated when turn boolean favors player

*/

//* Page load
//document.addEventListener('DOMContentLoaded', () => {
//   setInterval(() => {
//     const au = new Audio('sound/music.mp3')
//     au.play()
//   },164000)
// })