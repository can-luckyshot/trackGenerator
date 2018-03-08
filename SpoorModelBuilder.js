var spoortakCount;
var seinPaalTexture = THREE.ImageUtils.loadTexture("textures/seinpaal.png");
seinPaalTexture.minFilter = THREE.NearestFilter;
var seinKopTexture = THREE.ImageUtils.loadTexture("textures/sein.png");
seinKopTexture.minFilter = THREE.NearestFilter;
var y_offset = 7.0;

function laadModellen(geocode, statsPanel) {
	initStats(statsPanel);
	getSpoortakken(geocode, function(data) {
		if (data && data.features && data.features.length && data.features.length > 0) {
			makeSpoortakken(data);
		} else {
			window.alert("Geocode '" + geocode + "' heeft geen spoortak informatie");
		}

	});
}

function calcExtent(data) {
	var minX = Number.MAX_VALUE;
	var minY = Number.MAX_VALUE;
	var maxX = Number.MIN_VALUE;
	var maxY = Number.MIN_VALUE;
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

function initStats(panel) {
	spoortakCount = document.createElement('div');
	panel.appendChild(spoortakCount);
	wisselCount = document.createElement('div');
	panel.appendChild(wisselCount);
	kruisCount = document.createElement('div');
	panel.appendChild(kruisCount);
	seinCount = document.createElement('div');
	panel.appendChild(seinCount);
	tileCount = document.createElement('div');
	panel.appendChild(tileCount);
	overwegenCount = document.createElement('div');
	panel.appendChild(overwegenCount);
	webGlStats = document.createElement('div');
	panel.appendChild(webGlStats);
}

function makeSpoortakken(data) {
	var extent = calcExtent(data);
	world_offsetx = extent[0];
	world_offsetz = extent[1];
	var xRange = extent[2] - extent[0];
	var yRange = extent[3] - extent[1];
	if (xRange > yRange) {
		camera.rotation.z = Math.PI;
	}
	var count = 0;
	for (var i = 0; i < data.features.length; i++) {
		if (data.features[i].geometry) {
			var coords = data.features[i].geometry.paths[0];
			addLine(coords, 1, 0, 0);
			count++;
		}
	}
	// spoortakCount.textContent = "Spoortakken: " + (count);
	loadExtent(extent);
	getSeinen(geocode, makeSeinen);
	getWissels(geocode, makeWissels);
	getWisselNamen(geocode, makeWisselNamen);
	getKruizen(geocode, makeKruizen);
	//getOverwegVloeren(geocode, makeOverwegen);
	//getOverwegNamen(geocode, makeOverwegNamen);
};

function makeWissels(data) {
	var count = 0;
	for (var i = 0; i < data.features.length; i++) {
		if (data.features[i].geometry) {
			var coords = data.features[i].geometry.paths[0];
			addLine(coords, 0, 0, 1);
			count++;
		}
	}
	// wisselCount.textContent = "Wissels: " + (count);
}

function makeKruizen(data) {
	var count = 0;
	for (var i = 0; i < data.features.length; i++) {
		if (data.features[i].geometry) {
			var paths = data.features[i].geometry.paths;
			for (var p = 0; p < paths.length; p++) {
				var coords = data.features[i].geometry.paths[p];
				addLine(coords, 0, 1, 1);
			}
			count++;
		}
	}
	// kruisCount.textContent = "Kruizen: " + (count);
}

function addPolygon(coords) {
	var shape = new THREE.Shape();
	var x, y;
	x = coords[0][0] - world_offsetx;
	y = coords[0][1] - world_offsetz;
	shape.moveTo(x, y);
	for (var i = 1; i < coords.length; i++) {
		x = coords[i][0] - world_offsetx;
		y = coords[i][1] - world_offsetz;
		shape.lineTo(x, y);
	}
	var geometry = new THREE.ShapeGeometry(shape);
	var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
		color : 0x00ff00,
		side : THREE.DoubleSide
	}));
	mesh.rotation.x = -Math.PI / 2;
	mesh.rotation.z = Math.PI;
	mesh.position.y = 0.1+y_offset;
	scene.add(mesh);
}

function makeOverwegen(data) {
	var count = 0;
	for (var i = 0; i < data.features.length; i++) {
		if (data.features[i].geometry) {
			var coords = data.features[i].geometry.rings[0];
			addPolygon(coords, 0, 0, 1);
			count++;
		}
	}
	// overwegenCount.textContent = "Overwegen: " + (count);
}

function makeOverwegNamen(data) {
	var count = 0;
	for (var i = 0; i < data.features.length; i++) {
		if (data.features[i].geometry) {
			var x = data.features[i].geometry.x;
			var y = data.features[i].geometry.y;
			var text = data.features[i].attributes.NAAM;
			if (text == null) {
				text = "?";
			}
			addOverwegNaam(x, y, text);
			count++;
		}
	}
}

function makeWisselNamen(data) {
	var count = 0;
	for (var i = 0; i < data.features.length; i++) {
		if (data.features[i].geometry) {
			var x = data.features[i].geometry.x;
			var y = data.features[i].geometry.y;
			var text = data.features[i].attributes.NR;
			var text2 = data.features[i].attributes.NR2;
			if (text == null) {
				text = "?";
			} else if (text2) {
				text += "-" + text2;
			}
			addWisselNaam(x, y, text);
			count++;
		}
	}
}

function addOverwegNaam(x, y, text) {
	var canvas = document.createElement('canvas');
	canvas.width = 128;
	canvas.height = 64;
	var context = canvas.getContext('2d');
	var foreGround = "rgb(0,255,0)";
	context.font = "Bold 40px Arial";
	context.fillStyle = foreGround;
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "rgb(0,0,0)";
	context.fillRect(3, 3, canvas.width - 6, canvas.height - 6);
	context.fillStyle = foreGround;
	context.fillStyle = foreGround;
	context.fillText(text, 20, 45);
	var textTexture = new THREE.Texture(canvas);
	textTexture.needsUpdate = true;

	var material = new THREE.SpriteMaterial({
		map : textTexture,
	});
	var sprite = new THREE.Sprite(material);
	var textX = (x) - world_offsetx;
	var textZ = (y) - world_offsetz;
	sprite.scale.set(1, 0.5, 1);
	sprite.position.set(-textX, 2+y_offset, textZ);
	scene.add(sprite);
}

function addWisselNaam(x, y, text) {
	var canvas = document.createElement('canvas');
	canvas.width = 256;
	canvas.height = 64;
	var context = canvas.getContext('2d');
	var foreGround = "rgb(0,0,0)";
	context.font = "Bold 40px Arial";
	context.fillStyle = foreGround;
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "rgb(255,255,255)";
	context.fillRect(3, 3, canvas.width - 6, canvas.height - 6);
	context.fillStyle = foreGround;
	context.fillStyle = foreGround;
	context.fillText(text, 20, 45);
	var textTexture = new THREE.Texture(canvas);
	textTexture.minFilter = THREE.LinearFilter;
	textTexture.needsUpdate = true;

	var material = new THREE.SpriteMaterial({
		map : textTexture,

	});
	var sprite = new THREE.Sprite(material);
	var textX = (x) - world_offsetx;
	var textZ = (y) - world_offsetz;
	sprite.scale.set(1, 0.5, 1);
	sprite.position.set(-textX, 2+y_offset, textZ);
	scene.add(sprite);
}

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
	tile.position.x = -(((extent[0] + (xRange / 2))) - world_offsetx);
	tile.position.z = +(((extent[1] + (yRange / 2))) - world_offsetz);
	tile.position.y = 0;
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
			// seinCount.textContent = "Seinen: " + (i + 1);
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
	textTexture.needsUpdate = true;

	var material = new THREE.SpriteMaterial({
		map : textTexture,
	});
	var sprite = new THREE.Sprite(material);
	var textX = (x) - world_offsetx;
	var textZ = (y) - world_offsetz;
	sprite.scale.set(1, 0.5, 1);
	if (text.length > 4) {
		sprite.scale.set(2, 1, 1);
	}
	sprite.position.set(-textX, 9+y_offset, textZ);
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

	var seinX = (x) - world_offsetx;
	var seinZ = (y) - world_offsetz;
	lod.position.x = -seinX;
	lod.position.z = seinZ;
	lod.position.y = (5) + (2 / 2.0) +y_offset;
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

	var seinX = (x) - world_offsetx;
	var seinZ = (y) - world_offsetz;
	lod.position.x = -seinX;
	lod.position.z = seinZ;
	lod.position.y = 5 / 2.0+ y_offset;
	lod.updateMatrix();
	lod.matrixAutoUpdate = false;
	scene.add(lod);
}

function addSeinKop(q) {
	var dia = 0.5;
	var segmentSize = 2;
	var geometry = new THREE.CylinderGeometry(dia, dia, segmentSize, q);
	var material = new THREE.MeshPhongMaterial({
		color : 0xffffff,
		map : seinKopTexture
	});
	var mesh = new THREE.Mesh(geometry, material);
	return mesh;
}

function addSeinPaal(q) {
	var dia = 0.2;
	var segmentSize = 5;
	var geometry = new THREE.CylinderGeometry(dia, dia, segmentSize, q, 1, true);
	var material = new THREE.MeshPhongMaterial({
		color : 0xffffff,
		map : seinPaalTexture
	});
	return new THREE.Mesh(geometry, material);
}

function addLine(coords, r, g, b) {
	var geometry = new THREE.BufferGeometry();
	var material = new THREE.LineBasicMaterial({
		vertexColors : THREE.VertexColors
	});
	var positions = new Float32Array(coords.length * 3);
	var colors = new Float32Array(coords.length * 3);
	for (var i = 0; i < coords.length; i++) {
		var x = (coords[i][0]) - world_offsetx;
		var z = (coords[i][1]) - world_offsetz;

		// positions
		positions[i * 3] = -x;
		positions[i * 3 + 1] = 0.1+y_offset;
		positions[i * 3 + 2] = z;

		// colors
		colors[i * 3] = r;
		colors[i * 3 + 1] = g;
		colors[i * 3 + 2] = b;

	}
	geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
	geometry.computeBoundingSphere();
	var lineMesh = new THREE.Line(geometry, material);
	scene.add(lineMesh);
}
