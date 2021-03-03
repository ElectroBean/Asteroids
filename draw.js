var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas()
{
	canvas.width = window.innerWidth; 
	canvas.height = window.innerHeight - 150;
}
resizeCanvas();
// set up some event handlers to process keyboard input
window.addEventListener('keydown', function(evt) { onKeyDown(evt); }, false);
window.addEventListener('keyup', function(evt) { onKeyUp(evt); }, false);
// delta time
var startFrameMillis = Date.now();
var endFrameMillis = Date.now();
function getDeltaTime() // Only call this function once per frame
{
endFrameMillis = startFrameMillis;
startFrameMillis = Date.now();
var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
if (deltaTime > 1) // validate that the delta is within range
{
deltaTime = 1;
}
return deltaTime;
}
var buttonIsDown = false;
var asteroids = [];
var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;
var gameState = STATE_SPLASH;
var score = 0;
var highscore = localStorage.getItem("highscore");
if(highscore == null)
{
	highscore = 0;
}

document.getElementById("result").innerHTML = highscore;

var spawnTimer = 0; 
//various speeds
var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;
var ASTEROID_SPEED = 1;
var PLAYER_SPEED = 1;
var PLAYER_TURN_SPEED = 0.065;
var BULLET_SPEED = 15;


var space = document.createElement("img");
space.src = "images/SPACE.png"
var background = [];
for(var y=0;y<22;y++)
{
background[y] = [];
for(var x=0; x<32; x++)
background[y][x] = space;
}

// player variable
var player = {
image: document.createElement("img"),
x: SCREEN_WIDTH/2,
y: SCREEN_HEIGHT/2,
width: 93,
height: 80,
directionX: 0,
directionY: 0,
angularDirection: 0,
rotation: 0,
isDead: false
};
player.image.src = "images/ship.png";

// bullet variable
var bullets = [];

//key codes
var KEY_SPACE = 32;
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_A = 65
var KEY_D = 68
var shootTimer = 0; 
var KEY_R = 82;
var shoot = false;
var KEY_H = 72;

//begin confusing stuff now.......................................................
function onKeyDown(event)
{
if(event.keyCode == KEY_UP)
{
player.directionY = 1;
buttonIsDown = true;
}
if(event.keyCode == KEY_DOWN)
{
}
if(event.keyCode == KEY_LEFT)
{
player.angularDirection = -1.4; 

}
if(event.keyCode == KEY_RIGHT)
{
player.angularDirection = 1.4;

}
if(event.keyCode == KEY_SPACE)
{
shoot = true;
}
if(event.keyCode == KEY_R)
{
	tryAgain();
}
if(event.keyCode == KEY_H)
{
	localStorage.setItem("highscore", 0);
	highscore = 0;
	document.getElementById("result").innerHTML = 0;
}
}
//key up function
function onKeyUp(event)
{
if(event.keyCode == KEY_UP)
{
buttonIsDown = false;
}
if(event.keyCode == KEY_DOWN)
{
player.directionY = 0;

}
if(event.keyCode == KEY_LEFT)
{
player.angularDirection = 0;

}
if(event.keyCode == KEY_RIGHT)
{
player.angularDirection = 0;

}
if(event.keyCode == KEY_SPACE)
{
	shoot = false;
}
//end keyup
}

//VARIOUS FUNCTIONS \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/

// THIS THING SHOWS INTERSECTS BETWEEN VARIABLES
// tests if two rectangles are intersecting.
// Pass in the x,y coordinates, width and height of each rectangle.
// Returns 'true' if the rectangles are intersecting
function intersects(x1, y1, w1, h1, x2, y2, w2, h2)
{
if(y2 + h2 < y1 || x2 + w2 < x1 || x2 > x1 + w1 || y2 > y1 + h1)
{
return false;
}
return true;
}
//asteroid wrap
function AsteroidWrap()
{
for(var i=0; i<asteroids.length; i++)
{
if(asteroids[i].x < 0)
{
	asteroids[i].x = SCREEN_WIDTH;
	
}
if(asteroids[i].x - 34.5 > SCREEN_WIDTH) 
{
	asteroids[i].x = 0;
	
}
if(asteroids[i].y +37.5 < 0)
{
    asteroids[i].y = SCREEN_HEIGHT;
	 
}
if(asteroids[i].y -37.5 > SCREEN_HEIGHT)
{
	asteroids[i].y = 0;
	
}
}
}

function PlayerWrap()
{
if(player.x < 0)
{
	player.x = innerWidth;
	
}
if(player.x > innerWidth) 
{
	player.x = 0;
	
}
if(player.y < 0)
{
	player.y = innerHeight;
	
}
if(player.y > innerHeight)
{
	player.y = 0;
	
}
}
//bullet wrap
function BulletWrap()
{
for(var i=0; i<bullets.length; i++)
{
if(bullets[i].x < 0)
{
	bullets[i].x = SCREEN_WIDTH;
	
}
if(bullets[i].x > SCREEN_WIDTH) 
{
	bullets[i].x = 0;
	
}
if(bullets[i].y < 0)
{
    bullets[i].y = SCREEN_HEIGHT;
	 
}
if(bullets[i].y > SCREEN_HEIGHT)
{
	bullets[i].y = 0;
	
}
}
}

//draw image function
function DrawImage(ctx, img, posX, posY, ang)
{
   ctx.save()
       ctx.translate(posX, posY);
	   ctx.rotate(ang);
	   ctx.drawImage(img, -img.width/2, -img.height/2)
   ctx.restore()
}
//shoot function

function playerShoot(deltaTime)
{
var bullet = {
image: document.createElement("img"),
x: player.x,
y: player.y,
width: 5,
height: 5,
velocityX: 0,
velocityY: 0,
rotation: 0,
};
bullet.image.src = "images/bullet.png";

// start off with a velocity that shoots the bullet straight up
var velX = 0;
var velY = 1;
// now rotate this vector acording to the ship's current rotation
var s = Math.sin(player.rotation);
var c = Math.cos(player.rotation);
// for an explanation of this formula,
// see http://en.wikipedia.org/wiki/Rotation_matrix
var xVel = (velX * c) - (velY * s);
var yVel = (velX * s) + (velY * c);
bullet.velocityX = xVel * BULLET_SPEED;
bullet.velocityY = yVel * BULLET_SPEED;

// finally, add the bullet to the bullets array
	bullets.push(bullet);
}


//asteroid stuff
// rand(floor, ceil)
// Return a random number within the range of the two input variables
function rand(floor, ceil)
{
return Math.floor( (Math.random()* (ceil-floor)) +floor );
}
// Create a new random asteroid and add it to our asteroids array.
// We'll give the asteroid a random position (just off screen) and
// set it moving towards the center of the screen
function spawnAsteroid()
{
// make a random variable to specify which asteroid image to use
// (small, mediam or large)
var type = rand(0, 3);
// create the new asteroid
var asteroid = {};
asteroid.image = document.createElement("img");
asteroid.image.src = "images/kappa.png";
asteroid.width = 81;
asteroid.height = 115;
// to set a random position just off screen, we'll start at the centre of the
// screen then move in a random direction by the width of the screen
var x = SCREEN_WIDTH/2;
var y = SCREEN_HEIGHT/2;
var dirX = rand(-10,10);
var dirY = rand(-10,10);
// 'normalize' the direction (the hypotenuse of the triangle formed
// by x,y will equal 1)
var magnitude = (dirX * dirX) + (dirY * dirY);
if(magnitude != 0)
{
var oneOverMag = 1 / Math.sqrt(magnitude);
dirX *= oneOverMag;
dirY *= oneOverMag;
}
// now we can multiply the dirX/Y by the screen width to move that amount from
// the centre of the screen
var movX = dirX * SCREEN_WIDTH;
var movY = dirY * SCREEN_HEIGHT;
// add the direction to the original position to get the starting position of the
// asteroid
asteroid.x = x + movX;
asteroid.y = y + movY;
// now, the easy way to set the velocity so that the asteroid moves towards the
// centre of the screen is to just reverse the direction we found earlier
asteroid.velocityX = -dirX * ASTEROID_SPEED;
asteroid.velocityY = -dirY * ASTEROID_SPEED;
// finally we can add our new asteroid to the end of our asteroids array
asteroids.push(asteroid);
}

function tryAgain()
{
if(gameState == STATE_GAMEOVER)
	{
		score = 0;
		asteroids.length = 0;
		player.x = SCREEN_WIDTH/2;
		player.y = SCREEN_HEIGHT/2;
		player.rotation = 0;
		player.isDead = false;
		gameovertimer = 2;
		gameState = STATE_GAME;
		bullets.length = 0;
		firstGameOver = true;
		PLAYER_SPEED = 0;
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//THIS IS THE RUN FUNCTION THAT RUNS THINGS FOR THE GAME TO RUN
function run()
{
context.fillStyle = "#ccc";
context.fillRect(0, 0, canvas.width, canvas.height);
var deltaTime = getDeltaTime();
switch(gameState)
{
case STATE_SPLASH:
runSplash(deltaTime);
break;
case STATE_GAME:
runGame(deltaTime);
break;
case STATE_GAMEOVER:
runGameOver(deltaTime);
break;
}
//end run
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var splashTimer = 3;
function runSplash(deltaTime)
{
splashTimer -= deltaTime;
if(splashTimer <= 0)
{
gameState = STATE_GAME;
return;
}
for(var y=0; y<22; y++)
{
for(var x=0; x<32; x++)
{
context.drawImage(background[y][x], x*600, y*451);
}
}
context.font="92px Franklin Gothic Medium Condensed";
context.textAlign = "center";
context.fillStyle = "black";
context.strokeStyle = "gold";


context.fillText("Welcome to Asteroids", SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
context.strokeText("Welcome to Asteroids", SCREEN_WIDTH/2, SCREEN_HEIGHT/2);

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//run game function
function runGame(deltaTime)
{
	// draw the tiled background (make sure you do this first, so everything
// else in the scene will be drawn on top of the tiled background)
for(var y=0; y<22; y++)
{
for(var x=0; x<32; x++)
{
context.drawImage(background[y][x], x*600, y*451);
}
}
if(player.isDead == true)
	{
		gameState = STATE_GAMEOVER;
		         
	}
// update the shoot timer
if(shootTimer > 0)
shootTimer -= deltaTime;
//makes it so if i push another button i can still shoot.
// i moved shootTimer and playerShoot from the keyDown function to here.
//don't put semicolons at the end of if functions.
if(shoot == true && shootTimer <= 0 && player.isDead == false)
{
	playerShoot();
	shootTimer += 0.2;
	
}
// update all the bullets
for(var i=0; i<bullets.length; i++)
{
bullets[i].x += bullets[i].velocityX;
bullets[i].y += bullets[i].velocityY;
}
for(var i=0; i<bullets.length; i++)
{
// check if the bullet has gone out of the screen boundaries
// and if so kill it
if(bullets[i].x < -bullets[i].width ||
   bullets[i].x > SCREEN_WIDTH ||
   bullets[i].y < -bullets[i].height ||
   bullets[i].y > SCREEN_HEIGHT)
{ // remove 1 element at position i
bullets.splice(i, 1);
// because we are deleting elements from the middle of the
// array, we can only remove 1 at a time. So, as soon as we
// remove 1 bullet stop.
break;
}
}
//score board
{
    context.font = "30px Comic Sans MS";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText(score, 100 ,  50);
}
// draw all the bullets
for(var i=0; i<bullets.length; i++)
{
context.drawImage(bullets[i].image,
bullets[i].x - bullets[i].width/2,
bullets[i].y - bullets[i].height/2);
}
// update all the asterioids in the asteroids array
for(var i=0; i<asteroids.length; i++)
{
// update the asteroids position according to its current velocity.
// TODO: Dont forget to multiply by deltaTime to get a constant speed
asteroids[i].x = asteroids[i].x + asteroids[i].velocityX;
asteroids[i].y = asteroids[i].y + asteroids[i].velocityY;
// TODO: check if the asteroid has gone out of the screen boundaries
// If so, wrap the astroid around the screen so it comes back from the
// other side
}
// draw all the asteroids
for(var i=0; i<asteroids.length; i++)
{
context.drawImage(asteroids[i].image, asteroids[i].x, asteroids[i].y);
}
if (asteroids.length <=9)
{
spawnTimer -= deltaTime;
if(spawnTimer <= 0)
{
spawnTimer = 1;
spawnAsteroid();
}
}
//asteroid v player
if(player.isDead == false)
{
for(var i=0; i<asteroids.length; i++)
{
var hit = intersects(
asteroids[i].x, asteroids[i].y,
asteroids[i].width, asteroids[i].height,
player.x, player.y,
player.width, player.height);
if(hit == true)
{
player.isDead = true;
asteroids.splice(i, 1);
break;

}
}
}
// calculate sin and cos for the player's current rotation
var s = Math.sin(player.rotation);
var c = Math.cos(player.rotation);
// figure out what the player's velocity will be based on the current rotation
// (so that if the ship is moving forward, then it will move forward according to its
// rotation. Without this, the ship would just move up the screen when we pressed 'up',
// regardless of which way it was rotated)
// for an explanation of this formula, see http://en.wikipedia.org/wiki/Rotation_matrix
var xDir = (player.directionX * c) - (player.directionY * s);
var yDir = (player.directionX * s) + (player.directionY * c);
var xVel = xDir * PLAYER_SPEED;
var yVel = yDir * PLAYER_SPEED;
player.x += xVel;
player.y += yVel;
player.rotation += player.angularDirection * PLAYER_TURN_SPEED;
//doesn't draw the player if it's dead
if (player.isDead == false)
{
context.save();
context.translate(player.x, player.y);
context.rotate(player.rotation);
context.drawImage(player.image, -player.width/2, -player.height/2);
context.restore();
}
// check if any bullet intersects any asteroid. If so, kill them both
for(var i=0; i<asteroids.length; i++)
{
for(var j=0; j<bullets.length; j++)
{
if(intersects(
bullets[j].x, bullets[j].y,
bullets[j].width, bullets[j].height,
asteroids[i].x, asteroids[i].y,
asteroids[i].width, asteroids[i].height) == true)
{
asteroids.splice(i, 1);
bullets.splice(j, 1);
score += 10;
break;
}
}
}

if(buttonIsDown == true && PLAYER_SPEED <= 8)
{
	PLAYER_SPEED += 0.1;
}

if(buttonIsDown == false && PLAYER_SPEED > 0)
{
	PLAYER_SPEED -= 0.05;
}


//wrap functions
AsteroidWrap();
PlayerWrap();
return;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var firstGameOver = true;
var gothighscore = false;
function runGameOver(deltaTime)
{	
if(firstGameOver == true)
{
	firstGameOver = false;
    if(score > highscore)
{
	gothighscore = true;
	localStorage.setItem("highscore", score);
	highscore = score;
}
else{
     gothighscore = false;  
}
}	


		for(var y=0; y<22; y++)
{
    for(var x=0; x<32; x++)
{
    context.drawImage(background[y][x], x*600, y*451);
}
}
if(gothighscore == false)
{
context.fillStyle = 'black';
context.lineWidth = 10;
context.strokeStyle = 'gold';
context.lineWidth = 1;
context.font = '900 70px Franklin Gothic Demi';
context.fillText('Game Over! You Scored: ' +score, SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
context.strokeText('Game Over! You Scored: ' +score, SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
context.fill();
context.stroke();
context.fillStyle = 'black';
context.lineWidth = 10;
context.strokeStyle = 'gold';
context.lineWidth = 1;
context.font = '900 55px Franklin Gothic Demi';
context.fillText('Press R To Try Again', SCREEN_WIDTH/2, SCREEN_HEIGHT/2 +50);
context.strokeText('Press R To Try Again', SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 50);
context.fill();
context.stroke();  
context.fillStyle = 'black';
context.lineWidth = 10;
context.strokeStyle = 'gold';
context.lineWidth = 1;
context.font = '900 40px Franklin Gothic Demi';
context.fillText("Current highscore is: " +highscore, SCREEN_WIDTH/2, SCREEN_HEIGHT/2 +100);
context.strokeText("Current highscore is: " +highscore, SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 100);
context.fill();
context.stroke();
}

if(gothighscore == true)
{
context.fillStyle = 'gold';
context.lineWidth = 10;
context.font = '900 25px Franklin Gothic Demi';
context.fillText("YOU BEAT THE HIGHSCORE! THE NEW HIGH SCORE IS: " +score, SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
context.fill();
context.fillStyle = 'gold';
context.lineWidth = 10;
context.font = '900 20px Franklin Gothic Demi';
context.fillText("Press R to go at it again!", SCREEN_WIDTH/2, SCREEN_HEIGHT/2 +20);
context.fill();

document.getElementById("result").innerHTML = highscore;
}
}


//-------------------- Don't modify anything below here
// This code will set up the framework so that the 'run' function is
// called 60 times per second. We have some options to fall back on
// in case the browser doesn't support our preferred method.
(function() {
 var onEachFrame;
 if (window.requestAnimationFrame) {
 onEachFrame = function(cb) {
 var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
 _cb();
 };
 } else if (window.mozRequestAnimationFrame) {
 onEachFrame = function(cb) {
 var _cb = function() { cb();
window.mozRequestAnimationFrame(_cb); }
 _cb();
 };
 } else {
 onEachFrame = function(cb) {
 setInterval(cb, 1000 / 60);
 }
 }

 window.onEachFrame = onEachFrame;
})();
window.onEachFrame(run);