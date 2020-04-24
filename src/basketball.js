import "./index.css";
import { Engine, Render, World, Bodies, Body, Events } from "matter-js";
import lottie from "lottie-web";
import {getConstants} from './constants'
import { random, extractTouchPoint } from "./utils";

let engine = null;
let render = null; // TODO, remove this render

let touchStart = null;
let ball = null;
let left_point = null;
let right_point = null;
let gameInterval = null;
let ballDiv = null;
let perfectShot = false;
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
let backMusicDiv1 = document.querySelector(".music1");
let backMusicDiv2 = document.querySelector(".music2");
let shadowDiv = document.querySelector(".shadow");
const loading = document.querySelector(".loading");
let plusTwo = null;
let gameOver = false;
let currentScore = 0;
// render.options.background = "transparent";

function adjustAssetdimensions() {
  const spacingLeft = (innerWidth > 500) ? innerWidth/2 - 250: innerWidth/2 - loading.clientWidth/2;
  const spacingTop = (innerHeight > 888) ? innerHeight/2 - 444: (innerHeight - loading.clientHeight)/2;
  loading.style.left = spacingLeft;
  loading.style.top = spacingTop;

  const gameEndContainer = document.querySelector(".gameEndContainer");
  gameEndContainer.style.left = spacingLeft;
  gameEndContainer.style.top = spacingTop;


  const container = document.querySelector(".container");
  container.style.left = spacingLeft;
  container.style.top = spacingTop;


  const actionButton = document.querySelector(".actionButton");
  actionButton.style.width = 0.5 * loading.clientWidth;
  actionButton.style.height = 0.08 * loading.clientHeight;
  actionButton.style.lineHeight = (actionButton.style.height).toString();
  actionButton.style.left = 0.25* loading.clientWidth;


  const instruction = document.querySelector(".instructions");
  instruction.style.width = 0.8*loading.clientWidth;
  instruction.style.top = 0.4*loading.clientHeight;
  instruction.style.letterSpacing = (0.005 * loading.clientWidth).toString() +'px';
  instruction.style.fontSize = (0.07* loading.clientWidth).toString() + 'px';
  instruction.style.lineHeight = (0.07*loading.clientHeight).toString() + 'px';

  startBut.style.top = 0.7*loading.clientHeight;

  const restartButton = document.querySelector(".restartButton");
  restartButton.style.top = 0.55*loading.clientHeight;
  restartButton.style.left = 0.25* loading.clientWidth;
  restartButton.style.width = 0.5 * loading.clientWidth;
  restartButton.style.height = 0.08 * loading.clientHeight;
  restartButton.style.lineHeight = (restartButton.style.height).toString();


  const finalScore = document.querySelector(".finalScore");
  finalScore.style.left = 0.25* loading.clientWidth;
  finalScore.style.top = 0.71*loading.clientHeight;
  finalScore.style.width = 0.5 * loading.clientWidth;
  finalScore.style.height = 0.08 * loading.clientHeight;
  finalScore.style.lineHeight = (finalScore.style.height).toString();


  plusTwo = document.querySelector(".plusTwo");
  plusTwo.style.left = 0.64* loading.clientWidth;
  plusTwo.style.top = 0.34* loading.clientHeight;

}

function commence() {
  let { innerHeight: h, innerWidth: w } = window;
  const container = document.querySelector(".container")
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
    DELTA,
    largeYForce,
    lessYForce
  } = getConstants(containerHeight, containerWidth);
  let ballState = STILL_BALL_STATE;
  const ballRadius = BALL_RADIUS_FACTOR;
  function initializeWorldElements() {
    engine = Engine.create();
    // render = Render.create({
    //   element: document.body,
    //   engine: engine,
    //   options: {
    //     width: containerWidth,
    //     height: containerHeight,
    //     wireframes: false
    //   }
    // });
    left_point = Bodies.circle(RIM_LEFT, RIM_TOP, INFINITE_MASS_RADIUS, {
      isStatic: true,
      collisionFilter: { group: NO_COLLISION_CATEGORY }
    });
    right_point = Bodies.circle(
      RIM_LEFT + RIM_WIDTH - 2 * INFINITE_MASS_RADIUS,
      RIM_TOP,
      INFINITE_MASS_RADIUS,
      {
        isStatic: true,
        collisionFilter: { group: NO_COLLISION_CATEGORY }
      }
    );
    const ground2 = Bodies.rectangle(
      w / 2,
      h,
      3 * w,
      2 * WALL_WIDTH_FACTOR * h,
      {
        isStatic: true,
        collisionFilter: { group: BALL_COLLISION_CATEGORY }
      }
    );

    ball = Bodies.circle(
      random(2.5 * ballRadius, w - 2.5 * ballRadius),
      (1 - WALL_WIDTH_FACTOR) * h - ballRadius,
      ballRadius,
      {
        isStatic: false,
        friction: 0.05,
        frictionAir: 0.006,
        frictionStatic: 0,
        restitution: 0.7,
        collisionFilter: { group: NO_COLLISION_CATEGORY }
      }
    );
    // add all of the bodies to the world
    engine.world.gravity.y = GRAVITY;
    World.add(engine.world, [ground2, ball, left_point, right_point]);
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
      animationData: require("./assets/net.json")
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
    timerDiv.innerHTML = `TIME ${GAME_INTERVAL - timerValue}`;
    scoreDiv.innerHTML = `SCORE: ${currentScore}`;
    shadowDiv.style.height = 4 * ballRadius;
    shadowDiv.style.width = 4* ballRadius;
    updateBall(ball);

    gameOverDiv = document.querySelector(".gameOver");
    gameOverDiv.style.display = "none";

    gameEndLottie = lottie.loadAnimation({
      container: gameOverDiv,
      renderer: "svg",
      autoplay: false,
      loop: true,
      animationData: require("./assets/bouncyBall.json")
    });
  }

  function setBallColliding() {
    ballState = COLLIDING_BALL_STATE;
    ballDiv.classList.add("in-between");
    left_point.collisionFilter.group = BALL_COLLISION_CATEGORY;
    right_point.collisionFilter.group = BALL_COLLISION_CATEGORY;
  }

  function resetBall() {
    ballState = STILL_BALL_STATE;
    ball.velSet = false;
    left_point.collisionFilter.group = NO_COLLISION_CATEGORY;
    right_point.collisionFilter.group = NO_COLLISION_CATEGORY;
    Body.setPosition(ball, {
      x: random(2.5 * ballRadius, w - 2.5 * ballRadius),
      y: (1 - 2 * WALL_WIDTH_FACTOR) * h
    });
    Body.setVelocity(ball, {
      x: 0,
      y: 0
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
      const yFactor = yPos / h;
      scale = 1 + 0.3 * yFactor;
    } else if (ballState === COLLIDING_BALL_STATE) {
      scale = 1;
    }
    if(!ballState) shadowDiv.style.opacity = 1;
    shadowDiv.style.left = ball.position.x -2* ballRadius + parseInt(loading.style.left);
    shadowDiv.style.top = ball.position.y + 0.75* ballRadius + parseInt(loading.style.top);

    Body.set(ball,{angle: ball.angle + ball.velocity.x *0.014})

    ballDiv.style.left = ball.position.x - ballRadius;
    ballDiv.style.top = ball.position.y - ballRadius;
    ballDiv.style.transform = `rotate(${ball.angle}rad) scale(${scale})`;
  }

  function gameLoop() {
    currentTime += 30;
    if (currentTime > 1000) {
      timerValue++;
      if (timerValue === GAME_INTERVAL) {
        return handleGameOver();
      }
      currentTime = 0;
      timerDiv.innerHTML = `TIME: ${GAME_INTERVAL - timerValue}`;
    }
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
        if (perfectShot) {
          perfectShotDiv.play();
          showPoints("+2");
          currentScore += 2;
        } else {
          showPoints("+1");
          currentScore += 1;
        }
        scoreDiv.innerHTML = `SCORE: ${currentScore}`;
        rimLottie.setSpeed(3);
        rimLottie.playSegments([0, 30], true);
        basketDetected = true;
      }else  if (
        ball.position.y > RIM_TOP &&
        ball.velocity.y > 0 &&
        ball.position.x > RIM_LEFT &&
        ball.position.x < RIM_LEFT + RIM_WIDTH &&
        !ball.velSet &&
        !ball.slow
      ) {
        Body.setVelocity(ball, {
          x: 0,
          y: ball.velocity.y
        });
        ball.velSet = true;
      }
    }
    Engine.update(engine);
  }

  function showPoints(text) {
    plusTwo.textContent = text;
    plusTwo.style.display = "initial"
    setTimeout(function() {
      plusTwo.style.display = "none";
    }, 1000);
  }

  document.body.addEventListener("touchstart", e => {
    touchStart = extractTouchPoint(e);
  });

  document.body.addEventListener("touchend", e => {
    const touchEnd = extractTouchPoint(e);
    if (touchStart && ballState === STILL_BALL_STATE && !gameOver) {
      const deltaX = touchEnd.x - touchStart.x;
      const deltaY = touchEnd.y - touchStart.y;
      performBallShoot(deltaX, deltaY);
    }
  });

  function handleGameOver() {
    gameOver = true;
    shadowDiv.style.display = "none";
    gameOverDiv.style.display = "initial";
    gameEndContainer.style.display = "initial";
    gameEndLottie.play();
    timerDiv.innerHTML = `TIME: 0`;
    ballDiv.style.display = "none";
    finalScoreDiv.innerHTML = `SCORE: ${currentScore}`;
    clearInterval(gameInterval);
  }

  function handleRestart(e) {
    if(!backMusicDiv1.paused || !backMusicDiv2.paused) { backMusicDiv1.pause(); backMusicDiv2.pause(); }
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
    timerDiv.innerHTML = `TIME: ${GAME_INTERVAL - timerValue}`;
    gameInterval = setInterval(gameLoop, 30);
    resetBall();
    gameOver = false;
  }

  function performBallShoot(deltaX, deltaY) {
    let yForce = largeYForce;
    if (Math.abs(deltaY) > 150) yForce = largeYForce;
    else yForce = lessYForce;
    // Body.applyForce(ball, ball.position, {
    //   x: deltaX * forceFactor,
    //   y: yForce
    // });
    Body.setVelocity(ball, {
      x: deltaX * forceFactor,
      y: yForce
    });
    ball.velocity.y = 0;
    perfectShot = true;
    basketDetected = false;
    ballState = MOVING_BALL_STATE;
  }
  initializeWorldElements();
  gameInterval = setInterval(gameLoop, 30);
  Events.on(engine, "collisionStart", function(event) {
    if (ballState === COLLIDING_BALL_STATE) {
      rimLottie.playSegments([30, 45], true);
      rimLottie.setSpeed(1.5);
      window.navigator &&
        window.navigator.vibrate &&
        window.navigator.vibrate(50);
      perfectShot = false;
    }
  });
}
function handleVisibilityChange() {
      if (!document.hidden) {
          if(backMusicDiv1.paused)
          backMusicDiv1.play();
          else if(backMusicDiv2.paused)
          backMusicDiv2.play();
      } else {
        if(!backMusicDiv1.paused)
          backMusicDiv1.pause();
          else if(!backMusicDiv2.paused)
          backMusicDiv2.pause();
      }
}

window.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("resize", ()=> adjustAssetdimensions());
  adjustAssetdimensions();
  startBut.onclick = function() {
    loading.style.display = "none";
    backMusicDiv1.volume = 0.3;
    backMusicDiv1.play();
    backMusicDiv1.addEventListener("ended", ()=> {
        backMusicDiv2.volume = 0.3;
        backMusicDiv2.play();
      })
  document.addEventListener("visibilitychange", handleVisibilityChange);
  commence();
};
});
