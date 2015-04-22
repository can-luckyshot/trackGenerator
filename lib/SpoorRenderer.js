if (!Detector.webgl) {
	Detector.addGetWebGLMessage();
}

var container, stats, campos;

var camera, scene, renderer, controls, groundMesh;
var clock = new THREE.Clock();
var scale = 1.0;
var world_offsetx = 0.0;
var world_offsetz = 0.0;

var mesh, groundMesh;

init();
laadModellen();
animate();

function init() {

	container = document.getElementById('container');

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3500);
	camera.position.y = 5;

	scene = new THREE.Scene();
	scene.add(new THREE.AmbientLight(0x666666));
	makeGras();
	geocodeBox = document.getElementById('geocodeBox');
	geocodeInput = document.createElement('input');
	geocodeInput.id = 'geocodeBox';
	geocodeInput.addEventListener("keyup", new function(ev) {
		console.log(typeof ev);
	}, false);
	geocodeBox.appendChild(geocodeInput);
	// renderer
	renderer = new THREE.WebGLRenderer({
		antialias : 4
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setClearColor(0x87CEEB, 1);
	container.appendChild(renderer.domElement);
	// stats
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild(stats.domElement);
	// cam position
	campos = document.createElement('div');
	campos.id = 'campos';
	campos.style.cssText = 'width:80px;opacity:0.9;cursor:pointer';
	campos.style.position = 'absolute';
	campos.style.bottom = '0px';
	campos.style.right = '0px';
	campos.style.cssText = 'color:#f00;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	campos.innerHtml = "<b>test regel</b>";
	container.appendChild(campos);
	// controls
	controls = new THREE.FirstPersonControls(camera);
	controls.movementSpeed = 5;
	controls.lookSpeed = 0.1;

}

function onKeyDown(ev) {
	// var keys = { SP : 32, W : 87, A : 65, S : 83, D : 68, UP : 38, LT
	// : 37, DN : 40, RT : 39 };
	var step = 40
	if (ev.keyCode == 37) {
		camera.position.x -= step;
	} else if (ev.keyCode == 39) {
		camera.position.x += step;
	} else if (ev.keyCode == 38) {
		camera.position.y += step;
	} else if (ev.keyCode == 40) {
		camera.position.y -= step;
	}
}

function onMouseWheel(ev) {
	var amount = -ev.wheelDeltaY || ev.detail;
	var dir = amount / Math.abs(amount);
	console.log("evnt: " + amount + " - " + dir);
	camera.position.z += amount * 2;
	if (camera.position.z < 2) {
		camera.position.z = 4;
	}
	console.log("cam.z = " + camera.position.z);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function makeGras() {
	var loader = new THREE.TextureLoader();
	loader.load('textures/grasslight-big.jpg', function(groundTexture) {

		groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
		groundTexture.repeat.set(512, 512);
		groundTexture.anisotropy = 8;

		var groundMaterial = new THREE.MeshPhongMaterial({
			color : 0xffffff,
			specular : 0x111111,
			map : groundTexture
		});
		groundMaterial.depthTest = false;
		groundMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(10, 10), groundMaterial);
		groundMesh.rotation.x = -Math.PI / 2;
		groundMesh.scale.set(30, 30, 30);
		console.log("grass loaded");
		scene.add(groundMesh);

	});
}

function laadModellen() {
	getSpoortakken(531, makeSpoortakken);
}

function makeSpoortakken(data) {
	console.log("maak spoortakken");
	world_offsetx = data.features[0].geometry.paths[0][0][0] * scale;
	world_offsetz = data.features[0].geometry.paths[0][0][1] * scale;
	// camera.position.x = world_offsetx;
	// camera.position.z = world_offsetz;
	for (i = 0; i < data.features.length; i++) {
		if (data.features[i].geometry) {
			var coords = data.features[i].geometry.paths[0];
			addLine(coords);
		}
	}
	loadExtent(data)
	getSeinen(531, makeSeinen);
};

function makeSeinen(data) {
	console.log("maak seinen");
	for (i = 0; i < data.features.length; i++) {
		if (data.features[i].geometry) {
			var x = data.features[i].geometry.x;
			var y = data.features[i].geometry.y;
			// console.log("sein @x,y " + x + ", " + y);
			addSein(x, y);
		}
	}
};

function addSein(x, y) {
	// paal
	maakPaalSegment(x, y, 1, 0x000000, 0.02);
	maakPaalSegment(x, y, 2, 0xffffff, 0.02);
	maakPaalSegment(x, y, 3, 0x000000, 0.02);
	maakPaalSegment(x, y, 4, 0xffffff, 0.02);
	maakPaalSegment(x, y, 5, 0x000000, 0.02);
	maakPaalSegment(x, y, 6, 0x000000, 0.05);
	maakPaalSegment(x, y, 7, 0x000000, 0.05);
}

function maakPaalSegment(x, y, segNum, color, dia) {
	var segmentSize = 0.5 / 5;
	var geometry = new THREE.CylinderGeometry(dia, dia, segmentSize, 32);
	var material = new THREE.MeshBasicMaterial({
		color : color
	});
	var paal = new THREE.Mesh(geometry, material);
	paal.position.y = (segNum * segmentSize) + segmentSize / 2.0;
	paal.position.x = (x * scale) - world_offsetx;
	paal.position.z = (y * scale) - world_offsetz;
	scene.add(paal);
}

function loadExtent(data) {
	var minX = Number.MAX_VALUE;
	var minY = Number.MAX_VALUE;
	var maxX = Number.MIN_VALUE;
	var maxY = Number.MIN_VALUE;
	// for (var i = 0; i < data.features.length; i++) {
	for (var i = 0; i < 1; i++) {
		if (data.features[i].geometry) {
			var coords = data.features[i].geometry.paths[0];
			for (var j = 0; j < coords.length; j++) {
				var x = coords[j][0];
				var y = coords[j][1];
				minX = Math.min(x, minX);
				minY = Math.min(y, minY);
				maxX = Math.max(x, maxX);
				maxY = Math.max(y, maxY);
			}
		}
	}
	var startX = minX - (minX % 1000);
	var startY = minY - (minY % 1000);
	var xTiles = Math.ceil((maxX - minX) / 1000.0);
	var yTiles = Math.ceil((maxY - minY) / 1000.0);
	loadMap(startX, startY, xTiles, yTiles);
}

function addLine(coords) {
	var segments = coords.length;
	var geometry = new THREE.BufferGeometry();
	var material = new THREE.LineBasicMaterial({
		vertexColors : THREE.VertexColors
	});
	var positions = new Float32Array(segments * 3);
	var colors = new Float32Array(segments * 3);
	console.log("line @x,y: " + coords[0][0] + "," + coords[0][1])
	for (var i = 0; i < segments; i++) {
		var x = (coords[i][0] * scale) - world_offsetx;
		var z = (coords[i][1] * scale) - world_offsetz;

		// positions
		positions[i * 3] = x;
		positions[i * 3 + 1] = 0.001;
		positions[i * 3 + 2] = z;

		// colors
		colors[i * 3] = 1;
		colors[i * 3 + 1] = 1;
		colors[i * 3 + 2] = 1;

	}
	geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
	geometry.computeBoundingSphere();
	var lineMesh = new THREE.Line(geometry, material);
	scene.add(lineMesh);
}

function animate() {
	requestAnimationFrame(animate);
	render();
	stats.update();
	campos.textContent = camera.position.x + ", " + camera.position.y + ", " + camera.position.z;
}

function render() {
	controls.update(clock.getDelta());
	var minY = 0.5;
	if (camera.position.y < minY) {
		camera.position.y = minY;
	}
	renderer.render(scene, camera);
}