//* Objects

class Ship{
  // type: string,
  // cells: number,
  // horizontal: boolean (if not horizontal, it is vertical),
  // positions: [] (to be declared when placed),
  // damagedCells: [],
  // destroyed: boolean,
  
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
let occupied = []
let shipNew
let turn = true
let placementFinished = false

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
      targetCells.forEach(value => shipNew.positions.push(value))
      occupied = occupied.concat(targetCells)
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
    occupied = []
  }

} 

function enemyPlacement() {
  shipNew = undefined
  // each ship individually, from biggest to smallest
  enemySelect.forEach(spaceship => {
    const type = spaceship.classList[1]
    shipNew = new Ship(type)
    shipNew.horizontal = Math.floor(Math.random() * 2)
    // randomise position
    let origin = Math.floor(Math.random() * 100)
    let targetCells = shipCells(origin)
    //no collision between ships
    let check = collision(targetCells)
    // randomise ship position until accepted
    while (!targetCells || check) {
      shipNew.horizontal = Math.floor(Math.random() * 2)
      origin = Math.floor(Math.random() * 100)
      targetCells = shipCells(origin)
      check = collision(targetCells)
    }
    // assign values where needed
    shipNew.positions = targetCells
    occupied = occupied.concat(targetCells)
    enemyShips.push(shipNew)
  })
  turn = !turn
}
// check for collision
function collision(targetCells) {
  let check
  if (targetCells) {
    check = targetCells.some(pos => occupied.includes(pos))
    return check
  }
}
//! END OF PLACEMENTS

//! COMBAT
function shot(){

}

//! GLOBAL AUXILIARIES

function announcement(message, period) {
  const recover = display.innerHTML
  display.innerHTML = message
  setTimeout(() => {
    display.innerHTML = recover
  }, period)
}

function info(message) {
  display.innerHTML = message
}

//(recursive) when player positions ships, careful of ship exiting designated grid, if a paricular ship is selected twice, shipRemove() and allow new placement
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

//* Events
//! PLACEMENT EVENTS
// Player clicks ON ship to select
shipSelect.forEach(value => {
  value.addEventListener('click', (e) => {
    const type = e.target.classList[1]
    // check if ship already exists
    playerShips.forEach((value, index) => {
      if (value.type === type) {
        value.positions.forEach(val => playerGrid[val].classList.remove('positioned'))
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
    // finding cells to 'hover'
    const targetCells = shipCells(index)
    // adding hover
    if (targetCells) {
      targetCells.forEach((val) => {
        playerGrid[val].classList.add('hover')
      })
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
  value.addEventListener('click', (e) => {
    shot(index) //! eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
  })
})

//! AUXILIARY EVENTS
function cleanGrid(grid) {
  grid.forEach(cell => {
    cell.classList.remove('hover')
  })
}
/*
onkeyup to rotate the ships when placing and placementFinished === false
ships selection onclick
click on all cells in enemyGrid to be activated when turn boolean favors player

*/

//* Page load
// document.addEventListener('DOMContentLoaded', () => {
//   playerPlacement()
// })