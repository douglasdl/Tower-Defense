const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

// Global variables
const cellSize = 100;
const cellGap = 3;
canvas.width = cellSize * 9;
canvas.height = cellSize * 6;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 50;
let chosenDefender = 1;

let enemiesInterval = 600;
let numberOfResources = 300;

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];
const resources = [];

// Mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
    clicked: false,
}

canvas.addEventListener('mousedown', function(e) {
    mouse.clicked = true;
})

canvas.addEventListener('mouseup', function(e) {
    mouse.clicked = false;
})

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function(event) {
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;
})

canvas.addEventListener('mouseleave', function() {
    mouse.x = undefined;
    mouse.y = undefined;
})

// Game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw() {
        if(mouse.x && mouse.y && collision(this, mouse)) {
            ctx.strokeStyle = 'black';
            //ctx.lineWidth = 3;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}

function createGrid() {
    for(let y = cellSize; y < canvas.height; y += cellSize) {
        for(let x = 0; x < canvas.width; x += cellSize) {
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();

function handleGameGrid() {
    for(let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw();
    }
}

// Projectiles
class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = 20;
        this.speed = 5;
    }
    update(){
        this.x += this.speed;
    }
    draw() {
        ctx.fillStyle = 'pink';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleProjectiles() {
    for(let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
        projectiles[i].draw();
        
        for(let j = 0; j < enemies.length; j++) {
            if(enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])) {
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }

        if(projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
            projectiles.splice(i, 1);
            i--;
        }
    }
}

// Defenders
const defender1 = new Image();
defender1.src = 'images/defender1.png';

const defender2 = new Image();
defender2.src = 'images/defender2.png';

class Defender {
    constructor(x, y) {
        this.x = x + 20;
        this.y = y + 20;
        this.width = cellSize - cellGap * 2 - 20;
        this.height = cellSize - cellGap * 2 - 20;
        this.shooting = false; 
        this.shootNow = false;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 167;
        this.spriteHeight = 243;
        this.minFrame = 0;
        this.maxFrame = 1;
        this.chosenDefender = chosenDefender;
    }
    draw() {
        if(this.chosenDefender === 1) {
            ctx.drawImage(defender1, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        } else if(this.chosenDefender === 2) {
            ctx.drawImage(defender2, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }
        //ctx.fillStyle = 'blue';
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'gold';
        ctx.font = '30px Orbitron';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 0);
    }
    update() {
        // Shooting animation
        if(frame % 12 === 0) {
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
            if(this.frameX === 1) this.shootNow = true;
        }
        // Change to idle animation
        if(this.shooting) {
            this.minFrame = 0;
            this.maxFrame = 1;
        } else {
            this.minFrame = 0;
            this.maxFrame = 1;
        }
        if(this.shooting && this.shootNow) {
            this.timer++;
            if(this.timer % 100 === 0) {
                projectiles.push(new Projectile(this.x + 70, this.y + 35));
                this.shootNow = false;
            }
        } else {
            this.timer = 0;
        }
    }
}

function handleDefenders() {
    for(let i = 0; i < defenders.length; i++) {
        defenders[i].draw();
        defenders[i].update();
        console.log(enemyPositions.indexOf(defenders[i].y));
        if(enemyPositions.indexOf(defenders[i].y) !== -1) {
            defenders[i].shooting = true;
        } else { 
            defenders[i].shooting = false;
        }
        defenders[i].shooting = true;
        for(let j = 0; j < enemies.length; j++) {   
            if(defenders[i] && collision(defenders[i], enemies[j])) {
                enemies[j].movement = 0;
                defenders[i].health -= 1;
            }
            if(defenders[i] && defenders[i].health <= 0) {
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}

const card1 = {
    x: 10,
    y: 10,
    width: 70,
    height: 85,
}

const card2 = {
    x: 90,
    y: 10,
    width: 70,
    height: 85,
}


function chooseDefender() {
    let card1stroke = 'black';
    let card2stroke = 'black';

    if(collision(card1, mouse) && mouse.clicked) {
        chosenDefender = 1;
    } else if(collision(card2, mouse) && mouse.clicked) {
        chosenDefender = 2;
    }

    if(chosenDefender === 1) {
        card1stroke = 'gold';
        card2stroke = 'black';
    } else if(chosenDefender === 2) {
        card1stroke = 'black';
        card2stroke = 'gold';
    } else {
        card1stroke = 'black';
        card2stroke = 'black';
    }


    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(card1.x, card1.y, card1.width, card1.height);
    ctx.strokeStyle = card1stroke;
    ctx.strokeRect(card1.x, card1.y, card1.width, card1.height);
    ctx.drawImage(defender1, 0, 0, 167, 243, card1.x, card1.y, card1.width, card1.height);
    ctx.fillRect(card2.x, card2.y, card2.width, card2.height);
    ctx.strokeStyle = card2stroke;
    ctx.strokeRect(card2.x, card2.y, card2.width, card2.height);
    ctx.drawImage(defender2, 0, 0, 167, 243, card2.x, card2.y, card2.width, card2.height);
}

// Floating Messages
const floatingMessages = [];
class FloatingMessage {
    constructor(value, x, y, size, color) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifeSpan = 0;
        this.color = color;
        this.opacity = 1;
    }
    update() {
        this.y -= 0.3;
        this.lifeSpan++;
        if(this.opacity > 0.03) this.opacity -= 0.03;
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px Orbitron';
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

function handleFloatingMessages() {
    for(let i = 0; i < floatingMessages.length; i++) {
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if(floatingMessages[i].lifeSpan >= 50) {
            floatingMessages.splice(i, 1);
            i--;
        }
    }
}


// Enemies
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = 'images/enemy1.png';
enemyTypes.push(enemy1);

const enemy2 = new Image();
enemy2.src = 'images/enemy2.png';
enemyTypes.push(enemy2);

class Enemy {
    constructor(verticalPosition) {
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.4;
        this.movement = this.speed; 
        this.health = 100;
        this.maxHealth = this.health;
        this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 7;
        this.spriteWidth = 292;
        this.spriteHeight = 410;
    }
    update() {
        if(frame % 10 === 0) {
            this.x -= this.movement; 
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;
        }
    }
    draw() {
        ctx.drawImage(this.enemyType, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        //ctx.fillStyle = 'red';
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Orbitron';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 0);
    }
}

//let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
function handleEnemies() {
    for(let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw();

        if(enemies[i] && enemies[i].x <= 0) {
            gameOver = true;
        }

        if(enemies[i].health <= 0) {
            let gainedResources = enemies[i].maxHealth / 10;
            floatingMessages.push(new FloatingMessage('+ ' + gainedResources, enemies[i].x, enemies[i].y, 30, 'black'));
            floatingMessages.push(new FloatingMessage('+ ' + gainedResources, 430, 40, 30, 'gold'));
            numberOfResources += gainedResources;
            score += gainedResources;
            const findThisIndex = enemyPositions.indexOf(enemies[i].y);
            enemyPositions.splice(findThisIndex, 1);
            enemies.splice(i, 1);
            i--;
        }
    }
    if(frame % enemiesInterval === 0 && score < winningScore) {
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
        enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition);
        if(enemiesInterval > 120) enemiesInterval -= 50;
    }
}

// Resources
const amounts = [20, 30, 40];

const resource1 = new Image();
resource1.src = 'images/resource1.png';

class Resource {
    constructor() {
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = Math.floor(Math.random() * 5 + 1) * cellSize + 25;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 187;
        this.spriteHeight = 202;
        this.minFrame = 0;
        this.maxFrame = 1;
    }
    draw() {
        ctx.drawImage(resource1, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        //ctx.fillStyle = 'yellow';
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Orbitron';
        ctx.fillText(this.amount, this.x + 12, this.y + 36);
    }
}

function handleResources() {
    if(frame % 500 === 0 && score < winningScore) {
        resources.push(new Resource());
    }
    for(let i = 0; i < resources.length; i++) {
        resources[i].draw();
        if(resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
            numberOfResources += resources[i].amount;
            floatingMessages.push(new FloatingMessage('+ ' + resources[i].amount, resources[i].x, resources[i].y, 30, 'black'));
            floatingMessages.push(new FloatingMessage('+ ' + resources[i].amount, 480, 80, 30, 'gold'));
            resources.splice(i, 1);
            i--;
        }
    }
}

// Utilities
function handleGameStatus() {
    ctx.fillStyle = 'gold';
    ctx.font = '30px Orbitron';
    ctx.fillText('SCORE: ' + score, 180, 40);
    ctx.fillText('Resources: ' + numberOfResources, 180, 80);

    if(gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '90px Orbitron';
        ctx.fillText('GAME OVER', 135, 330);
    }

    if(score >= winningScore && enemies.length === 0) {
        ctx.fillStyle = 'black';
        ctx.font = '60px Orbitron';
        ctx.fillText('LEVEL COMPLETE', 130, 300);
        ctx.font = '30px Orbitron';
        ctx.fillText('You win with ' + score + ' points!', 134, 340);
    }
}

canvas.addEventListener('click', function() {
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if(gridPositionY < cellSize) return;
    for(let i = 0; i < defenders.length; i++) {
        if(defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) return;
    }
    let defenderCost = 100;
    if(numberOfResources >= defenderCost) {
        defenders.push(new Defender(gridPositionX, gridPositionY));
        numberOfResources -= defenderCost;
    } else {
        floatingMessages.push(new FloatingMessage('Need more resources', mouse.x, mouse.y, 20, 'black'));
    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleResources();
    handleDefenders();
    handleProjectiles();
    handleEnemies();
    chooseDefender();
    handleGameStatus();
    handleFloatingMessages();
    frame++;
    if(!gameOver) requestAnimationFrame(animate);
    
}
animate();

function collision(first, second) {
    if(!(first.x > second.x + second.width || 
        first.x + first.width < second.x ||
        first.y > second.y + second.height ||
        first.y + first.height < second.y)) {
        return true;
    }
}

window.addEventListener('resize', function() {
    canvasPosition = canvas.getBoundingClientRect();
});