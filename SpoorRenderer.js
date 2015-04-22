if (!Detector.webgl) {
	Detector.addGetWebGLMessage();
}

var container, stats, campos;

var camera, scene, renderer, controls, panel;
var clock = new THREE.Clock();
var trackScale = 1;
var camMinY = 0.1;
var viewerWidth;
var viewerHeight;
var maxAnisotropy = 1;
var geocode;
var map_step = 1000;
var tileSize = 1024;
var world_offsetx = 0;
var world_offsetz = 0;

var calls;
var vertices;
var faces;
var points;
var seinPaalTexture, seinKopTexture;

function start(quality) {
	if (quality) {
		tileSize = quality;
	}
	init();
	animate();
	geocode = 531;
	laadModellen();
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
	scene.add(new THREE.AmbientLight(0xffffff));
	var light = new THREE.DirectionalLight(0xffffff, 1.0);
	light.position.set(200, 400, 0);
	scene.add(light);
	seinPaalTexture = THREE.ImageUtils.loadTexture("textures/seinpaal.png");
	seinPaalTexture.minFilter = THREE.NearestFilter;
	seinKopTexture = THREE.ImageUtils.loadTexture("textures/sein.png");
	seinKopTexture.minFilter = THREE.NearestFilter;
}

function initCamera() {
	camera = new THREE.PerspectiveCamera(45, viewerWidth / viewerHeight, 0.1, 15000);
}

function initControls() {
	controls = new THREE.FirstPersonControls(camera, container);
	controls.movementSpeed = 100;
	controls.lookSpeed = 0.1;
}

function initSceneStats() {
	campos = document.createElement('div');
	campos.id = 'campos';
	panel.appendChild(campos);
	spoortakCount = document.createElement('div');
	spoortakCount.id = 'spoortakCount';
	panel.appendChild(spoortakCount);
	seinCount = document.createElement('div');
	seinCount.id = 'seinCount';
	panel.appendChild(seinCount);
	tileCount = document.createElement('div');
	tileCount.id = 'tileCount';
	panel.appendChild(tileCount);
	webGlStats = document.createElement('div');
	webGlStats.id = 'webGlStats';
	panel.appendChild(webGlStats);
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

function calcExtent(data) {
	var minX = Number.MAX_VALUE;
	var minY = Number.MAX_VALUE;
	var maxX = Number.MIN_VALUE;
	var maxY = Number.MIN_VALUE;
	// for (var i = 0; i < data.features.length; i++) {
	for (var i = 0; i < data.features.length; i++) {
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
	var extent = [];
	extent.push(minX);
	extent.push(minY);
	extent.push(maxX);
	extent.push(maxY);
	return extent;
}

function loadExtent(extent) {
	var minX = extent[0];
	var minY = extent[1];
	var maxX = extent[2];
	var maxY = extent[3];
	var xTiles = Math.ceil((maxX - minX) / map_step);
	var yTiles = Math.ceil((maxY - minY) / map_step);
	console.log("minX: " + minX);
	console.log("minY: " + minY);
	console.log("maxX: " + maxX);
	console.log("maxY: " + maxY);
	console.log("xTiles: " + xTiles);
	console.log("yTiles: " + yTiles);
	loadMap(minX, minY, xTiles, yTiles);
}

function loadMap(startX, startY, xTiles, yTiles) {
	var count = 0;
	for (x = 0; x < xTiles; x++) {
		for (y = 0; y < yTiles; y++) {
			var minX = startX + (x * map_step);
			var minY = startY + (y * map_step);
			var maxX = startX + ((x + 1) * map_step);
			var maxY = startY + ((y + 1) * map_step);
			loadMapTexture(minX, minY, maxX, maxY, x, y);
			count++;
			tileCount.textContent = "Luchtfotos: " + count;
		}
	}
}

function loadMapTexture(minX, minY, maxX, maxY, x, y) {
	var url = foto_url + "bbox=" + minX + "," + minY + "," + maxX + "," + maxY;
	url += "&transparant=false";
	url += "&format=png";
	url += "&dpi=96";
	url += "&size=" + tileSize + "," + tileSize;
	url += "&f=image";
	console.log("tile: " + url);
	var geometry = new THREE.PlaneBufferGeometry(map_step, map_step, 1, 1);
	THREE.ImageUtils.crossOrigin = true;
	var texture = THREE.ImageUtils.loadTexture(url);
	texture.anisotropy = maxAnisotropy;
	var material = new THREE.MeshPhongMaterial({
		color : 0xffffff,
		map : texture,
	});
	var tile = new THREE.Mesh(geometry, material);
	tile.rotation.x = -Math.PI / 2;
	tile.rotation.z = Math.PI;
	tile.position.x = -(((minX + (map_step / 2)) * trackScale) - world_offsetx);
	tile.position.z = +(((minY + (map_step / 2)) * trackScale) - world_offsetz);
	tile.scale.set(trackScale, trackScale, trackScale);
	scene.add(tile);
}

function laadModellen() {
	getSpoortakken(geocode, makeSpoortakken);
}

function makeSpoortakken(data) {
	console.log("maak spoortakken: " + data.features.length);
	if (data.features.length) {
		var extent = calcExtent(data);
		world_offsetx = extent[0] * trackScale;
		world_offsetz = extent[1] * trackScale;
		var xRange = extent[2] - extent[0];
		var yRange = extent[3] - extent[1];
		camera.position.x = (xRange / 2) * -trackScale;
		camera.position.z = (yRange / 2) * trackScale;
		camera.position.y = camera.far * 0.95;
		var lootAt = new THREE.Vector3(camera.position.x, 0, camera.position.z);
		camera.lookAt(lootAt);
		controls.lat = -90;
		controls.lon = 90;
		if (xRange > yRange) {
			camera.rotation.z = Math.PI;
		}
		for (i = 0; i < data.features.length; i++) {
			if (data.features[i].geometry) {
				var coords = data.features[i].geometry.paths[0];
				addLine(coords);
				spoortakCount.textContent = "Spoortakken: " + (i + 1);
			}
		}
		loadExtent(extent);
		// loadBasicMapTexture(extent);
		getSeinen(geocode, makeSeinen);
	} else {
		window.alert("Geocode heeft geen spoortak informatie");
	}
};

function loadBasicMapTexture(extent) {
	var url = foto_url + "bbox=" + extent[0] + "," + extent[1] + "," + extent[2] + "," + extent[3];
	url += "&transparant=false";
	url += "&format=png";
	url += "&dpi=96";
	url += "&size=2048,2048";
	url += "&f=image";
	console.log("tile: " + url);
	var xRange = extent[2] - extent[0];
	var yRange = extent[3] - extent[1];
	var geometry = new THREE.PlaneBufferGeometry(xRange, yRange, 1, 1);
	THREE.ImageUtils.crossOrigin = true;
	var texture = THREE.ImageUtils.loadTexture(url);
	texture.anisotropy = maxAnisotropy;
	var material = new THREE.MeshPhongMaterial({
		color : 0xffffff,
		map : texture,
	});
	var tile = new THREE.Mesh(geometry, material);
	tile.rotation.x = -Math.PI / 2;
	tile.rotation.z = Math.PI;
	tile.position.x = -(((extent[0] + (xRange / 2)) * trackScale) - world_offsetx);
	tile.position.z = +(((extent[1] + (yRange / 2)) * trackScale) - world_offsetz);
	tile.position.y = 0;
	tile.scale.set(trackScale, trackScale, trackScale);
	scene.add(tile);
}

function makeSeinen(data) {
	var texture1 = THREE.ImageUtils.loadTexture("textures/seinpaal.png");
	var texture2 = THREE.ImageUtils.loadTexture("textures/sein.png");
	console.log("maak seinen");
	for (i = 0; i < data.features.length; i++) {
		if (data.features[i].geometry) {
			var x = data.features[i].geometry.x;
			var y = data.features[i].geometry.y;
			addSeinKopLOD(x, y);
			addSeinPaalLOD(x, y);
			var nummer = data.features[i].attributes.NUMMER;
			if (nummer === null) {
				nummer = "?";
			}
			addSeinNummer(x, y, nummer);
			seinCount.textContent = "Seinen: " + (i + 1);
		}
	}
};

function addSeinNummer(x, y, text) {
	var canvas = document.createElement('canvas');
	canvas.width = 128;
	if (text.length > 4) {
		canvas.width = 256;
	}
	canvas.height = 64;
	var context = canvas.getContext('2d');
	context.font = "Bold 40px Arial";
	context.fillStyle = "rgb(255,255,0)";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "rgb(0,0,0)";
	context.fillRect(3, 3, canvas.width - 6, canvas.height - 6);
	context.fillStyle = "rgb(255,255,0)";
	context.fillStyle = "rgb(255,255,0)";
	context.fillText(text, 20, 45);
	var textTexture = new THREE.Texture(canvas);
	// var textTexture =
	// THREE.ImageUtils.loadTexture("textures/seinnummer.png");
	textTexture.needsUpdate = true;

	var material = new THREE.SpriteMaterial({
		map : textTexture,
	});
	var sprite = new THREE.Sprite(material);
	var textX = (x * trackScale) - world_offsetx;
	var textZ = (y * trackScale) - world_offsetz;
	sprite.scale.set(1, 0.5, 1);
	if (text.length > 4) {
		sprite.scale.set(2, 1, 1);
	}
	sprite.position.set(-textX, 9, textZ);
	scene.add(sprite);
}

var nearLod = 0;
var farLod = 50;
function addSeinKopLOD(x, y) {
	var lod = new THREE.LOD();

	mesh = addSeinKop(32);
	mesh.updateMatrix();
	mesh.matrixAutoUpdate = false;
	lod.addLevel(mesh, nearLod);

	mesh = addSeinKop(8);
	mesh.updateMatrix();
	mesh.matrixAutoUpdate = false;
	lod.addLevel(mesh, farLod);

	lod.position.y = (5 * trackScale) + (2 * trackScale / 2.0);
	var seinX = (x * trackScale) - world_offsetx;
	var seinZ = (y * trackScale) - world_offsetz;
	lod.position.x = -seinX;
	lod.position.z = seinZ;
	lod.updateMatrix();
	lod.matrixAutoUpdate = false;
	scene.add(lod);
}
function addSeinPaalLOD(x, y) {
	var lod = new THREE.LOD();

	mesh = addSeinPaal(32);
	mesh.updateMatrix();
	mesh.matrixAutoUpdate = false;
	lod.addLevel(mesh, nearLod);

	mesh = addSeinPaal(8);
	mesh.updateMatrix();
	mesh.matrixAutoUpdate = false;
	lod.addLevel(mesh, 1000);

	lod.position.y = 5 * trackScale / 2.0;
	var seinX = (x * trackScale) - world_offsetx;
	var seinZ = (y * trackScale) - world_offsetz;
	lod.position.x = -seinX;
	lod.position.z = seinZ;
	lod.updateMatrix();
	lod.matrixAutoUpdate = false;
	scene.add(lod);
}

function addSeinKop(q) {
	var dia = 0.5 * trackScale;
	var segmentSize = 2 * trackScale;
	var geometry = new THREE.CylinderGeometry(dia, dia, segmentSize, q);
	var material = new THREE.MeshPhongMaterial({
		color : 0xffffff,
		map : seinKopTexture,
		wireframe : true
	});
	return new THREE.Mesh(geometry, material);
}

function addSeinPaal(q) {
	var dia = 0.2 * trackScale;
	var segmentSize = 5 * trackScale;
	var geometry = new THREE.CylinderGeometry(dia, dia, segmentSize, q, 1, true);
	var material = new THREE.MeshPhongMaterial({
		color : 0xffffff,
		map : seinPaalTexture
	});
	return new THREE.Mesh(geometry, material);
}
function maakPaalSegment(x, y, segNum, color, dia) {
	var segmentSize = 1 * trackScale;
	var geometry = new THREE.CylinderGeometry(dia * trackScale, dia * trackScale, segmentSize, 32);
	var material = new THREE.MeshPhongMaterial({
		color : color,
		specular : 0x111111
	});
	var segment = new THREE.Mesh(geometry, material);
	segment.position.y = (segNum * segmentSize) + segmentSize / 2.0;
	var seinX = (x * trackScale) - world_offsetx;
	var seinZ = (y * trackScale) - world_offsetz;
	segment.position.x = -seinX;
	segment.position.z = seinZ;
	scene.add(segment);
}

function addLine(coords) {
	var segments = coords.length;
	var geometry = new THREE.BufferGeometry();
	var material = new THREE.LineBasicMaterial({
		vertexColors : THREE.VertexColors
	});
	var positions = new Float32Array(segments * 3);
	var colors = new Float32Array(segments * 3);
	// console.log("line @x,y: " + coords[0][0] + "," + coords[0][1])
	for (var i = 0; i < segments; i++) {
		var x = (coords[i][0] * trackScale) - world_offsetx;
		var z = (coords[i][1] * trackScale) - world_offsetz;

		// positions
		positions[i * 3] = -x;
		positions[i * 3 + 1] = 0.1;
		positions[i * 3 + 2] = z;

		// colors
		colors[i * 3] = 1;
		colors[i * 3 + 1] = 0;
		colors[i * 3 + 2] = 0;

	}
	geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
	geometry.computeBoundingSphere();
	var lineMesh = new THREE.Line(geometry, material);
	scene.add(lineMesh);
}

function animate() {
	requestAnimationFrame(animate);
	controls.update(clock.getDelta());
	if (camera.position.y < camMinY) {
		camera.position.y = camMinY;
	}
	controls.movementSpeed = 2 + camera.position.y * 2;
	updateHud();
	render();
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

function render() {
	scene.traverse(function(object) {
		if (object instanceof THREE.LOD) {
			object.update(camera);
		}
	});
	renderer.render(scene, camera);

}