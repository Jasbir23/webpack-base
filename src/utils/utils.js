const {
  innerHeight: h,
  innerWidth: w
} = window

import {
  CAR_HEIGHT,
  CAR_WIDTH,
  BLOCK_WIDTH,
  defaultCategory,
  redCategory
} from './constants'

function addCar(pos, engine, World, Bodies) {
  const car = Bodies.rectangle(pos.x, pos.y, CAR_WIDTH, CAR_HEIGHT, {
    isStatic: false,
    density: 0.01,
    label: 'car',
    friction: 0.05,
    frictionAir: 0.06,
    frictionStatic: 0,
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


function addBlock(pos, engine, World, Bodies) {
  const block = Bodies.rectangle(pos.x, pos.y, BLOCK_WIDTH, BLOCK_WIDTH, {
    isStatic: true,
    friction: 0.05,
    collisionFilter: {
      mask: defaultCategory
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  World.add(engine.world, block);
}

function addGrass(pos, engine, World, Bodies) {
  const grass = Bodies.rectangle(pos.x, pos.y, 2 * BLOCK_WIDTH, 2 * BLOCK_WIDTH, {
    isSensor: true,
    label: 'grass',
    friction: 0.05,
    collisionFilter: {
      mask: defaultCategory,
    },
    render: {
      fillStyle: '#4A7023',
      opacity: 0.4,
    }
  })
  World.add(engine.world, grass);
  return grass;
}

function addWalls(engine, World, Bodies) {
  const wallThickness = 10
  const bottom = Bodies.rectangle(0 + w / 2, h - wallThickness / 2, w, wallThickness, {
    isStatic: true,
    collisionFilter: {
      mask: defaultCategory
    },
    render: {
      fillStyle: "grey"
    }
  });
  const top = Bodies.rectangle(0 + w / 2, wallThickness / 2, w, wallThickness, {
    isStatic: true,
    collisionFilter: {
      mask: defaultCategory
    },
    render: {
      fillStyle: "grey"
    }
  });
  const left = Bodies.rectangle(0 + wallThickness / 2, h / 2, wallThickness, h, {
    isStatic: true,
    collisionFilter: {
      mask: defaultCategory
    },
    render: {
      fillStyle: "grey"
    }
  });
  const right = Bodies.rectangle(w - wallThickness / 2, h / 2, wallThickness, h, {
    isStatic: true,
    collisionFilter: {
      mask: defaultCategory
    },
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
  addBlock,
  addGrass,
  getTouchPoints
}