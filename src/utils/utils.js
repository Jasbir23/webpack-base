const {
  innerHeight: h,
  innerWidth: w
} = window

import {
  CAR_HEIGHT,
  CAR_WIDTH
} from './constants'

function addCar(pos, engine, World, Bodies) {
  const car = Bodies.trapezoid(pos.x, pos.y, CAR_WIDTH, CAR_HEIGHT, 1, {
    isStatic: false,
    friction: 0.05,
    frictionAir: 0.006,
    frictionStatic: 0,
    render: {
      fillStyle: 'red'
    }
  })
  World.add(engine.world, car);
  return car;
}

function addWalls(engine, World, Bodies) {
  const wallThickness = 10
  const bottom = Bodies.rectangle(0 + w / 2, h - wallThickness / 2, w, wallThickness, {
    isStatic: true,
    render: {
      fillStyle: "grey"
    }
  });
  const top = Bodies.rectangle(0 + w / 2, wallThickness / 2, w, wallThickness, {
    isStatic: true,
    render: {
      fillStyle: "grey"
    }
  });
  const left = Bodies.rectangle(0 + wallThickness / 2, h / 2, wallThickness, h, {
    isStatic: true,
    render: {
      fillStyle: "grey"
    }
  });
  const right = Bodies.rectangle(w - wallThickness / 2, h / 2, wallThickness, h, {
    isStatic: true,
    render: {
      fillStyle: "grey"
    }
  });
  World.add(engine.world, [bottom, top, left, right])
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
  getTouchPoints
}