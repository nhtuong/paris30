
/*!
 * Get address from latitude & longitude
 * \author Hoai-Tuong Nguyen (nhtuong@gmail.com)
 * \fn string getAddress(lat,lon,callback)
 * \memberof mapcal
 * \param lat Latitude double
 * \param lon Longitude double
 * \return string Full address
 * \example 
 		getAddress(48.85587109999999,2.331451799999968,function(result) {
 			alert(result);
 		});
 */
function getAddress(lat,lon,callback){
	var geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(lat,lon);	
	geocoder.geocode({'latLng':latlng},function(data,status){		 
		if(status == google.maps.GeocoderStatus.OK){		 
			var address = data[0].address_components[0].long_name + ', ' +
			data[0].address_components[1].long_name + ', ' +
			data[0].address_components[6].long_name + ' ' +
			data[0].address_components[2].long_name + ', ' +
			data[0].address_components[3].long_name + ', ' +
			data[0].address_components[4].long_name + ', ' +
			data[0].address_components[5].long_name; 
			callback(address);		 
		}		 
	});		
}	

function setRouting(lat,lon){
	var geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(lat,lon);	
	geocoder.geocode({'latLng':latlng},function(data,status){		 
		if(status == google.maps.GeocoderStatus.OK){		 
			var address = data[0].address_components[0].long_name + ', ' +
			data[0].address_components[1].long_name + ', ' +
			data[0].address_components[6].long_name + ' ' +
			data[0].address_components[2].long_name + ', ' +
			data[0].address_components[3].long_name + ', ' +
			data[0].address_components[4].long_name + ', ' +
			data[0].address_components[5].long_name; 
			
			$.cookie("routeTo", address,{ expires: 365});					 
			
			$("menu").trigger('close');
			$("#pop-route").trigger('open');
			loadRouting();
			routingMap();
			
		}		 
	});		

}	


function routingMap() {

var from = /** @type {HTMLInputElement} */(document.getElementById('routeFrom'));
var to = /** @type {HTMLInputElement} */(document.getElementById('routeTo'));
var fromBox = new google.maps.places.SearchBox(from);
google.maps.event.addListener(fromBox, 'places_changed', function() {
var places = searchBox.getPlaces();
});

var toBox = new google.maps.places.SearchBox(to);
google.maps.event.addListener(toBox , 'places_changed', function() {
var places = searchBox.getPlaces();
});

}


var directionsDisplay = new google.maps.DirectionsRenderer({ draggable: true });
var directionsService = new google.maps.DirectionsService();
var map2;


function loadRouting() {

	google.maps.event.addDomListener(window, 'load', routingMap);

	if ($.cookie("routeFrom")==null)
		$.cookie("routeFrom", 'A',{ expires: 365});
		

	if ($.cookie("routeTo")==null)
		$.cookie("routeTo", '',{ expires: 365});

	 

	navigator.geolocation.getCurrentPosition(function(position){			
		
		
		
		var currlat=position.coords.latitude;
		var currlng=position.coords.longitude;

		var myOptions = {
			zoom: 12,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			center: new google.maps.LatLng(currlat, currlng)
		};
		

		
		map2 = new google.maps.Map(document.getElementById("map_routing"), myOptions);
		
		
		  

		
		

		
		getAddress(currlat,currlng,function(address){
			
			$.cookie("routeFrom", address,{ expires: 365});
			$("#routeFrom").val($.cookie("routeFrom"));
			$("#routeTo").val($.cookie("routeTo"));
			calcRoute();
		});
		
		
		
		
		
		
		$("#routeMode").on("change", function() { calcRoute(); });
		$("#routeGo").on("click", function() { calcRoute(); $.cookie("routeTo", $("#routeTo").val(),{ expires: 365});	 });
		$("#routeClear").on("click", function() { $("#map_routing").width("100%"); directionsDisplay.setDirections({ routes: [] }); });
		
		
			
		function calcRoute() {

			directionsDisplay.setMap(map2);
			directionsDisplay.setPanel(document.getElementById("directions"));
		
			var request = {
				origin: $("#routeFrom").val(),
				destination: $("#routeTo").val(),
				travelMode: google.maps.TravelMode[$("#routeMode").val()]
			};
			directionsService.route(request, function(response, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(response);
					 $("#map_routing").width("45%");
				}
			});
		}


		
	});
}	

function viewRoute(from,to) {
	//alert(window.mapObject.map);
	directionsDisplay.setMap(window.mapObject.map);
	
	
		getAddress(from.lat(),from.lng(),function(address){			
			$.cookie("routeFrom", address,{ expires: 365});		
		});
		
		getAddress(to.lat(),to.lng(),function(address){			
			$.cookie("routeTo", address,{ expires: 365});		
		});		
		
	var request = {
		origin: from,
		destination: to,
		travelMode: google.maps.TravelMode["TRANSIT"]
	};
	directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(response);					 
		}
	});
}
		
		