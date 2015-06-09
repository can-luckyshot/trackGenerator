var ahn_url = "http://geodata.nationaalgeoregister.nl/ahn2/wms?";

function getAhnFoto(minX, minY, maxX, maxY,size, onSucces) {
	var url = "http://geodata.nationaalgeoregister.nl/ahn2/wms?";
	url += "bbox=" + minX + "," + minY + "," + maxX + "," + maxY;
	url += "&service=wms";
	url += "&VERSION=1.1.1";
	url += "&REQUEST=GetMap";
	url += "&LAYERS=ahn2_05m_non";
	url += "&WIDTH="+size;
	url += "&HEIGHT="+size;
	url += "&FORMAT=image/png";
	url += "&SRS=EPSG:28992"
	var loader = new THREE.ImageLoader();
	loader.crossOrigin = true;
	loader.load(url, onSucces);
}

function color2height(color) {
	for (var i = 0; i < rgb2height.length; i++) {
		var c2h = rgb2height[i];
		if (c2h.r == color.r && c2h.g == color.g && c2h.b == color.b) {
			return c2h.h;
		}
	}
	console.log("default height");
	return -20.0;
}

function getHeightMap(image) {
	var imageData = getImageData(image);
	var heightMap = [];
	var min = 10000;
	var max = -10000;
	for (var x = 0; x < image.width; x++) {
		for (var y = 0; y < image.height; y++) {
			var c = getPixel(imageData, y, x);
			var h = color2height(c);
			min = Math.min(min,h);
			max = Math.max(max,h);
			heightMap.push(h);
		}
	}
	console.log("min height: "+min);
	console.log("max height: "+max);
	return heightMap;
}

function getImageData(image) {
	var canvas = document.createElement('canvas');
	canvas.width = image.width;
	canvas.height = image.height;
	var context = canvas.getContext('2d');
	context.drawImage(image, 0, 0);
	return context.getImageData(0, 0, image.width, image.height);
}

function getPixel(imagedata, x, y) {
	var position = (x + imagedata.width * y) * 4;
	var data = imagedata.data;
	return {
		r : data[position],
		g : data[position + 1],
		b : data[position + 2],
		a : data[position + 3]
	};
}

rgb2height = [ {
	r : 255,
	g : 255,
	b : 255,
	h : -8
}, {
	r : 8,
	g : 56,
	b : 123,
	h : -7.5
}, {
	r : 8,
	g : 69,
	b : 132,
	h : -6.5
}, {
	r : 16,
	g : 81,
	b : 132,
	h : -5.5
}, {
	r : 16,
	g : 93,
	b : 132,
	h : -4.5
}, {
	r : 16,
	g : 105,
	b : 140,
	h : -3.5
}, {
	r : 24,
	g : 117,
	b : 140,
	h : -2.75
}, {
	r : 24,
	g : 130,
	b : 140,
	h : -2.25
}, {
	r : 24,
	g : 146,
	b : 148,
	h : -1.75
}, {
	r : 33,
	g : 150,
	b : 148,
	h : -1.25
}, {
	r : 33,
	g : 158,
	b : 140,
	h : -0.75
}, {
	r : 24,
	g : 162,
	b : 132,
	h : -0.25
}, {
	r : 24,
	g : 170,
	b : 123,
	h : 0.25
}, {
	r : 24,
	g : 178,
	b : 107,
	h : 0.75
}, {
	r : 16,
	g : 186,
	b : 99,
	h : 1.25
}, {
	r : 16,
	g : 190,
	b : 82,
	h : 1.75
}, {
	r : 8,
	g : 199,
	b : 66,
	h : 2.25
}, {
	r : 8,
	g : 207,
	b : 49,
	h : 2.75
}, {
	r : 8,
	g : 207,
	b : 49,
	h : 3.25
}, {
	r : 0,
	g : 219,
	b : 0,
	h : 3.75
}, {
	r : 16,
	g : 223,
	b : 0,
	h : 4.25
}, {
	r : 41,
	g : 227,
	b : 0,
	h : 4.75
}, {
	r : 66,
	g : 231,
	b : 0,
	h : 5.5
}, {
	r : 99,
	g : 235,
	b : 0,
	h : 6.5
}, {
	r : 123,
	g : 239,
	b : 0,
	h : 7.5
}, {
	r : 148,
	g : 243,
	b : 0,
	h : 8.5
}, {
	r : 181,
	g : 247,
	b : 0,
	h : 9.5
}, {
	r : 206,
	g : 247,
	b : 0,
	h : 11
}, {
	r : 239,
	g : 255,
	b : 0,
	h : 13
}, {
	r : 255,
	g : 251,
	b : 0,
	h : 15
}, {
	r : 255,
	g : 243,
	b : 0,
	h : 17
}, {
	r : 255,
	g : 231,
	b : 0,
	h : 19
}, {
	r : 247,
	g : 215,
	b : 0,
	h : 22.5
}, {
	r : 247,
	g : 207,
	b : 8,
	h : 27.5
}, {
	r : 247,
	g : 199,
	b : 8,
	h : 32.5
}, {
	r : 247,
	g : 190,
	b : 8,
	h : 37.5
}, {
	r : 247,
	g : 182,
	b : 16,
	h : 42.5
}, {
	r : 239,
	g : 166,
	b : 16,
	h : 47.5
}, {
	r : 239,
	g : 162,
	b : 16,
	h : 55
}, {
	r : 239,
	g : 154,
	b : 16,
	h : 65
}, {
	r : 231,
	g : 142,
	b : 24,
	h : 75
}, {
	r : 231,
	g : 134,
	b : 33,
	h : 85
}, {
	r : 222,
	g : 121,
	b : 33,
	h : 95
}, {
	r : 214,
	g : 109,
	b : 41,
	h : 112.5
}, {
	r : 214,
	g : 105,
	b : 41,
	h : 137.5
}, {
	r : 206,
	g : 97,
	b : 49,
	h : 162.5
}, {
	r : 206,
	g : 89,
	b : 49,
	h : 187.5
}, {
	r : 198,
	g : 85,
	b : 57,
	h : 225
}, {
	r : 198,
	g : 81,
	b : 57,
	h : 275
} ];
