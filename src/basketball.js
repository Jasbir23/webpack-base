import "./index.css";
import { Engine, Render, World, Bodies, Body, Events } from "matter-js";
import lottie from "lottie-web";

import { random, extractTouchPoint } from "./utils";
import {
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
} from "./constants";

const { innerHeight: h, innerWidth: w } = window;
const ballRadius = BALL_RADIUS_FACTOR * w;
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
let plusTwo = null;
let gameOver = false;
let currentScore = 0;
let ballState = STILL_BALL_STATE;
// render.options.background = "transparent";

function initializeWorldElements() {
  engine = Engine.create();
  //   render = Render.create({
  //     element: document.body,
  //     engine: engine,
  //     options: {
  //       width: w,
  //       height: h,
  //       wireframes: true
  //     }
  //   });
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
  const ground2 = Bodies.rectangle(w / 2, h, 3 * w, 2 * WALL_WIDTH_FACTOR * h, {
    isStatic: true,
    collisionFilter: { group: BALL_COLLISION_CATEGORY }
  });

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
  ballDiv.style.left = ball.position.x - ballRadius;
  ballDiv.style.top = ball.position.y - ballRadius;
  ballDiv.style.transform = `rotate(${ball.angle}rad) scale(${scale})`;
}

function gameLoop() {
  currentTime += 33;
  if (currentTime > 1000) {
    timerValue++;
    if (timerValue === GAME_INTERVAL) {
      return handleGameOver();
    }
    currentTime = 0;
    timerDiv.innerHTML = `TIME: ${GAME_INTERVAL - timerValue}`;
  }
  if (ballState === MOVING_BALL_STATE) {
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
    }
  }
  Engine.update(engine);
}

function showPoints(text) {
  plusTwo.textContent = text;
  plusTwo.style.display = "initial";
  setTimeout(function() {
    plusTwo.style.display = "none";
  }, 1000);
}

window.addEventListener("DOMContentLoaded", () => {
  initializeWorldElements();
  gameInterval = setInterval(gameLoop, 33);
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
});

document.body.addEventListener("touchstart", e => {
  touchStart = extractTouchPoint(e);
});

document.body.addEventListener("touchend", e => {
  const touchEnd = extractTouchPoint(e);
  if (touchStart && ballState === STILL_BALL_STATE && !gameOver) {
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    // const targetAngle = Math.atan(deltaY / deltaX);
    performBallShoot(deltaX, deltaY);
  }
});

function handleGameOver() {
  gameOver = true;
  gameOverDiv.style.display = "initial";
  gameEndContainer.style.display = "initial";
  gameEndLottie.play();
  timerDiv.innerHTML = `TIME: 0`;
  ballDiv.style.display = "none";
  finalScoreDiv.innerHTML = `SCORE: ${currentScore}`;
  clearInterval(gameInterval);
}

function handleRestart(e) {
  gameOverDiv.style.display = "none";
  gameEndContainer.style.display = "none";
  ballDiv.style.display = "initial";
  gameEndLottie.pause();
  scoreDiv.innerHTML = `SCORE: 0`;
  currentScore = 0;
  timerValue = 0;
  currentTime = 0;
  timerDiv.innerHTML = `TIME: ${GAME_INTERVAL - timerValue}`;
  gameInterval = setInterval(gameLoop, 33);
  resetBall();
  gameOver = false;
}

function performBallShoot(deltaX, deltaY) {
  let yForce = 0;
  if (Math.abs(deltaY) > 150) yForce = largeYForce;
  else yForce = lessYForce;
  Body.applyForce(ball, ball.position, {
    x: deltaX * forceFactor,
    y: yForce
  });
  ball.velocity.y = 0;
  perfectShot = true;
  basketDetected = false;
  ballState = MOVING_BALL_STATE;
}
