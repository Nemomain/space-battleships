//* Objects

class Ship{
  // type: string,
  // cells: number,
  // horizontal: boolean (if not horizontal, it is vertical),
  // positions: [] (to be declared when placed),
  // damagedCells: number,
  // destroyed: boolean,
  
  constructor(type) {
    if (type === 'carrier') this.cells = 5
    if (type === 'battleship') this.cells = 4
    if (type === 'cruiser' || type === 'stealth') this.cells = 3
    if (type === 'destroyer') this.cells = 2
    this.type = type
    this.horizontal = true
  }
}

class TeamShips{
  constructor(Ship) {
    this.shipList[0] = Ship
  }
  addShip(Ship) {
    this.shipList.length <= 5 ? this.shipList.push(Ship) : false
  }
}

//* Variables

let playerShips
let enemyShips
let shipNew
let turn = true
let placementFinished = false

//* Elements

const playerGrid = document.querySelector('.player').querySelectorAll('.cell')
const enemyGrid = document.querySelector('.enemy').querySelectorAll('.cell')
const shipSelect = document.querySelector('.player').querySelectorAll('.ship')
const display = document.querySelector('#display')


//* Executions
function playerPlacement(index) {
  //if (shipNew.horizontal) {

  //}

} //(recursive) when player positions ships, careful of ship exiting designated grid, if a paricular ship is selected twice, shipRemove() and allow new placement
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
// Player clicks on ship
shipSelect.forEach(value => {
  value.addEventListener('click', (e) => {
    const type = e.target.classList[1]
    shipNew = new Ship(type)
  })
})

// player places ships
playerGrid.forEach((value, index) => {
  value.addEventListener('click', (e) => {
    if (!shipNew) {
      const recover = display.innerHTML
      display.innerHTML = '<p>-- YOU MUST CHOOSE A SHIP --</p>'
      setTimeout(() => {
        display.innerHTML = recover
      }, 2000)
      return
    } else {
      console.log(index)
      playerPlacement(index)
    }
  })
})
 

// Mouse on hover
playerGrid.forEach((value, index) => {
  value.addEventListener('mouseover', () => {
    //clearing previous cells
    playerGrid.forEach(cell => {
      cell.classList.remove('hover')
    })
    // finding cells to 'hover'
    if (shipNew) {
      if (shipNew.horizontal === true) {
        const hoverCells = []
        for (let i = 0; i < shipNew.cells; i++) {
          if (i === 0 && index % 10 === 0) {
            hoverCells.push(index)
            continue
          }
          if ((index + i) % 10 !== 0) {
            hoverCells.push(index + i)
          } else {
            return
          }
        }
        hoverCells.forEach((val) => {
          playerGrid[val].classList.add('hover')
        })
      }
    }
  })
})

/*
onkeyup to rotate the ships when placing and placementFinished === false
ships selection onclick
click on all cells in enemyGrid to be activated when turn boolean favors player

*/

//* Page load
// document.addEventListener('DOMContentLoaded', () => {
//   playerPlacement()
// })