const {
  innerHeight: h,
  innerWidth: w
} = window
const THREE = require('three');

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
    density: 0.02,
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
  const rectangle = Bodies.rectangle(w * 0.2, h * 0.572, w * 0.124, h * 0.574, {
    isStatic: true,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    chamfer: {
      radius: [44, 44, 0, 10]
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  const rectangle2 = Bodies.rectangle(w * 0.386, h * 0.14, w * 0.14, h * 0.28, {
    isStatic: true,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    chamfer: {
      radius: [0, 0, 50, 50]
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  const rectangle3 = Bodies.rectangle(w * 0.4, h * 0.688, w * 0.3, h * 0.316, {
    isStatic: true,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    chamfer: {
      radius: [20, 20, 0, 0]
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  const rectangle4 = Bodies.rectangle(w * 0.776, h * 0.14, w * 0.07, h * 0.36, {
    isStatic: true,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    chamfer: {
      radius: [0, 0, 0, 0]
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  const rectangle5 = Bodies.rectangle(w * 0.746, h * 0.436, w * 0.07, h * 0.33, {
    isStatic: true,
    angle: Math.PI / 8,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    chamfer: {
      radius: [0, 6, 30, 30]
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  const rectangle6 = Bodies.rectangle(w * 0.55, h * 0.4, w * 0.09, h * 0.4, {
    isStatic: true,
    angle: Math.PI * 1.144,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    chamfer: {
      radius: [0, 0, 30, 30]
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  const rectangle7 = Bodies.rectangle(w * 0.68, h * 0.81, w * 0.35, h * 0.07, {
    isStatic: true,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    chamfer: {
      radius: [0, 0, 40, 0]
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  const rectangle8 = Bodies.rectangle(w * 0.864, h * 0.68, w * 0.038, h * 0.3, {
    isStatic: true,
    angle: Math.PI * 1.12,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    chamfer: {
      radius: [20, 20, 10, 0]
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  const trapezoid = Bodies.trapezoid(w * 0.29, h * 0.6, w * 0.14, h * 0.3, 1.8, {
    isStatic: true,
    frictionStatic: 0,
    collisionFilter: {
      mask: defaultCategory
    },
    render: {
      fillStyle: '#FFA700'
    }
  })
  const trapezoid2 = Bodies.trapezoid(w * 0.89, h * 0.5, w * 0.2, h * 0.1, 3, {
    isStatic: true,
    frictionStatic: 0,
    angle: Math.PI * 1.48,
    collisionFilter: {
      mask: defaultCategory
    },
    render: {
      fillStyle: '#FFA700'
    }
  })


  World.add(engine.world, [rectangle, rectangle2, rectangle3, rectangle4, rectangle5, rectangle6, rectangle7, rectangle8, trapezoid, trapezoid2]);
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
  const wallThickness = 5
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
  addBlock,
  addGrass,
  getTouchPoints,
  getAngleBtwVectores,
  createTrack,
  addGround,
}