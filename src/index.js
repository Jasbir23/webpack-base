import "./index.css";
import Matter from "matter-js";
import lottie from "lottie-web";
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

var rotation = 0;
var initialVx = 0;
var initialVy = 0;
var ballAboveBasket = false;
var isCollided = false;
var score = 0;
var ballRadius = w / 12;
var scale = 1.5;
var isMoving = false;
var startX = 0;
var startY = 0;
var startTime = null;
var endTime = null;
var dragTime = null;

const GRAVITY = 0.9;
const INFINITE_MASS_RADIUS = w / 84;
const BALL_POSITION_CHECK_THRES = 80;
const ROTATION_FAC = 4;
const RIM_HEIGHT = 0.14 * h;
const RANDOM_VX_FAC = 1.2;
const SCALE_THRESHOLD = 0.015;

var engine = Engine.create();
engine.world.gravity.y = GRAVITY;

var defaultCategory = 0x0001,
  redCategory = 0x0002;

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// create a renderer
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
  restitution: 0.7,
  collisionFilter: {
    category: redCategory
  },
  render: {
    fillStyle: "transparent"
  }
};

var left_point = Bodies.circle(0.4 * w, (2 / 7) * h, INFINITE_MASS_RADIUS, {
  isStatic: true,
  collisionFilter: {
    mask: redCategory
  },
  render: {
    fillStyle: "transparent"
  }
});

var right_point = Bodies.circle(0.6 * w, (2 / 7) * h, INFINITE_MASS_RADIUS, {
  isStatic: true,
  collisionFilter: {
    mask: redCategory
  },
  render: {
    fillStyle: "transparent"
  }
});

var ball = Bodies.circle(w / 2, 0.9 * h, ballRadius, basketOptions);

var ground = Bodies.rectangle(w / 2, 0.98 * h, w, 0.08 * h, {
  isStatic: true,
  collisionFilter: { mask: defaultCategory },
  render: {
    fillStyle: "transparent"
  }
});

// add all of the bodies to the world
World.add(engine.world, [left_point, right_point, ground, ball]);
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

function getDistance(center1, center2) {
  return Math.sqrt(
    (center1.x - center2.x) * (center1.x - center2.x) +
      (center1.y - center2.y) * (center1.y - center2.y)
  );
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
  swipeLength = swipeLength >= 200 ? 2.4 : (swipeLength * 2.4) / 200;

  initialVx =
    0.02 * (mousePosition.x - startX) +
    RANDOM_VX_FAC * (random(0, 1) > 0.5 ? 0.1 : -0.1);

  initialVy = swipeLength === 2.4 ? -20 : -8.3 * swipeLength;
  //fixing bug
  if (initialVy < -16.5 && initialVy > -19.8) initialVy = -20;
  if (initialVy > -5) initialVy = -5;

  Body.set(ball, { isSensor: true, isStatic: false });
  Body.setVelocity(ball, { x: initialVx, y: initialVy });
  rotation = initialVx * ROTATION_FAC;
  isMoving = true;
}

Events.on(mouseConstraint, "mousedown", function(event) {
  var mousePosition = event.mouse.position;
  startY = mousePosition.y;
  startX = mousePosition.x;
  startTime = new Date().getTime();
  endTime = null;
});

Events.on(mouseConstraint, "mousemove", function(event) {
  dragTime = new Date().getTime();
  if (!endTime && dragTime - startTime > 400) setFinalValue(event);
});

Events.on(mouseConstraint, "mouseup", function(event) {
  endTime = new Date().getTime();
  setFinalValue(event);
});

Events.on(engine, "collisionStart", function(event) {
  if (ball.velocity.y >= 0) {
    rimLottie.playSegments([30, 45], true);
    isCollided = true;
    rimLottie.setSpeed(1.5);
  }
});

const scoreView = document.querySelector(".score");

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
rim.style.width =
  right_point.position.x - left_point.position.x + 2 * INFINITE_MASS_RADIUS;
rim.style.left = left_point.position.x - INFINITE_MASS_RADIUS;
rim.style.top = left_point.position.y - 2 * INFINITE_MASS_RADIUS;
rim.style.borderRadius = `${INFINITE_MASS_RADIUS}px`;

const board = document.querySelector(".board");
board.style.height = h * 0.15;
board.style.width = w * 0.38;
board.style.left = left_point.position.x - INFINITE_MASS_RADIUS - 0.068 * w;
board.style.top = left_point.position.y - INFINITE_MASS_RADIUS - 0.13 * h;

const ballView = document.querySelector(".ball");
ballView.style.height = 2 * ball.circleRadius;
ballView.style.width = 2 * ball.circleRadius;
ballView.style.borderRadius = `${ball.circleRadius}px`;

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
  scoreView.textContent = `score ${score}`;
  Body.set(ball, { circleRadius: ballRadius * scale });
  ballView.style.transform = `rotate(${rotation}deg) scale(${scale})`;
  rotation = rotation + ball.velocity.x;
  ballView.style.left = ball.position.x - ball.circleRadius;
  ballView.style.top = ball.position.y - ball.circleRadius;

  //check if ball is completely above basket
  if (
    ball.position.y + ball.circleRadius <
      left_point.position.y - INFINITE_MASS_RADIUS &&
    ball.velocity.y >= 0
  ) {
    Body.set(ball, { isSensor: false, isStatic: false });
    ballView.style.zIndex = -2;
    isCollided = false;
    ballAboveBasket = true;
  }

  if (
    isMoving &&
    ball.velocity.y >= 0 &&
    ball.position.y - ballRadius >
      left_point.position.y + INFINITE_MASS_RADIUS + RIM_HEIGHT
  )
    ballView.style.zIndex = -2;

  if (scale > 1 && isMoving) {
    scale = scale - SCALE_THRESHOLD < 1 ? 1 : scale - SCALE_THRESHOLD;
  }

  //check if ball is outside viewport
  if (
    ball.position.x < 0 - ballRadius - BALL_POSITION_CHECK_THRES ||
    ball.position.x > w + ballRadius + BALL_POSITION_CHECK_THRES ||
    ball.position.y > h + ballRadius + 10 * BALL_POSITION_CHECK_THRES
  ) {
    isMoving = false;
    scale = 1.5;
    isCollided = false;
    rotation = 0;
    ballAboveBasket = false;
    ballView.style.zIndex = -1;
    Body.setPosition(ball, {
      x: random(0 + ballRadius * 1.6, w - ballRadius * 1.6),
      y: 0.92 * h
    });
    Body.setStatic(ball, true);
    Body.setVelocity(ball, { x: 0, y: 0 });
  }

  //check if basket is succesfull
  if (
    ballAboveBasket &&
    ball.position.x > left_point.position.x + INFINITE_MASS_RADIUS &&
    ball.position.x < right_point.position.x - INFINITE_MASS_RADIUS &&
    ball.position.y - ball.circleRadius >
      left_point.position.y + INFINITE_MASS_RADIUS
  ) {
    ballAboveBasket = false;
    rimLottie.setSpeed(3);
    rimLottie.playSegments([0, 30], true);
    score = isCollided ? score + 1 : score + 2;
  }
  if (ball) Engine.update(engine, 1000 / 60);
}, 1000 / 60);

var runner = Runner.create();
Runner.run(runner, engine);

render.mouse = mouse;

Render.run(render);
