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
    Scene,
    PerspectiveCamera,
    BoxGeometry,
    MeshPhongMaterial,
    Mesh,
    WebGLRenderer,
    DirectionalLight,
} from "three";

// import { GLTFLoader } from "three/examples/js/loaders/";

import carModel from '../assets/car/strts.gltf'

import {
    addWalls,
    addCar,
    addBlock,
    addGrass,
    createTrack,
    getAngleBtwVectores
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

// const loader = new GLTFLoader();

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
        this.car.isTurning = false;
        createTrack(w, h, this.engine, World, Bodies)

        addWalls(this.engine, World, Bodies);
        Events.on(this.engine, "collisionActive", this.collisionActive)
        Events.on(this.engine, 'collisionEnd', this.collisionEnd)
        Render.run(render);
        const scene = new Scene();
        const camera = new PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
        );
        this.carMeshes = [];
        // this.getCarModel();

        const raceContainer = document.querySelector(".raceContainer");
        const renderer = new WebGLRenderer();
        renderer.setSize(w, h);
        raceContainer.appendChild(renderer.domElement);
        // renderer.render(scene, camera);
    }

    startGame() {
        this.animationFrame = window.requestAnimationFrame(this.gameLoop);
    }

    gameLoop = () => {
        this.carView.style.left = this.car.position.x - CAR_WIDTH / 2;
        this.carView.style.top = this.car.position.y - CAR_HEIGHT / 2;
        this.carView.style.transform = `rotate(${this.car.angle}rad)`;

        this.updateCar();

        Engine.update(this.engine);
        window.requestAnimationFrame(this.gameLoop);
    }

    addCarModels(carModel) {
        this.carMeshes.forEach(carMesh => carMesh.add(carModel.clone()));
      }
    drawCarMesh(x, y, edge) {
        const car = new Mesh();
        car.position.set(x, -y, 0);
        carMeshes.push(car);
        scene.add(car);
    }

    getCarModel() {
        loader.load(
            carModel,
            ( gltf ) => {
                // called when the resource is loaded
                scene.add( gltf.scene );
            },
            ( xhr ) => {
                // called while loading is progressing
                console.log( `${( xhr.loaded / xhr.total * 100 )}% loaded` );
            },
            ( error ) => {
                // called when loading has errors
                console.error( 'An error happened', error );
            },
        );
    }
    updateCar() {
        this.car.isTurning = this.left || this.right;
        this.angleBtwFNV = getAngleBtwVectores({
            x: this.car.power * Math.sin(this.car.angle),
            y: -this.car.power * Math.cos(this.car.angle)
        }, this.car.velocity);

        let direction = (this.accelerate || this.deaccelerate) ? this.accelerate ? 1 : -1 : 0
        direction = this.angleBtwFNV ? this.angleBtwFNV * direction : direction

        if (this.accelerate) {
            this.car.power += POWER_FAC;
        } else {
            this.car.power -= POWER_FAC;
        }

        if (this.deaccelerate) {
            this.car.reverse += REVERSE_FAC;
        } else this.car.reverse -= REVERSE_FAC;

        this.car.power = Math.max(0, Math.min(MAX_POWER, this.car.power));
        this.car.reverse = Math.max(0, Math.min(MAX_REVERSE, this.car.reverse));

        if (this.left) {
            this.car.angularVelocity -= direction * ANGULAR_VELOCITY_FACTOR;
            !this.isCollisionActive && Body.setAngularVelocity(this.car, this.car.angularVelocity);
        }
        if (this.right) {
            this.car.angularVelocity += direction * ANGULAR_VELOCITY_FACTOR;
            !this.isCollisionActive && Body.setAngularVelocity(this.car, this.car.angularVelocity);
        }

        if (this.car.isTurning) {
            this.car.power = Math.min(this.car.power, 0.62 * MAX_POWER)
            this.car.reverse = Math.min(this.car.reverse, 0.62 * MAX_REVERSE)
        }
        if (this.accelerate) {
            Body.applyForce(
                this.car, {
                    x: this.car.position.x - (CAR_HEIGHT * Math.sin(this.car.angle)) / 2,
                    y: this.car.position.y + (CAR_HEIGHT * Math.cos(this.car.angle)) / 2
                }, {
                    x: this.car.power * Math.sin(this.car.angle),
                    y: -this.car.power * Math.cos(this.car.angle)
                }
            )

        }
        if (this.deaccelerate) {
            Body.applyForce(
                this.car, {
                    x: this.car.position.x - (CAR_HEIGHT * Math.sin(this.car.angle)) / 2,
                    y: this.car.position.y + (CAR_HEIGHT * Math.cos(this.car.angle)) / 2
                }, {
                    x: -this.car.reverse * Math.sin(this.car.angle),
                    y: this.car.reverse * Math.cos(this.car.angle)
                }
            )
        }
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
            case "w":
                this.accelerate = isDown;
                break;
            case "W":
                this.accelerate = isDown;
                break;
            case "s":
                this.deaccelerate = isDown;
                break;
            case "S":
                this.deaccelerate = isDown;
                break;
        }
    };
    collisionActive = (e) => {
        this.isCollisionActive = true
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
        this.isCollisionActive = false
        Body.set(this.car, {
            frictionAir: 0.03
        })
    }
}