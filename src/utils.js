const {
    innerHeight: h,
    innerWidth: w
} = window


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

export {
    addWalls
}