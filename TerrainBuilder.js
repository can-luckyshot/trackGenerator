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
	// maakTerrainOutline(minX, minY, maxX, maxY, 16);
	loadHeight(minX, minY, maxX, maxY, 16);
}

function loadHeight(minX, minY, maxX, maxY, tiles) {
	var w = maxX - minX;
	var h = maxY - minY;
	var size = Math.max(w, h);
	maxX = minX + size;
	maxY = minY + size;
	getAhnFoto(minX, minY, maxX, maxY, function(image) {
		console.log("hoogte data is binnen");
		var data = getHeightMap(image);
		var step = size / tiles;
		var half_step = step / 2;
		for (var tile_y = 0; tile_y < tiles; tile_y += 1) {
			for (var tile_x = 0; tile_x < tiles; tile_x++) {
				var tile_minX = minX - (tile_x * step);
				var tile_minY = minY - (tile_y * step);
				var tile_maxX = tile_minX + step;
				var tile_maxY = tile_minY + step;
				var tile_data = getTileData(data, tile_x, tile_y, tiles);
				var tileX = (tile_minX - (step / 2)) - world_offsetx;
				var tileZ = (maxY - ((tile_y * step) + step / 2)) - world_offsetz;
				createHeightPlane(tile_data, undefined, tileX, tileZ, step);
				getProRailLuchtFoto(tile_minX, tile_minY, tile_maxX, tile_maxY, 512, function(luchtfoto) {
					console.log("luchtfoto is binnen");

				});
			}
		}

	});

}

function maakTerrainOutline(minX, minY, maxX, maxY, tiles) {
	var w = maxX - minX;
	var h = maxY - minY;
	var size = Math.max(w, h);
	console.log("outline: " + (minX - world_offsetx) + " - " + (minY - world_offsetz) + " - " + size);
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

function createHeightPlane(data, texImage, x, z, size) {
	// we assume the heightmap is always square
	var segments = Math.sqrt(data.length) - 1;
	var geometry = new THREE.PlaneBufferGeometry(size, size, segments, segments);
	geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI));
	geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

	var vertices = geometry.attributes.position.array;
	var l = vertices.length;
	for (var i = 0, j = 0; i < l; i++, j += 3) {
		vertices[j + 1] = -data[i];
	}
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	var materials = [];
	// MeshPhongMaterial,MeshLambertMaterial,MeshBasicMaterial
	materials.push(new THREE.MeshLambertMaterial({
		color : 0x331300,
	}));
	if (texImage) {
		var texture1 = new THREE.Texture(texImage);
		texture1.needsUpdate = true;
		materials.push(new THREE.MeshLambertMaterial({
			map : texture1,
			transparent : true
		}));
	}
	var mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
	mesh.position.x = x;
	mesh.position.z = z;
	scene.add(mesh);

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
