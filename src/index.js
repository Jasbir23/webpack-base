import "./index.css";
import Matter from "matter-js";
import { platform } from "os";
import { createContext } from "vm";
const { innerHeight: h, innerWidth: w } = window;
// module aliases

var Engine = Matter.Engine,
  Body = Matter.Body,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Vertices = Matter.Vertices,
  Mouse = Matter.Mouse,
  Events = Matter.Events,
  Runner = Matter.Runner,
  Composites = Matter.Composites,
  Composite = Matter.Composite,
  MouseConstraint = Matter.MouseConstraint;

var GRAVITY = 0.9;
var rotation = 0;
var initialVx = 0;
var initialVy = 0;
var shouldStart = false;
var ballAboveBasket = false;
var isCollided = false;
var score = 0;
var infiniteMassRadius = w / 84;
var ballRadius = w / 10;
var BALL_POSITION_CHECK_THRES = 80;
var ROTATION_FAC = 14;
var scale = 1.2;
var isMoving = false;
var scaleThreshold = 0.008;
var engine = Engine.create();
engine.world.gravity.y = GRAVITY;
var defaultCategory = 0x0001,
  redCategory = 0x0002;

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
var group = Body.nextGroup(true),
  particleOptions = {
    friction: 0.00001,
    collisionFilter: { group: group },
    render: {
      visible: false
    }
  },
  constraintOptions = { stiffness: 0.6 },
  cloth = Composites.softBody(
    0.35 * w - infiniteMassRadius,
    (2 / 7) * h - infiniteMassRadius,
    10,
    5,
    12,
    10,
    false,
    8,
    particleOptions,
    constraintOptions
  );
for (var i = 0; i < 20; i++) {
  if (i !== 0 && i !== 8) {
    cloth.bodies[i].isSensor = true;
  }
  cloth.bodies[0].isStatic = true;
  cloth.bodies[9].isStatic = true;
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
  restitution: 0.8,
  collisionFilter: {
    category: redCategory
  },
  render: {
    fillStyle: "transparent"
  }
};

var boxA = Bodies.circle(0.35 * w, (2 / 7) * h, infiniteMassRadius, {
  isStatic: true,
  collisionFilter: {
    mask: redCategory
  },
  render: {
    fillStyle: "transparent"
  }
});
var boxB = Bodies.circle(0.6 * w, (2 / 7) * h, infiniteMassRadius, {
  isStatic: true,
  collisionFilter: {
    mask: redCategory
  },
  render: {
    fillStyle: "transparent"
  }
});
var ball = Bodies.circle(w / 2, 0.92 * h, ballRadius, basketOptions);
var ground = Bodies.rectangle(w / 2, 0.98 * h, w, 0.08 * h, {
  isStatic: true,
  collisionFilter: { mask: defaultCategory },
  render: {
    fillStyle: "transparent"
  }
});

// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ground, ball]);
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

Events.on(mouseConstraint, "mouseup", function(event) {
  var mousePosition = event.mouse.position;
  const { x, y } = ball.position;
  if (
    this.startX < x - ballRadius ||
    this.startX > x + ballRadius ||
    this.startY > y + ballRadius ||
    this.startY < y - ballRadius ||
    this.startY + 20 < mousePosition.y
  )
    return;
  const angle =
    (Math.atan2(mousePosition.y - this.startY, mousePosition.x - this.startX) *
      180) /
    Math.PI;
  let swipeLength = getDistance(
    { x: this.startX, y: this.startY },
    mousePosition
  );
  swipeLength = swipeLength > 400 ? 4 : (swipeLength * 4) / 400;
  initialVx = 0.02 * (mousePosition.x - this.startX);
  initialVy = -8.4 * swipeLength;
  shouldStart = true;
  Body.set(ball, { isSensor: true, isStatic: false });
  Body.setVelocity(ball, { x: initialVx, y: initialVy });
  rotation = 0.2 * angle * ROTATION_FAC;
  isMoving = true;
});

function getDistance(center1, center2) {
  return Math.sqrt(
    (center1.x - center2.x) * (center1.x - center2.x) +
      (center1.y - center2.y) * (center1.y - center2.y)
  );
}
Body.set(ball, { name: "basketBall" });
Body.set(boxA, { name: "leftNetPoint" });
Body.set(boxB, { name: "rightNetPoint" });
Body.set(ground, { name: "ground" });

Events.on(mouseConstraint, "mousedown", function(event) {
  var mousePosition = event.mouse.position;
  this.startY = mousePosition.y;
  this.startX = mousePosition.x;
});
console.log("ball: ", ball);

Events.on(engine, "collisionStart", function(event) {
  isCollided = true;
});
const scoreView = document.querySelector(".score");

const rim = document.querySelector(".rim");
rim.style.height = 2 * infiniteMassRadius;
rim.style.width = boxB.position.x - boxA.position.x + 2 * infiniteMassRadius;
rim.style.left = boxA.position.x - infiniteMassRadius;
rim.style.top = boxA.position.y - infiniteMassRadius;
rim.style.borderRadius = `${infiniteMassRadius}px`;

const ballView = document.querySelector(".ball");
ballView.style.height = 2 * ballRadius;
ballView.style.width = 2 * ballRadius;
ballView.style.borderRadius = `${ballRadius}px`;

const leftPoint = document.querySelector(".leftPoint");
leftPoint.style.height = 2 * infiniteMassRadius;
leftPoint.style.width = 2 * infiniteMassRadius;
leftPoint.style.borderRadius = `${infiniteMassRadius}px`;
leftPoint.style.left = boxA.position.x - infiniteMassRadius;
leftPoint.style.top = boxA.position.y - infiniteMassRadius;

const rightPoint = document.querySelector(".rightPoint");
rightPoint.style.height = 2 * infiniteMassRadius;
rightPoint.style.width = 2 * infiniteMassRadius;
rightPoint.style.borderRadius = `${infiniteMassRadius}px`;
rightPoint.style.left = boxB.position.x - infiniteMassRadius;
rightPoint.style.top = boxB.position.y - infiniteMassRadius;

setInterval(function() {
  const bodies = Composite.allBodies(engine.world);
  scoreView.textContent = `score ${score}`;
  bodies.forEach(body => {
    if (body.name === "basketBall") {
      ballView.style.left = body.position.x - ballRadius;
      ballView.style.top = body.position.y - ballRadius;
      ballView.style.transform = `rotate(${rotation}deg) scale(${scale})`;
      rotation = rotation + body.velocity.x;
    }
  });

  if (ball.position.y + ballRadius * scale < 0.9 * h)
    ballView.style.zIndex = -2;
  // check if ball is falling
  if (
    ball.position.y < boxA.position.y - 100 &&
    Math.round(ball.velocity.y) === 0
  ) {
    ballAboveBasket = true;
    Body.set(ball, { isSensor: false, isStatic: false });
  }
  if (shouldStart && scale > 0.85 && isMoving) {
    scale = scale - scaleThreshold;
  }
  //check if ball is outside viewport
  if (
    ball.position.x < 0 - ballRadius - BALL_POSITION_CHECK_THRES ||
    ball.position.x > w + ballRadius + BALL_POSITION_CHECK_THRES ||
    ball.position.y > h + ballRadius + 10 * BALL_POSITION_CHECK_THRES
  ) {
    console.log("outside");
    isMoving = false;

    ballView.style.zIndex = -1;
    scale = 1.2;
    Body.setPosition(ball, {
      x: random(0 + ballRadius, w - ballRadius),
      y: 0.92 * h
    });
    Body.setStatic(ball, true);
    isCollided = false;
    rotation = 0;
    Body.setVelocity(ball, { x: 0, y: 0 });

    ballAboveBasket = false;
  }

  //check if basket is succesfull
  if (
    ballAboveBasket &&
    ball.position.x > boxA.position.x &&
    ball.position.x < boxB.position.x &&
    ball.position.y > boxA.position.y + ball.circleRadius
  ) {
    ballAboveBasket = false;
    score = isCollided ? score + 1 : score + 2;
  }
  if (ball) Engine.update(engine, 1000 / 60);
}, 1000 / 60);

var runner = Runner.create();
Runner.run(runner, engine);

render.mouse = mouse;

Render.run(render);
