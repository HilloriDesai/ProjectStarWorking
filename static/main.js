var scene, camera, renderer, light;
var starMesh, tmpMesh;
var starRadius = 50;
var positionHistory = [];
var lastPos, diffMove, laststarScale;
var ping = 0;


function init(width, height) {
    scene = new THREE.Scene();
    // Setup cameta with 45 deg field of view and same aspect ratio
    var aspect = width / height;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    // Set the camera to 400 units along `z` axis
    camera.position.set(0, 0, 400);

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer:true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.domElement.classList.add("star");
    document.body.appendChild(renderer.domElement);
}

function initLight() {
    light = new THREE.SpotLight(0xffffff);
    // Position the light slightly to a side to make 
    // shadows look better.
    light.position.set(400, 100, 1000);
    light.castShadow = true;
    scene.add(light);
}

function initStar() {
    // Load star texture and create material from it
    var starTexture = THREE.ImageUtils.loadTexture(starBase64);
    starTexture.minFilter = THREE.NearestFilter;
    var starMaterial = new THREE.MeshBasicMaterial({
        map: starTexture,
    });
    // Create a sphere 25 units in radius and 16 segments
    // both horizontally and vertically.
    // var starGeometry = new THREE.SphereGeometry(starRadius, 16, 16);
    var starGeometry = new THREE.PlaneGeometry(80, 80);
    starMesh = new THREE.Mesh(starGeometry, starMaterial);
    starMesh.receiveShadow = true;
    starMesh.castShadow = true;
    // Add star to the scene
    scene.add(starMesh);
}

// function initMoon() {
//     var moonTexture = THREE.ImageUtils.loadTexture(moonBase64);
//     moonTexture.minFilter = THREE.NearestFilter;
//     var moonMaterial = new THREE.MeshLambertMaterial({
//         map: moonTexture,
//     });
//     var moonGeometry =  new THREE.SphereGeometry(starRadius * 0.273, 10, 10);
//     moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
//     moonMesh.receiveShadow = true;
//     moonMesh.castShadow = true;
//     scene.add(moonMesh);
// }

function initPlane() {
    // The plane needs to be large to be sure it'll always intersect
    var tmpGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    tmpGeometry.position = new THREE.Vector3(0, 0, 0);
    tmpMesh = new THREE.Mesh(tmpGeometry);
}

var intersects = [];

function checkIntersect(vector) {
    // Unproject camera distortion (fov, aspect ratio)
    vector.unproject(camera);
    var norm = vector.sub(camera.position).normalize();
    var ray = new THREE.Raycaster(camera.position, norm);
    // Cast a line from our camera to the tmpMesh and see where these
    // two intersect. That's our 2D position in 3D coordinates.
    intersects = ray.intersectObject(tmpMesh);

    return intersects[0].point;
}

// Update position of objects in the scene
function update() {
    if (positionHistory.length === 0) {
       return;
    }

    // starRotY += 0.007;

    ping++;
    if (ping < 10) {
        lastPos[0] += diffMove[0];
        lastPos[1] += diffMove[1];
        lastPos[2] += diffMove[2];
    }

    //dsadsabjdkd
    //var vector = new THREE.Vector3(0.1, 0.1, 0.5);
    var vector = new THREE.Vector3(lastPos[0], lastPos[1], 0.5);
    var intersect = checkIntersect(vector);

    // starMesh.rotation.y = starRotY;

    // With position from OpenCV I could possibly move the star outside of the window
    if (intersects.length === 1) {
        var point = intersects[0].point;
        starMesh.position.x = point.x;
        starMesh.position.y = point.y;


        // X pos + radius
        var vector = new THREE.Vector3(lastPos[0] + lastPos[2], lastPos[1], 0.5);
        var intersect = checkIntersect(vector);

        var newstarRadius = Math.abs(intersect.x - starMesh.position.x);
        var starScale = newstarRadius / starRadius;

        starMesh.scale.set(starScale, starScale, starScale);
        // moonMesh.scale.set(starScale, starScale, starScale);

        laststarScale = starScale;
    }

    // moonRotY += 0.005;
   

    // Update Moon position
    // moonMesh.position.set(x + starMesh.position.x, y + starMesh.position.y, z);
    // moonMesh.rotation.y = moonRotY;
}
var X = "Jayesh";
function render() {
    update();
    
    renderer.setClearColor(0xffffff, 0);
    renderer.render(scene, camera);
    // Schedule another frame
    requestAnimationFrame(render);
}

function greeting() {

    document.getElementById('greeting').innerHTML = "Welcome, Mr." + X;

}


document.addEventListener('DOMContentLoaded', function(event) {

    // var video = document.querySelector("#video");
    // var constraints = { video: { facingMode: "user", minWidth: window.innerWidth }, audio: false } ;

    // function cameraStart() {

    //     navigator.mediaDevices
    //         .getUserMedia(constraints)
    //         .then(function(stream) {
            
    //             track = stream.getTracks()[0];
    //             video.srcObject = stream;
            // video.oncanplay = function() {
                //console.log(video.clientWidth, video.clientHeight);
                //init(video.clientWidth, video.clientHeight);
                init(window.innerWidth, window.innerHeight);
                initStar();
                // initMoon();
                initLight();
                initPlane();
                greeting();
                requestAnimationFrame(render);
                    

            // }, function() {}

        // })
// }
})
// window.addEventListener("load", cameraStart, false);

var ws = new WebSocket('ws://localhost:9000');
ws.onopen = function() {
    //console.log('onopen');
};
ws.onmessage = function (event) {
    var msg = JSON.parse(event.data);

    positionHistory.push({
        x:  msg.x * 2 - 1,
        y: - msg.y * 2 + 1,
        radius: msg.radius
    });

    if (positionHistory.length > 10) {
        positionHistory.shift();
    }

    var xCoords = [], yCoords = [], radiuses = [];
    for (var i = math.max(positionHistory.length - 2, 0); i < positionHistory.length; i++) {
        xCoords.push(positionHistory[i].x);
        yCoords.push(positionHistory[i].y);
    }
    
    for (var i = 0; i < positionHistory.length; i++) {
        radiuses.push(positionHistory[i].radius);
    }

    var posX = math.mean(xCoords);
    var posY = math.mean(yCoords);
    var radius = math.mean(radiuses);

    var targetPos = [posX, posY, radius];
    if (!lastPos) {
        lastPos = targetPos;
    }
    diffMove = [(targetPos[0] - lastPos[0]) / 4, (targetPos[1] - lastPos[1]) / 4, (targetPos[2] - lastPos[2]) / 4]

    ping = 0;
}
