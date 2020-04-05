
const THREE = require("three");
const CANNON = require("cannon");
const heightMap = [[22.52, 15.79, -4.38, -4.38, 22.52, 15.79, 15.79, -4.38, -4.38, -4.38, 3.05, -9.89, -9.89, -23.85]];

const groundMaterial = new CANNON.Material('groundMaterial');

export function generateTerrain() {
    const scaledHeightMap = heightMap.map(row => row.map(heightValue => (heightValue)*0.25));
    const mapRows = heightMap.length;
    const mapColumns = heightMap[0].length;
    const terrainShape = new CANNON.Heightfield(scaledHeightMap, {elementSize: 5});
    const terrain = new CANNON.Body({mass: 0, shape: terrainShape, material: groundMaterial});
    terrain.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    terrain.position.set(-mapRows * terrainShape.elementSize / 2, 0, mapColumns * terrainShape.elementSize / 2);
    return terrain;
}

export function createPlatform(size, position, rotation = {axis: 'x', angle: 0}) {
    const platformGeometry = new THREE.BoxGeometry(size.x * 2, size.y * 2, size.z * 2);
    const platformMesh = new THREE.Mesh(platformGeometry, new THREE.MeshLambertMaterial());

    const platformShape = new CANNON.Box(new CANNON.Vec3(size.x, size.y, size.z));
    const platformBody = new CANNON.Body({mass: 0, shape: platformShape, material: groundMaterial});
    const rotationAxis = new CANNON.Vec3();
    rotationAxis[rotation.axis] = 1;

    platformBody.position.set(position.x, position.y, position.z);
    platformMesh.position.copy(platformBody.position);

    platformBody.quaternion.setFromAxisAngle(rotationAxis, rotation.angle);
    platformMesh.quaternion.copy(platformBody.quaternion);

    return {
        mesh: platformMesh,
        body: platformBody,
        append(scene, world) {
            scene.add(platformMesh);
            world.addBody(platformBody);
        },
    };
}

const defaultOptions = {
    receiveShadow: false,
    castShadow: false,
    color: 0xB59058,
};

export function heightFieldToMesh(body, options = {}) {
    options = Object.assign({}, defaultOptions, options);
    const shape = body.shapes[0];
    const geometry = new THREE.Geometry();
    const material = new THREE.MeshLambertMaterial({color: options.color});
    const v0 = new CANNON.Vec3();
    const v1 = new CANNON.Vec3();
    const v2 = new CANNON.Vec3();

    for (let i = 0; i < shape.data.length - 1; i++) {
        for (let j = 0; j < shape.data[i].length - 1; j++) {
            for (let k = 0; k < 2; k++) {
                shape.getConvexTrianglePillar(i, j, k === 0);

                v0.copy(shape.pillarConvex.vertices[0]);
                v1.copy(shape.pillarConvex.vertices[1]);
                v2.copy(shape.pillarConvex.vertices[2]);
                v0.vadd(shape.pillarOffset, v0);
                v1.vadd(shape.pillarOffset, v1);
                v2.vadd(shape.pillarOffset, v2);

                geometry.vertices.push(
                  new THREE.Vector3(v0.x, v0.y, v0.z),
                  new THREE.Vector3(v1.x, v1.y, v1.z),
                  new THREE.Vector3(v2.x, v2.y, v2.z),
                );

                const n = geometry.vertices.length - 3;
                geometry.faces.push(new THREE.Face3(n, n + 1, n + 2));
            }
        }
    }

    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = options.receiveShadow;
    mesh.castShadow = options.castShadow;
    mesh.position.set(body.position.x, body.position.y, body.position.z);
    mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);

    const obj = new THREE.Object3D();
    obj.add(mesh);

    return obj;
}

export function meshToHeightField(mesh) {
    const geometry = findGeometry(mesh);
    // positions coordinates are stored in a THREE.Float32BufferAttribute (array buffer [c0.x,c0.y,c0.z,c1.x, ...])
    const vertices = mapPositionBufferToVertices(geometry.getAttribute('position'));
    // if the the plane width equals to its length
    const rowCount = Math.sqrt(vertices.length);
    const columnCount = rowCount;

    geometry.computeBoundingBox();

    const minX = geometry.boundingBox.min.x;
    const maxX = geometry.boundingBox.max.x;
    const minZ = geometry.boundingBox.min.z;
    const maxZ = geometry.boundingBox.max.z;
    const gridWidth = maxX - minX;
    const gridLength = maxZ - minZ;
    // the scale is bit off, so it needs some adjustment (+ 0.1585)
    const gridElementSize = gridWidth / columnCount + 0.1585;

    // create grid
    const grid = [];
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const row = [];

        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
            const vertexIndex = rowIndex * rowCount + columnIndex;
            const vertex = vertices[vertexIndex];
            vertex && row.push(vertex.y);
        }

        grid.push(row);
    }
    generateTerrain();

    // create heightField from grid
    const heightFieldShape = new CANNON.Heightfield(grid, {elementSize: gridElementSize});
    const heightField = new CANNON.Body({mass: 0, shape: heightFieldShape});

    const q1 = new THREE.Quaternion();
    q1.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI / 2);
    const q = new THREE.Quaternion();
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    q.multiply(q1);

    heightField.quaternion.copy(q);
    heightField.position.set(
        -gridWidth / 2,
        0,
        gridLength / 2 - gridLength,
    );

    return heightField;

    function findGeometry(mesh) {
        let geometry;

        mesh.traverse((child) => {
            if (!geometry && child.type === 'Mesh' && child.geometry) {
                geometry = child.geometry;
            }
        });

        return geometry;
    }

    function mapPositionBufferToVertices(positionBuffer) {
        const vertexArray = [];
        const vertexCount = positionBuffer.count;

        for (let i = 0; i < vertexCount; i++) {        
            vertexArray.push(new THREE.Vector3(
                positionBuffer.getX(i),
                positionBuffer.getY(i),
                positionBuffer.getZ(i),
            ));
        }
        // vertices in a mesh are not in order, sort them by x & z position
        vertexArray.sort((a, b) => {
            if (a.z === b.z) {
                return (a.x < b.x) ? -1 : (a.x > b.x) ? 1 : 0;
            } else {
                return (a.z < b.z) ? -1 : 1;
            }
        });
        // filter duplicated vertices
        return vertexArray.filter((vertex, index) => {
            const nextVertex = vertexArray[index + 1];
            const duplicated = nextVertex 
                && vertex.x === nextVertex.x
                && vertex.y === nextVertex.y
                && vertex.z === nextVertex.z;

            return !duplicated;
        });
    }
}
