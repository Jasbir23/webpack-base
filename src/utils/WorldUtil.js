import Matter from "matter-js";

import {
    FORCE_CONST,
    CAR_WIDTH,
    CAR_HEIGHT,
    ANGLE_CHANGE_CONST
} from './constants'

import {
    addWalls,
    addCar,
    addBlock,
    addGrass
} from './utils'

const {
    innerHeight: h,
    innerWidth: w
} = window;

const Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    Body = Matter.Body;

export default class WorldUtil {
    constructor(props) {
        this.engine = Engine.create();
        this.engine.world.gravity = {
            x: 0,
            y: 0
        };
        const render = Render.create({
            element: document.body,
            engine: this.engine,
            options: {
                width: w,
                height: h,
                wireframes: false
            }
        });
        this.left = false;
        this.right = false;
        this.accelerate = false;
        this.deaccelerate = false;
        this.addControls();

        this.car = addCar({
            x: 0.1 * w,
            y: 0.8 * h
        }, this.engine, World, Bodies);

        addBlock({
            x: 0.3 * w,
            y: 0.4 * h
        }, this.engine, World, Bodies);

        addBlock({
            x: 0.7 * w,
            y: 0.4 * h
        }, this.engine, World, Bodies);

        this.grass = addGrass({
            x: 0.5 * w,
            y: 0.4 * h
        }, this.engine, World, Bodies)

        addWalls(this.engine, World, Bodies);
        Events.on(this.engine, "collisionActive", this.collisionActive)
        Events.on(this.engine, 'collisionEnd', this.collisionEnd)
        Render.run(render)
    }

    startGame() {
        this.animationFrame = window.requestAnimationFrame(this.gameLoop);
    }
    gameLoop = () => {
        if (this.accelerate) {
            Body.applyForce(
                this.car, {
                    x: this.car.position.x,
                    y: this.car.position.y
                }, {
                    x: FORCE_CONST * Math.sin(this.car.angle),
                    y: -FORCE_CONST * Math.cos(this.car.angle)
                }
            );
        }
        if (this.deaccelerate) {
            Body.applyForce(
                this.car, {
                    x: this.car.position.x,
                    y: this.car.position.y
                }, {
                    x: -FORCE_CONST * Math.sin(this.car.angle),
                    y: FORCE_CONST * Math.cos(this.car.angle)
                }
            );
        }
        if (this.left) {
            Body.setAngle(this.car, this.car.angle - ANGLE_CHANGE_CONST)
        }
        if (this.right) {
            Body.setAngle(this.car, this.car.angle + ANGLE_CHANGE_CONST)
        }

        Engine.update(this.engine);
        window.requestAnimationFrame(this.gameLoop);
    }
    addControls = () => {
        document.onkeydown = key => this.setMovement(key, true);
        document.onkeyup = key => this.setMovement(key, false);
    };

    setMovement = (key, isDown) => {
        switch (key.key) {
            case "a":
                this.left = isDown;
                break;
            case "A":
                this.left = isDown;
                break;
            case "D":
                this.right = isDown;
                break;
            case "d":
                this.right = isDown;
                break;
            case " ":
                this.accelerate = isDown;
                break;
            case "Shift":
                this.deaccelerate = isDown;
                break;
        }
    };
    collisionActive = (e) => {
        var i, pair,
            length = e.pairs.length;
        for (i = 0; i < length; i++) {
            pair = e.pairs[i];
            if (pair.bodyA.label === 'car' && pair.bodyB.label === 'grass') {
                Body.set(this.car, {
                    frictionAir: 0.1
                })
            }
        }
    }
    collisionEnd = (e) => {
        Body.set(this.car, {
            frictionAir: 0
        })
    }
}