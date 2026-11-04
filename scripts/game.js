// Settings and Constants
const TOTAL_SHIELDS = 8;
const PLAYER_SPEED = 250;
const CHASER_SPEED = 150;
const CHASER_LIFE_MIN = 5;
const CHASER_LIFE_MAX = 15;
const DAMAGE_ON_HIT = 15;

// DOM and Context
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Assets Loading
const assets = {
    player: new Image(),
    shield: new Image(),
    chaser: new Image(),
    enemies: [new Image(), new Image(), new Image(), new Image(), new Image()]
};

assets.player.src = 'assets/player.png';
assets.shield.src = 'assets/shield.png';
assets.chaser.src = 'assets/chaser.png';
for (let i = 0; i < 5; i++) assets.enemies[i].src = `assets/enemy${i + 1}.png`;

// Game State Variables
let state = 'menu';
let playerName = "player";
let lastTime = performance.now();
let collected = 0;
let chaserTimer = 5;
let crackProgress = 0;
const keys = {};

// Game Objects
const player = { 
    x: 400, y: 300, w: 30, h: 30, 
    speed: PLAYER_SPEED, hp: 100, invTime: 0 
};

const btnRestart = { x: 250, y: 420, w: 140, h: 50, text: "Restart" };
const btnMenu = { x: 410, y: 420, w: 140, h: 50, text: "On the menu" };

// Arrays
let viruses = [];
let shields = [];
let walls = [];

// Event Listeners
window.addEventListener('keydown', e => { 
    keys[e.key] = true; 
    if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault(); 
});
window.addEventListener('keyup', e => keys[e.key] = false);

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (state === 'menu') {
        playerName = prompt("Enter your name:") || "player";
        resetGame(); 
        state = 'playing';
    } 
    else if (state === 'lose' || state === 'win_screen') {
        if (clickX >= btnRestart.x && clickX <= btnRestart.x + btnRestart.w &&
            clickY >= btnRestart.y && clickY <= btnRestart.y + btnRestart.h) {
            resetGame(); 
            state = 'playing';
        }
        if (clickX >= btnMenu.x && clickX <= btnMenu.x + btnMenu.w &&
            clickY >= btnMenu.y && clickY <= btnMenu.y + btnMenu.h) {
            state = 'menu';
        }
    }
});


// Helper Functions
function checkCollision(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function drawSprite(img, x, y, w, h, fallbackColor) {
    if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, x, y, w, h);
    } else {
        ctx.fillStyle = fallbackColor;
        ctx.fillRect(x, y, w, h);
    }
}

function drawButton(btn, color) {
    ctx.fillStyle = color;
    ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
    
    ctx.fillStyle = '#000';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.text, btn.x + btn.w / 2, btn.y + btn.h / 2);
}

// Initialization and Spawning
function resetGame() {
    player.x = 400; player.y = 300; player.hp = 100; player.invTime = 0;
    collected = 0; chaserTimer = 5; crackProgress = 0;
    viruses = []; shields = [];

    walls = [
        {x: 100, y: 100, w: 200, h: 20}, {x: 500, y: 100, w: 200, h: 20},
        {x: 300, y: 200, w: 20, h: 150}, {x: 100, y: 350, w: 250, h: 20},
        {x: 450, y: 250, w: 20, h: 250}, {x: 600, y: 350, w: 150, h: 20},
        {x: 200, y: 480, w: 300, h: 20}
    ];

    for (let i = 0; i < TOTAL_SHIELDS; i++) {
        let s = { x: 0, y: 0, w: 24, h: 24, isCollected: false };
        do { s.x = Math.random() * 700 + 50; s.y = Math.random() * 500 + 50; } while (walls.some(w => checkCollision(s, w)));
        shields.push(s);
    }

    for (let i = 0; i < 5; i++) spawnVirus(false);
}

function spawnVirus(isChaser) {
    let v = {
        id: Math.floor(Math.random() * 5) + 1,
        x: 0, y: 0, w: 32, h: 32, vx: 0, vy: 0,
        isChaser: isChaser,
        lifeTime: isChaser ? (CHASER_LIFE_MIN + Math.random() * (CHASER_LIFE_MAX - CHASER_LIFE_MIN)) : 0,
        alpha: 1
    };

    do { v.x = Math.random() * 700 + 50; v.y = Math.random() * 500 + 50; } while (walls.some(w => checkCollision(v, w)));

    if (!isChaser) {
        v.vx = (Math.random() - 0.5) * 300;
        v.vy = (Math.random() - 0.5) * 300;
    }
    viruses.push(v);
}

// Update Logic
function update(dt) {
    if (state === 'win_anim') {
        crackProgress += dt * 1.5;
        if (crackProgress > 1.5) state = 'win_screen';
        return;
    }
    if (state !== 'playing') return;

    let prevX = player.x, prevY = player.y;
    if (keys['ArrowLeft'] || keys['a'] || keys['ф']) player.x -= player.speed * dt;
    if (keys['ArrowRight'] || keys['d'] || keys['в']) player.x += player.speed * dt;
    if (keys['ArrowUp'] || keys['w'] || keys['ц']) player.y -= player.speed * dt;
    if (keys['ArrowDown'] || keys['s'] || keys['ы']) player.y += player.speed * dt;
    
    player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));
    
    if (walls.some(w => checkCollision(player, w))) {
        player.x = prevX; player.y = prevY;
    }
    if (player.invTime > 0) player.invTime -= dt;

    if (chaserTimer > 0 && (chaserTimer -= dt) <= 0) spawnVirus(true);

    for (let i = viruses.length - 1; i >= 0; i--) {
        let v = viruses[i];

        if (v.isChaser) {
            let dx = player.x - v.x, dy = player.y - v.y;
            let dist = Math.hypot(dx, dy);
            if (dist > 0) { 
                v.x += (dx / dist) * CHASER_SPEED * dt; 
                v.y += (dy / dist) * CHASER_SPEED * dt; 
            }
            
            v.lifeTime -= dt;
            if (v.lifeTime <= 0) {
                v.alpha -= dt * 2;
                if (v.alpha <= 0) {
                    viruses.splice(i, 1);
                    chaserTimer = 10 + Math.random() * 10; 
                }
            }
        } else {
            v.x += v.vx * dt; v.y += v.vy * dt;
            if (v.x < 0 || v.x + v.w > canvas.width) v.vx *= -1;
            if (v.y < 0 || v.y + v.h > canvas.height) v.vy *= -1;
            if (walls.some(w => checkCollision(v, w))) {
                v.vx *= -1; v.vy *= -1;
                v.x += v.vx * dt * 2; v.y += v.vy * dt * 2;
            }
        }

        if (checkCollision(player, v) && player.invTime <= 0) {
            player.hp -= DAMAGE_ON_HIT; 
            player.invTime = 1.0;
            if (player.hp <= 0) { player.hp = 0; state = 'lose'; }
        }
    }

    for (let s of shields) {
        if (!s.isCollected && checkCollision(player, s)) {
            s.isCollected = true; 
            collected++;
            if (collected >= TOTAL_SHIELDS) state = 'win_anim';
        }
    }
}
