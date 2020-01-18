import "./index.css";
import Matter from "matter-js";
import lottie from "lottie-web";
const Blowfish = require("egoroof-blowfish");
const { innerHeight: h, innerWidth: w } = window;

var Engine = Matter.Engine,
  Body = Matter.Body,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Mouse = Matter.Mouse,
  Events = Matter.Events,
  Runner = Matter.Runner,
  MouseConstraint = Matter.MouseConstraint;

var velSet = false;
var gameStarted = false;
var resultSend = false;
var isLoading = true;
var timeStopped = true;
var time = 40;
var count = 0;
var rotation = 0;
var initialVx = 0;
var initialVy = 0;
var ballAboveBasket = false;
var isCollided = false;
var score = 0;
var ballRadius = w / 12;
var scale = 1.5;
var isMoving = false;
var ballOnPlatform = false;
var startX = 0;
var startY = 0;
var startTime = null;
var endTime = null;
var dragTime = null;
var scaleThreshold = 0.015;
const loadingArr = [
  [0, 35],
  [35, 65],
  [65, 100],
  [100, 115]
];

const GRAVITY = 0.0013 * h;
const getUserURL =
  "http://192.168.0.116:9000/api/gamePind/user/1cfb2101-b204-4744-a977-592be73c8b10";
const postResURL = "http://192.168.17.236:9000/api/gamePind/result";
const INFINITE_MASS_RADIUS = w / 84;
const BALL_POSITION_CHECK_THRES = 80;
const ROTATION_FAC = 4;
const RIM_HEIGHT = 0.14 * h;
const RANDOM_VX_FAC = 1.2;
const RIM_WIDTH = 0.22 * w + 2 * INFINITE_MASS_RADIUS;
const RIM_LEFT = 0.4 * w;
const RIM_TOP = 0.32 * h;
const BOARD_WIDTH = w * 0.5;
const BOARD_HEIGHT = h * 0.2;

var engine = Engine.create();
engine.world.gravity.y = GRAVITY;
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: w,
    height: h,
    wireframes: false
  }
});
render.options.background = "transparent";

var basketOptions = {
  isStatic: true,
  friction: 0.05,
  frictionAir: 0.006,
  frictionStatic: 0,
  restitution: 0.7,
  render: {
    fillStyle: "transparent"
  }
};

var left_point = Bodies.circle(RIM_LEFT, RIM_TOP, INFINITE_MASS_RADIUS, {
  isStatic: true,
  render: {
    fillStyle: "transparent"
  }
});

var right_point = Bodies.circle(
  RIM_LEFT + RIM_WIDTH - 2 * INFINITE_MASS_RADIUS,
  RIM_TOP,
  INFINITE_MASS_RADIUS,
  {
    isStatic: true,
    render: {
      fillStyle: "transparent"
    }
  }
);

var ball = Bodies.circle(w / 2, 0.92 * h, ballRadius, basketOptions);

var ground = Bodies.rectangle(w / 2, 0.75 * h, w, 0.05 * h, {
  isStatic: true,
  render: {
    fillStyle: "transparent"
  }
});

// add all of the bodies to the world
World.add(engine.world, [ground, left_point, right_point, ball]);
var mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false
      }
    }
  });

const bf = new Blowfish("gamePind@12", Blowfish.MODE.ECB); // only key isn't optional

function sendResult(obj) {
  const encoded = bf.encode(JSON.stringify(obj));
  resultSend = true;
  fetch(postResURL, {
    method: "post",
    body: encoded.toString()
  });
}

function setFinalValue(event) {
  if (isMoving) return;
  var mousePosition = event.mouse.position;
  const { x, y } = ball.position;
  if (
    startX < x - ballRadius ||
    startX > x + ballRadius ||
    startY > y + ballRadius ||
    startY < y - ballRadius ||
    startY + 20 < mousePosition.y
  )
    return;
  let swipeLength = startY - mousePosition.y;
  swipeLength = swipeLength >= 250 ? 2.4 : (swipeLength * 2.4) / 250;

  initialVx =
    0.02 * (mousePosition.x - startX) +
    RANDOM_VX_FAC * (random(0, 1) > 0.5 ? 0.1 : -0.1);

  initialVy = swipeLength === 2.4 ? -0.03 * h : -8.3 * swipeLength;
  //fixing bug
  if (initialVy > -0.02 * h) initialVy = -0.023 * h;
  else initialVy = -0.03 * h;
  // console.log("initial vy: ", initialVy);
  Body.set(ball, { isSensor: true, isStatic: false });
  Body.setVelocity(ball, { x: initialVx, y: initialVy });
  rotation = initialVx * ROTATION_FAC;
  isMoving = true;
}
Events.on(mouseConstraint, "mousedown", function(event) {
  if (!gameStarted && timeStopped) return;
  var mousePosition = event.mouse.position;
  startY = mousePosition.y;
  startX = mousePosition.x;
  startTime = new Date().getTime();
  endTime = null;
});

Events.on(mouseConstraint, "mousemove", function(event) {
  if (!gameStarted && timeStopped) return;
  dragTime = new Date().getTime();
  slideLottie.stop();
  if (!endTime && dragTime - startTime > 400) setFinalValue(event);
});

Events.on(mouseConstraint, "mouseup", function(event) {
  if (!gameStarted && timeStopped) return;

  endTime = new Date().getTime();
  setFinalValue(event);
});

Events.on(engine, "collisionStart", function(event) {
  if (
    isMoving &&
    ball.velocity.y >= 0 &&
    ball.position.y < RIM_TOP + 2 * ballRadius
  ) {
    rimLottie.playSegments([30, 45], true);
    isCollided = true;
    window.navigator.vibrate(100);
    rimLottie.setSpeed(1.5);
  } else if (ball.velocity.y >= 0 && ball.position.y + ballRadius >= 0.6 * h) {
    ballOnPlatform = true;
    bounceSound.playbackRate = 4;
    bounceSound.volume = 0.2;
    bounceSound.play();
  }
});

const scoreView = document.querySelector(".scoreVal");
const timerView = document.querySelector(".timerVal");
const scoreText = document.querySelector(".score");
scoreText.textContent = "Score";
const board = document.querySelector(".board");
board.src =
  "https://res.cloudinary.com/princeofpersia/image/upload/v1579348123/board.png";
board.style.height = BOARD_HEIGHT;
board.style.width = BOARD_WIDTH;
board.style.left =
  RIM_LEFT - INFINITE_MASS_RADIUS - (BOARD_WIDTH - RIM_WIDTH) / 2;
board.style.top = RIM_TOP + 4 * INFINITE_MASS_RADIUS - BOARD_HEIGHT;

const finalScore = document.querySelector(".finalScore");
const name = document.querySelector(".name");
// name.textContent = "Parth";
finalScore.style.display = "none";
name.style.display = "none";

const plusTwo = document.querySelector(".plusTwo");
plusTwo.style.display = "none";

const timer = document.querySelector(".timer");
timer.textContent = "Time";
const gameOver = document.querySelector(".gameOver");
// gameOver.src =
//   "https://res.cloudinary.com/princeofpersia/image/upload/v1579079521/gameOver.png";
gameOver.style.display = "none";

var gameEndLottie = lottie.loadAnimation({
  container: gameOver,
  renderer: "svg",
  autoplay: true,
  loop: true,
  animationData: require("./assets/bouncyBall.json")
});
// gameEndLottie.play();

const swishSound = document.querySelector(".swishSound");
const bounceSound = document.querySelector(".bounceSound");

const loading = document.querySelector(".loading");
const loadingBall = document.querySelector(".loadingBall");
var loadingLottie = lottie.loadAnimation({
  container: loadingBall,
  renderer: "svg",
  autoplay: false,
  loop: false,
  animationData: require("./assets/loading.json")
});
loadingLottie.playSegments(loadingArr[0], true);
loadingLottie.playSegments(loadingArr[1], false);
loadingLottie.playSegments(loadingArr[2], false);
loadingLottie.loop = true;
// const timerGif = document.querySelector(".timerGif");

// timerGif.style.width = RIM_WIDTH + 4 * INFINITE_MASS_RADIUS;
// timerGif.style.height = RIM_WIDTH - 2 * INFINITE_MASS_RADIUS;
// timerGif.style.top = left_point.position.y - RIM_WIDTH - INFINITE_MASS_RADIUS;
// timerGif.style.left = left_point.position.x - 3 * INFINITE_MASS_RADIUS;

const rim = document.querySelector(".rim");
var rimLottie = lottie.loadAnimation({
  container: rim,
  renderer: "svg",
  autoplay: false,
  loop: false,
  animationData: require("./assets/net.json")
});
rimLottie.goToAndStop(0, true);

rim.style.height = RIM_HEIGHT;
rim.style.width = RIM_WIDTH;
rim.style.left = left_point.position.x - INFINITE_MASS_RADIUS;
rim.style.top = left_point.position.y - 2 * INFINITE_MASS_RADIUS;
rim.style.borderRadius = `${INFINITE_MASS_RADIUS}px`;

const ballView = document.querySelector(".ball");
ballView.style.height = 2 * ball.circleRadius;
ballView.style.width = 2 * ball.circleRadius;
ballView.style.borderRadius = `${ball.circleRadius}px`;
ballView.style.opacity = 1;

const slide = document.querySelector(".slide");
slide.style.left = ball.position.x - 0.1 * w;
slide.style.top = ball.position.y - 0.25 * h;

var slideLottie = lottie.loadAnimation({
  container: slide,
  renderer: "svg",
  autoplay: false,
  loop: true,
  animationData: require("./assets/slide.json")
});
slideLottie.goToAndStop(0, true);

const leftPoint = document.querySelector(".leftPoint");
leftPoint.style.height = 2 * INFINITE_MASS_RADIUS;
leftPoint.style.width = 2 * INFINITE_MASS_RADIUS;
leftPoint.style.borderRadius = `${INFINITE_MASS_RADIUS}px`;
leftPoint.style.left = left_point.position.x - INFINITE_MASS_RADIUS;
leftPoint.style.top = left_point.position.y - INFINITE_MASS_RADIUS;

const rightPoint = document.querySelector(".rightPoint");
rightPoint.style.height = 2 * INFINITE_MASS_RADIUS;
rightPoint.style.width = 2 * INFINITE_MASS_RADIUS;
rightPoint.style.borderRadius = `${INFINITE_MASS_RADIUS}px`;
rightPoint.style.left = right_point.position.x - INFINITE_MASS_RADIUS;
rightPoint.style.top = right_point.position.y - INFINITE_MASS_RADIUS;

setInterval(function() {
  if (isLoading) return;
  count += 1;
  var scoreText = ("0" + score).slice(-2);
  scoreView.textContent = `SCORE: ${scoreText}`;
  if (count === 60) {
    count = 0;
    gameStarted = true;
    timeStopped = false;
    time !== 0 && gameStarted && time--;
    if (time === 0) {
      timeStopped = true;
      isMoving = false;
    }

    if (gameStarted && timeStopped) {
      slideLottie.stop();
      ballView.style.display = "none";
      gameOver.style.display = "initial";
      var gameEndContainer = document.querySelector(".gameEndContainer");
      gameEndContainer.style.opacity = 0.6;
      gameEndContainer.style.display = "initial";
      name.style.display = "initial";
      finalScore.style.display = "initial";
      finalScore.textContent = `SCORE: ${score}`;
      let res = { battleId: 123, result: { id: "abc", score } };
      // !resultSend && sendResult(res);
    }
  }

  timerView.textContent = `TIME: ${time}`;
  Body.set(ball, { circleRadius: ballRadius * scale });
  ballView.style.transform = `rotate(${rotation}deg) scale(${scale})`;
  rotation = rotation + ball.velocity.x;
  ballView.style.left = ball.position.x - ball.circleRadius;
  ballView.style.top = ball.position.y - ball.circleRadius;
  // console.log("pos: ", ballView.style.left === "150px");

  if (isMoving) {
    ballView.style.boxShadow = "0px 15px 10px -15px #111";
  } else {
    ballView.style.boxShadow = "0px 15px 10px -10px #111";
  }
  if (ballOnPlatform && ballView.style.opacity >= 0.1) {
    ballView.style.opacity = ballView.style.opacity - 0.02;
  } else if (ballOnPlatform && ballView.style.opacity <= 0.1) {
    ballOnPlatform = false;

    isMoving = false;
    scale = 1.5;
    isCollided = false;
    rotation = 0;
    ballAboveBasket = false;
    ballView.style.zIndex = -1;
    Body.setStatic(ball, true);
    Body.setVelocity(ball, { x: 0, y: 0 });
    setTimeout(() => {
      ballView.style.opacity = 1;
    }, 100);
    scaleThreshold = 0.015;
    plusTwo.style.display = "none";
    velSet = false;
    Body.setPosition(ball, {
      x: random(0 + ballRadius * 1.6, w - ballRadius * 1.6),
      y: 0.92 * h
    });
  }
  //check if ball is completely above basket
  if (
    isMoving &&
    ball.position.y + ball.circleRadius <
      left_point.position.y - INFINITE_MASS_RADIUS &&
    ball.velocity.y >= 0
  ) {
    Body.set(ball, { isSensor: false, isStatic: false });
    ballView.style.zIndex = -2;
    isCollided = false;
    ballAboveBasket = true;
  }

  if (ball.velocity.y > 0) {
    Body.set(ball, { isSensor: false });
  }
  if (
    isMoving &&
    ball.velocity.y >= 0 &&
    ball.position.y - ballRadius >
      left_point.position.y + INFINITE_MASS_RADIUS + RIM_HEIGHT
  ) {
    ballView.style.zIndex = -2;
  }

  if (
    isMoving &&
    ball.position.y > RIM_TOP &&
    ball.velocity.y > 0 &&
    ball.position.x > RIM_LEFT &&
    ball.position.x < RIM_LEFT + RIM_WIDTH &&
    !velSet &&
    initialVy === -0.03 * h
  ) {
    Body.setVelocity(ball, { x: 0, y: ball.velocity.y });
    velSet = true;
  }
  if (scale > 1 && isMoving) {
    if (initialVy === 0.02 * h) scaleThreshold = 0.03;
    else scaleThreshold = 0.015;
    scale = scale - scaleThreshold < 1 ? 1 : scale - scaleThreshold;
  }

  //check if ball is outside viewport
  if (
    ball.position.x < 0 - ballRadius - BALL_POSITION_CHECK_THRES ||
    ball.position.x > w + ballRadius + BALL_POSITION_CHECK_THRES ||
    ball.position.y > h + ballRadius + 10 * BALL_POSITION_CHECK_THRES
  ) {
    ballOnPlatform = false;
    ballView.style.opacity = 1;
    isMoving = false;
    scale = 1.5;
    isCollided = false;
    rotation = 0;
    scaleThreshold = 0.015;
    ballAboveBasket = false;
    ballView.style.zIndex = -1;
    velSet = false;
    Body.setPosition(ball, {
      x: random(0 + ballRadius * 2, w - ballRadius * 2),
      y: 0.92 * h
    });
    plusTwo.style.display = "none";
    Body.setStatic(ball, true);
    Body.setVelocity(ball, { x: 0, y: 0 });
  }

  if (
    isMoving &&
    ballAboveBasket &&
    ball.position.x > left_point.position.x + INFINITE_MASS_RADIUS &&
    ball.position.x < right_point.position.x - INFINITE_MASS_RADIUS &&
    ball.position.y > left_point.position.y - INFINITE_MASS_RADIUS
  ) {
    swishSound.play();
    swishSound.playbackRate = 1;
    swishSound.volume = 0.7;
  }
  //check if basket is succesfull
  if (
    isMoving &&
    ballAboveBasket &&
    ball.position.x > left_point.position.x + INFINITE_MASS_RADIUS &&
    ball.position.x < right_point.position.x - INFINITE_MASS_RADIUS &&
    ball.position.y - ball.circleRadius >
      left_point.position.y + INFINITE_MASS_RADIUS
  ) {
    ballAboveBasket = false;
    rimLottie.setSpeed(3);
    rimLottie.playSegments([0, 30], true);
    plusTwo.textContent = isCollided ? "+1" : "+2";
    plusTwo.style.display = "initial";
    score = isCollided ? score + 1 : score + 2;
  }
  if (ball) Engine.update(engine, 1000 / 60);
}, 1000 / 60);

setTimeout(function() {
  loadingLottie.playSegments(loadingArr[3], false);
  loadingLottie.loop = false;
  loadingLottie.stop();
  loading.style.display = "none";
  loadingBall.style.display = "none";
  ballView.style.display = "none";
  setTimeout(function() {
    isLoading = false;
    ballView.style.display = "initial";
    slideLottie.setSpeed(0.2);
    slideLottie.playSegments([0, 10], true);
  }, 500);
}, 5000);

var runner = Runner.create();
Runner.run(runner, engine);

render.mouse = mouse;

Render.run(render);
