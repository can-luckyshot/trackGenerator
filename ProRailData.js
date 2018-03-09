//var spoortak_url = "http://mapservices.prorail.nl/arcgis/rest/services/Spoortakken_001/MapServer/0/query?";
var sein_url = "https://mapservices.prorail.nl/arcgis/rest/services/Treinbeveiligingsysteem_002/MapServer/0/query?";
var pr_foto_url = "https://luchtfoto.prorail.nl/erdas-iws/ogc/wms/Luchtfoto?";
var wissel_url = "https://mapservices.prorail.nl/arcgis/rest/services/Geleidingssysteem_004/MapServer/3/query?"
var wissel_math_url = "https://mapservices.prorail.nl/arcgis/rest/services/Geleidingssysteem_004/MapServer/1/query?"
var kruis_url = "https://mapservices.prorail.nl/arcgis/rest/services/Geleidingssysteem_004/MapServer/query?"
var spoortak_url = "https://mapservices.prorail.nl/arcgis/rest/services/Geleidingssysteem_004/MapServer/2/query?"
var overweg_vloer_url = "https://mapservices.prorail.nl/arcgis/rest/services/BBK_spoorobjecten_002/MapServer/22/query?"
var overweg_punt_url = "https://mapservices.prorail.nl/arcgis/rest/services/BBK_spoorobjecten_002/MapServer/21/query?"

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
	url += "request=getmap";
	url += "&bbox=" + minX + "," + minY + "," + maxX + "," + maxY;
	url += "&transparent=true";
	url += "&width=" + size + "&height=" + size;
	url += "&format=image/png";
	url += "&styles=default";
	url += "&layers=2016";
	url += "&srs=EPSG:28992";
	url += "&version=1.1.1";
	url += "&service=wms";
	console.log("luchtfoto url: " + url);
	return url;
}

function getProRailLuchtFoto(minX, minY, maxX, maxY, size, onSucces) {
	var url = getProRailLuchtFotoUrl(minX, minY, maxX, maxY, size);
	var loader = new THREE.ImageLoader();
	loader.crossOrigin = true;
	loader.load(url, onSucces);
}
