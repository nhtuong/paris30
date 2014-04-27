var stop = [];
function CountdownTimer(elm,tl,mes){
 this.initialize.apply(this,arguments);
}
CountdownTimer.prototype={
 initialize:function(elm,station_id,service,tl,mes) {

 
  this.elem = document.getElementById(elm);
  this.tl = tl;
  this.station_id = station_id;  
  this.mes = mes;
  this.stop = false;
  this.service = service;
  stop[this.station_id] = false;
  //alert(stop);
 },countDown:function(){
  var timer='';
  var today=new Date();
  var day=Math.floor((this.tl-today)/(24*60*60*1000));
  var hour=Math.floor(((this.tl-today)%(24*60*60*1000))/(60*60*1000));
  var min=Math.floor(((this.tl-today)%(24*60*60*1000))/(60*1000))%60;
  var sec=Math.floor(((this.tl-today)%(24*60*60*1000))/1000)%60%60;
  var me=this;

  if (stop[this.station_id]){	
	this.tl - today;
  }
  
  
  
  if( ( this.tl - today ) > 0){
	
   timer += '<span class="number-wrapper"><div class="line"></div><div class="caption"></div><span class="number min">'+this.addZero(min)+'</span></span><span class="number-wrapper"><div class="line"></div><div class="caption"></div><span class="number sec">'+this.addZero(sec)+'</span></span>';
   this.elem.innerHTML = timer;
	//$("#"+this.id).html(timer);
   this.tid = setTimeout( function(){me.countDown();},10 );
	
  }else{
	
	window.clearTimeout(this.tid);

	//this.elem.innerHTML = this.mes;
	//this.stop = true;
	//stop = true;
	
	
	
	//alert(stop[this.station_id]);
	//loadRT();
   //$("#timing").slideUp(1000).delay(0).fadeIn(0);
   //if (!stop[this.station_id]){
   
		stop[this.station_id] = true;
		//setTimeout(function(){loadRT2(this.service,this.station_id);},1000);
		loadRT2(this.service,this.station_id);
		
   //}
	

   return;
  }
 },addZero:function(num){ return ('0'+num).slice(-2); }
}
function CDT(id,station_id,service,m,s){

 // Set countdown limit
 var date = new Date();
 date.setMinutes(date.getMinutes()+m)
 date.setSeconds(date.getSeconds()+s)
 var tl = date;
 


 // You can add time's up message here
 var timer = new CountdownTimer(id,station_id,service,tl,"<span class='number-wrapper'><div class='line'></div><span class='number end'>Train à l'approche</span></span>");
 timer.countDown();
}





function loadRT(service,stop_id){
	
	$.getJSON("http://vietsciexdir.net/api/paris30/getStations.php?service="+service+"&stop_id="+stop_id, function(data){
		
		
		
		$.each(data, function(i, station){
			
			var t1=station.t1.split(":");	
			var t2=station.t2.split(":");	
				
			if (station.t1!="null" && t1[0]==0 && t2[0]==0){
				$("#timing").append('<div id="'+data[0].station+'" style="background-color:blue; color:#FFFFFF; width="200";>'+data[0].station+'</div>');
				var train = '<tr><td><img src="./img/ressources/'+station.type+'.png" width="20"/> <img src="./img/transports/'+station.type+'/'+station.line+'.png" width="20"/></td><td style="width:200px">'+station.destination+'</td>';					
				var times = '<td><div id="CDT-1-'+station.id+'-'+station.dest_id+'" class="CD"></div></td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div id="CDT-2-'+station.id+'-'+station.dest_id+'" class="CD"></div></td></tr>';
				$("#timing").append(train+times+"<br>");	
				
				
		
				CDT('CDT-1-'+station.id+'-'+station.dest_id,station.id,service,parseFloat(t1[1]),parseFloat(t1[2]));	
				CDT('CDT-2-'+station.id+'-'+station.dest_id,station.id,service,parseFloat(t2[1]),parseFloat(t2[2]));					
			}
		});
		
	});
}

function loadRT2(service,stop_id){
	
	$.getJSON("http://vietsciexdir.net/api/paris30/getStations.php?service="+service+"&stop_id="+stop_id, function(data){				

		$.each(data, function(i, station){
				
			var t1=station.t1.split(":");	
			var t2=station.t2.split(":");			

			//stop = false;
			stop[station.id] = false;
			//alert('#CDT-11-'+station.id+'-'+station.dest_id);
			//alert("Here");
			//alert(t1[1]);
			
			$('#CDT-1-'+station.id+'-'+station.dest_id).slideUp(500).delay(0).fadeIn(0);
			$('#CDT-2-'+station.id+'-'+station.dest_id).slideUp(500).delay(0).fadeIn(0);				
			$('#CDT-1-'+station.id+'-'+station.dest_id).empty();
			$('#CDT-2-'+station.id+'-'+station.dest_id).empty();

			CDT('CDT-1-'+station.id+'-'+station.dest_id,station.id,service,parseFloat(t1[1]),parseFloat(t1[2]));	
			CDT('CDT-2-'+station.id+'-'+station.dest_id,station.id,service,parseFloat(t2[1]),parseFloat(t2[2]));	

		
		});
		
	});
}