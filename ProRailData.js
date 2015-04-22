var spoortak_url = "http://mapservices.prorail.nl/arcgis/rest/services/Spoortakken_001/MapServer/0/query?";
var sein_url = "http://mapservices.prorail.nl/arcgis/rest/services/BBK_spoorobjecten/MapServer/14/query?";
var foto_url = "http://mapservices.prorail.nl/arcgis/rest/services/Luchtfoto_001/MapServer/export?";

function getSpoortakken(geocode, onSucces) {
	$.ajax({
		url : spoortak_url,
		data : {
			where : "'" + geocode + "' in(GEOCODE_BEGIN,GEOCODE_EIND)",
			returnGeometry : true,
			f : "pjson"
		},
		cache : false,
		dataType : "jsonp",
		crossDomain : true,
		success : onSucces,
		error : function(jqXHR, textStatus, errorThrown) {
			alert(errorThrown);
		},
	});
}

function getSeinen(geocode, onSucces) {
	$.ajax({
		url : sein_url,
		data : {
			where : "GEOCODE = '" + geocode + "'",
			returnGeometry : true,
			f : "pjson",
			outFields : "*"
		},
		dataType : "jsonp",
		crossDomain : true,
		cache : false,
		success : onSucces,
		error : function(jqXHR, textStatus, errorThrown) {
			alert(errorThrown);
		},
	});
}
function getTileDefs(minX, minY, maxX, maxY) {
	minX = minX - (minX % 1000);
	minY = minY - (minY % 1000);
	maxX = maxX - (maxX % 1000);
	maxY = maxY - (maxY % 1000);
	var xRange = maxX - minX;
	var yRange = maxY - minY;
	var tiles = xRange / 1000
}

function getFoto(minX, minY, maxX, maxY, onSucces) {
	$.ajax({
		url : foto_url,
		data : {
			bbox : minX + "," + minY + "," + maxX + "," + maxY,
			returnGeometry : true,
			transparant : false,
			format : "png",
			dpi : 96,
			size : "512,512",
			f : "json"
		},
		dataType : "jsonp",
		crossDomain : true,
		cache : false,
		success : onSucces,
		error : function(jqXHR, textStatus, errorThrown) {
			alert(errorThrown);
		},
	});
}