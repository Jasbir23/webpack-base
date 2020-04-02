const THREE = require("three");
const CANNON = require("cannon");
import {
    GLTFLoader
} from "three/examples/jsm/loaders/GLTFLoader";
import {
    OrbitControls
} from "three/examples/jsm/controls/OrbitControls";

const raceContainer = document.querySelector(".raceContainer");


import CannonHelper from './CannonHelper'
import JoyStick from './Joystick'
import {
    addGround
} from "./Utils";

const {
    innerHeight: h,
    innerWidth: w
} = window;

const loader = new GLTFLoader();
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
        this.initPhysics();
    }
    initThreeJS() {

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        this.camera.position.set(10, 10, 10);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xa0a0a0);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(w, h);
        this.renderer.shadowMap.enabled = true;
        raceContainer.appendChild(this.renderer.domElement);

        this.helper = new CannonHelper(this.scene);
        this.helper.addLights(this.renderer);
        this.orbitalControls = new OrbitControls(this.camera, raceContainer);
        window.addEventListener('resize', function () {
            this.onWindowResize();
        }, false);


        this.joystick = new JoyStick({
            game: this,
            onMove: this.joystickCallback
        });
    }

    joystickCallback(forward, turn) {
        this.js.forward = forward;
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

        const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
        const chassisBody = new CANNON.Body({
            mass: 150,
            material: groundMaterial
        });
        chassisBody.addShape(chassisShape);
        chassisBody.position.set(0, 4, 0);
        this.helper.addVisual(chassisBody, 'car');

        this.followCam = new THREE.Object3D();
        this.followCam.position.copy(this.camera.position);
        this.scene.add(this.followCam);
        this.followCam.parent = chassisBody.threemesh;
        this.helper.shadowTarget = chassisBody.threemesh;

        const options = {
            radius: 0.5,
            directionLocal: new CANNON.Vec3(0, -1, 0),
            suspensionStiffness: 30,
            suspensionRestLength: 0.3,
            frictionSlip: 5,
            dampingRelaxation: 2.3,
            dampingCompression: 4.4,
            maxSuspensionForce: 100000,
            rollInfluence: 0.01,
            axleLocal: new CANNON.Vec3(-1, 0, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
            maxSuspensionTravel: 0.3,
            customSlidingRotationalSpeed: -30,
            useCustomSlidingRotationalSpeed: true
        };

        // Create the vehicle
        const vehicle = new CANNON.RaycastVehicle({
            chassisBody: chassisBody,
            indexRightAxis: 0,
            indexUpAxis: 1,
            indeForwardAxis: 2
        });

        options.chassisConnectionPointLocal.set(1, 0, -1);
        vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(-1, 0, -1);
        vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(1, 0, 1);
        vehicle.addWheel(options);

        options.chassisConnectionPointLocal.set(-1, 0, 1);
        vehicle.addWheel(options);

        vehicle.addToWorld(world);

        const wheelBodies = [];
        vehicle.wheelInfos.forEach(function (wheel) {
            const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
            const wheelBody = new CANNON.Body({
                mass: 1,
                material: wheelMaterial
            });
            const q = new CANNON.Quaternion();
            q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
            wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
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

        let matrix = [];
        let sizeX = 64,
            sizeY = 64;

        for (let i = 0; i < sizeX; i++) {
            matrix.push([]);
            for (var j = 0; j < sizeY; j++) {
                var height = Math.cos(i / sizeX * Math.PI * 5) * Math.cos(j / sizeY * Math.PI * 5) * 2 + 2;
                if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeY - 1)
                    height = 3;
                matrix[i].push(height);
            }
        }

        var hfShape = new CANNON.Heightfield(matrix, {
            elementSize: 100 / sizeX
        });
        var hfBody = new CANNON.Body({
            mass: 0
        });
        hfBody.addShape(hfShape);
        hfBody.position.set(-sizeX * hfShape.elementSize / 2, -4, sizeY * hfShape.elementSize / 2);
        hfBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        world.add(hfBody);
        this.helper.addVisual(hfBody, 'landscape');

    }
    updateDrive(forward = this.js.forward, turn = this.js.turn) {

        const maxSteerVal = 0.5;
        const maxForce = 1000;
        const brakeForce = 10;

        const force = maxForce * forward;
        const steer = maxSteerVal * turn;

        if (forward != 0) {
            this.vehicle.setBrake(0, 0);
            this.vehicle.setBrake(0, 1);
            this.vehicle.setBrake(0, 2);
            this.vehicle.setBrake(0, 3);

            this.vehicle.applyEngineForce(force, 2);
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
        if (this.helper.sun != undefined) {
            this.helper.sun.position.copy(this.camera.position);
            this.helper.sun.position.y += 10;
        }
    }
    gameLoop = () => {
        this.renderer.render(this.scene, this.camera);
        this.orbitalControls.update();

        const now = Date.now();
        if (this.lastTime === undefined) this.lastTime = now;
        const dt = (Date.now() - this.lastTime) / 1000.0;
        this.FPSFactor = dt;
        this.lastTime = now;

        this.world.step(this.fixedTimeStep, dt);
        this.helper.updateBodies(this.world);

        this.updateDrive();
        this.updateCamera();

        this.renderer.render(this.scene, this.camera);

        if (this.stats != undefined) this.stats.update();
        if (this.useVisuals) {
            this.helper.updateBodies(this.world);
        }
        window.requestAnimationFrame(this.gameLoop);
    };
}