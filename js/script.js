//* Objects
/*
class Ship{
  type: string,
  cells: number,
  horizontal: boolean (if not horizontal, it is vertical),
  positions: [] (to be declared when placed),
  damagedCells: number,
  destroyed: boolean,
  
  constructor(type) {
    this.type = type
    depending on type automatically define this.cells
    default horizontal: true
  }
}
*/

//* Variables
/* 
const playerShips {Carrier (occupies 5 spaces), Battleship (4), Cruiser (3), Submarine (3), and Destroyer (2)}
const enemyShips {Carrier (occupies 5 spaces), Battleship (4), Cruiser (3), Submarine (3), and Destroyer (2)}
let turn boolean
placementFinished boolean

*/

//* Elements
/* 
const playerGrid NodeList
const enemyGrid NodeList

*/

//* Executions
/*
shipPlacement()(recursive) when player positions ships, careful of ship exiting designated grid
enemyPlacement() (find positions of already placed ships to avoid collision and ships touching)

battle()(recursive) when enemy turn starts 0.5 seconds timeout to give some breathing room
enemyShot() if ship has been hit, find adjacent cells if not, randomise shot

shot() find out if hit or miss, and pass corresponding cell to the appropriate function
hit(cell) change data of ship object, play explosion sound and if possible dispay fire on top of ship in the cell. If ship is destroyed shipDestroyed()
miss(cell) play spacey pewpew sound, color cell a non aggressive color and
shipDestroyed()
gameEnd()

*/

//* Events
/*
onkeyup to rotate the ships when placing and placementFinished === false
click on all cells in enemyGrid to be activated when turn boolean favors player

*/

//* Page load