//World - object taht contains all the things in our app
//Engine - reads current state of the world from the World obj, calculates changes in 
//          positions of the shapes
//Runner - 60hz, makes engine and world work together
//Render - renders objects on screen during engine update
//Body - shape to be displayed

//import matter modules
const { Engine,
    Render,
    Runner,
    World,
    Bodies,
    Body,
    Events,
    // MouseConstraint, 
    // Mouse 
} = Matter;

//MAZE CONFIGURATION
const width = window.innerWidth;
const height = window.innerHeight;
const cellsHorizontal = 12;      //no of cols
const cellsVertical = 10;        //no of rows
const cellWidth = width / cellsHorizontal;
const cellHeight = height / cellsVertical;
const wallSize = 3;


/////BOILERPLATE
const engine = Engine.create();
engine.world.gravity.y = 0;     //disable gravity
const { world: myWorld } = engine;
const render = Render.create({
    engine: engine,
    element: document.body,
    options: {
        width,
        height,
        wireframes: false //colored shapes
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

//mouse
// World.add(myWorld, MouseConstraint.create(engine, {
//     mouse: Mouse.create(render.canvas)
// }));

//WALLS
const outerWalls = [
    //top
    Bodies.rectangle(width / 2, 0, width, 2, {
        isStatic: true
    }),
    //left
    Bodies.rectangle(0, height / 2, 2, height, {
        isStatic: true
    }),
    //bot
    Bodies.rectangle(width / 2, height, width, 2, {
        isStatic: true
    }),
    //right
    Bodies.rectangle(width, height / 2, 2, height, {
        isStatic: true
    })
];


///// MAZE GENERATOR

// //using for loops
// const grid = [];
// for (let i = 0; i < 3; i++) {
//     grid.push([]);
//     for (let j = 0; j < 3; j++){
//         grid[i].push(false);
//     }
// };
const shuffle = (arr) => {
    let counter = arr.length;
    while ( counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter --;
        const temporary = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temporary;
    };
    return arr;
};

//using map
//initialize grid and walls with false (unexplored, has wall)
const grid = Array(cellsVertical) //col
.fill(null)
.map( () => Array(cellsHorizontal).fill(false)) //row

const verticalWalls = Array(cellsVertical)
.fill(null)
.map( () => Array(cellsHorizontal - 1).fill(false))

const horizontalWalls = Array(cellsVertical - 1)
.fill(null)
.map( ()=> Array(cellsHorizontal).fill(false))




////// MAPPING RECURSION
const mapGrid = (row, col) => {

    //check if cell is already explored
    if (grid[row][col]) { 
        return;
    }
    //If not yet explored, mark as visited
    grid[row][col] = true;

    //randomize adjacent cells
    const adjacentCells = shuffle([
        [row - 1, col, 'up'], //up
        [row, col + 1, 'right'], //right
        [row + 1, col, 'down'], //down
        [row, col - 1, 'left'] //left
    ]);
    
    //for each neighboring cell:
    for(let cell of adjacentCells) {
        const [nextRow, nextCol, direction] = cell;
        //check if adjacent cell is out of bounds
        if (nextRow < 0 || nextRow >= cellsVertical || nextCol < 0 || nextCol >= cellsHorizontal) {
            continue;   //if cell is out of bounds, check for another adjacent cell
        };

        if (grid[nextRow][nextCol] === true) {
            continue;   //if cell have already been explored, check for another adjacent cell
        };

        //on horizontal movement, delete vertical wall
        //on vertical movement, delete horizontal wall
        if (direction === 'left') {
            verticalWalls[row][col - 1] = true;
        } else if (direction === 'right') {
            verticalWalls[row][col] = true;
        } else if (direction === 'up') {
            horizontalWalls[row-1][col] = true;
        } else if (direction === 'down') {
            horizontalWalls[row][col] = true;
        }

        mapGrid(nextRow, nextCol)
    };
};

// console.log('grid', grid)
// console.log('verticalWalls', verticalWalls)
// console.log('horizontalWalls', horizontalWalls)



////RANDOMIZE STARTING POSITION FOR RECURSION
const startRow = Math.floor(Math.random() * cellsVertical);
const startCol = Math.floor(Math.random() * cellsHorizontal);

mapGrid(startRow, startCol);
// console.log('starting recursion at', startRow, startCol)


//Draw horizontal walls
//x = colIndex*cellLength + cellLength/2 
//y = rowIndex*cellLength + cellLength
horizontalWalls.forEach( (row, rowIndex) => {
    row.forEach( (isWallEmpty, colIndex) => {
        if (isWallEmpty) { //check if array element is true (no wall)
            return;
        } else {
            const wall = Bodies.rectangle( 
                colIndex * cellWidth + cellWidth / 2,
                rowIndex * cellHeight + cellHeight,
                cellWidth,
                wallSize, {
                    isStatic: true,
                    label: 'wall',
                    render: {
                        fillStyle: 'pink'
                    }
                }
             );
             World.add(myWorld, wall);
        }
    });
});

verticalWalls.forEach( (row, rowIndex) => {
    row.forEach( (isWallEmpty, colIndex) => {
        if (isWallEmpty) {
            return;
        } else {
            const wall = Bodies.rectangle(
                colIndex * cellWidth + cellWidth,
                rowIndex * cellHeight + cellHeight / 2,
                wallSize, 
                cellHeight, {
                    isStatic: true,
                    label: 'wall',
                    render: {
                        fillStyle: 'pink'
                    }
                }
            )
            World.add(myWorld, wall);
        }
    })
})

const goal = Bodies.rectangle(
    width - cellWidth / 2,
    height - cellHeight /2,
    cellWidth * .60,
    cellHeight * .60, {
        isStatic : true,
        label: 'goal',
        render: {
            fillStyle: 'green'
        }
    }
)

const ballRadius = Math.min(cellWidth, cellHeight) / 4;
const ball = Bodies.circle(
    cellWidth / 2,
    cellHeight /2,
    ballRadius,{
        label: 'ball',
        render: {
            fillStyle: 'orange'
        }
    }
)

World.add(myWorld, outerWalls);
World.add(myWorld, ball);
World.add(myWorld, goal);

document.addEventListener('keydown', (event) => {
    const {x: xVel, y: yVel} = ball.velocity;

    if (event.keyCode === 87) {
        Body.setVelocity(ball, {x: xVel, y: yVel-1 })
    }
    if (event.keyCode === 68) {
        Body.setVelocity(ball, {x: xVel + 1, y: yVel })
    }
    if (event.keyCode === 83) {
        Body.setVelocity(ball, {x: xVel, y: yVel+1 })
    }
    if (event.keyCode === 65) {
        Body.setVelocity(ball, {x: xVel - 1, y: yVel })
    }
})

/////WIN CONDITION

Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach( (collision)=> {
        const winningCollision = ['ball','goal'];
        if (winningCollision.includes(collision.bodyA.label) &&
         winningCollision.includes(collision.bodyB.label)) {
            document.querySelector('.winner').classList.remove('hidden');
            myWorld.gravity.y = 1;
            myWorld.bodies.forEach( (currentBody) => {
                if (currentBody.label === 'wall') {
                    Body.setStatic(currentBody, false);
                }
            })
            
         }

    })
});