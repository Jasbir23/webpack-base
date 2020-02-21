import Matter from "matter-js";

import {
    MAX_POWER,
    CAR_WIDTH,
    CAR_HEIGHT,
    REVERSE_FAC,
    POWER_FAC,
    BRAKE_CONST,
    MAX_REVERSE,
    ANGULAR_VELOCITY_FACTOR
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

        this.carView = document.querySelector(".car")
        this.carView.style.height = CAR_HEIGHT;
        this.carView.style.width = CAR_WIDTH;

        this.left = false;
        this.brake = false;
        this.right = false;
        this.accelerate = false;
        this.deaccelerate = false;
        this.addControls();

        this.car = addCar({
            x: 0.1 * w,
            y: 0.8 * h
        }, this.engine, World, Bodies);
        this.car.power = 0;
        this.car.reverse = 0;

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
        this.carView.style.left = this.car.position.x - CAR_WIDTH / 2;
        this.carView.style.top = this.car.position.y - CAR_HEIGHT / 2;
        this.carView.style.transform = `rotate(${this.car.angle}rad)`;

        const direction = (this.accelerate || this.deaccelerate) ? this.accelerate ? 1 : -1 : 0

        if (this.accelerate) this.car.power += POWER_FAC;
        else this.car.power -= POWER_FAC;

        if (this.deaccelerate) this.car.reverse += REVERSE_FAC;
        else this.car.reverse -= REVERSE_FAC;
        this.car.power = Math.max(0, Math.min(MAX_POWER, this.car.power));
        this.car.reverse = Math.max(0, Math.min(MAX_REVERSE, this.car.reverse));
        if (this.accelerate)
            Body.applyForce(
                this.car, {
                    x: this.car.position.x,
                    y: this.car.position.y
                }, {
                    x: this.car.power * Math.sin(this.car.angle),
                    y: -this.car.power * Math.cos(this.car.angle)
                }
            )
        if (this.deaccelerate)
            Body.applyForce(
                this.car, {
                    x: this.car.position.x,
                    y: this.car.position.y
                }, {
                    x: -this.car.reverse * Math.sin(this.car.angle),
                    y: this.car.reverse * Math.cos(this.car.angle)
                }
            )

        // if (this.brake) {
        //     Body.applyForce(
        //         this.car, {
        //             x: this.car.position.x + CAR_HEIGHT * Math.sin(this.car.angle) / 2,
        //             y: this.car.position.y + CAR_HEIGHT * Math.cos(this.car.angle) / 2,
        //         }, {
        //             x: -direction * BRAKE_CONST * Math.sin(this.car.angle),
        //             y: direction * BRAKE_CONST * Math.cos(this.car.angle)
        //         }
        //     );
        // }
        if (this.left) {
            Body.setAngularVelocity(this.car, this.car.speed < 1 ? 0 : -ANGULAR_VELOCITY_FACTOR)
        }
        if (this.right) {
            Body.setAngularVelocity(this.car, this.car.speed < 1 ? 0 : ANGULAR_VELOCITY_FACTOR)
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
            case "CapsLock":
                this.brake = isDown;
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
                    frictionAir: 0.2
                })
            }
        }
    }
    collisionEnd = (e) => {
        Body.set(this.car, {
            frictionAir: 0.04
        })
    }
}