const {
  innerHeight: h,
  innerWidth: w
} = window
const THREE = require('three');
import Matter from "matter-js";

const Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Events = Matter.Events,
  Body = Matter.Body;

import {
  CAR_HEIGHT,
  CAR_WIDTH,
  BLOCK_WIDTH,
  defaultCategory,
  redCategory,
  THREE_D_X_SHIFT,
  THREE_D_Y_SHIFT
} from './constants'
import {
  Vector3
} from "three";

function getAngleBtwVectores(a, b) {
  const aMod = Math.sqrt(a.x * a.x + a.y * a.y);
  const bMod = Math.sqrt(b.x * b.x + b.y * b.y);
  return (a.x * b.x + a.y * b.y) / (aMod * bMod);
}

function addCar(pos, engine) {
  const car = Bodies.rectangle(pos.x, pos.y, CAR_WIDTH, CAR_HEIGHT, {
    isStatic: false,
    density: 0.1,
    label: 'car',
    friction: 0.02,
    frictionAir: 0.06,
    frictionStatic: 0.01,
    collisionFilter: {
      mask: defaultCategory
    },
    render: {
      fillStyle: 'red'
    }
  })
  World.add(engine.world, car);
  return car;
}

function addRect(engine, x, y, width, height, scene, angle = 0) {
  const body = Bodies.rectangle(x, y, width, height, {
    isStatic: true,
    friction: 0.02,
    frictionStatic: 0,
    angle,
    collisionFilter: {
      mask: defaultCategory
    },
    render: {
      fillStyle: "grey"
    }
  });
  World.add(engine.world, body);

  let geometry = new THREE.BoxGeometry(width, height, 10);
  let material = new THREE.MeshBasicMaterial({
    color: 0xD2691E
  })
  let cube = new THREE.Mesh(geometry, material);
  cube.position.x = THREE_D_X_SHIFT + x;
  cube.position.y = THREE_D_Y_SHIFT - y;
  cube.rotateOnAxis(new Vector3(0, 0, 1), Math.PI - angle)
  scene && scene.add(cube);
}

function createTrack(engine, scene) {
  const thickness = 4;
  // top left part
  let i = 10,
    k = 3
  while (i <= 36) {
    addRect(engine, w / (i * 2), k * thickness / 2, w / i, thickness, scene);
    i += 2;
    k += 2
  }

  addRect(engine, w / 72, 36 * thickness / 2, w / 36, 10 * thickness, scene);

  //left middle pyramid
  addRect(engine, w / 16, 79 * thickness / 2, w / 8, thickness, scene);

  addRect(engine, w / 12, 77 * thickness / 2, w / 6, thickness, scene);

  i = 6;
  k = 75
  while (i <= 36) {
    addRect(engine, w / (i * 2), k * thickness / 2, w / i, thickness, scene);
    i += 2;
    k -= 2;
  }

  i = 12, k = 79;
  while (i <= 34) {
    addRect(engine, w / (i * 2), k * thickness / 2, w / i, thickness, scene);
    i += 2;
    k += 2;
  }

  addRect(engine, w / 72, 119 * thickness / 2, w / 36, 20 * thickness, scene);

  //bottom left
  addRect(engine, w / 2, 171 * thickness / 2, w, thickness, scene);
  addRect(engine, w / 8, 169 * thickness / 2, w / 4, thickness, scene);
  addRect(engine, w / 12, 167 * thickness / 2, w / 6, thickness, scene);
  addRect(engine, w / 16, 165 * thickness / 2, w / 8, thickness, scene);
  addRect(engine, w / 20, 163 * thickness / 2, w / 10, thickness, scene);
  addRect(engine, w / 24, 161 * thickness / 2, w / 12, thickness, scene);
  addRect(engine, w / 28, 159 * thickness / 2, w / 14, thickness, scene);
  addRect(engine, w / 32, 157 * thickness / 2, w / 16, thickness, scene);
  addRect(engine, w / 36, 155 * thickness / 2, w / 18, thickness, scene);
  addRect(engine, w / 40, 153 * thickness / 2, w / 20, thickness, scene);
  addRect(engine, w / 44, 151 * thickness / 2, w / 22, thickness, scene);
  addRect(engine, w / 48, 149 * thickness / 2, w / 24, thickness, scene);
  addRect(engine, w / 52, 147 * thickness / 2, w / 26, thickness, scene);
  addRect(engine, w / 56, 145 * thickness / 2, w / 28, thickness, scene);
  addRect(engine, w / 60, 143 * thickness / 2, w / 30, thickness, scene);
  addRect(engine, w / 64, 141 * thickness / 2, w / 32, thickness, scene);
  addRect(engine, w / 68, 139 * thickness / 2, w / 34, thickness, scene);

  // top middle pyramid
  addRect(engine, w / 5 + 69 * thickness / 2, w / 24, thickness, w / 12, scene);
  addRect(engine, w / 5 + 67 * thickness / 2, w / 24, thickness, w / 12, scene);
  addRect(engine, w / 5 + 65 * thickness / 2, w / 24, thickness, w / 12, scene);
  addRect(engine, w / 5 + 63 * thickness / 2, w / 28, thickness, w / 14, scene);
  addRect(engine, w / 5 + 61 * thickness / 2, w / 32, thickness, w / 16, scene);
  addRect(engine, w / 5 + 59 * thickness / 2, w / 36, thickness, w / 18, scene);
  addRect(engine, w / 5 + 57 * thickness / 2, w / 40, thickness, w / 20, scene);
  addRect(engine, w / 5 + 55 * thickness / 2, w / 44, thickness, w / 22, scene);
  addRect(engine, w / 5 + 53 * thickness / 2, w / 48, thickness, w / 24, scene);
  addRect(engine, w / 5 + 51 * thickness / 2, w / 52, thickness, w / 26, scene);
  addRect(engine, w / 5 + 49 * thickness / 2, w / 56, thickness, w / 28, scene);
  addRect(engine, w / 5 + 47 * thickness / 2, w / 60, thickness, w / 30, scene);
  addRect(engine, w / 5 + 45 * thickness / 2, w / 64, thickness, w / 32, scene);
  addRect(engine, w / 5 + 43 * thickness / 2, w / 68, thickness, w / 34, scene);
  addRect(engine, w / 5 + 41 * thickness / 2, w / 72, thickness, w / 36, scene);

  addRect(engine, w / 5 + 71 * thickness / 2, w / 24, thickness, w / 12, scene);
  addRect(engine, w / 5 + 73 * thickness / 2, w / 28, thickness, w / 14, scene);
  addRect(engine, w / 5 + 75 * thickness / 2, w / 32, thickness, w / 16, scene);
  addRect(engine, w / 5 + 77 * thickness / 2, w / 36, thickness, w / 18, scene);
  addRect(engine, w / 5 + 79 * thickness / 2, w / 40, thickness, w / 20, scene);
  addRect(engine, w / 5 + 81 * thickness / 2, w / 44, thickness, w / 22, scene);
  addRect(engine, w / 5 + 83 * thickness / 2, w / 48, thickness, w / 24, scene);
  addRect(engine, w / 5 + 85 * thickness / 2, w / 52, thickness, w / 26, scene);
  addRect(engine, w / 5 + 87 * thickness / 2, w / 56, thickness, w / 28, scene);
  addRect(engine, w / 5 + 89 * thickness / 2, w / 60, thickness, w / 30, scene);
  addRect(engine, w / 5 + 91 * thickness / 2, w / 64, thickness, w / 32, scene);
  addRect(engine, w / 5 + 93 * thickness / 2, w / 68, thickness, w / 34, scene);



  addRect(engine, w / 4 + 136 * thickness / 2, w / 88, 68 * thickness, w / 44, scene);

  //top right corner
  addRect(engine, w / 1.5 + 69 * thickness / 2, w / 16, thickness, w / 8, scene);
  addRect(engine, w / 1.5 + 67 * thickness / 2, w / 20, thickness, w / 10, scene);
  addRect(engine, w / 1.5 + 65 * thickness / 2, w / 24, thickness, w / 12, scene);
  addRect(engine, w / 1.5 + 63 * thickness / 2, w / 28, thickness, w / 14, scene);
  addRect(engine, w / 1.5 + 61 * thickness / 2, w / 32, thickness, w / 16, scene);
  addRect(engine, w / 1.5 + 59 * thickness / 2, w / 36, thickness, w / 18, scene);
  addRect(engine, w / 1.5 + 57 * thickness / 2, w / 40, thickness, w / 20, scene);
  addRect(engine, w / 1.5 + 55 * thickness / 2, w / 44, thickness, w / 22, scene);
  addRect(engine, w / 1.5 + 53 * thickness / 2, w / 48, thickness, w / 24, scene);
  addRect(engine, w / 1.5 + 51 * thickness / 2, w / 52, thickness, w / 26, scene);
  addRect(engine, w / 1.5 + 49 * thickness / 2, w / 56, thickness, w / 28, scene);
  addRect(engine, w / 1.5 + 47 * thickness / 2, w / 60, thickness, w / 30, scene);
  addRect(engine, w / 1.5 + 45 * thickness / 2, w / 64, thickness, w / 32, scene);
  addRect(engine, w / 1.5 + 43 * thickness / 2, w / 68, thickness, w / 34, scene);
  addRect(engine, w / 1.5 + 41 * thickness / 2, w / 72, thickness, w / 36, scene);

  //bottom right
  addRect(engine, w / 1.12 - w / 8, 169 * thickness / 2, w / 4, thickness, scene);
  addRect(engine, w / 1.12 - w / 12, 167 * thickness / 2, w / 6, thickness, scene);
  addRect(engine, w / 1.12 - w / 16, 165 * thickness / 2, w / 8, thickness, scene);
  addRect(engine, w / 1.12 - w / 20, 163 * thickness / 2, w / 10, thickness, scene);
  addRect(engine, w / 1.12 - w / 24, 161 * thickness / 2, w / 12, thickness, scene);
  addRect(engine, w / 1.12 - w / 28, 159 * thickness / 2, w / 14, thickness, scene);
  addRect(engine, w / 1.12 - w / 32, 157 * thickness / 2, w / 16, thickness, scene);
  addRect(engine, w / 1.12 - w / 36, 155 * thickness / 2, w / 18, thickness, scene);
  addRect(engine, w / 1.12 - w / 40, 153 * thickness / 2, w / 20, thickness, scene);
  addRect(engine, w / 1.12 - w / 44, 151 * thickness / 2, w / 22, thickness, scene);
  addRect(engine, w / 1.12 - w / 48, 149 * thickness / 2, w / 24, thickness, scene);
  addRect(engine, w / 1.12 - w / 52, 147 * thickness / 2, w / 26, thickness, scene);
  addRect(engine, w / 1.12 - w / 56, 145 * thickness / 2, w / 28, thickness, scene);
  addRect(engine, w / 1.12 - w / 60, 143 * thickness / 2, w / 30, thickness, scene);
  addRect(engine, w / 1.12 - w / 88, 141 * thickness / 2, w / 46, thickness, scene);
  addRect(engine, w / 1.12 - w / 96, 139 * thickness / 2, w / 48, thickness, scene);


  addRect(engine, w - w / 16, h / 2, w / 8, h, scene);
  //center part
  addRect(engine, w / 1.5 - w / 8, 101 * thickness / 2 - w / 10, w / 4, thickness, scene);
  addRect(engine, w / 1.5 - w / 8.4, 99 * thickness / 2 - w / 10, w / 4.2, thickness, scene);
  addRect(engine, w / 1.5 - w / 8.8, 97 * thickness / 2 - w / 10, w / 4.4, thickness, scene);
  addRect(engine, w / 1.5 - w / 9.2, 95 * thickness / 2 - w / 10, w / 4.6, thickness, scene);
  addRect(engine, w / 1.5 - w / 9.6, 93 * thickness / 2 - w / 10, w / 4.8, thickness, scene);
  addRect(engine, w / 1.5 - w / 10, 91 * thickness / 2 - w / 10, w / 5, thickness, scene);
  addRect(engine, w / 1.5 - w / 10.4, 89 * thickness / 2 - w / 10, w / 5.2, thickness, scene);
  addRect(engine, w / 1.5 - w / 10.8, 87 * thickness / 2 - w / 10, w / 5.4, thickness, scene);
  addRect(engine, w / 1.5 - w / 11.2, 85 * thickness / 2 - w / 10, w / 5.6, thickness, scene);
  addRect(engine, w / 1.5 - w / 11.6, 83 * thickness / 2 - w / 10, w / 5.8, thickness, scene);
  addRect(engine, w / 1.5 - w / 12, 81 * thickness / 2 - w / 10, w / 6, thickness, scene);
  addRect(engine, w / 1.5 - w / 16, 79 * thickness / 2 - w / 10, w / 8, thickness, scene);
  addRect(engine, w / 1.5 - w / 20, 77 * thickness / 2 - w / 10, w / 10, thickness, scene);
  addRect(engine, w / 1.5 - w / 24, 75 * thickness / 2 - w / 10, w / 12, thickness, scene);
  addRect(engine, w / 1.5 - w / 28, 73 * thickness / 2 - w / 10, w / 14, thickness, scene);
  addRect(engine, w / 1.5 - w / 32, 71 * thickness / 2 - w / 10, w / 16, thickness, scene);
  addRect(engine, w / 1.5 - w / 36, 69 * thickness / 2 - w / 10, w / 18, thickness, scene);
  addRect(engine, w / 1.5 - w / 40, 67 * thickness / 2 - w / 10, w / 20, thickness, scene);
  addRect(engine, w / 1.5 - w / 44, 65 * thickness / 2 - w / 10, w / 22, thickness, scene);
  addRect(engine, w / 1.5 - w / 48, 63 * thickness / 2 - w / 10, w / 24, thickness, scene);

  addRect(engine, w / 1.5 - w / 6, 109 * thickness / 2, w / 3, thickness, scene);
  addRect(engine, w / 1.5 - w / 6.4, 107 * thickness / 2, w / 3.2, thickness, scene);
  addRect(engine, w / 1.5 - w / 6.8, 105 * thickness / 2, w / 3.4, thickness, scene);
  addRect(engine, w / 1.5 - w / 7.2, 103 * thickness / 2, w / 3.6, thickness, scene);
  addRect(engine, w / 1.5 - w / 7.6, 101 * thickness / 2, w / 3.8, thickness, scene);
  addRect(engine, w / 1.5 - w / 8, 99 * thickness / 2, w / 4, thickness, scene);
  addRect(engine, w / 1.5 - w / 8.4, 97 * thickness / 2, w / 4.2, thickness, scene);
  addRect(engine, w / 1.5 - w / 8.8, 95 * thickness / 2, w / 4.4, thickness, scene);
  addRect(engine, w / 1.5 - w / 9.2, 93 * thickness / 2, w / 4.6, thickness, scene);
  addRect(engine, w / 1.5 - w / 9.6, 91 * thickness / 2, w / 4.8, thickness, scene);
  addRect(engine, w / 1.5 - w / 10, 89 * thickness / 2, w / 5, thickness, scene);
  addRect(engine, w / 1.5 - w / 10, 87 * thickness / 2, w / 5, thickness, scene);
  addRect(engine, w / 1.5 - w / 10, 85 * thickness / 2, w / 5, thickness, scene);
  addRect(engine, w / 1.5 - w / 10, 83 * thickness / 2, w / 5, thickness, scene);
  addRect(engine, w / 1.5 - w / 10, 81 * thickness / 2, w / 5, thickness, scene);
  addRect(engine, w / 1.5 - w / 9.6, 79 * thickness / 2, w / 4.8, thickness, scene);
  addRect(engine, w / 1.5 - w / 9.2, 77 * thickness / 2, w / 4.6, thickness, scene);
  addRect(engine, w / 1.5 - w / 8.8, 75 * thickness / 2, w / 4.4, thickness, scene);
  addRect(engine, w / 1.5 - w / 8.4, 73 * thickness / 2, w / 4.2, thickness, scene);
  addRect(engine, w / 1.5 - w / 8, 71 * thickness / 2, w / 4, thickness, scene);
  addRect(engine, w / 2.18, 120 * thickness / 2, w / 2.4, 10 * thickness, scene);


  addRect(engine, w / 3, h / 3.2, w / 4.2, 2 * thickness, scene, Math.PI / 7.4);
}

function addWalls(engine, scene) {
  const wallThickness = 5
  //bottom
  addRect(engine, 0 + w / 2, h - wallThickness / 2, w, wallThickness, scene);
  //top
  addRect(engine, 0 + w / 2, wallThickness / 2, w, wallThickness, scene);
  //left
  addRect(engine, 0 + wallThickness / 2, h / 2, wallThickness, h, scene);
  //right
  addRect(engine, w - wallThickness / 2, h / 2, wallThickness, h, scene);
}

function addGround(scene) {
  let geometry = new THREE.BoxGeometry(w, h, 1);
  let material = new THREE.MeshBasicMaterial({
    color: 0xD3D3D3
  })
  let cube = new THREE.Mesh(geometry, material);
  cube.position.x = 0;
  cube.position.y = 0;
  scene.add(cube);
}

function getTouchPoints(e) {
  return {
    x: e.changedTouches[0].clientX,
    y: e.changedTouches[0].clientY
  };
}
export {
  addWalls,
  addCar,
  getTouchPoints,
  getAngleBtwVectores,
  addGround,
  createTrack
}