if (!Detector.webgl) {
	Detector.addGetWebGLMessage();
}
// html variables
var container, stats, campos, panel;
var calls, vertices, faces, points;
// scene variables
var camera, scene, controls;
var clock = new THREE.Clock();
var camMinY = 10.0;

// viewer variables
var viewerWidth, viewerHeight;

// renderer variables
var renderer
var maxAnisotropy = 1;

var geocode;
var world_offsetx = 0;
var world_offsetz = 0;

function start(quality, raw) {
	init();
	animate();
	geocode = 531;
	laadModellen(geocode, panel);
}

function init() {
	initContainer();
	initCamera();
	initRenderer();
	initScene();
	initStats();
	initSceneStats();
	initGeocodeInput();
	initControls();
}

function initContainer() {
	panel = document.getElementById('panel');
	container = document.getElementById('viewer');
	calcViewerSize();
	window.addEventListener('resize', onWindowResize, false);
}

function calcViewerSize() {
	viewerWidth = container.offsetWidth;
	viewerHeight = container.offsetHeight;
	console.log("size: " + viewerWidth + " " + viewerHeight);
}

function initScene() {
	scene = new THREE.Scene();
	scene.add(new THREE.AmbientLight(0x444444));
	var light = new THREE.DirectionalLight(0xffffff, 1.0);
	light.position.set(1000, 1000, 0);
	scene.add(light);
	var axisHelper = new THREE.AxisHelper(5000);
	scene.add(axisHelper);
}

function initCamera() {
	camera = new THREE.PerspectiveCamera(60, viewerWidth / viewerHeight, 10, 10000);
	camera.position.y = camera.far * 0.3;
	camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function initControls() {
	controls = new THREE.FirstPersonControls(camera, container);
	controls.movementSpeed = 100;
	controls.lookSpeed = 0.1;
	controls.lat = -90;
	controls.lon = 90;
}

function initSceneStats() {
	campos = document.createElement('div');
	panel.appendChild(campos);
	calls = document.getElementById('calls');
	vertices = document.getElementById('vertices');
	faces = document.getElementById('faces');
	points = document.getElementById('points');
}

function initStats() {
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild(stats.domElement);
}

function initRenderer() {// renderer
	renderer = new THREE.WebGLRenderer({
		antialias : 1
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(viewerWidth, viewerHeight);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setClearColor(0x7EC0EE, 1);

	maxAnisotropy = renderer.getMaxAnisotropy() / 2;
	console.log("maxAnisotropy: " + maxAnisotropy);
	container.appendChild(renderer.domElement);
}

function initGeocodeInput() {
	geocodeBox = document.getElementById('panel');
	geocodeInput = document.createElement('input');
	geocodeInput.id = 'geocodeBox';
	geocodeInput.addEventListener("keyup", new function(ev) {
		console.log(typeof ev);
	}, false);
	geocodeBox.appendChild(geocodeInput);
}

function onWindowResize() {
	calcViewerSize();
	camera.aspect = viewerWidth / viewerHeight;
	camera.updateProjectionMatrix();
	controls.handleResize();
	renderer.setSize(viewerWidth, viewerHeight);
}

function animate() {
	requestAnimationFrame(animate);
	controls.update(clock.getDelta());
	updateControlSpeed();
	updateHud();
	render();
}

function updateControlSpeed() {
	camera.position.y = Math.max(camMinY, camera.position.y);
	controls.movementSpeed = 2 + camera.position.y * 2;
}

function updateHud() {
	stats.update();
	var camPosX = camera.position.x + world_offsetx;
	var camPosZ = camera.position.z + world_offsetz;
	campos.textContent = "Positie: " + Math.floor(camPosX) + ", " + Math.floor(camera.position.y) + ", " + Math.floor(camPosZ);
	calls.textContent = "calls: " + renderer.info.render.calls;
	vertices.textContent = "vertices: " + renderer.info.render.vertices;
	faces.textContent = "faces: " + renderer.info.render.faces;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	controls.handleResize();
}

function render() {
	scene.traverse(function(object) {
		if (object instanceof THREE.LOD) {
			object.update(camera);
		}
	});
	renderer.render(scene, camera);

}