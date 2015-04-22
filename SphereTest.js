if (!Detector.webgl) {
	Detector.addGetWebGLMessage();
}

var container, stats, campos;

var camera, scene, renderer, controls;
var clock = new THREE.Clock();
var scale = 1;
var camMinY = 2.0;

var sphere;

init();
animate();
loadMap(135000, 455000, 10, 10);

function init() {
	initContainer();
	initCamera();
	initScene();
	initRenderer();
	initStats();
	initControls();
}

function loadMap(startX, startY, xTiles, yTiles) {
	var step = 100;
	for (x = 0; x < xTiles; x++) {
		for (y = 0; y < yTiles; y++) {
			var minX = startX + (x * step);
			var minY = startY + (y * step);
			var maxX = startX + ((x + 1) * step);
			var maxY = startY + ((y + 1) * step);
			loadMapTexture(minX, minY, maxX, maxY, x, y);
		}
	}
}

function loadMapTexture(minX, minY, maxX, maxY, x, y) {
	var url = foto_url + "bbox=" + minX + "," + minY + "," + maxX + "," + maxY;
	url += "&transparant=false";
	url += "&format=png";
	url += "&dpi=96";
	url += "&size=512,512";
	url += "&f=image";
	var geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
	THREE.ImageUtils.crossOrigin = true;
	var texture = THREE.ImageUtils.loadTexture(url);
	THREE.ImageUtils.crossOrigin = false;
	var material = new THREE.MeshPhongMaterial({
		color : 0xffffff,
		map : texture,
		side : THREE.DoubleSide
	});
	var sphere = new THREE.Mesh(geometry, material);
	scale = 10;
	sphere.rotation.x = -Math.PI / 2;
	sphere.position.x = 0.5 + (x * scale);
	sphere.position.z = 0.5 - (y * scale);
	sphere.scale.set(10, 10, 10)
	scene.add(sphere);
}

function initContainer() {
	container = document.getElementById('container');
}

function initScene() {
	scene = new THREE.Scene();
	scene.add(new THREE.AmbientLight(0xffffff));
	light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0, 20, 0);
	scene.add(light);
	scene.add(new THREE.AxisHelper());
	scene.add(new THREE.GridHelper(10, 1));
}

function initCamera() {
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 3200000);
	camera.position.y = camMinY;
	camera.position.z = 5;
}

function initControls() {
	controls = new THREE.FirstPersonControls(camera);
	controls.movementSpeed = 5;
	controls.lookSpeed = 0.1;
}

function initStats() {
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild(stats.domElement);
}

function initRenderer() {// renderer
	renderer = new THREE.WebGLRenderer({
		antialias : 8
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	container.appendChild(renderer.domElement);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame(animate);
	stats.update();
	controls.update(clock.getDelta());
	render();
}

function render() {
	renderer.render(scene, camera);
}