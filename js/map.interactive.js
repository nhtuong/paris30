//////////////////////////////////////////
//	Variable globale de l'application
//	L2o - maj 09.04.2014 Félix Bindernagel
//////////////////////////////////////////

// Hashtable pour les markeurs (l2o.marker.js)
window.markerTypes = {
	velib : {
		icon : "img/marker/pin_velib.png",
		visible : true,
		markerCollection : [],
		markerLocation : []
	},
	metro : {
		icon : "img/marker/pin_metro.png",
		visible : true,
		markerCollection : [],
		markerLocation : []
	},
	tram : {
		icon : "img/marker/pin_tramway.png",
		visible : true,
		markerCollection : [],
		markerLocation : []
	},
	bus : {
		icon : "img/marker/pin_bus.png",
		visible : true,
		markerCollection : [],
		markerLocation : []
	},
	rer : {
		icon : "img/marker/pin_rer.png",
		visible : true,
		markerCollection : [],
		markerLocation : []
	}
};

//	Objet étendu contenant la carte et les paramètres
window.mapObject = {
	defaults:{
		zoom:17,
		minZoom: 12 //	définit un niveau de zoom minimum (12 représente une belle vue de Paris)
	},
	object: "map_canvas"
};

//	Variable par défaut du popup
var opts = {
	target: "#realtime",
	container: "#realtime-content",
	loader: "#loader",
	toolbar: "#realtime-updater",
	counter: "#realtime-counter",
	update_button: "#realtime-manual-update"
};

//	Variables utile au màj des popups	
window.processData = {};

//////////////////////////////////////////
//	Fonctions utilitaires
//	L2o - maj 09.04.2014 Félix Bindernagel
//////////////////////////////////////////

//	convertie degrees en radians 
//	argument d(float)
//	sortie float
var degreesToRadian = function(d){
	return d / 57.2958;
};

//	Convertie un niveau de zoom en rayon(km)
//	argument: map(object) les points d'un rectangle que forme la map
//	sortie float
var zoomToRadius = function(map){
	return parseFloat(
		3963.0 * Math.acos(
			Math.sin(
				degreesToRadian(map.getCenter().lat())
			) *
			Math.sin(
				degreesToRadian(map.getNorthEast().lat())
			) +
			Math.cos(
				degreesToRadian(map.getCenter().lat())
			) *
			Math.cos(
				degreesToRadian(map.getNorthEast().lat())
			) * 
			Math.cos(
				degreesToRadian(map.getNorthEast().lng()) -
				degreesToRadian(map.getCenter().lng()) 
			)
		)
	).toFixed(2);
};

//	Calcule la distance(km) entre 2 jeux de coordonnées
//	argument: coordonnées (object)
//	sortie float
var getDistanceLatLon = function(latlon1, latlon2){
	return (google.maps.geometry.spherical.computeDistanceBetween(latlon1, latlon2) / 1000).toFixed(2);  
};

//	Genere un lien pour les requetes de types Near of POI
//	arguments: service(String), lat(float) lng(float)
//	sortie String
var markerLink = function(service, lat, lng){
	
	return "http://failwithfairytales.fr/l2o/request/" + service + "/getStations/"+lat + "_" + lng + "/" + window.mapObject.radius;	
};

//	Genere un lien pour les requetes de 
//	arguments: service(String), fonction(String)=getStation, id(int)
//	sortie String
var linkGenedrator = function(service, fonction, argument) {
	if (service=="velib")
		return "http://failwithfairytales.fr/l2o/request/"+service+"/"+fonction+"/"+argument;
	else return "http://vietsciexdir.net/api/paris30/getStations.php?service="+service+"&stop_id="+argument;
	
};

//	Determine si un markeur donné est intéressant à afficher
//	argument POIpos(object), service(String)
//	sortie Boolean
var isRelevantPOI = function(POIpos, service){
	if(window.mapObject.map.getZoom() <= (window.mapObject.defaults.minZoom + 2)) return false;
	if(getDistanceLatLon(window.mapObject.map.getCenter(), POIpos) > window.mapObject.radius) return false;
	if(!window.markerTypes[service].visible) return false;
	return true;
};

//////////////////////////////////////////
//	Fonctions relatives au markers
//	L2o - maj 09.04.2014 Félix Bindernagel
//////////////////////////////////////////

//	Obtiens, place, et gére les évenements des marqueurs pour un service
//	argument serv(String), lat(float), lng(float)
//	sortie Object
var setMarker = function(serv, lat, lng){
	$.ajax({
		type : 'GET',
		url : markerLink(serv, lat, lng), 
		dataType: 'json', 
		crossDomain : true
	}).done(function(data) { 
		if(data == null) return false;
		$.each( data, function(i, marker) {
			if($.inArray(new google.maps.LatLng(marker.lat, marker.lng).toString(), window.markerTypes[serv].markerLocation) >= 0) return true;
			
			//window.markerTypes[serv].icon = "img/transports/"+serv+"/"+marker.line+".png";
			window.markerTypes[serv].markerLocation.push(new google.maps.LatLng(marker.lat, marker.lng).toString());
			
			var marker = new google.maps.Marker({
					map: window.mapObject.map,
					icon : window.markerTypes[serv].icon,
					position: new google.maps.LatLng(marker.lat, marker.lng),
					animation: google.maps.Animation.DROP,
					service: serv,
					visible: window.markerTypes[serv].visible,
					id:marker.id
			});
			
			window.markerTypes[serv].markerCollection.push(marker);
			
			google.maps.event.addListener(
				marker,
				"click",
				function(e){
					
					viewRoute(window.mapObject.defaults.center,marker.position);
					realtime(event, {service : serv, id : marker.id});

					
				}
			)

		});
		return this;
	});	
};

//	Cache ou affiche des markers d'un service
//	argument service(String)
//	sortie	Object
var toogleMarkers = function(service){
	$.each(window.markerTypes[service].markerCollection, function(i, marker) {
		marker.setVisible(isRelevantPOI(marker.position, service));					
	});
	return this;		
};

//	Place les markers pour tout les services
//	arguments void
//	sortie object
var setMarkers = function(){
	if(window.mapObject.radius > 2)return false;
	var lat = window.mapObject.map.getCenter().lat();
	var lng = window.mapObject.map.getCenter().lng();
	$.each(window.markerTypes, function(marker){
		setMarker(marker, lat, lng);
	});
	return this;
};

//////////////////////////////////////////
//	Fonction relative a la carte
//	L2o - maj 09.04.2014 Félix Bindernagel
//////////////////////////////////////////

//	Génere, etend les fonctions de bases, et crées des evenements pour les éléments relatifs à la carte
//	Argument Void
//	Sortie Void

var setMap = function(){

	navigator.geolocation.getCurrentPosition(function(position){	
		
		var pointzero = new google.maps.LatLng(48.853290, 2.348751);
		
		window.mapObject.defaults.center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		
		var dist_from_pointzero = google.maps.geometry.spherical.computeDistanceBetween(pointzero, window.mapObject.defaults.center)/1000;
		
		//Return to Point Zero if the user is too far from Paris
		if (dist_from_pointzero>300)
			window.mapObject.defaults.center = pointzero;
		
		
		
		window.mapObject.map = new google.maps.Map(
			document.getElementById("map_canvas"),
			window.mapObject.defaults
		);
		
		window.mapObject.current = new google.maps.Marker({
			map: window.mapObject.map,
			position: window.mapObject.defaults.center,
			animation: google.maps.Animation.BOUNCE
		});
		
		/******************************************************************************
										Evenements
		******************************************************************************/
		
		//	S'effectue qu'une fois (seulement) lorsque la carte est chargé
		google.maps.event.addListenerOnce(window.mapObject.map, "tilesloaded", function(){
			window.mapObject.radius = zoomToRadius(window.mapObject.map.getBounds());
			setMarkers();
			$.each(window.markerTypes, function(service){ // Gére les filtres sur les services (checkboxes)
				$("input[name="+service+"]").on("change", function(){
					window.markerTypes[service].visible = $(this).is(':checked');
					toogleMarkers(service);
				});
			});
			$("#setDefault").on("click",function(){	// Gere le bouton de retour à la position initiale
				window.mapObject.map.panTo(window.mapObject.defaults.center);
			});
			$(opts.update_button).on("click",function(){ //	fonctionnalité de maj automatique
				manualUpdate();
			});
		});
		
		//	Evenement au changement de Zoom
		google.maps.event.addListener(window.mapObject.map, 'zoom_changed', function(){
			window.mapObject.radius = zoomToRadius(window.mapObject.map.getBounds());
			$.each(window.markerTypes, function(service){
				toogleMarkers(service);
			});
		});
		
		//	Evenement lorsqu'on relache la souris apres un mouvement de dépacement
		google.maps.event.addListener(window.mapObject.map, 'dragend', function() {
			setMarkers();
		});
		
		//	Evenement au changement de centre
		google.maps.event.addListener(window.mapObject.map, 'center_changed', function(){
			$.each(window.markerTypes, function(service){
				toogleMarkers(service);
			});
		});
	});			
};
//////////////////////////////////////////
//	Fonctions relatives au popup
//	L2o - maj 23.04.2014 Félix Bindernagel
//////////////////////////////////////////

//	Fonction vidant le contenu html de la popup
//	argument - sortie : Void
var clearContainer = function() {
	$(opts.container).empty();
};

//	Fonction servant à arreter la boucle d'actualisation
//	argument number(int) id du compteur
//	sortie Object	
var stopTimer = function(){
	window.clearTimeout(window.processData.procId);
	return this;
};

//	Fonction qui remet le popups et les variables de l'environnement à leurs état initiale
//	argument void
//	sortie void	
var destroy = function(){
	realCounter(0, true);
	stopTimer();
	window.processData = {};
	clearContainer();
};

//	fonction abstraite - Affichage de la popups
var popups = function(mX, mY, index, data){
	$(opts.target).popup();
	if(mX == 0 && mY == 0){
		$(opts.target).popup("open", {transition:"pop", positionTo:"origin"});
	}
	else{
		$(opts.target).popup("open", {transition:"pop", x: mX, y: mY});
	}
	getData(data);
	$(opts.target).on("popupafterclose", function(event, ui){
		destroy();
	});
};

// 	Fonction abstraite - servant à l'affichage des informations relatives au velibs
var showRatp = function(data){
	if($("#ratp-container").length){
		$("#ratp-container").effect('highlight',{color:"#ABCFE7"},1000);
		$.each(data, function(key, element){
			$("#ratp-t1-"+element.id).html(element.t1);
			$("#ratp-t2-"+element.id).html(element.t2);
		})
		return true;
	}
	
	$(opts.container).append(
		$(document.createElement("table")).attr({
			"class": "ratp",
			"id":"ratp-container",
		})
	);
	$("#ratp-container").append(
		$(document.createElement("tr")).append(
			$(document.createElement("td")).attr({
				"class": "adress",
				"colspan":"3"
			}).append(data[0].station),
			
			$(document.createElement("td")).attr({
				"class": "ratp-time",
			}).append("min"),
			$(document.createElement("td")).attr({
				"class": "ratp-time",
			}).append("min")
		)		
		
	);
	
	$.each(data, function(key, el){
		var number = el.id;
		$("#ratp-container").append(
			$(document.createElement("tr")).append(
				$(document.createElement("td")).attr({
					"class": "ratp-img",
				}).append(
					$(document.createElement("img")).attr({
						"src": "img/ressources/"+el.type.toLowerCase()+".png",
						"alt": el.type,
						"width": "20"
					})
				),
				$(document.createElement("td")).attr({
					"class": "ratp-img",
				}).append(
					$(document.createElement("img")).attr({
						"src": "img/transports/"+el.type.toLowerCase()+"/"+el.line+".png",
						"alt": el.line,
						"width": "20"
					})
				),
				$(document.createElement("td")).attr({
					"class": "donnee"
				}).append(el.destination),
				$(document.createElement("td")).attr({
					"class": "ratp-time",
					"id": "ratp-t1-"+number
				}).append(el.t1),
				$(document.createElement("td")).attr({
					"class": "ratp-time",
					"id": "ratp-t2-"+number
				}).append(el.t2)
			)
		);
	});	
};

var showVelib = function(data){
	var number = data.id;
	data = data[0];		
	if($("#velib-"+number).length){
		$("#velib-"+number).effect('highlight',{color:"#ABCFE7"},1000);
		$("#velib-available-bikes-stands-"+number).html("Emplacements disponibles: " + data.available_bike_stands);
		$("#velib-available-bikes-"+number).html("V&eacute;los disponibles: " + data.available_bikes);
	}
	else{
		$(opts.container).append(
			$(document.createElement("table")).attr({
				"class": "velib",
				"id":"velib-"+number,
			})
		);
		$('#velib-'+number).append(

			$(document.createElement("tr")).append(
				
				$(document.createElement("td")).attr({
					"class": "adress",
					"colspan":"2"
				}).append(data.address)
			),	
			$(document.createElement("tr")).append(
				$(document.createElement("td")).attr({
					"rowspan":"2",
					"class": "velib-number"
				}).append(
					$(document.createElement("img")).attr({
						"src":"img/transports/velib.png"
					})
				),
				$(document.createElement("td")).attr({
					"class": "donnee",
					"id": "velib-available-bikes-stands-"+number
				}).append("Emplacements disponibles : " + data.available_bike_stands)
			),
			$(document.createElement("tr")).append(
				$(document.createElement("td")).attr({
					"class": "donnee",
					"id": "velib-available-bikes-"+number
				}).append("V&eacute;los disponibles : " + data.available_bikes)					
			)
		);
	}
};

//	Fonction chargé de recuperer les données relatives aux arguments sur le serveur
//	arguments args(Object:{func:"fonctionaexecuter"(String),link:"lien"(String));
//	Sortie Void	
var getData = function(args){
	//alert(args.link);
	
	
	$.ajax({
		url: args.link,
		type: 'GET',
		dataType: 'json',
		crossDomain:true
	}).done(function(data){
		$(opts.loader).hide();
		if(data == null){
			$(opts.container).append("<br /><b id='realtime-error'>Aucune donnée pour le service n'est disponible</b><br/><br/>");
			return false;
		}
		eval(args.func)(data);
		realCounter(0, true);
		stopTimer();
		window.processData.arg = args;
			window.processData.procId = 
				setTimeout(function(){
					getData(args)
				}, 
				parseInt(data[0].next_update)
			);
		realCounter(parseInt(data[0].next_update), false);
	}).fail(function(){
		$(opts.loader).hide();
		$(opts.container).append("<br /><b id='realtime-error'>Oops ! An error has occured, please retry later</b><br/><br/>");
	});	
};

//	Maj via click
//	argument void
//	retour void
var manualUpdate = function(){
	stopTimer();
	realCounter(0, true);
	getData(window.processData.arg);
}

//	Fonction décompte des secondes avec maj
//	argument time(int) stopToken(boolean)
//	retour void
var realCounter = function(time, stopToken){
	var inter = parseInt(150);
	if(!stopToken && (time-inter) > 0){
		if(!$(opts.toolbar).is(":visible")){
			$(opts.toolbar).fadeIn("slow");
		}
		$(opts.counter).html((time/1000).toFixed(1));
		window.processData.counterId = setTimeout(function(){
			realCounter((time-inter), false)
			}, 
			inter)
		;
	}
	else{
		clearTimeout(window.processData.counterId)
		$(opts.toolbar).hide();
	}
}

//	Constructeur du popups
//	arguments event(object), data(object)
//	sortie void
var realtime = function(event, data){

	var x = (event.pageX != 0) ? event.pageX: event.changedTouches[0].pageX;
	var y = (event.pageY != 0) ? event.pageY: event.changedTouches[0].pageY;

	clearContainer();
	if(!$("#loader").length){
		$(opts.container).append(
			$(document.createElement("img")).attr({
				"id": "loader",
				"src": "img/load.gif"
			})
		);
	}			
	else $(opts.loader).show();
	popups(x, y, data.id,{
		link: linkGenedrator(data.service,"getStation", data.id),
		func: (data.service == "velib")? "showVelib": "showRatp" 
	});
}