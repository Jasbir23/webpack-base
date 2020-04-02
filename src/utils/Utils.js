const {
    innerHeight: h,
    innerWidth: w
} = window
const THREE = require('three');

import {
    Vector3
} from "three";

function getAngleBtwVectores(a, b) {
    const aMod = Math.sqrt(a.x * a.x + a.y * a.y);
    const bMod = Math.sqrt(b.x * b.x + b.y * b.y);
    return (a.x * b.x + a.y * b.y) / (aMod * bMod);
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
    getTouchPoints,
    getAngleBtwVectores,
    addGround,
}