//var spoortak_url = "http://mapservices.prorail.nl/arcgis/rest/services/Spoortakken_001/MapServer/0/query?";
var sein_url = "http://mapservices.prorail.nl/arcgis/rest/services/BBK_spoorobjecten/MapServer/14/query?";
var pr_foto_url = "http://mapservices.prorail.nl/arcgis/rest/services/Luchtfoto_001/MapServer/export?";
var wissel_url = "http://mapservices.prorail.nl/arcgis/rest/services/Geleidingssysteem_001/MapServer/4/query?"
var wissel_math_url = "http://mapservices.prorail.nl/arcgis/rest/services/Geleidingssysteem_001/MapServer/2/query?"
var kruis_url = "http://mapservices.prorail.nl/arcgis/rest/services/Geleidingssysteem_001/MapServer/5/query?"
var spoortak_url = "http://mapservices.prorail.nl/arcgis/rest/services/Geleidingssysteem_001/MapServer/3/query?"
var overweg_vloer_url = "http://mapservices.prorail.nl/arcgis/rest/services/BBK_spoorobjecten_002/MapServer/22/query?"
var overweg_punt_url = "http://mapservices.prorail.nl/arcgis/rest/services/BBK_spoorobjecten_002/MapServer/21/query?"

function getSpoortakken(geocode, onSucces) {
	getGeomVanGeocode(spoortak_url, geocode, onSucces);
}

function getWissels(geocode, onSucces) {
	getGeomVanGeocode(wissel_url, geocode, onSucces);
}

function getWisselNamen(geocode, onSucces) {
	getGeomVanGeocode(wissel_math_url, geocode, onSucces);
}

function getKruizen(geocode, onSucces) {
	getGeomVanGeocode(kruis_url, geocode, onSucces);
}

function getOverwegVloeren(geocode, onSucces) {
	getGeomVanGeocode(overweg_vloer_url, geocode, onSucces);
}

function getOverwegNamen(geocode, onSucces) {
	getGeomVanGeocode(overweg_punt_url, geocode, onSucces);
}

function getSeinen(geocode, onSucces) {
	getGeomVanGeocode(sein_url, geocode, onSucces);
}

function getGeomVanGeocode(url, geocode, onSucces) {
	$.ajax({
		url : url,
		data : {
			where : "GEOCODE=" + geocode,
			outFields : '*',
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
function getProRailLuchtFotoUrl(minX, minY, maxX, maxY, size) {
	var url = pr_foto_url;
	url += "bbox=" + minX + "," + minY + "," + maxX + "," + maxY;
	url += "&transparent=true";
	url += "&size=" + size + "," + size;
	url += "&dpi=96";
	url += "&format=png";
	url += "&f=image";
	console.log("luchtfoto url: " + url);
	return url;
}

function getProRailLuchtFoto(minX, minY, maxX, maxY, size, onSucces) {
	var url = getProRailLuchtFotoUrl(minX, minY, maxX, maxY, size);
	var loader = new THREE.ImageLoader();
	loader.crossOrigin = true;
	loader.load(url, onSucces);
}