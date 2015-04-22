var markers = [ [ 'Agen', 44.203142, 0.616363 ], [ 'Albi', 43.925085, 2.148641 ], [ 'Argenton', 46.586446, 1.52282 ],
		[ 'Barcelona', 41.385064, 2.173403 ], [ 'Blois', 47.586092, 1.335947 ], [ 'Bordeaux', 44.837789, -0.57918 ],
		[ 'Bourges', 47.081012, 2.398782 ], [ 'Cahors', 44.447523, 1.441989 ], [ 'Chateauroux', 46.811434, 1.686779 ],
		[ 'Duffel', 51.09539, 4.5052 ], [ 'Essen-Nispen', 51.467803, 4.468613 ], [ 'Fontenay Sur Eure', 48.395236, 1.411807 ],
		[ 'Marseille', 43.296482, 5.36978 ], [ 'Meaux', 48.956202, 2.888466 ], [ 'Meer', 51.4456, 4.7383 ],
		[ 'Menen', 50.796292, 3.121342 ], [ 'Morlincourt', 49.570175, 3.033268 ], [ 'Nanteuil', 49.141377, 2.808772 ],
		[ 'Narbonne', 43.184277, 3.003078 ], [ 'Oudenaarde', 50.846955, 3.601368 ], [ 'Pau', 43.2951, -0.370797 ],
		[ 'Perpignan', 42.688659, 2.894833 ], [ 'Pt.Maxcence', 49.301412, 2.604843 ], [ 'Quievrain', 50.407626, 3.682887 ],
		[ 'Ruffec', 46.028559, 0.199339 ], [ 'St.Vincent', 45.143604 - 3.908139 ], [ 'Tarbes', 43.232951, 0.078082 ],
		[ 'Vierzon', 47.221438, 2.069791 ], [ 'Zellik', 50.88449, 4.27401 ] ];
// in the marker-drawing loop:
// after the loop:
function initializeMaps() {
	console.log("load map");
	var bounds = new google.maps.LatLngBounds();
	var myOptions = {
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		mapTypeControl : false
	};
	var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	var infowindow = new google.maps.InfoWindow(), marker, i;
	for (i = 0; i < markers.length; i++) {
		var pos = new google.maps.LatLng(markers[i][1], markers[i][2]);
		marker = new google.maps.Marker({
			position : pos,
			map : map
		});
		bounds.extend(pos);
		google.maps.event.addListener(marker, 'click', (function(marker, i) {
			return function() {
				infowindow.setContent(markers[i][0]);
				infowindow.open(map, marker);
			}
		})(marker, i));
	}
	map.fitBounds(bounds);
}
