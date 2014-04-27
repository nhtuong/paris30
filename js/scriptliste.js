

	/*---------------------- #page1 liste ---------------*/

//creation des differentes listes par rapport au type de transport
function loadList () {
	
	listecreate("metro");
	listecreate("rer");
	listecreate("tram");
	listecreate("bus");
	listecreate("velib");
}

//creation des liens de l'API en fonction du transport et des donnees GPS
var linkGenerator = function (service, fonction, args) {
	return "http://failwithfairytales.fr/l2o/request/"+service+"/"+fonction+"/"+args;
}

//fonction qui cree la liste des stations dans un rayon de 500m 
var listecreate = function (service) {
	navigator.geolocation.getCurrentPosition (function (position) {
		//obtention des coordonnees GPS
		var latGPS = position.coords.latitude;
		var lngGPS = position.coords.longitude;
		var args = latGPS+"_"+lngGPS+"/"+0.1;
		//apelle au fichier JSON obtenue grace a l'API
		$.getJSON(linkGenerator(service,"getStations", args), function(data){
			$.each(data, function(i, station){
			
				var latlngGPS = new google.maps.LatLng(latGPS,lngGPS);
				var latlngStation = new google.maps.LatLng(station.lat,station.lng);
				function getDistanceLatLng(pos1, pos2){
					return (google.maps.geometry.spherical.computeDistanceBetween(pos1, pos2) / 1).toFixed(2);
				}
				var res = station.name.toLocaleLowerCase();
				var itineraire = 'https://maps.google.com/maps?saddr=' + latGPS + ',' + lngGPS + '&daddr=' + station.lat + ',' + station.lng ;
				var routing = 'javascript:setRouting('+ station.lat + ',' + station.lng+');';
				
				
				//loadRT(service,station.id);
			

				$.getJSON("http://failwithfairytales.fr/l2o/request/"+service+"/getStation/"+station.id, function(data2){
					var liste ='<li><a href="'+routing+'" target="_blank" data-transition="pop" data-id="'+station.id+'" data-type="'+service+'"><h1><img src="./img/ressources/'+station.type+'.png" width="20"/>'+res+'</h1><span class="distance" >Distance: '+ getDistanceLatLng(latlngGPS,latlngStation) +' m </span></a></li>';
					$("#liststation").append(liste);
					$('#liststation').css('textTransform', 'capitalize');
				});
				
		

			});
			
			
			
	
				
		});
	});
};

	/*---------------------- #page2 details ---------------*/

/*
	
var selectedStation = {
	id : null,
	type : null
}

//evenement lors d'un clique sur une station
$(document).on('click', '#liststation li a', function () {
	//obtention de l'ID et du TYPE de la station choisie
	selectedStation.id = $(this).attr('data-id');
	selectedStation.type = $(this).attr('data-type');
	//redirection vers la page des details de la station
	$.mobile.changePage(($("#page2")), { transition: "pop", changeHash: true });
});

//affichage des details par rapport au type du transport choisi
$(document).on('pagebeforeshow', '#page2', function () {
	
	$("#page2 #stationdetails").empty();
	if (selectedStation.type=="metro") {
		detailcreate("metro");
	}
	else if(selectedStation.type=="rer") {
		detailcreate("rer");
	}
	else if (selectedStation.type=="tram") {
		detailcreate("tram");
	}
	else if (selectedStation.type=="bus") {
		detailcreate("bus");
	}
	else if(selectedStation.type=="velib") {
		detailcreate("velib");
	}
	$("#page2 #stationdetails").listview("refresh");
});

//fonction qui cree la liste des details
var detailcreate = function ( service ) {
	navigator.geolocation.getCurrentPosition (function (position) {
		//obtention des coordonnees GPS
		var latGPS = position.coords.latitude;
		var lngGPS = position.coords.longitude;
		var args = latGPS+"_"+lngGPS+"/"+0.5;
		//apelle au fichier JSON obtenue grace a l'API
		$.getJSON(linkGenerator(service,"getStations", args), function(data){
			var details = "";
			$.each(data, function(i, station){
				if(station.id == selectedStation.id) {
					var res = station.name.toLocaleLowerCase();
					details +=  '<li>'+res+'</li><li>'+station.lat+'</li><li>'+station.lng+'</li>';
				}
			});
			$("#liststation").empty();
			$("#stationdetails").append(details);
			$('#stationdetails').css('textTransform', 'capitalize');
			$("#stationdetails").listview('refresh'); 
	    });
	});
};

*/