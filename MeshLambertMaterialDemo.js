init();
render();
var viewerWidth = 800;
var viewerHeight = 600;

function init() {
	var viewer = document.getElementById('viewer');
	calcViewerSize();
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, viewerWidth / viewerHeight, 0.1, 50);
	camera.position.z = 30;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(viewerWidth, viewerHeight);
	viewer.appendChild(renderer.domElement);

	var ambientLight = new THREE.AmbientLight(0x000000);
	scene.add(ambientLight);

	var lights = [];
	lights[0] = new THREE.PointLight(0xffffff, 1, 0);
	lights[1] = new THREE.PointLight(0xffffff, 1, 0);
	lights[2] = new THREE.PointLight(0xffffff, 1, 0);

	lights[0].position.set(0, 200, 0);
	lights[1].position.set(100, 200, 100);
	lights[2].position.set(-100, -200, -100);

	scene.add(lights[0]);
	scene.add(lights[1]);
	scene.add(lights[2]);

	var geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
	var material = new THREE.MeshLambertMaterial({
		color : 0xff0000
	})
	mesh = new THREE.Mesh(geometry, material);

	scene.add(mesh);

	window.addEventListener('resize', function() {
		console.log("resize");
		calcViewerSize();
		camera.aspect = viewerWidth / viewerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(viewerWidth, viewerHeight);

	}, false);

}

function calcViewerSize() {
	viewerWidth = $("#viewer").width();
	viewerHeight = $("#viewer").height();
	console.log("size: " + viewerWidth + " " + viewerHeight);
}

function render() {
	requestAnimationFrame(render);
	var time = Date.now() * 0.001;
	mesh.rotation.x += 0.005;
	mesh.rotation.y += 0.005;
	renderer.render(scene, camera);
};
