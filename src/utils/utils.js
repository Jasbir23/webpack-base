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

function getAngleBtwVectores(a, b) {
  const aMod = Math.sqrt(a.x * a.x + a.y * a.y);
  const bMod = Math.sqrt(b.x * b.x + b.y * b.y);
  return (a.x * b.x + a.y * b.y) / (aMod * bMod);
}

function addCar(pos, engine, World, Bodies) {
  const car = Bodies.rectangle(pos.x, pos.y, CAR_WIDTH, CAR_HEIGHT, {
    isStatic: false,
    density: 0.01,
    label: 'car',
    friction: 0.02,
    frictionAir: 0.03,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    chamfer: {
      radius: [4, 4, 4, 4]
    },
    render: {
      fillStyle: 'red'
    }
  })
  World.add(engine.world, car);
  return car;
}

function createTrack(w, h, engine, World, Bodies) {
  const block = Bodies.trapezoid(w * 0.24, h * 0.52, w * 0.1, h * 0.5, -0.8, {
    isStatic: true,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    chamfer: {
      radius: [50, 50, 50, 50]
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  const circle = Bodies.circle(w * 0.24, h * 0.32, w * 0.1, {
    isStatic: true,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  const circle2 = Bodies.circle(w * 0.28, h * 0.7, w * 0.08, {
    isStatic: true,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  const circle3 = Bodies.circle(w * 0.77, h * 0.7, w * 0.076, {
    isStatic: true,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  const block2 = Bodies.trapezoid(w * 0.5, h * 0.74, w * 0.6, h * 0.2, 1, {
    isStatic: true,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    chamfer: {
      radius: [30, 30, 30, 30]
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  const block3 = Bodies.polygon(w * 0.68, 0.13 * h, 6, 0.2 * w, {
    isStatic: true,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    chamfer: {
      radius: [90, 100, 60, 40]
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  World.add(engine.world, [block, block2, block3, circle, circle2, circle3]);
}

function addBlock(pos, engine, World, Bodies) {
  const block = Bodies.rectangle(pos.x, pos.y, BLOCK_WIDTH, BLOCK_WIDTH, {
    isStatic: true,
    friction: 0.02,
    collisionFilter: {
      mask: defaultCategory
    },
    chamfer: {
      radius: [10, 20, 30, 40, 50, 60]
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
    friction: 0.02,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    render: {
      fillStyle: "grey"
    }
  });
  const top = Bodies.rectangle(0 + w / 2, wallThickness / 2, w, wallThickness, {
    isStatic: true,
    friction: 0.02,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    render: {
      fillStyle: "grey"
    }
  });
  const left = Bodies.rectangle(0 + wallThickness / 2, h / 2, wallThickness, h, {
    isStatic: true,
    friction: 0.02,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    render: {
      fillStyle: "grey"
    }
  });
  const right = Bodies.rectangle(w - wallThickness / 2, h / 2, wallThickness, h, {
    isStatic: true,
    friction: 0.02,
    frictionStatic: 0,
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
  getTouchPoints,
  getAngleBtwVectores,
  createTrack
}