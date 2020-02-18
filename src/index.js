import "./index.css";
import Matter from "matter-js";
import { addWalls } from "./utils";

const { innerHeight: h, innerWidth: w } = window;

const STEERING_RADIUS = 0.08 * w,
  SENSITIVITY = 1,
  FORCE_CONST = 0.0000001 * w,
  STEERING_DIFF_THRESHOLD = 40,
  CAR_WIDTH = 0.02 * w,
  CAR_HEIGHT = 0.05 * h;

var accelerate = false,
  deaccelerate = false,
  lockSteeringWheel = false,
  prevVal = 0,
  carAngle = 0,
  steeringStartX,
  steeringStartY;

// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body;

var engine = Engine.create();

var render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: w,
    height: h,
    wireframes: false
  }
});
engine.world.gravity = { x: 0, y: 0 };
var car = Bodies.rectangle(w / 5, 0.6 * h, CAR_WIDTH, CAR_HEIGHT, {
  isStatic: true,
  render: {
    fillStyle: "transparent"
  }
});

var boxA = Bodies.rectangle(w / 3.2, 0.3 * h, 0.14 * w, 0.14 * w, {
  isStatic: true,
  render: {
    fillStyle: "lightyellow"
  }
});
var boxB = Bodies.rectangle((2.8 * w) / 4, 0.3 * h, 0.14 * w, 0.14 * w, {
  isStatic: true,
  render: {
    fillStyle: "lightyellow"
  }
});
var boxC = Bodies.rectangle(w / 2, 0.7 * h, 0.14 * w, 0.14 * w, {
  isStatic: true,
  render: {
    fillStyle: "lightyellow"
  }
});

function setupGame() {
  addWalls(engine, World, Bodies);

  //adding car
  World.add(engine.world, [car, boxA, boxB, boxC]);
  var animationFrame = window.requestAnimationFrame(gameLoop);
}

setupGame();
var carView = document.querySelector(".car");
carView.style.height = CAR_HEIGHT;
carView.style.width = CAR_WIDTH;
carView.style.left = `${car.position.x - CAR_WIDTH / 2}px`;
carView.style.top = `${car.position.y - CAR_HEIGHT / 2}px`;

function gameLoop() {
  Body.setAngle(car, carAngle);
  carView.style.left = `${car.position.x - CAR_WIDTH / 2}px`;
  carView.style.top = `${car.position.y - CAR_HEIGHT / 2}px`;
  carView.style.transform = `rotate(${car.angle}rad)`;
  if (accelerate) {
    Body.applyForce(
      car,
      {
        x: car.position.x,
        y: car.position.y
      },
      {
        x: FORCE_CONST * Math.sin(car.angle),
        y: -FORCE_CONST * Math.cos(car.angle)
      }
    );
  }
  if (deaccelerate) {
    Body.applyForce(
      car,
      {
        x: car.position.x,
        y: car.position.y
      },
      {
        x: -FORCE_CONST * Math.sin(car.angle),
        y: FORCE_CONST * Math.cos(car.angle)
      }
    );
  }

  Engine.update(engine);
  window.requestAnimationFrame(gameLoop);
}
// Engine.run(engine);

function getTouchPoints(e) {
  return {
    x: e.changedTouches[0].clientX,
    y: e.changedTouches[0].clientY
  };
}

var steering = document.querySelector(".steering");
steering.style.top = 0.7 * h;
steering.style.left = 0.05 * w;

steering.ontouchstart = event => ontouchstart(event);
steering.ontouchmove = event => ontouchmove(event);
steering.ontouchend = event => ontouchend(event);

function ontouchstart(event) {
  const { x, y } = getTouchPoints(event);
  steeringStartX = x;
  steeringStartY = y;
  steeringStartY /= SENSITIVITY;
}

function ontouchmove(event) {
  let { x, y } = getTouchPoints(event);
  y /= SENSITIVITY;
  let diff = y - steeringStartY;
  if (diff < STEERING_DIFF_THRESHOLD) lockSteeringWheel = false;
  if (diff > 2 * STEERING_RADIUS) diff = 2 * STEERING_RADIUS;
  else if (diff < 0) diff = 0;

  if (!lockSteeringWheel) {
    prevVal = x >= steeringStartX ? 1 : -1;
    lockSteeringWheel = true;
  }
  const angle = (diff / STEERING_RADIUS) * prevVal;
  carAngle = angle;
  steering.style.transform = `rotate(${angle}rad)`;
}

function ontouchend(event) {
  steering.style.transform = `rotate(0deg)`;
  // carAngle = 0;
}

var deaccelerator = document.querySelector(".deaccelerator");
deaccelerator.style.right = 0.1 * w;
deaccelerator.style.top = 0.8 * h;
deaccelerator.style.backgroundColor = "pink";
deaccelerator.ontouchstart = () => deacceleratorPress();
deaccelerator.ontouchend = () => deacceleratorRelease();

function deacceleratorPress() {
  deaccelerator.style.backgroundColor = "red";
  deaccelerate = true;
  accelerate = false;
  accelerator.style.backgroundColor = "greenyellow";
  Body.setStatic(car, false);
}
function deacceleratorRelease() {
  deaccelerator.style.backgroundColor = "pink";
  deaccelerate = false;
  Body.setStatic(car, true);
}

var accelerator = document.querySelector(".accelerator");
accelerator.style.right = 0.2 * w;
accelerator.style.top = 0.8 * h;
accelerator.style.backgroundColor = "greenyellow";
accelerator.ontouchstart = () => acceleratorPress();
accelerator.ontouchend = () => acceleratorRelease();

function acceleratorPress() {
  accelerator.style.backgroundColor = "green";
  accelerate = true;
  deaccelerate = false;
  deaccelerator.style.backgroundColor = "pink";
  Body.setStatic(car, false);
}

function acceleratorRelease() {
  accelerator.style.backgroundColor = "greenyellow";
  accelerate = false;
  Body.setStatic(car, true);
}

Render.run(render);
