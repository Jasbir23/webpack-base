import Matter from "matter-js";

import generateSocket from "./util/socketUtil";
import { playerXForce } from "./constants/serverConstants";
import "./index.css";
const { innerHeight, innerWidth } = window;
export const initYPos = 0.2; // wrt width
let defaultW = 360,
  defaultH = 640;
const containerMaxWidth = 600;
const socket = generateSocket();
let playerControl = { x: 0, y: 0 };
let allPlayersBodies = {};

let gameConfigs = {};
let containerWidth = 0,
  containerHeight = 0;
let playerRad = 0,
  obstacleRad = 0;
let treeBodies = [],
  treeMap = [];

let currentSampleDate = 0;

const raceContainer = document.querySelector(".raceContainer");
const leftBut = document.querySelector(".leftBut");
const rightBut = document.querySelector(".rightBut");

// module aliases
const Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body;
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
    worldGravity
  } = gameConfigs;
  defaultW = defaultWidth;
  defaultH = defaultHeight;
  playerRad = playerRadiusFactor;
  obstacleRad = obstacleRadiusFactor;
  containerWidth =
    innerWidth > containerMaxWidth ? containerMaxWidth : innerWidth;
  containerHeight = containerWidth / defaultAspectRation;

  raceContainer.style.width = defaultW;
  raceContainer.style.height = raceLength;
  treeMap = treemap;
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

  drawTrees(treemap);
  // create a renderer
  const render = Render.create({
    element: raceContainer,
    engine: engine,
    options: {
      width: defaultW,
      height: raceLength
    }
  });
  render.options.wireframes = false;

  engine.world.bounds.max.x = defaultW * 2;
  engine.world.bounds.max.y = raceLength;

  // run the renderer
  Render.run(render);
  World.add(engine.world, [wallLeft, wallRight, bottomWall]);
}

function drawTrees(treemap) {
  treeBodies = treemap.map(map => {
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
      break;
    case "d":
      playerControl.x = 1;
      break;
  }
};

document.onkeyup = function(e) {
  switch (e.key) {
    case "a":
      playerControl.x = 0;
      break;
    case "d":
      playerControl.x = 0;
      break;
  }
};

leftBut.ontouchstart = function(e) {
  playerControl.x = -1;
};

leftBut.ontouchend = function(e) {
  playerControl.x = 0;
};

rightBut.ontouchstart = function(e) {
  playerControl.x = 1;
};

rightBut.ontouchend = function(e) {
  playerControl.x = 0;
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
    playerBody = Bodies.rectangle(
      defaultW / 2,
      initYPos * defaultW,
      playerRad * defaultW,
      playerRad * defaultW,
      {
        render: {
          fillStyle: player.id === socket.id ? "green" : "red"
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
  if (player.force.x) {
    Body.applyForce(playerBody, player.position, {
      x: player.force.x,
      y: 0
    });
  } else {
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
}

function updateControls(playerControl) {
  socket.emit("playerControl", playerControl);
}

// run the engine

const gameInteval = setInterval(() => {
  Engine.update(engine);
  updateControls(playerControl);
}, 33);

function stopGame() {
  clearInterval(gameInteval);
}
