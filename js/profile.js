 
 
 /*!
 * Get list of JSON URL given a list of categories chosen by user
 * \author  Teyeb Hazem (teyeb.hazem@gmail.com)
 * \fn void getJSONCat(lat,lng,lim)
 * \memberof paris30
 * \param 
 * \example 
 *      getJSONCat(4.999999,2.139999,20);
 */
 function getJSONCat(){ 
	
	var tabjson=new Array();
	var tabchecked=new Array();
	var tabreco=new Array();
	
	var inputElements = document.getElementsByTagName('input');
	
	var tab=new Array();
	for(var i=0; i<inputElements.length; ++i){
		
		if (inputElements[i].checked && inputElements[i].name.substring(0,9)=="cbprofile"){ 
			
			tabchecked.push(inputElements[i].id);
			tabreco.push(inputElements[i].value);
			
		}
		
	} 

	alert("Votre profil a été enregistré.");
	$.cookie("profile", tabchecked, { expires: 365});
	tabreco = $.unique(tabreco);
	$.cookie("reco", tabreco, { expires: 365});
	

	
	//$.mobile.changePage($("#page-recommend"));
	recommend($.cookie("reco"),20);
	return tabjson;
}



/*!
 * Set profile
 * \author  Hoai-Tuong Nguyen (nhtuong@gmail.com)
 * \fn void setProfile()
 * \memberof paris30 
 * \example 
 *      setProfile();
 */
function setProfile(){	
	$.each($.cookie("profile").split(','),function(key,val){		
		$('#pop-profile #'+val).prop('checked', true);			
	});
}



/*!
 * Recommend places
 * \author  Hoai-Tuong Nguyen (nhtuong@gmail.com)
 * \fn void recommend()
 * \memberof paris30
 * \example 
 *      recommend();
 */
function recommend(topics,limit){

	
	
	$("menu").trigger('close');
						
	$("#pop-recom").trigger('open');

						
	$("#listitem-recommend").html("");

	
	
	
	navigator.geolocation.getCurrentPosition (function (position)
	{
		var lat = position.coords.latitude;
		var lng = position.coords.longitude;

		var addRecom = function(q){			

			var url = 'https://api.foursquare.com/v2/venues/explore?ll='+lat+','+lng+'&oauth_token=YRWHIGLOVIYI0DHFQE0KG0W4C5IYKVR2CXNB2UXG1V11IHPK&v=20140423&limit='+limit+'&query='+q;
			
			$.getJSON(url,function(data){
				$.each(data.response.groups[0].items,function(key,item){	
					
					var list = "";
					var p1 = new google.maps.LatLng(item.venue.location.lat, item.venue.location.lng);
					var p2 = new google.maps.LatLng(lat, lng);
					var distance = (item.venue.location.distance/1000).toFixed(2);
					
					var address = "";
					if (item.venue.location.address!="")
						address+= item.venue.location.address + " ";	
					if (item.venue.location.postalCode!="")
						address+= item.venue.location.postalCode + " ";						
					if (item.venue.location.city!="")
						address+= item.venue.location.city + " ";		
						
					//var routing = 'https://maps.google.com/maps?saddr=' + lat + ',' + lng + '&daddr=' + item.venue.location.lat + ',' + item.venue.location.lng ;
					var routing = 'javascript:setRouting('+ item.venue.location.lat + ',' + item.venue.location.lng+');';
					if (distance<10){
						list +='<li><a href="'+routing+'" target="_blank">' +item.venue.name+ ' - <i> '+distance+' km</i> '+(item.venue.rating==null ? '' : '- Rate: '+item.venue.rating +"/10")+'<br><font size="1">'+item.venue.categories[0].name+' - '+(item.venue.hours.isOpen=="true" ? "Open" : "Closed")+'<br><i>'+address+'</i></font></a></li>';
						
						$("#listitem-recommend").append(list);
						$("#listitem-recommend").listview("refresh");				
					}
				
				});
			});		
			return this;	
		};
		
		$.each(topics.split(','),function(key,val){
			
			addRecom(val);
		});
		
	
		 
	});
	
}






/*!
 * Search places
 * \author  Hoai-Tuong Nguyen (nhtuong@gmail.com)
 * \fn void search(q)
 * \memberof paris30
 * \param q query
 * \example 
 *      search(q);
 */
function search(q){

	
	navigator.geolocation.getCurrentPosition (function (position)
	{
		var lat = position.coords.latitude;
		var lng = position.coords.longitude;
		var url = 'https://graph.facebook.com/search?q='+q+'&type=place&center='+lat+','+lng+'&distance=500&access_token=462795960457474%7CAFlrvDZJYJSWnhNZYij1ilkw8tU';
		
		$("#page-search #listitem-search").html("");
		$("#page-search #listitem-search").listview("refresh");
		$.getJSON(url, function(result){
			var liste = "";
			$.each(result.data, function(index, item){ 
				var address = "";
				if (item.location.street!="")
					address+= item.location.street;				
				if (item.location.zip!="")
					address+= " " + item.location.zip;
				if (item.location.city!="")
					address+= " " + item.location.city;
				var p1 = new google.maps.LatLng(item.location.latitude, item.location.longitude);
				var p2 = new google.maps.LatLng(lat, lng);
				var distance = google.maps.geometry.spherical.computeDistanceBetween(p1, p2).toFixed(2);
				//var routing = 'https://maps.google.com/maps?saddr=' + lat + ',' + lng + '&daddr=' + item.location.latitude + ',' + item.location.longitude;
				var routing = 'javascript:setRouting('+ item.location.latitude + ',' + item.location.longitude+');';
				liste +='<li><a href="'+routing+'" target="_blank">' +item.name+ ' - <i> '+distance+' m</i><br><font size="1">'+item.category+'<br><i>'+address+'</i></font></a></li>';
			});
			$("#page-search #listitem-search").append(liste);
			$("#page-search #listitem-search").listview("refresh");
		});							 
	});
	
}
