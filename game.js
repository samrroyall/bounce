// GLOBAL VARIABLES AND GETTER/SETTER FUNCTIONS //

const root = document.documentElement; 
// game area variables
let gameHeight = 0;
let gameWidth = 0;
// basket variables
let basketHeight = 0;
let basketWidth = 0;
let basketPos = {
    left: 0,
    right: 0
}
// ball variables
let ballSize = 0;
let ballPos = {
    left: 0,
    right: 0
}
let stepDist = 0;
// scoreboard variables
let wins = 0;
let losses = 0;

function setBasketPos() {
    const basketCoords = document.getElementById("basket").getBoundingClientRect();
    basketHeight = basketCoords.height;
    basketWidth = basketCoords.width;
    basketPos.left = basketCoords.left;
    basketPos.right = basketCoords.right;
    basketPos.top = basketCoords.top;
    basketPos.bottom = basketCoords.bottom;
}

function setBallPos() {
    const ballCoords = document.getElementById("ball").getBoundingClientRect();
    ballSize = ballCoords.width;
    ballPos.left = ballCoords.left;
    ballPos.right = ballCoords.right;
    stepDist = 0.05*ballSize;
}

// BASKET-BALL RELATIVE POSITION FUNCTIONS //

function overRimLeft() {
    return ballPos.left < basketPos.left && ballPos.right > basketPos.left;
}

function overRimRight() {
    return ballPos.left < basketPos.right && ballPos.right > basketPos.right;
}

function overHoop() {
    return (ballPos.left >= basketPos.left && ballPos.right <= basketPos.right);
}

function overBasket() {
    return (ballPos.right > basketPos.left && ballPos.left < basketPos.right);
}

// WIN/LOSS FUNCTIONS //

function pauseBall() {
    const ball = document.getElementById("ball");
    ball.style.setProperty("animation-play-state", "paused");
    const ballShadow = document.getElementById("ball-shadow");
    ballShadow.style.setProperty("animation-play-state", "paused");
}

function updateLosses() {
    losses++;
    let lossesSection = document.getElementById("losses");
    let lossText = "Losses: <span class='loss'>" + losses.toString() + "</span>";
    lossesSection.innerHTML = lossText;   
}

function updateWins() {
    wins++;
    let winsSection = document.getElementById("wins");
    let winText = "Wins: <span class='win'>" + wins.toString() + "</span>";
    winsSection.innerHTML = winText;
}

function handleResult(res) {
    pauseBall();
    if (res === 1) {
        updateWins();
    } else if (res === 0) {
        updateLosses();
    }
    setTimeout(
        start,
        1000
    );
    
}

function checkPosChange() {
    const ball = document.getElementById("ball");
    const ballCoords = ball.getBoundingClientRect();
    const ballBottom = ballCoords.bottom;
    const ballTop = ballCoords.top;
    const ballHeight = ballCoords.height;
    const currOverBasket = overBasket();
    if (currOverBasket && ballBottom >= basketPos.top) {
        const currOverHoop = overHoop();
        const currOverRimLeft = overRimLeft();
        const currOverRimRight = overRimRight();
        if (currOverHoop) {
            if (ballTop >= basketPos.top) {
                handleResult(1);
            } else {
                window.requestAnimationFrame(checkPosChange);
            }
        } else {
            const x0 = ballPos.left + ballSize/2;
            const y0 = ballBottom - ballHeight/2;
            const x = (currOverRimLeft ? basketPos.left : basketPos.right);
            const overlapHeight = (ballHeight/2 * Math.sqrt(
                1 - Math.pow(x - x0, 2)
                  / Math.pow(ballSize/2, 2)
            )) + y0;
            if (overlapHeight > basketPos.top) {
                handleResult(0);
            } else {
                window.requestAnimationFrame(checkPosChange);
            }
        }
    } else {
        window.requestAnimationFrame(checkPosChange);
    }
}

// BALL MOVEMENT FUNCTIONS //

function moveBall(dir) {
    // check validity of move
    const ball = document.getElementById("ball");
    if (ball.style.getPropertyValue("animation-play-state") === "paused") {
        return;
    }
    // get game screen position
    const screenCoords = document.getElementById("game").getBoundingClientRect();
    const currValStr = root.style.getPropertyValue("--ball-pos");
    const currVal = parseInt(currValStr.slice(0, currValStr.length-2));
    // move ball
    if (dir === -1) {
        if (ballPos.left >= screenCoords.left + 2) {
            root.style.setProperty(
                "--ball-pos", 
                (currVal - stepDist).toString() + "px"
            );
        } else {
            root.style.setProperty(
                "--ball-pos", 
                (screenCoords.width - (ballSize + 2)).toString() + "px"
            );
        }
    } else if (dir === 1) {
        if (ballPos.right <= screenCoords.right - (stepDist + 5)) {
            root.style.setProperty(
                "--ball-pos", 
                (currVal + stepDist).toString() + "px"
            );
        } else {
            root.style.setProperty(
                "--ball-pos", 
                "0px"
            );
        }
    }
    // refresh ballPos 
    setBallPos();
}

// INITIALIZATION FUNCTIONS //

function startBall() {
    const ball = document.getElementById("ball");
    ball.style.setProperty("animation-play-state", "running");
    const ballShadow = document.getElementById("ball-shadow");
    ballShadow.style.setProperty("animation-play-state", "running");
}

function setScoreboard() {
    let winsSection = document.getElementById("wins");
    let winText = "Wins: " + wins.toString();
    winsSection.innerHTML = winText;
    let lossesSection = document.getElementById("losses");
    let lossText = "Losses: " + losses.toString();
    lossesSection.innerHTML = lossText;
}

function setPositions() {
    // set game board dimensions 
    let gameCoords = document.getElementById("game").getBoundingClientRect();
    gameHeight = gameCoords.height;
    gameWidth = gameCoords.width;
    // set basket position
    root.style.setProperty("--basket-width", (0.2*gameWidth).toString() + "px");
    root.style.setProperty("--basket-height", (0.12*gameWidth).toString() + "px");
    root.style.setProperty("--basket-pos", (0.65*gameWidth).toString() + "px");
    setBasketPos();
    // set ball position
    root.style.setProperty("--ball-size", (0.17*gameWidth).toString() + "px");
    root.style.setProperty("--ball-pos", (0.15*gameWidth).toString() + "px");
    setBallPos();
}

function start() {
    // set scoreboard
    setScoreboard();
    // set ball and basket positions 
    setPositions();
    // start ball animations
    startBall();
    // start ball position listener
    window.requestAnimationFrame(checkPosChange);

    // wait for arrow
    const leftArrow = 37;
    const rightArrow = 39;
    window.onkeydown = function (k) {
        if (k.keyCode === leftArrow) {
            moveBall(-1);
        } else if (k.keyCode === rightArrow) {
            moveBall(1);
        }
    };
};

window.onload = start;
window.onresize = setPositions;