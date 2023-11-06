//TODO: create hunt() so ai knows how to defat a ship that has been hit. Find out why computer turn starts to go crazy from mid to lategame.
//TODO: create announcements for the type of ship that has been hit/destroyed create a continueGame boolean to stop any continuation of the game once finished
//* Objects

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

let playerShips = []
const enemyShips = []
let occupiedPlayer = []
const shotPlayerCells = []
const hitPlayerCells = []
let occupiedEnemy = []
const shotEnemyCells = []
const hitEnemyCells = []
let shipNew
let turn = true
let placementFinished = false
let continueGame = true
let shotTaken = false

//* Elements

const playerGrid = document.querySelector('.player').querySelectorAll('.cell')
const enemyGrid = document.querySelector('.enemy').querySelectorAll('.cell')
const shipSelect = document.querySelector('.player').querySelectorAll('.ship')
const enemySelect = document.querySelector('.player').querySelectorAll('.ship')
const display = document.querySelector('#display')


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
    console.log('type: ' + shipNew.type + '  positions:' + shipNew.positions)
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
let control = 0 //TODO control variable for testing
function shot(index){
  if (continueGame) {
    let aim = painComingTo()
    if (aim[2].includes(index) && !aim[3].includes(index)) {
      hit(index)
      if (!turn) shotTaken = !shotTaken
    } else if (aim[3].includes(index)) {
      if (!turn) {
        shot(randomIndex())
        console.log(shotTaken)
      } else {
        control++
        console.log(control)
        announcement('<p>-- ENGAGE NEW TARGET --</p>', 1000)
        return false
      }
    } else if (!aim[2].includes(index) && !aim[3].includes(index)){
      miss(index)
    }
    aim[3].push(index)
    turn = !turn
    if (!turn && !shotTaken) {
      setTimeout(() => shot(randomIndex()), 250)
    }
  }
  shotTaken = false
}

function hit(index) {
  const aim = painComingTo()
  aim[0].forEach(value => {
    //console.log(aim)//TODO check wth
    if (value.positions.includes(index) && !value.damagedCells.includes(index)) {
      value.damagedCells.push(index)//ok
      aim[1][index].innerHTML = '<img src="img/explosion.gif" alt=""></img>'
      aim[4].push(index)
      if (value.damagedCells.length === value.cells) {
        value.destroyed = true
        if (aim[0].every(ship => ship.destroyed === true)) {
          endGame()
        }
      }
    }
  })
  const au = new Audio('sound/explosion.mp3')
  au.play()
}

function miss(index) {
  const aim = painComingTo()
  aim[1][index].style.backgroundColor = 'rgba(140 147 254 / 80%)'
  const au = new Audio('sound/miss.mp3')
  au.play()
}

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
  setTimeout(() => {
    display.innerHTML = '<p>-- War Spares No One --</p>'
  }, period)
}

function info(message) {
  display.innerHTML = message
}

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

function cleanGrid(grid) {
  grid.forEach(cell => {
    cell.classList.remove('hover')
  })
}
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