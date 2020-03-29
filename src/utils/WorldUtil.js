import Matter from "matter-js";

import {
    MAX_POWER,
    CAR_WIDTH,
    CAR_HEIGHT,
    REVERSE_FAC,
    POWER_FAC,
    BRAKE_CONST,
    MAX_REVERSE,
    HEART_VEC,
    ANGLE_FACTOR,
    THREE_D_X_SHIFT,
    THREE_D_Y_SHIFT
} from "./constants";

import {
    Scene,
    PerspectiveCamera,
    BoxGeometry,
    MeshBasicMaterial,
    MeshPhongMaterial,
    Mesh,
    WebGLRenderer,
    DirectionalLight,
    AmbientLight,
    CubeCamera,
    Vector3
} from "three";

import {
    GLTFLoader
} from "three/examples/jsm/loaders/GLTFLoader";
import {
    OrbitControls
} from "three/examples/jsm/controls/OrbitControls";

import {
    LightProbeGenerator
} from 'three/examples/jsm/lights/LightProbeGenerator';
import {
    LightProbeHelper
} from "three/examples/jsm/helpers/LightProbeHelper"

import carModel from "../assets/car/SportsCar.gltf";

const raceContainer = document.querySelector(".raceContainer");

import {
    addWalls,
    addCar,
    getAngleBtwVectores,
    addGround,
    createTrack,
} from "./utils";

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

const loader = new GLTFLoader();
const THREE = require("three");
var camera, scene, renderer, cubeCamera, lightProbe;
var temp = new THREE.Vector3;
var geometry, material, mesh;
export default class WorldUtil {
    constructor(props) {

        this.initMatterWorld()
        this.initCar()
        this.addControls();
        this.initThreeJsWorld();
    }

    initMatterWorld() {
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
        Events.on(this.engine, "collisionActive", this.collisionActive);
        Events.on(this.engine, "collisionEnd", this.collisionEnd);
        Render.run(render);
    }

    initCar() {
        this.car = addCar({
                x: 0.14 * w,
                y: 0.86 * h
            },
            this.engine
        );
        this.car.power = 0;
        this.car.reverse = 0;
        this.car.isTurning = false;
        this.carView = document.querySelector(".car");
        this.carView.style.height = CAR_HEIGHT;
        this.carView.style.width = CAR_WIDTH;

        this.left = false;
        this.right = false;
        this.accelerate = false;
        this.deaccelerate = false;
    }

    initThreeJsWorld() {
        //creating scene
        scene = new Scene();
        scene.background = new THREE.Color(0xfffff0);
        scene.castShadow = true;

        //renderer
        renderer = new WebGLRenderer({
            alpha: true
        });
        renderer.setClearColor(0xffffff, 0);
        renderer.setSize(w, h);

        //camera
        camera = new PerspectiveCamera(70, w / h, 0.01, 1000);
        this.getCarModel(scene);

        const light = new AmbientLight(0xffffff, 1);
        light.castShadow = true;
        light.position.set(-h / 2, -h / 2, 600);
        scene.add(light);

        addGround(scene);
        createTrack(this.engine, scene);
        addWalls(this.engine, scene);
        var axesHelper = new THREE.AxesHelper(500);
        scene.add(axesHelper);
        // this.orbitalControls = new OrbitControls(camera, raceContainer);
        raceContainer.appendChild(renderer.domElement);
    }

    startGame() {
        this.animationFrame = window.requestAnimationFrame(this.gameLoop);
    }

    gameLoop = () => {
        this.carView.style.left = this.car.position.x - CAR_WIDTH / 2;
        this.carView.style.top = this.car.position.y - CAR_HEIGHT / 2;
        this.carView.style.transform = `rotate(${this.car.angle}rad)`;

        if (this.model && this.model.position) {
            this.model.position.x = this.car.position.x + THREE_D_X_SHIFT;
            this.model.position.y = -this.car.position.y + THREE_D_Y_SHIFT;
            this.model.position.z = 0;
            this.model.rotation.z = -this.car.angle + (3 * Math.PI) / 2;
        }

        renderer.render(scene, camera);

        this.updateCar();
        // camera.updateProjectionMatrix();
        Engine.update(this.engine);
        // this.orbitalControls.update();

        window.requestAnimationFrame(this.gameLoop);
    };

    getCarModel(scene) {
        loader.load(
            carModel,
            gltf => {
                // called when the resource is loaded

                camera.position.set(-20, 0, 250);
                this.model = gltf.scene;
                this.model.scale.x = 0.1;
                this.model.scale.y = 0.1;
                this.model.scale.z = 0.1;
                this.model.position.x = this.car.position.x - w / 2;
                this.model.position.y = -this.car.position.y - h / 2;
                this.model.position.z = 0;
                this.model.rotation.z = -this.car.angle + Math.PI / 2;
                const carMesh = new THREE.Mesh();
                carMesh.add(this.model);
                carMesh.add(camera)
                scene.add(carMesh);
            },
            xhr => {
                // called while loading is progressing
                console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
            },
            error => {
                // called when loading has errors
                console.error("An error happened", error);
            }
        );
    }

    updateCar() {
        this.car.isTurning = this.left || this.right;

        const direction = this.car.power - this.car.reverse > 0 ? 1 : -1
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
        this.shouldRotate =
            this.car.power > 0.00006 || this.car.reverse > 0.00004 ? true : false;
        if (this.left && this.shouldRotate) {
            this.car.angle -= direction * ANGLE_FACTOR;
            Body.set(this.car, {
                angle: this.car.angle
            });
        }
        if (this.right && this.shouldRotate) {
            this.car.angle += direction * ANGLE_FACTOR;
            Body.set(this.car, {
                angle: this.car.angle
            });
        }

        if (this.car.isTurning) {
            this.car.power = Math.min(this.car.power, 0.8 * MAX_POWER);
            this.car.reverse = Math.min(this.car.reverse, 0.8 * MAX_REVERSE);
        }
        Body.applyForce(
            this.car, {
                x: this.car.position.x - (CAR_HEIGHT * Math.sin(this.car.angle)) / 2,
                y: this.car.position.y + (CAR_HEIGHT * Math.cos(this.car.angle)) / 2
            }, {
                x: (this.car.power - this.car.reverse) * Math.sin(this.car.angle),
                y: -(this.car.power - this.car.reverse) * Math.cos(this.car.angle)
            }
        );
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
            case " ":
                this.deaccelerate = isDown;
                break;
            case "s":
                this.deaccelerate = isDown;
                break;
            case "S":
                this.deaccelerate = isDown;
                break;
        }
    };
    collisionActive = e => {
        var i,
            pair,
            length = e.pairs.length;
        for (i = 0; i < length; i++) {
            pair = e.pairs[i];
            if (pair.bodyA.label === "car" && pair.bodyB.label === "grass") {
                Body.set(this.car, {
                    frictionAir: 0.1
                });
            }
        }
    };
    collisionEnd = e => {
        Body.set(this.car, {
            frictionAir: 0.03
        });
    };
}