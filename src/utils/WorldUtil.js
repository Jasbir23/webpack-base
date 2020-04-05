const THREE = require("three");
const CANNON = require("cannon");
import {
    GLTFLoader
} from "three/examples/jsm/loaders/GLTFLoader";

import {
    OrbitControls
} from "three/examples/jsm/controls/OrbitControls";
import track from '../assets/track/track.gltf';
import ferrari from '../assets/ferrari/scene.gltf';
import wheelModel from '../assets/morello_cerchi_-_rims_-_murgese_iii 2/scene.gltf';
const raceContainer = document.querySelector(".raceContainer");

import CannonHelper from './CannonHelper'
import JoyStick from './Joystick'
var car = null;
var wheel = null;
var wheelArray = [];
const {
    innerHeight: h,
    innerWidth: w
} = window;

const loader = new GLTFLoader();
// var audioLoader = new THREE.AudioLoader();
// var listener = new THREE.AudioListener();
// var sound = new THREE.Audio(listener);
// var engineVolume = 0;
export default class WorldUtil {
    constructor(props) {
        this.fixedTimeStep = 1.0 / 60.0;
        this.js = {
            forward: 0,
            turn: 0
        };
        this.clock = new THREE.Clock();
        this.useVisuals = true;
        this.initThreeJS();
        this.getCar(this.scene);
        // this.getWheel(this.scene);
    }
    getTrack(scene) {
        loader.load(track,
            gltf => {
                this.model = gltf.scene;
                this.model.scale.x = 1
                this.model.scale.y = 1
                this.model.scale.z = 1
                scene.add(this.model)
                gltf.scene.children.forEach(child => {
                    if (child.name.includes('Cube')) {
                        const halfExtents = new CANNON.Vec3(child.scale.x, child.scale.y, child.scale.z);
                        const box = new CANNON.Box(halfExtents);
                        const body = new CANNON.Body({
                            mass: 0
                        });
                        body.addShape(box);
                        body.position.copy({
                            x: child.position.x + this.model.position.x,
                            y: child.position.y + this.model.position.y + 0.1,
                            z: child.position.z + this.model.position.z
                        });
                        body.quaternion.copy(child.quaternion);
                        this.world.add(body);
                    }
                })
            },
            xhr => {
                // called while loading is progressing
                console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
            },
            error => {
                // called when loading has errors
                console.error("An error happened", error);
            }
        )
    }
    getCar(scene) {
        loader.load(
            ferrari,
            gltf => {
                car = gltf.scene;
                car.scale.x = 0.5;
                car.scale.y = 0.5;
                car.scale.z = 0.5;
                car.position.x = 0;
                car.position.y = 0;
                car.position.z = 0;
                const mesh = new THREE.Mesh()
                mesh.add(car);
                this.scene.add(mesh)
                this.initPhysics();
                this.getTrack(scene);
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
    getWheel(scene) {
        loader.load(
            wheelModel,
            gltf => {
                wheel = gltf.scene;
                wheel.scale.x = 0.1;
                wheel.scale.y = 0.1;
                wheel.scale.z = 0.1;
                wheel.position.x = 0;
                wheel.position.y = 1;
                wheel.position.z = 0;
                let t = 4;
                while (t--) {
                    wheelArray.push(wheel);
                    this.scene.add(new THREE.Mesh().add(wheel))
                }
                // const wheelMesh = new THREE.Mesh();
                // wheelMesh.add(wheel);
                // this.scene.add(wheelMesh)
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
    initThreeJS() {
        const game = this;
        this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.set(30, 15, 0);
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xa0a0a0);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(w, h);
        this.renderer.shadowMap.enabled = true;
        raceContainer.appendChild(this.renderer.domElement);

        // this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
        // this.hemiLight.position.set( 0, 300, 0 );
        // this.scene.add( this.hemiLight );

        this.helper = new CannonHelper(this.scene);
        this.helper.addLights(this.renderer);
        this.orbitalControls = new OrbitControls(this.camera, raceContainer);
        window.addEventListener('resize', function () {
            game && game.onWindowResize();
        }, false);

        // this.camera.add(listener);
        // this.startSoundStopped = false;
        // create a global audio source
        // audioLoader.load('https://res.cloudinary.com/princeofpersia/video/upload/v1586107257/Sports-Car-Driving-Loud-_AudioTrimmer.com_thvtqg.ogg', function (buffer) {
        //     sound.setBuffer(buffer);
        //     sound.setLoop(true);
        //     sound.setVolume(0);
        //     sound.play();
        // });
        this.joystick = new JoyStick({
            game: this,
            onMove: this.joystickCallback
        });
    }

    joystickCallback(forward, turn) {
        this.js.forward = -forward;
        this.js.turn = -turn;
    }

    initPhysics() {
        this.physics = {};

        const game = this;
        const world = new CANNON.World();
        this.world = world;
        world.broadphase = new CANNON.SAPBroadphase(world);
        world.gravity.set(0, -10, 0);
        world.defaultContactMaterial.friction = 0;

        const groundMaterial = new CANNON.Material("groundMaterial");
        const wheelMaterial = new CANNON.Material("wheelMaterial");
        const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
            friction: 0.3,
            restitution: 0,
            contactEquationStiffness: 1000
        });

        // We must add the contact materials to the world
        world.addContactMaterial(wheelGroundContactMaterial);

        const chassisShape = new CANNON.Box(new CANNON.Vec3(1.24, 0.232, 0.5));
        const chassisBody = new CANNON.Body({
            mass: 250,
            material: groundMaterial
        });
        chassisBody.addShape(chassisShape);
        chassisBody.position.x = car.position.x;
        chassisBody.position.y = car.position.y;
        chassisBody.position.z = car.position.z
        chassisBody.name = "car"
        chassisBody.threemesh = car;
        world.add(chassisBody);
        // this.helper.addVisual(chassisBody, "car")

        this.followCam = new THREE.Object3D();
        this.followCam.position.copy(this.camera.position);
        this.scene.add(this.followCam);
        this.followCam.parent = chassisBody.threemesh;
        this.helper.shadowTarget = chassisBody.threemesh;

        const options = {
            radius: 0.18,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 30,
            suspensionRestLength: 0.5,
            frictionSlip: 5,
            dampingRelaxation: 10,
            dampingCompression: 4.4,
            maxSuspensionForce: 10000000,
            rollInfluence: 0.01,
            axleLocal: new CANNON.Vec3(0, 0, -1),
            chassisConnectionPointLocal: new CANNON.Vec3(0, 1, 1),
            maxSuspensionTravel: 0.2,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
        };

        // Create the vehicle
        const vehicle = new CANNON.RaycastVehicle({
            chassisBody: chassisBody,
            indexRightAxis: 2,
            indexUpAxis: 1,
            indeForwardAxis: 0
        });

        options.chassisConnectionPointLocal.set(-0.74, 0.21, 0.51);
        vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(-0.74, 0.21, -0.51);
        vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(0.74, 0.22, 0.51);
        vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(0.74, 0.22, -0.51);
        vehicle.addWheel(options);

        vehicle.addToWorld(world);

        const wheelBodies = [];
        vehicle.wheelInfos.forEach(function (wheelChild, index) {
            const cylinderShape = new CANNON.Cylinder(wheelChild.radius, wheelChild.radius, wheelChild.radius / 2, 20);
            const wheelBody = new CANNON.Body({
                mass: 50,
                material: wheelMaterial,
            });
            wheelBody.addShape(cylinderShape);
            wheelBodies.push(wheelBody);
            game.helper.addVisual(wheelBody, 'wheel');
        });

        // Update wheels
        world.addEventListener('postStep', function () {
            let index = 0;
            game.vehicle.wheelInfos.forEach(function (wheel) {
                game.vehicle.updateWheelTransform(index);
                const t = wheel.worldTransform;
                wheelBodies[index].threemesh.position.copy(t.position);
                wheelBodies[index].threemesh.quaternion.copy(t.quaternion);
                index++;
            });
        });

        this.vehicle = vehicle;
    }

    updateDrive(forward = this.js.forward, turn = this.js.turn) {
        // engineVolume -= 0.01;
        // sound.setVolume(engineVolume);
        const maxSteerVal = 0.34;
        const maxForce = 700;
        const brakeForce = 10;

        const force = maxForce * forward;
        const steer = maxSteerVal * turn;
        if (forward != 0) {
            // engineVolume += forward * 0.005;
            // if (engineVolume > 0.1) engineVolume = 0.1
            // sound.setVolume(engineVolume);
            this.vehicle.setBrake(0, 0);
            this.vehicle.setBrake(0, 1);
            this.vehicle.setBrake(0, 2);
            this.vehicle.setBrake(0, 3);
            // if (!this.startSoundStopped) {
            //     sound.stop();
            //     this.startSoundStopped = true;
            //     audioLoader.load('https://res.cloudinary.com/princeofpersia/video/upload/v1586104391/moving-_AudioTrimmer.com_yehuyl.ogg', function (buffer) {
            //         sound.setBuffer(buffer);
            //         sound.setLoop(true);
            //         if (engineVolume > 0.2) engineVolume = 0.2
            //         sound.setVolume(engineVolume);
            //         sound.play();
            //     });
            // };

            this.vehicle.applyEngineForce(force, 0);
            this.vehicle.applyEngineForce(force, 3);
        } else {
            this.vehicle.setBrake(brakeForce, 0);
            this.vehicle.setBrake(brakeForce, 1);
            this.vehicle.setBrake(brakeForce, 2);
            this.vehicle.setBrake(brakeForce, 3);
        }

        this.vehicle.setSteeringValue(steer, 0);
        this.vehicle.setSteeringValue(steer, 1);
    }

    startGame() {
        this.animationFrame = window.requestAnimationFrame(this.gameLoop);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

    }
    updateCamera() {
        this.camera.position.lerp(this.followCam.getWorldPosition(new THREE.Vector3()), 0.05);
        this.camera.lookAt(this.vehicle.chassisBody.threemesh.position);
        if (this.dirLight != undefined) {
            this.dirLight.position.copy(this.camera.position);
            this.dirLight.position.y += 10;
        }
    }
    gameLoop = () => {
        this.renderer.render(this.scene, this.camera);
        // this.orbitalControls.update();
        const now = Date.now();
        if (this.lastTime === undefined) this.lastTime = now;
        const dt = (Date.now() - this.lastTime) / 1000.0;
        this.FPSFactor = dt;
        this.lastTime = now;

        if (this.world) {
            this.world.step(this.fixedTimeStep, dt);
            this.updateDrive();
            this.updateCamera();
            this.world.bodies.forEach(function (body) {
                if (body.threemesh) {
                    body.threemesh.position.x = body.position.x
                    body.threemesh.position.y = body.position.y - 0.4
                    body.threemesh.position.z = body.position.z
                    body.threemesh.quaternion.copy(body.quaternion);
                }
            });
        }
        window.requestAnimationFrame(this.gameLoop);
    };
}