function loadExtent(extent) {
	console.log("load extend");
	var minX = extent[0];
	var minY = extent[1];
	var maxX = extent[2];
	var maxY = extent[3];
	console.log("minX: " + minX);
	console.log("minY: " + minY);
	console.log("maxX: " + maxX);
	console.log("maxY: " + maxY);
	console.log("width: " + maxX - minX);
	console.log("height: " + maxY - minY);

	// maakTerrainOutline(minX, minY, maxX, maxY, 16);
	//maakWaterlijn(minX, minY, maxX, maxY);
	loadHeight(minX, minY, maxX, maxY, 8);
}

function loadHeight(minX, minY, maxX, maxY, tiles) {
	var w = maxX - minX;
	var h = maxY - minY;
	var size = Math.max(w, h);
	maxX = minX + size;
	maxY = minY + size;
	getAhnFoto(minX, minY, maxX, maxY, 4096, function(image) {
		console.log("hoogte data is binnen");
		var data = getHeightMap(image);
		var step = size / tiles;
		var half_step = step / 2;
		THREE.ImageUtils.crossOrigin = true;
		for (var tile_y = 0; tile_y < tiles; tile_y++) {
			for (var tile_x = 0; tile_x < tiles; tile_x++) {
				var tile_data = getTileData(data, tile_x, tile_y, tiles);
				var tileX = (minX - ((tile_x * step) + (step / 2)))
						- world_offsetx;
				var tileZ = (maxY - ((tile_y * step) + (step / 2)))
						- world_offsetz;
				var x1 = minX + (tile_x * step);
				var x2 = minX + (tile_x * step) + step;
				var y1 = maxY - (tile_y * step);
				var y2 = maxY - (tile_y * step) - step;
				var luchtFotoUrl = getProRailLuchtFotoUrl(x1, y1, x2, y2, 1024);
				var texture = THREE.ImageUtils.loadTexture(luchtFotoUrl);
				createHeightPlaneLOD(tile_data, texture, tileX, tileZ, step);
			}
		}

	});

}

function maakTerrainOutline(minX, minY, maxX, maxY, tiles) {
	var w = maxX - minX;
	var h = maxY - minY;
	var size = Math.max(w, h);
	console.log("outline: " + (minX - world_offsetx) + " - "
			+ (minY - world_offsetz) + " - " + size);
	var geometry = new THREE.PlaneBufferGeometry(size, size, tiles, tiles);
	geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
	var material = new THREE.MeshBasicMaterial({
		color : 0x00ff00,
		wireframe : true
	});
	var outline = new THREE.Mesh(geometry, material);
	outline.position.x = (minX - (size / 2)) - world_offsetx;
	outline.position.z = (minY + (size / 2)) - world_offsetz;
	scene.add(outline);
}
function maakWaterlijn(minX, minY, maxX, maxY) {
	var w = maxX - minX;
	var h = maxY - minY;
	var size = Math.max(w, h);
	var geometry = new THREE.PlaneBufferGeometry(size, size, 1, 1);
	geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
	var material = new THREE.MeshBasicMaterial({
		color : 0x0000ff,
		transparent : true,
		opacity : 0.5
	});
	var waterMesh = new THREE.Mesh(geometry, material);
	waterMesh.position.x = (minX - (size / 2)) - world_offsetx;
	waterMesh.position.z = (minY + (size / 2)) - world_offsetz;
	scene.add(waterMesh);
}

function getTileData(data, tile_x, tile_y, tiles) {
	var size = Math.sqrt(data.length);
	var sweep = size / tiles;
	var tileData = [];
	var startY = tile_y * sweep;
	var startX = tile_x * sweep;
	console.log("tile x,y: " + tile_x + " - " + tile_y);
	console.log("tile_data x,y: " + startX + " - " + startY);
	for (var y = 0; y < sweep; y++) {
		for (var x = 0; x < sweep; x++) {
			var realY = startY + y;
			var realX = startX + x;
			var pos = realX + (realY * size);
			tileData.push(data[pos]);
		}
	}
	return tileData;
}

function createHeightPlaneLOD(data, texture, x, z, size) {
	var lod = new THREE.LOD();

	var mesh = createHeightPlane(data, texture, x, z, size, 1);
	mesh.updateMatrix();
	mesh.matrixAutoUpdate = false;
	lod.addLevel(mesh, 100);

	mesh = createHeightPlane(data, texture, x, z, size, 2);
	mesh.updateMatrix();
	mesh.matrixAutoUpdate = false;
	lod.addLevel(mesh, 200);

	mesh = createHeightPlane(data, texture, x, z, size, 4);
	mesh.updateMatrix();
	mesh.matrixAutoUpdate = false;
	lod.addLevel(mesh, 300);
	
	mesh = createHeightPlane(data, texture, x, z, size, 8);
	mesh.updateMatrix();
	mesh.matrixAutoUpdate = false;
	lod.addLevel(mesh, 400);

	lod.position.x = x;
	lod.position.z = z;
	lod.updateMatrix();
	lod.matrixAutoUpdate = false;
	scene.add(lod);
}

function createHeightPlane(data, texture, x, z, size, detail) {
	var dataSize = Math.sqrt(data.length);
	// we assume the heightmap is always square
	var segments = ((dataSize / detail) - 1);
	var geometry = new THREE.PlaneBufferGeometry(size, size, segments, segments);
	geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI));
	geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

	var vertices = geometry.attributes.position.array;
	var l = vertices.length;
	var sweep = segments + 1;
	// console.log("sweep: " + sweep);
	for (var vy = 0; vy < sweep; vy++) {
		for (var vx = 0; vx < sweep; vx++) {
			var vertexPos = (vy * sweep) + vx;
			var heightPos = (vy * dataSize * detail) + (vx * detail);
			vertices[(vertexPos * 3) + 1] = data[heightPos];
		}
	}
	// for (var i = 0, j = 0; i < l; i++, j += 3) {
	// var hx = (j/3)%sweep;
	// var hy = ((j/3)-hx)/sweep;
	// var h = data[(hy*sweep)+hx];
	// vertices[j + 1] = h;
	// }
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	var materials = [];
	// MeshPhongMaterial,MeshLambertMaterial,MeshBasicMaterial
	materials.push(new THREE.MeshLambertMaterial({
		color : 0x331300,
	}));
	if (texture) {
		materials.push(new THREE.MeshLambertMaterial({
			map : texture,
			transparent : true
		}));
	}
	var mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
	// mesh.position.x = x;
	// mesh.position.z = z;
	// scene.add(mesh);
	return mesh;

}

function generateTexture(data, width, height) {

	var canvas, canvasScaled, context, image, imageData, level, diff, vector3, sun, shade;

	vector3 = new THREE.Vector3(0, 0, 0);

	sun = new THREE.Vector3(1, 1, 1);
	sun.normalize();

	canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	context = canvas.getContext('2d');
	context.fillStyle = '#000';
	context.fillRect(0, 0, width, height);

	image = context.getImageData(0, 0, canvas.width, canvas.height);
	imageData = image.data;

	for (var i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {

		vector3.x = data[j - 2] - data[j + 2];
		vector3.y = 2;
		vector3.z = data[j - width * 2] - data[j + width * 2];
		vector3.normalize();

		shade = vector3.dot(sun);

		imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
		imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
		imageData[i + 2] = (shade * 96) * (0.5 + data[j] * 0.007);
	}

	context.putImageData(image, 0, 0);
	return canvas;
}
