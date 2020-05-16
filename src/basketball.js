import "./index.css";
import {
  Engine,
  Render,
  World,
  Bodies,
  Body,
  Events,
  Vector
} from "matter-js";
import lottie from "lottie-web";
import {
  getConstants
} from "./constants";
import {
  random,
  extractTouchPoint
} from "./utils";

var isMobile = false; //initiate as false
// device detection
if (
  /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
    navigator.userAgent
  ) ||
  /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
    navigator.userAgent.substr(0, 4)
  )
) {
  isMobile = true;
}

let engine = null;
let render = null; // TODO, remove this render

let touchStart = null;
let ball = null;
let left_point = null;
let right_point = null;
let gameInterval = null;
let ballDiv = null;
let ballCollided = false;
let SHOW_CLOCK = false;
let rimLottie = null;
let basketDetected = false;
let currentTime = 0;
let timerValue = 0;
let timerDiv = null;
let scoreDiv = null;
let gameOverDiv = null;
let finalScoreDiv = null;
let gameEndContainer = null;
let restartButton = null;
let gameEndLottie = null;
let perfectShotDiv = null;

let gameTimer = null;
let backMusicDiv1 = document.querySelector(".music1");
let backMusicDiv2 = document.querySelector(".music2");
let shadowDiv = document.querySelector(".shadow");
const loading = document.querySelector(".loading");
const timerVal = document.querySelector(".timerVal");
const scoreVal = document.querySelector(".scoreVal");
const flameDiv = document.querySelector(".flameDiv");
let tID = null;
let CLOCK_LEFT, CLOCK_TOP;
let clockDiv;
let clockLottie;
let clock;
let rimOnFire = false;
let spacingLeft, spacingTop;
let gameIntervalupdated;
let clockArray = [20, 40];
let clockDisappearTime = 0;
let plusTwo = null;
let timeIncrease = null;
let gameOver = false;
let currentScore = 0;
// render.options.background = "transparent";

function animateFlame() {
  flameDiv.style.display = "initial";
}

function stopFlame() {
  flameDiv.style.display = "none";
}

function adjustAssetdimensions() {
  spacingLeft =
    innerWidth > 500 ?
    innerWidth / 2 - 250 :
    innerWidth / 2 - loading.clientWidth / 2;
  spacingTop =
    innerHeight > 888 ?
    innerHeight / 2 - 444 :
    (innerHeight - loading.clientHeight) / 2;
  loading.style.left = spacingLeft;
  loading.style.top = spacingTop;

  const gameEndContainer = document.querySelector(".gameEndContainer");
  gameEndContainer.style.left = spacingLeft;
  gameEndContainer.style.top = spacingTop;

  const container = document.querySelector(".container");
  container.style.left = spacingLeft;
  container.style.top = spacingTop;

  const actionButton = document.querySelector(".actionButton");
  actionButton.style.display = "initial";
  actionButton.style.width = 0.5 * loading.clientWidth;
  actionButton.style.height = 0.08 * loading.clientHeight;
  actionButton.style.lineHeight = actionButton.style.height.toString();
  actionButton.style.left = 0.25 * loading.clientWidth;

  const instruction = document.querySelector(".instructions");
  instruction.innerHTML =
    "Swipe the ball" +
    "<br>" +
    "Into the basket." +
    "<br>" +
    "You have 60 seconds";
  instruction.style.width = 0.8 * loading.clientWidth;
  instruction.style.top = 0.4 * loading.clientHeight;
  instruction.style.letterSpacing =
    (0.005 * loading.clientWidth).toString() + "px";
  instruction.style.fontSize = (0.07 * loading.clientWidth).toString() + "px";
  instruction.style.lineHeight =
    (0.07 * loading.clientHeight).toString() + "px";

  startBut.textContent = "START";
  startBut.style.top = 0.7 * loading.clientHeight;

  const restartButton = document.querySelector(".restartButton");
  // restartButton.style.display = "initial";
  restartButton.textContent = "RESTART";
  restartButton.style.top = 0.55 * loading.clientHeight;
  restartButton.style.left = 0.25 * loading.clientWidth;
  restartButton.style.width = 0.5 * loading.clientWidth;
  restartButton.style.height = 0.08 * loading.clientHeight;
  restartButton.style.lineHeight = restartButton.style.height.toString();

  const finalScore = document.querySelector(".finalScore");
  finalScore.style.left = 0.25 * loading.clientWidth;
  finalScore.style.top = 0.71 * loading.clientHeight;
  finalScore.style.width = 0.5 * loading.clientWidth;
  finalScore.style.height = 0.08 * loading.clientHeight;
  finalScore.style.lineHeight = finalScore.style.height.toString();

  plusTwo = document.querySelector(".plusTwo");
  plusTwo.style.left = 0.64 * loading.clientWidth;
  plusTwo.style.top = 0.34 * loading.clientHeight;

  timeIncrease = document.querySelector(".timeIncrease");
  timeIncrease.style.display = "none";
  timeIncrease.style.width = 0.25 * loading.clientWidth;
  timerVal.style.display = "initial";
  scoreVal.style.display = "initial";
}

function commence() {
  let {
    innerHeight: h,
    innerWidth: w
  } = window;
  const container = document.querySelector(".container");
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  w = containerWidth;
  h = containerHeight;
  const {
    GRAVITY,
    getUserURL,
    postResURL,
    SLOW_VEL_FAC,
    INFINITE_MASS_RADIUS,
    ROTATION_FAC,
    RIM_HEIGHT,
    RANDOM_VX_FAC,
    RIM_WIDTH,
    RIM_LEFT,
    RIM_TOP,
    BOARD_WIDTH,
    BOARD_HEIGHT,
    GAME_INTERVAL,
    SPEED_Y_FACTOR,
    WALL_WIDTH_FACTOR,
    BALL_RADIUS_FACTOR,
    forceFactor,
    BALL_COLLISION_CATEGORY,
    NO_COLLISION_CATEGORY,
    STILL_BALL_STATE,
    MOVING_BALL_STATE,
    COLLIDING_BALL_STATE,
    CLOCK_SPEED,
    CLOCK_DELAY,
    DELTA,
    largeYForce,
    lessYForce,
  } = getConstants(containerHeight, containerWidth);
  gameIntervalupdated = GAME_INTERVAL;
  let ballState = STILL_BALL_STATE;
  const ballRadius = BALL_RADIUS_FACTOR;

  function initializeWorldElements() {
    engine = Engine.create();
    left_point = Bodies.circle(RIM_LEFT, RIM_TOP, INFINITE_MASS_RADIUS, {
      isStatic: true,
      label: "rim",
      collisionFilter: {
        group: NO_COLLISION_CATEGORY,
      },
    });
    right_point = Bodies.circle(
      RIM_LEFT + RIM_WIDTH - 2 * INFINITE_MASS_RADIUS,
      RIM_TOP,
      INFINITE_MASS_RADIUS, {
        isStatic: true,
        label: "rim",
        collisionFilter: {
          group: NO_COLLISION_CATEGORY,
        },
      }
    );
    const ground = Bodies.rectangle(
      w / 2,
      h,
      3 * w,
      2 * WALL_WIDTH_FACTOR * h, {
        isStatic: true,
        label: "ground",
        collisionFilter: {
          group: BALL_COLLISION_CATEGORY,
        },
      }
    );
    CLOCK_LEFT = RIM_LEFT + RIM_WIDTH / 2 - 0.0725 * w - INFINITE_MASS_RADIUS;
    CLOCK_TOP = RIM_TOP + RIM_HEIGHT;
    clockDiv = document.querySelector(".clock");
    clockDiv.style.width = 0.15 * w;
    clockDiv.style.height = 0.15 * w;
    clockDiv.style.left = CLOCK_LEFT;
    clockDiv.style.top = CLOCK_TOP;

    clockLottie = lottie.loadAnimation({
      container: clockDiv,
      renderer: "svg",
      autoplay: true,
      loop: true,
      animationData: require("./assets/clock.json"),
    });

    ball = Bodies.circle(
      random(2.5 * ballRadius, w - 2.5 * ballRadius),
      (1 - WALL_WIDTH_FACTOR) * h - ballRadius,
      ballRadius, {
        isStatic: false,
        friction: 0.05,
        frictionAir: 0.006,
        frictionStatic: 0,
        restitution: 0.7,
        collisionFilter: {
          group: NO_COLLISION_CATEGORY,
        },
        label: "ball",
      }
    );
    // add all of the bodies to the world
    engine.world.gravity.y = GRAVITY;
    World.add(engine.world, [ground, ball, left_point, right_point]);
    initializeDomElements();
  }

  function initializeDomElements() {
    const board = document.querySelector(".board");
    const rim = document.querySelector(".rim");
    ballDiv = document.querySelector("#ball");
    ballDiv.style.width = ballRadius * 2;
    ballDiv.style.height = ballRadius * 2;
    rim.style.height = RIM_HEIGHT;
    rim.style.width = RIM_WIDTH;
    rim.style.left = left_point.position.x - INFINITE_MASS_RADIUS;
    rim.style.top = left_point.position.y - INFINITE_MASS_RADIUS;
    rim.style.borderRadius = `${INFINITE_MASS_RADIUS}px`;
    rimLottie = lottie.loadAnimation({
      container: rim,
      renderer: "svg",
      autoplay: false,
      loop: false,
      animationData: require("./assets/net.json"),
    });
    timerDiv = document.querySelector(".timerVal");
    scoreDiv = document.querySelector(".scoreVal");
    gameEndContainer = document.querySelector(".gameEndContainer");
    finalScoreDiv = document.querySelector(".finalScore");
    restartButton = document.getElementById("restartButton");
    perfectShotDiv = document.querySelector(".perfectShot");
    plusTwo = document.querySelector(".plusTwo");
    restartButton.onclick = handleRestart;
    rimLottie.goToAndStop(0, true);
    board.style.height = BOARD_HEIGHT;
    board.style.width = BOARD_WIDTH;
    board.style.left =
      RIM_LEFT - INFINITE_MASS_RADIUS - (BOARD_WIDTH - RIM_WIDTH) / 2;
    board.style.top = RIM_TOP + 4 * INFINITE_MASS_RADIUS - BOARD_HEIGHT;
    flameDiv.style.width = 0.26 * containerWidth;
    flameDiv.style.height = 0.14 * containerHeight;
    flameDiv.style.left = `${
      parseInt(rim.style.left) - 0.8 * INFINITE_MASS_RADIUS
    }px`;
    flameDiv.style.top = `${
      parseInt(rim.style.top) - parseInt(flameDiv.style.height)
    }px`;
    timerDiv.innerHTML = `TIME ${gameIntervalupdated - timerValue}`;
    scoreDiv.innerHTML = `SCORE: ${currentScore}`;
    shadowDiv.style.height = 4 * ballRadius;
    shadowDiv.style.width = 4 * ballRadius;
    updateBall(ball);

    gameOverDiv = document.querySelector(".gameOver");
    gameOverDiv.style.display = "none";

    gameEndLottie = lottie.loadAnimation({
      container: gameOverDiv,
      renderer: "svg",
      autoplay: false,
      loop: true,
      animationData: require("./assets/bouncyBall.json"),
    });
  }

  function setBallColliding() {
    ballState = COLLIDING_BALL_STATE;
    ballDiv.classList.add("in-between");
    left_point.collisionFilter.group = BALL_COLLISION_CATEGORY;
    right_point.collisionFilter.group = BALL_COLLISION_CATEGORY;
  }

  function resetBall() {
    if (!basketDetected) {
      stopFlame();
      rimOnFire = false;
    }
    if (basketDetected && SHOW_CLOCK) {
      clockDiv.style.display = "none";
      setTimeout(function () {
        SHOW_CLOCK = false
      }, 1000);
      timeIncrease.style.left = parseInt(clockDiv.style.left) >= 0.74 * w ? 0.74 * w : clockDiv.style.left;
      timeIncrease.style.top = clockDiv.style.top;
      showTimeIncrease(CLOCK_DELAY);
      gameIntervalupdated += 10;
    }
    ballCollided = false;
    ballState = STILL_BALL_STATE;
    ball.velSet = false;
    left_point.collisionFilter.group = NO_COLLISION_CATEGORY;
    right_point.collisionFilter.group = NO_COLLISION_CATEGORY;
    Body.setPosition(ball, {
      x: random(2.5 * ballRadius, w - 2.5 * ballRadius),
      y: (1 - 2 * WALL_WIDTH_FACTOR) * h,
    });
    Body.setVelocity(ball, {
      x: 0,
      y: 0,
    });
    ballDiv.classList.add("fade-out");
    setTimeout(() => {
      ballDiv.classList.remove("fade-out");
      ballDiv.classList.remove("in-between");
      updateBall(ball);
    }, 100);
  }

  function updateBall(ball, ballState) {
    let scale = 1.3;
    if (ballState === MOVING_BALL_STATE) {
      const yPos = Math.abs(ball.position.y);
      const yFactor = yPos / (0.9 * h);
      scale = 1 + 0.3 * yFactor;
    } else if (ballState === COLLIDING_BALL_STATE) {
      scale = 1;
    }
    if (!ballState) shadowDiv.style.opacity = 1;
    shadowDiv.style.left =
      ball.position.x - 2 * ballRadius + parseInt(loading.style.left);
    shadowDiv.style.top =
      ball.position.y + 0.75 * ballRadius + parseInt(loading.style.top);

    Body.set(ball, {
      angle: ball.angle + ball.velocity.x * 0.014,
    });
    ballDiv.style.left = ball.position.x - ballRadius;
    ballDiv.style.top = ball.position.y - ballRadius;
    ballDiv.style.transform = `rotate(${ball.angle}rad) scale(${scale})`;
  }

  function gameLoop() {
    if (ballState === MOVING_BALL_STATE) {
      shadowDiv.style.opacity = 0.25;
      updateBall(ball, ballState);
      if (ball.velocity.y > 0) {
        setBallColliding();
      }
    } else if (ballState === COLLIDING_BALL_STATE) {
      updateBall(ball, ballState);
      if (
        ball.position.x < 0 ||
        ball.position.x > w + ballRadius ||
        ball.position.y > 0.75 * h
      ) {
        resetBall();
      } else if (
        ball.position.x > RIM_LEFT &&
        ball.position.x < RIM_LEFT + RIM_WIDTH &&
        ball.position.y > RIM_TOP &&
        ball.position.y < RIM_TOP + DELTA &&
        !basketDetected
      ) {
        if (!ballCollided) {
          if (rimOnFire) {
            perfectShotDiv.play();
            showPoints("+5");
            currentScore += 5;
          } else {
            perfectShotDiv.play();
            showPoints("+2");
            currentScore += 2;
            animateFlame();
            rimOnFire = true;
          }
        } else {
          if (rimOnFire) {
            showPoints("+3");
            currentScore += 3;
          } else {
            showPoints("+1");
            currentScore += 1;
          }
          rimOnFire = false;
        }
        scoreDiv.innerHTML = `SCORE: ${currentScore}`;
        rimLottie.setSpeed(3);
        rimLottie.playSegments([0, 30], true);
        basketDetected = true;
      } else if (
        ball.position.y > RIM_TOP &&
        ball.velocity.y > 0 &&
        ball.position.x > RIM_LEFT &&
        ball.position.x < RIM_LEFT + RIM_WIDTH &&
        !ball.velSet &&
        !ball.slow
      ) {
        Body.setVelocity(ball, {
          x: 0,
          y: ball.velocity.y,
        });
        ball.velSet = true;
      }
    }
    if (clockDisappearTime === timerValue) {
      SHOW_CLOCK = false;
      clockDiv.style.display = "none";
    }
    if (clockArray.includes(timerValue) && !SHOW_CLOCK) {
      console.log('here: ', SHOW_CLOCK)
      clockDiv.style.display = "initial";
      SHOW_CLOCK = true;
      console.log('here: ', SHOW_CLOCK)
      clockDisappearTime = timerValue + CLOCK_DELAY;
    }
    Engine.update(engine);
    !gameOver && requestAnimationFrame(gameLoop);
  }

  function showPoints(text) {
    plusTwo.textContent = text;
    plusTwo.style.display = "initial";
    setTimeout(function () {
      plusTwo.style.display = "none";
    }, 1000);
  }

  function showTimeIncrease(delay) {
    timeIncrease.textContent = `+${delay} sec`;
    timeIncrease.style.display = "initial";
    setTimeout(function () {
      timeIncrease.style.display = "none";
    }, 1000);
  }

  if (isMobile) {
    document.body.addEventListener("touchstart", (e) => {
      touchStart = extractTouchPoint(e);
    });
  } else {
    document.body.addEventListener("mousedown", (e) => {
      touchStart = {
        x: e.clientX,
        y: e.clientY,
      };
    });
  }

  if (isMobile) {
    document.body.addEventListener("touchend", (e) => {
      const touchEnd = extractTouchPoint(e);
      if (touchStart && ballState === STILL_BALL_STATE && !gameOver) {
        const deltaX = touchEnd.x - touchStart.x;
        const deltaY = touchEnd.y - touchStart.y;
        performBallShoot(deltaX, deltaY);
      }
    });
  } else
    document.body.addEventListener("mouseup", (e) => {
      const touchEnd = {
        x: e.clientX,
        y: e.clientY,
      };
      if (touchStart && ballState === STILL_BALL_STATE && !gameOver) {
        const deltaX = touchEnd.x - touchStart.x;
        const deltaY = touchEnd.y - touchStart.y;
        performBallShoot(deltaX, deltaY);
      }
    });

  function handleGameOver() {
    gameOver = true;
    rimOnFire = false;
    stopFlame();
    shadowDiv.style.display = "none";
    clockDiv.style.display = "none";
    gameOverDiv.style.display = "initial";
    gameEndContainer.style.display = "initial";
    gameEndLottie.play();
    timerDiv.innerHTML = `TIME: 0`;
    ballDiv.style.display = "none";
    finalScoreDiv.innerHTML = `SCORE: ${currentScore}`;
    cancelAnimationFrame(gameInterval);
    clearInterval(gameTimer);
  }

  function handleRestart(e) {
    if (!backMusicDiv1.paused || !backMusicDiv2.paused) {
      backMusicDiv1.pause();
      backMusicDiv2.pause();
    }
    backMusicDiv1.play();
    shadowDiv.style.display = "initial";
    gameOverDiv.style.display = "none";
    gameEndContainer.style.display = "none";
    ballDiv.style.display = "initial";
    gameEndLottie.pause();
    scoreDiv.innerHTML = `SCORE: 0`;
    currentScore = 0;
    timerValue = 0;
    currentTime = 0;
    gameIntervalupdated = 60;
    SHOW_CLOCK = false;
    ballCollided = false;
    rimOnFire = false;
    clockDiv.style.display = "none";
    timerDiv.innerHTML = `TIME: ${gameIntervalupdated - timerValue}`;
    gameOver = false;
    gameInterval = requestAnimationFrame(gameLoop);
    resetBall();
    startGameTimer();
  }

  function startGameTimer() {
    gameTimer = setInterval(() => {
      timerValue++;
      if (timerValue >= gameIntervalupdated) {
        return handleGameOver();
      }
      timerDiv.innerHTML = `TIME: ${gameIntervalupdated - timerValue}`;
    }, 1000);
  }

  function performBallShoot(deltaX, deltaY) {
    let yForce = largeYForce;
    if (Math.abs(deltaY) > 150) {
      ball.slow = false;
      yForce = largeYForce;
    } else {
      ball.slow = true;
      yForce = lessYForce;
    }
    Body.setVelocity(ball, {
      x: deltaX * forceFactor,
      y: yForce,
    });
    ball.velocity.y = 0;
    ballCollided = false;
    basketDetected = false;
    ballState = MOVING_BALL_STATE;
  }

  initializeWorldElements();
  gameInterval = requestAnimationFrame(gameLoop);
  startGameTimer();

  Events.on(engine, "collisionStart", function (event) {
    event.pairs.forEach((pair) => {
      const {
        bodyA,
        bodyB
      } = pair;
      if (
        (bodyA.label === "ball" && bodyB.label === "rim") ||
        (bodyA.label === "rim" && bodyB.label === "ball")
      ) {
        rimLottie.playSegments([30, 45], true);
        rimLottie.setSpeed(1.5);
        stopFlame();
        window.navigator &&
          window.navigator.vibrate &&
          window.navigator.vibrate(50);
        ballCollided = true
      }
    });
  })
};

function handleVisibilityChange() {
  if (!document.hidden) {
    if (backMusicDiv1.paused) backMusicDiv1.play();
    else if (backMusicDiv2.paused) backMusicDiv2.play();
  } else {
    if (!backMusicDiv1.paused) backMusicDiv1.pause();
    else if (!backMusicDiv2.paused) backMusicDiv2.pause();
  }
}

window.document.addEventListener(
  "readystatechange",
  function () {
    if (document.readyState == "complete") {
      adjustAssetdimensions();
      startBut.onclick = function () {
        gtag("send", {
          hitType: "event",
          eventCategory: "game",
          eventAction: "play",
          eventLabel: "basketballplay",
        });
        loading.style.display = "none";
        backMusicDiv1.volume = 0.25;
        backMusicDiv1.play();
        backMusicDiv1.addEventListener("ended", () => {
          backMusicDiv2.volume = 0.25;
          backMusicDiv2.play();
        });
        backMusicDiv2.addEventListener("ended", () => {
          backMusicDiv1.play();
        })
        document.addEventListener("visibilitychange", handleVisibilityChange);
        commence();
      };
    }
  },
  false
);