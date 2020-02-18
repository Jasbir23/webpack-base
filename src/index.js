import "./index.css";
import Matter from "matter-js";
import lottie from "lottie-web";
const Blowfish = require("egoroof-blowfish");
const {
  innerHeight: h,
  innerWidth: w
} = window;
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
  SPEED_Y_FACTOR
} from "./constants";
import {
  random,
  getParameterByName,
} from "./utils";

var Engine = Matter.Engine,
  Body = Matter.Body,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Mouse = Matter.Mouse,
  Events = Matter.Events,
  MouseConstraint = Matter.MouseConstraint;

var isLoading = false;
var timerInterval;
var animationFrame;
var gameStarted = false;
var resultSend = false;
var timeStopped = true;
var mainTimer = 60;
var initialVx = 0;
var initialVy = 0;
var score = 0;
var ballRadius = w / 12;
var startX = 0;
var startY = 0;
var startTime = null;
var endTime = null;
var rimOnFire = false;
var basketCount = 0;
var removeCount = 0;
var dragTime = null;
var battleId = null;
var playerId = null;
var scaleThreshold = 0.015;
const loadingArr = [
  [0, 35],
  [35, 65],
  [65, 100],
  [100, 115]
];
var defaultCategory = 0x0001,
  redCategory = 0x0002;
var ballArray = [];
var engine = Engine.create();
const ballCont = document.getElementById("ball");
engine.world.gravity.y = GRAVITY;

const bf = new Blowfish("gamePind@12", Blowfish.MODE.ECB); // only key isn't optional

var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

function handleVisibilityChange() {
  if (document[hidden]) {
    stopGame()
  }
}

let params = new URL(document.location).searchParams;
battleId = params.get("battleId");
playerId = params.get("playerId");
getParameterByName(getUserURL, battleId, playerId);

function stopGame() {
  ballCont &&
    ballCont.remove();
  fireLottie.goToAndStop(30, true)
  slideLottie.stop();
  gameOver.style.display = "initial";
  var gameEndContainer = document.querySelector(".gameEndContainer");
  gameEndContainer.style.opacity = 0.6;
  gameEndContainer.style.display = "initial";
  name.style.display = "initial";
  finalScore.style.display = "initial";
  finalScore.textContent = `SCORE: ${score}`;
  let res = {
    battleId: battleId,
    result: {
      id: playerId,
      score
    }
  };
  gameEndLottie.play();
  clearInterval(timerInterval)
  window.cancelAnimationFrame(animationFrame);
  !resultSend && playerId && battleId && sendResult(res, postResURL, bf);
}


function sendResult(obj, postResURL, bf) {
  const encoded = bf.encode(JSON.stringify(obj));
  resultSend = true;
  fetch(postResURL, {
    method: "post",
    body: encoded.toString()
  });
}
if (typeof document.addEventListener === "undefined" || hidden === undefined) {
  console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
} else {
  // Handle page visibility change   
  document.addEventListener(visibilityChange, handleVisibilityChange, false);
}

Matter.Bounds.create({
  min: {
    x: -Infinity,
    y: -Infinity
  },
  max: {
    x: Infinity,
    y: Infinity
  }
})
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
  collisionFilter: {
    mask: redCategory
  },
  render: {
    fillStyle: "transparent"
  }
};

var left_point = Bodies.circle(RIM_LEFT, RIM_TOP, INFINITE_MASS_RADIUS, {
  isStatic: true,
  collisionFilter: {
    mask: defaultCategory
  },
  render: {
    fillStyle: "transparent"
  }
});

var right_point = Bodies.circle(
  RIM_LEFT + RIM_WIDTH - 2 * INFINITE_MASS_RADIUS,
  RIM_TOP,
  INFINITE_MASS_RADIUS, {
    isStatic: true,
    collisionFilter: {
      mask: defaultCategory
    },
    render: {
      fillStyle: "transparent"
    }
  }
);

var ground = Bodies.rectangle(w / 2, 0.75 * h, 3 * w, 0.06 * h, {
  isStatic: true,
  collisionFilter: {
    mask: defaultCategory
  },
  render: {
    fillStyle: "transparent"
  }
});
// add all of the bodies to the world
World.add(engine.world, [ground, left_point, right_point, ]);

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

function setFinalValue(event) {
  if (!ballArray[ballArray.length - 1] || ballArray[ballArray.length - 1].isMoving) return;
  var mousePosition = event.mouse.position;
  const {
    x,
    y
  } = ballArray[ballArray.length - 1].position;
  let swipeLength = startY - mousePosition.y;
  swipeLength = swipeLength >= 250 ? 2.4 : (swipeLength * 2.4) / 250;

  initialVx =
    0.04 * (mousePosition.x - startX) +
    RANDOM_VX_FAC * (random(0, 1) > 0.5 ? 0.1 : -0.1);

  initialVy = swipeLength === 2.4 ? -0.03 * h : -8.3 * swipeLength;

  if (initialVy > -0.02 * h) initialVy = -SLOW_VEL_FAC * h;
  else initialVy = -0.06 * h;
  Body.set(ballArray[ballArray.length - 1], {
    isStatic: false
  });
  Body.setVelocity(ballArray[ballArray.length - 1], {
    x: initialVx,
    y: initialVy
  });
  ballArray[ballArray.length - 1].rotation = initialVx * ROTATION_FAC;
  ballArray[ballArray.length - 1].isMoving = true;
  ballArray[ballArray.length - 1].slow = initialVy === -SLOW_VEL_FAC * h ? true : false
  setTimeout(function () {
    createBall()
  }, 600);
}

Events.on(mouseConstraint, "mousedown", function (event) {
  if (!gameStarted && timeStopped) return;
  var mousePosition = event.mouse.position;
  startY = mousePosition.y;
  startX = mousePosition.x;
  startTime = new Date().getTime();
  endTime = null;
});

Events.on(mouseConstraint, "mousemove", function (event) {
  if (!gameStarted && timeStopped) return;
  dragTime = new Date().getTime();
  slideLottie.stop();
  if (!endTime && dragTime - startTime > 400) setFinalValue(event);
});

Events.on(mouseConstraint, "mouseup", function (event) {
  if (!gameStarted && timeStopped) return;

  endTime = new Date().getTime();
  setFinalValue(event);

});

Events.on(engine, "collisionStart", function (event) {
  ballArray.map((ball, index) => {
    if (
      ball.isMoving &&
      ball.velocity.y >= 0 &&
      ball.position.y < RIM_TOP + 2 * ballRadius
    ) {
      fireLottie.goToAndStop(30, true);
      rimLottie.setSpeed(1.5);
      window.navigator && window.navigator.vibrate && window.navigator.vibrate(50)
      rimLottie.playSegments([30, 45], true);
      ball.isCollided = true;
    } else if (ball.velocity.y > 0 && ball.position.y + ballRadius >= 0.6 * h) {
      ball.ballOnPlatform = true;
      ball.ballAboveBasket = false;
    }
  });
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
finalScore.style.display = "none";
name.style.display = "none";

const plusTwo = document.querySelector(".plusTwo");
plusTwo.style.display = "none";

const timer = document.querySelector(".timer");
timer.textContent = "Time";
const gameOver = document.querySelector(".gameOver");
gameOver.style.display = "none";

var gameEndLottie = lottie.loadAnimation({
  container: gameOver,
  renderer: "svg",
  autoplay: false,
  loop: true,
  animationData: require("./assets/bouncyBall.json")
});

const perfectShot = document.querySelector(".perfectShot");

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
loadingLottie.addEventListener("loopComplete", function () {
  startGame();
});
var interval = null;

const slide = document.querySelector(".slide");
var slideLottie = null;

function startGame() {
  loadingLottie.playSegments(loadingArr[3], false);
  loadingLottie.loop = false;
  loadingLottie.destroy();
  loading.style.display = "none";
  loadingBall.style.display = "none";
  createBall();

  slide.style.left = ballArray[0].position.x - 0.1 * w;
  slide.style.top = ballArray[0].position.y - 0.25 * h;
  slideLottie = lottie.loadAnimation({
    container: slide,
    renderer: "svg",
    autoplay: false,
    loop: true,
    animationData: require("./assets/slide.json")
  });
  slideLottie.goToAndStop(0, true);
  isLoading = false;
  gameStarted = true;
  timeStopped = false;
  timerInterval = setInterval(function () {
    mainTimer--
  }, 1000)
  animationFrame = window.requestAnimationFrame(run);
  slideLottie.setSpeed(0.2);
  slideLottie.playSegments([0, 10], true);
}

const fire = document.querySelector(".fire");
var fireLottie = lottie.loadAnimation({
  container: fire,
  renderer: "svg",
  autoplay: false,
  loop: true,
  animationData: require("./assets/firebasket.json")
});
fireLottie.goToAndStop(30, true)
fireLottie.setSpeed(0.4)
fire.style.width = RIM_WIDTH;
fire.style.height = 52;
fire.style.opacity = 0.9;
fire.style.left = left_point.position.x - INFINITE_MASS_RADIUS;
fire.style.top = left_point.position.y - 2 * INFINITE_MASS_RADIUS - 46;

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

function createBall() {
  var ball1 = Bodies.circle(
    random(2.5 * ballRadius, w - 2.5 * ballRadius),
    0.92 * h,
    ballRadius,
    basketOptions
  );
  ballArray.push(ball1);
  ballArray[ballArray.length - 1].isCollided = false;
  ballArray[ballArray.length - 1].ballAboveBasket = false;
  ballArray[ballArray.length - 1].ballOnPlatform = false;
  ballArray[ballArray.length - 1].isMoving = false;
  ballArray[ballArray.length - 1].scale = 1.5;
  ballArray[ballArray.length - 1].rotation = 0;
  ballArray[ballArray.length - 1].velSet = false;
  ballArray[ballArray.length - 1].slow = false;
  World.add(engine.world, ballArray[ballArray.length - 1]);
  var ballChild = document.createElement("span");
  ballCont && ballCont.appendChild(ballChild);
  ballChild.style.height = 2 * ballArray[ballArray.length - 1].circleRadius;
  ballChild.style.width = 2 * ballArray[ballArray.length - 1].circleRadius;
  ballChild.style.borderRadius = `${
    ballArray[ballArray.length - 1].circleRadius
    }px`;
  ballChild.style.opacity = 1;
  ballChild.style.transform = `rotate(${
    ballArray[ballArray.length - 1].rotation
    }deg) scale(${ballArray[ballArray.length - 1].scale})`;
  ballChild.style.left =
    ballArray[ballArray.length - 1].position.x -
    ballArray[ballArray.length - 1].circleRadius;
  ballChild.style.top =
    ballArray[ballArray.length - 1].position.y -
    ballArray[ballArray.length - 1].circleRadius;
}

function removeBall(index) {
  // console.log("here remove");
  removeCount++;
  if (removeCount !== basketCount) {
    rimOnFire = false;
    fireLottie.goToAndStop(30, true)
    removeCount = 0;
    basketCount = 0;
  }
  World.remove(engine.world, ballArray[index]);
  ballArray.splice(index, 1);
  if (
    ballCont &&
    ballCont.childNodes[index]
  )
    ballCont
    .removeChild(ballCont.childNodes[index]);

}


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

function showPoints(text) {
  plusTwo.textContent = text
  plusTwo.style.display = "initial";
  setTimeout(function () {
    plusTwo.style.display = "none";
  }, 1000);
}

function runOnBasketSuccess(ball) {
  if (
    ball.isMoving &&
    ball.ballAboveBasket &&
    ball.position.x > left_point.position.x + INFINITE_MASS_RADIUS &&
    ball.position.x < right_point.position.x - INFINITE_MASS_RADIUS &&
    ball.position.y - ball.circleRadius >
    left_point.position.y + INFINITE_MASS_RADIUS
  ) {
    ball.ballAboveBasket = false;
    rimLottie.setSpeed(3);
    rimLottie.playSegments([0, 30], true);
    basketCount++;
    if (rimOnFire && !ball.isCollided) {
      score += 5
      showPoints("+5")
      perfectShot.play();
    } else if (rimOnFire && ball.isCollided) {
      score += 3
      showPoints("+3")
      rimOnFire = false
      fireLottie.goToAndStop(30, true)
    } else if (!rimOnFire && !ball.isCollided) {
      score += 2
      rimOnFire = true
      fireLottie.playSegments([0, 29])
      showPoints("+2")
      perfectShot.play();
    } else {
      score += 1
      fireLottie.goToAndStop(30, true)
      showPoints("+1")
    }
  }
}

function run() {
  var scoreText = ("0" + score).slice(-3);
  scoreView.textContent = `SCORE: ${scoreText}`;
  if (mainTimer === 0) {
    timeStopped = true;
  }
  timerView.textContent = `TIME: ${mainTimer <= 0 ? 0 : mainTimer}`;
  if (gameStarted && timeStopped) {
    stopGame()
    return;
  }
  ballArray.map((ball, index) => {
    var ballView =
      ballCont &&
      ballCont.childNodes[index];
    if (!ballView) return;
    Body.set(ball, {
      circleRadius: ballRadius * ball.scale
    });
    ballView.style.transform = `rotate(${ball.rotation}deg) scale(${ball.scale})`;
    ball.rotation = ball.rotation + 3 * ball.velocity.x;
    ballView.style.left = ball.position.x - ball.circleRadius;
    ballView.style.top = ball.position.y - ball.circleRadius;

    if ((ball.ballOnPlatform) || ball.position.x < ballRadius || ball.position.x > w) {
      removeBall(index);
    }

    if (ball &&
      ball.isMoving &&
      ball.position.y + ball.circleRadius <
      left_point.position.y - INFINITE_MASS_RADIUS &&
      ball.velocity.y >= 0
    ) {
      ball.collisionFilter.mask = defaultCategory;
      ballView.style.zIndex = -2;
      if (!(ball.ballAboveBasket && ball.isCollided)) {
        ball.isCollided = false;
        ball.ballAboveBasket = true;
      }
    }

    if (ball.velocity.y > 0) {
      ball.collisionFilter.mask = defaultCategory;
    }
    if (
      ball.isMoving &&
      ball.velocity.y >= 0 &&
      ball.position.y - ballRadius >
      left_point.position.y + INFINITE_MASS_RADIUS + RIM_HEIGHT
    ) {
      ballView.style.zIndex = -2;
    }
    if (
      ball.isMoving &&
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
    if (ball.scale > 1 && ball.isMoving) {
      if (initialVy === 0.02 * h) scaleThreshold = 0.03;
      else scaleThreshold = 0.015;
      ball.scale =
        ball.scale - scaleThreshold < 1 ? 1 : ball.scale - scaleThreshold;
    }

    //check if basket is succesfull
    runOnBasketSuccess(ball);
  });
  Engine.update(engine, 1000 / 60);
  window.requestAnimationFrame(run);
}
// Matter.Runner.run(engine)
render.mouse = mouse;

// Render.run(render);