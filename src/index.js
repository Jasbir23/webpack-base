import "./index.css";
import Matter from "matter-js";
import "./assets/basketBall.png";
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
  MouseConstraint = Matter.MouseConstraint;

var GRAVITY = 0.5;
var initialVx = 0;
var initialVy = 0;
var shouldStart = false;
var infiniteMassRadius = w / 84;
var ballRadius = w / 10;
var BALL_POSITION_CHECK_THRES = 80;
var ROTATION_FAC = 10;
var engine = Engine.create();
engine.world.gravity.y = GRAVITY;

var defaultCategory = 0x0001,
  redCategory = 0x0002,
  greenCategory = 0x0004,
  blueCategory = 0x0008;

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// var group = Body.nextGroup(true),
//   particleOptions = {
//     friction: 0.00001,
//     collisionFilter: { group: group },
//     render: { visible: false }
//   },
//   constraintOptions = { stiffness: 0.06 },
//   cloth = Composites.softBody(
//     280,
//     600,
//     12,
//     5,
//     8,
//     5,
//     false,
//     8,
//     particleOptions,
//     constraintOptions
//   );
// for (var i = 0; i < 20; i++) {
//   if (i !== 0 && i !== 10) cloth.bodies[i].isSensor = true;
//   cloth.bodies[0].isStatic = true;
//   cloth.bodies[11].isStatic = true;
// }

// create a renderer
var render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: w,
    height: h,
    wireframes: false,
    showConvexHulls: true
  }
});

var basketOptions = {
  isStatic: true,
  friction: 0.05,
  frictionAir: 0.006,
  restitution: 0.9,
  collisionFilter: {
    category: redCategory
  },
  render: {
    fillStyle: "darkorange",
    strokeStyle: "black",
    sprite: {
      texture: "./assets/basketBall.png",
      xScale: 0.75,
      yScale: 0.75
    }
  }
};

var boxA = Bodies.circle(0.3 * w, (2 / 7) * h, infiniteMassRadius, {
  isStatic: true,
  collisionFilter: {
    mask: redCategory
  }
});
var boxB = Bodies.circle(0.55 * w, (2 / 7) * h, infiniteMassRadius, {
  isStatic: true,
  collisionFilter: {
    mask: redCategory
  }
});
var ball = Bodies.circle(w / 2, 0.92 * h, ballRadius, basketOptions);
var ground = Bodies.rectangle(w / 2, 0.98 * h, w, 0.08 * h, {
  isStatic: true,
  collisionFilter: { mask: defaultCategory }
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
  initialVy = -7 * swipeLength;
  shouldStart = true;
  Body.set(ball, { isSensor: true, isStatic: false });
  Body.setAngularVelocity(ball, 0.2 * angle * ROTATION_FAC);
  Body.setVelocity(ball, { x: initialVx, y: initialVy });
});

function getDistance(center1, center2) {
  return Math.sqrt(
    (center1.x - center2.x) * (center1.x - center2.x) +
      (center1.y - center2.y) * (center1.y - center2.y)
  );
}

Events.on(mouseConstraint, "mousedown", function(event) {
  var mousePosition = event.mouse.position;
  this.startY = mousePosition.y;
  this.startX = mousePosition.x;
});
console.log("ball: ", ball);

setInterval(function() {
  if (
    ball.position.y < boxA.position.y - 100 &&
    Math.round(ball.velocity.y) === 0
  ) {
    Body.set(ball, { isSensor: false, isStatic: false });
  }
  console.log("here: ball.timeScale", ball.timeScale);
  // if (shouldStart && ball.position.y > boxA.position.y)
  //   Body.scale(ball, 0.99, 0.99);
  if (
    ball.position.x < 0 - ballRadius - BALL_POSITION_CHECK_THRES ||
    ball.position.x > w + ballRadius + BALL_POSITION_CHECK_THRES ||
    ball.position.y > h + ballRadius + 10 * BALL_POSITION_CHECK_THRES
  ) {
    Body.setPosition(ball, { x: w / 2, y: 0.92 * h });
    Body.setStatic(ball, true);
  }
  Engine.update(engine, 1000 / 60);
}, 1000 / 60);

var runner = Runner.create();
Runner.run(runner, engine);

render.mouse = mouse;
Engine.run(engine);

Render.run(render);
