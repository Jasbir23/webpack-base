import Matter from "matter-js";
import {
  Scene,
  PerspectiveCamera,
  BoxGeometry,
  MeshPhongMaterial,
  Mesh,
  WebGLRenderer,
  DirectionalLight
} from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import generateSocket from "./util/socketUtil";
import { playerXForce } from "./constants/serverConstants";
import "./index.css";

import treeModel from "./assets/models/tree/PineTree.gltf";

const { innerHeight, innerWidth } = window;
export const initYPos = 0.2; // wrt width

let normalFric = 0,
  movementFric = 0;

let defaultW = 360,
  defaultH = 640;
const containerMaxWidth = 600;
const socket = generateSocket();
let playerControl = { x: 0, y: 0 };
let allPlayersBodies = {};
let treeModelObject = null;

let gameConfigs = {};
let containerWidth = 0,
  containerHeight = 0;
let playerRad = 0,
  obstacleRad = 0;
let treeBodies = [],
  treeMap = [];

let currentSampleDate = 0;

const loader = new GLTFLoader();

const raceContainer = document.querySelector(".raceContainer");
const leftBut = document.querySelector(".leftBut");
const rightBut = document.querySelector(".rightBut");

// module aliases
const Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body;

// webgl code

const scene = new Scene();
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);
let allPlayerMeshes = {};

const renderer = new WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
raceContainer.appendChild(renderer.domElement);
// const directionalLight = new PointLight(0xffffff, 1);

// new OrbitControls(camera, renderer.domElement);

// const worldTest = new BoxGeometry();
// const TestMaterial = new MeshPhongMaterial({ color: 0x00ff00 });
// const Test = new Mesh(worldTest, TestMaterial);
// scene.add(Test);

function createWorld(height, width) {
  const worldGround = new BoxGeometry(width, height, 20, 20);
  const groundMaterial = new MeshPhongMaterial({
    color: "white"
  });
  const ground = new Mesh(worldGround, groundMaterial);
  const light2 = new DirectionalLight(0xffffff, 3);
  light2.castShadow = true;
  light2.position.set(-height / 2, -height / 2, 600);
  scene.add(light2);
  ground.position.x = width / 2;
  ground.position.y = -height / 2;
  ground.position.z = -10;
  scene.add(ground);
}
let treeMeshes = [];
function drawTreeMesh(x, y, edge) {
  const tree = new Mesh();
  tree.position.set(x, -y, 0);
  treeMeshes.push(tree);
  scene.add(tree);
}

function addTreesModels(treeModel) {
  treeMeshes.forEach(treeMesh => treeMesh.add(treeModel.clone()));
}

function getTreeModel() {
  // Load a glTF resource
  loader.load(
    // resource URL
    treeModel,
    // called when the resource is loaded
    function(gltf) {
      const model = gltf.scene;
      model.scale.x = 5;
      model.scale.y = 5;
      model.scale.z = 5;
      model.rotation.x = Math.PI / 2;
      addTreesModels(gltf.scene);
    },
    // called while loading is progressing
    function(xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function(error) {
      console.log("An error happened");
    }
  );
}

function createCharacter(edge, isHero, id) {
  console.log("create char", isHero, id);
  const chatacterGeometry = new BoxGeometry(edge, edge, edge);
  const characterMaterial = new MeshPhongMaterial({
    color: isHero ? "blue" : "red"
  });
  const character = new Mesh(chatacterGeometry, characterMaterial);
  const outerMesh = new Mesh();
  outerMesh.add(character);
  if (isHero) {
    outerMesh.add(camera);
  }
  outerMesh.position.z = edge / 2;
  outerMesh.character = character;
  console.log(outerMesh);
  allPlayerMeshes[id] = outerMesh;
  scene.add(outerMesh);
}

function updateCharacter(id, newPosition, newRotation) {
  // console.log("updateCharacter", newRotation);
  if (allPlayerMeshes[id]) {
    allPlayerMeshes[id].position.x = newPosition.x;
    allPlayerMeshes[id].position.y = -newPosition.y;
    allPlayerMeshes[id].character.rotation.z = -newRotation;
  }
}

camera.position.z = 250;
camera.position.y = -400;
camera.rotation.x = Math.PI / 4;

const animate = function() {
  renderer.render(scene, camera);
};

// // create an engine
const engine = Engine.create();
function initializeGame(configs) {
  gameConfigs = configs;
  const {
    raceLength,
    treeFrequency,
    defaultWidth,
    defaultHeight,
    defaultAspectRation,
    playerXForce,
    playerYDrag,
    wallThicknessFactor,
    playerRadiusFactor,
    obstacleRadiusFactor,
    treemap,
    worldGravity,
    normalFriction,
    movementFriction
  } = gameConfigs;
  normalFric = normalFriction;
  movementFric = movementFriction;
  defaultW = defaultWidth;
  defaultH = defaultHeight;
  playerRad = playerRadiusFactor;
  obstacleRad = obstacleRadiusFactor;
  containerWidth =
    innerWidth > containerMaxWidth ? containerMaxWidth : innerWidth;
  containerHeight = containerWidth / defaultAspectRation;

  raceContainer.style.width = innerWidth;
  raceContainer.style.height = innerHeight;
  createWorld(raceLength, defaultWidth);
  treeMap = treemap;
  // console.log(worldGravity);
  engine.world.gravity.y = worldGravity;
  const wallLeft = Bodies.rectangle(
    0,
    raceLength / 2,
    wallThicknessFactor * defaultW,
    raceLength,
    {
      isStatic: true,
      render: {
        fillStyle: "grey"
      }
    }
  );
  const wallRight = Bodies.rectangle(
    defaultW,
    raceLength / 2,
    wallThicknessFactor * defaultW,
    raceLength,
    {
      isStatic: true,
      render: {
        fillStyle: "grey"
      }
    }
  );
  const bottomWall = Bodies.rectangle(
    defaultW / 2,
    raceLength,
    defaultW,
    wallThicknessFactor * defaultW,
    {
      isStatic: true,
      render: {
        fillStyle: "grey"
      }
    }
  );
  getTreeModel();
  drawTrees(treemap);
  // create a renderer
  // const render = Render.create({
  //   element: raceContainer,
  //   engine: engine,
  //   options: {
  //     width: defaultW,
  //     height: raceLength
  //   }
  // });
  // render.options.wireframes = false;

  // engine.world.bounds.max.x = defaultW * 2;
  // engine.world.bounds.max.y = raceLength;

  // // run the renderer
  // Render.run(render);
  World.add(engine.world, [wallLeft, wallRight, bottomWall]);
}

function drawTrees(treemap) {
  treeBodies = treemap.map(map => {
    drawTreeMesh(map.x * defaultW, map.y, obstacleRad * defaultW);
    return Bodies.rectangle(
      map.x * defaultW,
      map.y,
      obstacleRad * defaultW,
      obstacleRad * defaultW,
      {
        isStatic: true,
        render: {
          fillStyle: "grey"
        }
      }
    );
  });
  World.add(engine.world, treeBodies);
}

document.onkeydown = function(e) {
  switch (e.key) {
    case "a":
      playerControl.x = -1;
      // console.log("start left");
      break;
    case "d":
      playerControl.x = 1;
      // console.log("start right");

      break;
  }
};

document.onkeyup = function(e) {
  switch (e.key) {
    case "a":
      playerControl.x = 0;
      // console.log("end left");
      break;
    case "d":
      playerControl.x = 0;
      // console.log("end left");
      break;
  }
};

leftBut.ontouchstart = function(e) {
  // console.log("start left");
  e.preventDefault();
  // playerControl.x = -1;
  playerControl = Object.assign({}, playerControl, { x: -1 });
};

leftBut.ontouchend = function(e) {
  e.preventDefault();
  playerControl = Object.assign({}, playerControl, { x: 0 });
};

rightBut.ontouchstart = function(e) {
  e.preventDefault();
  playerControl = Object.assign({}, playerControl, { x: 1 });
};

rightBut.ontouchend = function(e) {
  e.preventDefault();
  playerControl = Object.assign({}, playerControl, { x: 0 });
};

socket.on("connect", () => {
  console.log("connected", socket);
});

socket.on("passConfigs", initializeGame);

socket.on("newWorld", newWorld => {
  // console.log(newWorld);
  newWorld.forEach(player => createOrUpdatePlayer(player));
});

socket.on("removePlayer", playerId => {
  World.remove(engine.world, allPlayersBodies[playerId]);
  delete allPlayersBodies[playerId];
  scene.remove(allPlayerMeshes[playerId]);
  delete allPlayerMeshes[playerId];
});

socket.on("disconnect", () => stopGame());

function createOrUpdatePlayer(player) {
  // console.log(player);
  if (player.currentSampleDate < currentSampleDate) {
    console.log("khjkhjk");
    return;
  } else {
    // console.log(currentSampleDate, "90909");
    currentSampleDate = player.currentSampleDate;
  }
  let playerBody = allPlayersBodies[player.id];
  if (!playerBody) {
    createCharacter(playerRad * defaultW, player.id === socket.id, player.id);
    playerBody = Bodies.rectangle(
      defaultW / 2,
      initYPos * defaultW,
      playerRad * defaultW,
      playerRad * defaultW,
      {
        render: {
          fillStyle: player.id === socket.id ? "blue" : "red"
        }
      }
    );
    allPlayersBodies[player.id] = playerBody;
    World.add(engine.world, [playerBody]);
  }
  applyPlayerValues(player, playerBody);
}

function applyPlayerValues(player, playerBody) {
  Body.setAngle(playerBody, player.angle);
  Body.setAngularVelocity(playerBody, player.angularVelocity);
  Body.applyForce(playerBody, player.position, {
    x: player.force.x,
    y: player.force.y
  });
  // if (player.force.x) {
  //   playerBody.frictionAir = movementFric;
  // } else playerBody.frictionAir = normalFric;
  // updateCharacter(player.id, player.position, player.angle);
  Body.setPosition(playerBody, {
    x: player.position.x,
    y: player.position.y
  });
  Body.setVelocity(playerBody, {
    x: player.velocity.x,
    y: player.velocity.y
  });
  // Body.applyForce(playerBody, player.position, {
  //   x: player.force.x,
  //   y: 0
  // });
}

function updateControls(playerControl) {
  socket.emit("playerControl", playerControl);
  const playerBody = allPlayersBodies[socket.id];
  // playerBody && updateScroll(playerBody.position.y - initYPos * defaultW);
}

function updatePlayerMeshes() {
  Object.keys(allPlayersBodies).forEach(playerId =>
    updateCharacter(
      playerId,
      allPlayersBodies[playerId].position,
      allPlayersBodies[playerId].angle
    )
  );
}

// run the engine

const gameInteval = setInterval(() => {
  Engine.update(engine);
  updatePlayerMeshes();
  animate();
  updateControls(playerControl);
}, 33);

function stopGame() {
  clearInterval(gameInteval);
}
