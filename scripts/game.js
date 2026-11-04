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
