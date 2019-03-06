
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.oneroute')
      .controller('OnerouteCtrl', OnerouteCtrl);
  /** @ngInject */
  function OnerouteCtrl($scope,$rootScope,$http,$location,$state,$timeout,connectGETService,connectPOSTService,connectDELETEService,$filter) {
    	$rootScope.module=        'oneroute';
    	//$rootScope.imgUrl="http://185.70.251.252/transportation/server/web/img/maps/";
    	$scope.controller=   	   'track';
    	$scope.radio_day = 'all_week';
    	$rootScope.headline='נהול מסלול ' + $rootScope.convertToHebrew($rootScope.date) + ' ' + $filter('date')($rootScope.date, "dd/MM/yyyy") + ' ' + ($scope.track?$scope.track.track.shift:'');
    	$scope.new_shift = 0;
    	
    	$scope.setCurrTrackForEdit = function(track){
    		$scope.currTrackForEdit = track;
    		$scope.currTrackForEdit.isCollect = $scope.currTrackForEdit.track.shift.indexOf('איסוף')!=-1;
    	}
    	
    	$scope.saveWorkers = function(){
    		document.getElementById('loader').style.display = 'block';
    		$http.post($rootScope.baseUrl + $scope.controller + '/save_workers',{data:$scope.currTrackForEdit})
    		.success(function(data){
    			document.getElementById('loader').style.display = 'none';
    			if(data.status != "ok"){
    				document.getElementById('invalidHoursBG').style.background = '#e38996f7';
    				$scope.invalidHoursMessage = data.msg;
	    			angular.element('#invalidHoursBtn').trigger('click');
	    			
    			}else{
    				if(data.msg != ''){
    					document.getElementById('invalidHoursBG').style.background = '#92cfff';
    					$scope.invalidHoursMessage = data.msg;
	    				angular.element('#invalidHoursBtn').trigger('click');    				
    				}else{
    					$rootScope.message = 'נתוני העובדים נשמרו בהצלחה';
	    				angular.element('#saved-toggle').trigger('click');
    				}
    				//if($scope.currTrackForEdit.track.shift.indexOf('איסוף')!=-1){
    				//$scope.currTrackForEdit.workers = $filter('orderBy')($scope.currTrackForEdit.workers, 'hour');
	    			//}
	    			//else{
	    				$scope.currTrackForEdit.workers = $filter('orderBy')($scope.currTrackForEdit.workers, 'track_order');
	    			//}
	    			changeDuration($scope.currTrackForEdit);
	    			
	    			getOneRoute($rootScope.track.track.id);
    			}
    		})
    		.error(function(){
    			document.getElementById('loader').style.display = 'none';
    			$rootScope.message = 'ארעה שגיאה בשמירת נתוני העובדים';
    			angular.element('#saved-toggle').trigger('click');
    		});
    	}
    	
    	$scope.setWorkerToDelete = function(track,worker){
    		$scope.currentTrackOfWorker = track;
    		$scope.currentWorker = worker;
    	}
    	
    	$scope.setWorkerToChange = function(track,worker){
    		$scope.currTrack = track;
    		$scope.currentWorker = worker;
    	}
    	
    	function getReverseShift(shiftId){
    		switch(Number(shiftId))
    		{
    			case 1:
    				return 4;
    				break;
    			case 2:
    				return 5;
    				break;	
    			case 3:
    				return 6;
    				break;
    			case 4:
    				return 1;
    				break;
    			case 5:
    				return 2;
    				break;
    			case 6:
    				return 3;
    				break;				
    		}
    	}
    	
    	$scope.getReverseTrack = function(){
    		if($scope.reverseTrack)
    			return;
			document.getElementById('loader').style.display='block';
			var shift_id = getReverseShift($scope.track.track.shift_id);
			$http.post($rootScope.baseUrl + $scope.controller + '/get_reverse_track',{track:$scope.track.track,shift_id:shift_id})
			.success(function(data){
				document.getElementById('loader').style.display = 'none';
				if(data=='not found'){
					$rootScope.message = 'לא נמצא מסלול נגדי';
					angular.element('#saved-toggle').trigger('click');
				}
				else{
					$scope.reverseTrack = data;
					//if(!$scope.collecting){
					//	$scope.reverseTrack.workers = $filter('orderBy')($scope.reverseTrack.workers, "hour");
					//}
					//else{
						$scope.reverseTrack.workers = $filter('orderBy')($scope.reverseTrack.workers, "track_order");
					//}
		    		// if($scope.reverseTrack.workers && $scope.reverseTrack.workers.length)
		    			// $scope.reverseTrack.start_hour=new Date($scope.reverseTrack.workers[0].hour);					
		    		for(var i=0;$scope.reverseTrack.workers&&i<$scope.reverseTrack.workers.length;i++){
						for(var j=0;$scope.reverseTrack.workers[i].addresses&&j<$scope.reverseTrack.workers[i].addresses.length;j++){
							if($scope.reverseTrack.workers[i].addresses[j].primary_address==1)
								$scope.reverseTrack.workers[i].index = j;
						}
					}
					changeDuration($scope.reverseTrack);				
					// $scope.reverseTrack.trackDuration = 0;
					// angular.forEach($scope.reverseTrack.workers,function(worker){
						// $scope.reverseTrack.trackDuration += Number(worker.duration);
						// worker.hour = new Date($filter('date')($rootScope.date,'MM/dd/yyyy') + ' ' + worker.hour);
					// });
		    		// var place;
		    		 // if($scope.reverseTrack.track.shift.indexOf('איסוף')!=-1){
		    			// place = $scope.reverseTrack.workers.length-1;
		    		// }
		    		// else{
		    			// place = 0;
		    		// }
		    		// if($scope.reverseTrack.workers[place].addresses&&$scope.reverseTrack.workers[place].addresses[$scope.reverseTrack.workers[place].index].travel_time){
		    			// $scope.reverseTrack.trackDuration-=Number($scope.reverseTrack.workers[place].duration);
		    			// $scope.reverseTrack.trackDuration+=Number($scope.reverseTrack.workers[place].addresses[$scope.reverseTrack.workers[place].index].travel_time);
		    		// }					
				}
			})
			.error(function(){
				document.getElementById('loader').style.display='none';
				$rootScope.message='ארעה שגיאה בשליפת מסלול נגדי';
				angular.element('#saved-toggle').trigger('click');
			});    		
    	}
    	
    	$scope.setTrackToDelete = function(track){
    		$scope.trackToDelete = track;
    	}
    	
    	//set first value in select to be the current address
    	$scope.setInitialAddress = function(worker){
    		if(worker.addresses)
    		for(var i = 0;i<worker.addresses.length;i++){
    			// if(addresses[i].is_current==1)
    				// return addresses[i];
    			// worker.address && 
    			if(worker.addresses[i].original_address==worker.address)
    				return worker.addresses[i];
    			// if(worker.addresses[i].is_current==1)
    				// return worker.addresses[i];
    		}
    	}
    	
    	//set <th> of track according to the current shift
		$scope.setTh = function(track){
			var shift = track.track.shift;
			var b = shift.indexOf('פיזור');
			if(b!=-1){
				if(track.track.id==$scope.track.track.id){
					$scope.collecting = false;
				}
				return 'סדר';
			}
			if(track.track.id==$scope.track.track.id){
				$scope.collecting = true;
			}
			return 'שעה';
		}
		
		//order worker by order or hour, according to his current shift
		$scope.sortMe = function(){
			return function(element) {
			  return element.track_order||element.hour;
			}
		}
		
		//delete current track
		$scope.deleteTrack=function(){
			document.getElementById('loader').style.display='block';
			$http.post($rootScope.baseUrl+$scope.controller+'/deletetrack',{track_id:$scope.trackToDelete.track.id}).success(
				function(data) {
					document.getElementById('loader').style.display='none';
					$rootScope.message='הקו נמחק בהצלחה';
					angular.element('#saved-toggle').trigger('click');
					$timeout(function(){
						$location.path('stations');
					},1000);
					})
					.error(function(){
					document.getElementById('loader').style.display='none';
					$rootScope.message='ארעה שגיאה במחיקת הקו';
					angular.element('#saved-toggle').trigger('click');
				});					
		}
		
		$scope.setUpdatedTrack = function(track){
			$scope.updatedTrack = track;
		}
		
		$scope.updateTrack = function(){
			document.getElementById('loader').style.display='block';
			var shift_id = getReverseShift($scope.updatedTrack.track.shift_id);
			var reverse_track_id = null;
			if($scope.reverseTrack){
				reverse_track_id = $scope.reverseTrack.track.id;
			}
			$http.post($rootScope.baseUrl+$scope.controller+'/updatetrackdetails',{data:$scope.updatedTrack,reverse_track_id:reverse_track_id})
			.success(function(data){
				document.getElementById('loader').style.display='none';
				$scope.updatedTrack.track.description = data;
				// if($scope.reverseTrack){
					// if($scope.updatedTrack.track.id==$scope.track.track.id){
						// $scope.reverseTrack.track.combined_line = $scope.track.track.combined_line;
					// }
					// else{
						// $scope.track.track.combined_line = $scope.reverseTrack.track.combined_line;
					// }					
				// }
				$rootScope.message='פרטי המסלול עודכנו בהצלחה';
				angular.element('#saved-toggle').trigger('click');
			})
			.error(function(){
				document.getElementById('loader').style.display='none';
				$rootScope.message='ארעה שגיאה בעדכון פרטי המסלול';
				angular.element('#saved-toggle').trigger('click');
			});
		}
		
		//save track's details
		$scope.save = function(){
			document.getElementById('loader').style.display = 'block';
			// $scope.track.workers[0].hour = new Date($scope.track.start_hour);
			$http.post($rootScope.baseUrl + $scope.controller + '/updatetrack',{data:$scope.track,worker_id:$scope.track.workers[0].id,start_hour:$scope.track.start_hour}).success(
				function(data) {
					document.getElementById('loader').style.display = 'none';
					if(data!='updated')
						$rootScope.message = 'ארעה שגיאה בעדכון הנתונים';
					else
						$rootScope.message = 'הנתונים התעדכנו';
					// if($scope.collecting)
						// calculateHourByWaiting();
					angular.element('#saved-toggle').trigger('click');})
				.error(function(){
					$rootScope.message = 'ארעה שגיאה בעדכון הנתונים';
					angular.element('#saved-toggle').trigger('click');
					document.getElementById('loader').style.display='none';
				});
		}
		
    	//delete worker
    	$scope.deleteWorker = function(){
    		document.getElementById('loader').style.display='block';
    		$scope.deletedWorker=$scope.currentWorker;
    		var i = 0;
    		for(;i<$scope.currentTrackOfWorker.workers.length&&$scope.currentTrackOfWorker.workers[i].id!=$scope.deletedWorker.id;i++);
    		$scope.currentTrackOfWorker.workers.splice(i,1);
    		var index = 1;
    		angular.forEach($scope.currentTrackOfWorker.workers,function(worker){
    			worker.track_order = index++;
    		});
    		$http.post($rootScope.baseUrl + $scope.controller + '/deleteworker',{worker_id:$scope.deletedWorker.id,track:$scope.currentTrackOfWorker}).success(
				function(data) {
					document.getElementById('loader').style.display='none';
					if(data!='deleted')
						$rootScope.message = 'ארעה שגיאה במחיקת העובד מקו זה';
					else
						$rootScope.message = 'העובד נמחק מקו זה';
					})
				.error(function(){
					$rootScope.message='ארעה שגיאה במחיקת העובד מקו זה';
				});
				angular.element('#saved-toggle').trigger('click');
				if(document.getElementById('mymap').style.display=='block')
					$scope.showMap($scope.currentTrackOfWorker);
				changeDuration($scope.currentTrackOfWorker);
    	}
    	
    	Date.prototype.addMinutes = function(minutes) {
	    var copiedDate = new Date(this.getTime());
	    return new Date(copiedDate.getTime() + minutes * 60000);
	}
    	
    	//claculating hour of worker by sum prev worker hour and prev worker duration
    	function calculateHourByWaiting (track) {
    		if(!track.workers)
    			return;
    		// if($scope.toCalc){
    			// for(var i=1;i<$scope.track.workers.length;i++){
		  	// if(i==1){
		  		// $scope.track.workers[i].hour=$scope.track.start_hour.addMinutes($scope.track.workers[i-1].duration);
		  	// }
		  	// else{
		  		// $scope.track.workers[i].hour=$scope.track.workers[i-1].hour.addMinutes($scope.track.workers[i-1].duration);	
		  	// }
		  // }
    	// }
		  // $scope.track.workers[0].hour = new Date($scope.track.start_hour);
		  // $scope.track.workers = $filter('orderBy')($scope.track.workers, "hour");
		  document.getElementById('loader').style.display = 'block';
    		$http.post($rootScope.baseUrl + $scope.controller + '/changehours',{workers:track.workers,track_id:track.track.id}).success(
				function(data) {
					document.getElementById('loader').style.display = 'none';
					if(data.status !="ok")
						$rootScope.message=data.msg;//'ארעה שגיאה בשמירת השעות';
					else
						$rootScope.message='השעות נשמרו לפי הסדר הנוכחי';
					// angular.element('#saved-toggle').trigger('click');
					document.getElementById('loader').style.display = 'none';
				}).error(function(){
					$rootScope.message='ארעה שגיאה בשמירת השעות';
					document.getElementById('loader').style.display = 'none';
					// angular.element('#saved-toggle').trigger('click');
				});
		}
    	
    	//copy workers list
    	$scope.copyList=function(track,worker){
    		// $scope.copied_workers=angular.copy($scope.track.workers);
    		$scope.copied_workers=angular.copy(track.workers);
    		$scope.old_track = track.track.id;
    		$scope.drag_worker = worker.id;
    	}
    	
    	$scope.updateWorkerOrder = function(track,list){
    		$scope.currentRoute = track;
    		var i = 1;
    		angular.forEach(list,function(worker){
    			worker.track_order = i++;
    			//worker.duration = Number($scope.copied_workers[i-2].duration);
    			// if($scope.currentRoute.track.id==$scope.track.track.id)
    				// worker.hour = new Date($scope.copied_workers[i-2].hour);
    			// else
    				//worker.hour = $scope.copied_workers[i-2].hour;
    			worker = worker;
    		});
    		// $scope.track.workers=list;
    		document.getElementById('loader').style.display = 'block';
    		if(track.track.id!=$scope.old_track){
    			$http.post($rootScope.baseUrl + $scope.controller + '/addworkertotrack',{worker_id:$scope.drag_worker,new_track_id:track.track.id,old_track_id:$scope.old_track}).success(
				function(data) {
					if(data=='exists'){
						$scope.exists = true;
						$rootScope.message = 'העובד כבר קיים במסלול זה';
						angular.element('#saved-toggle').trigger('click');
					}
					document.getElementById('loader').style.display = 'none';
					getOneRoute($scope.track.track.id);
					getOneNewRoute($scope.newTrack.track.id);   
					})
			       	.error(function(){
			       		$rootScope.message = 'ארעה שגיאה בשמירת הנתונים';
			       		angular.element('#saved-toggle').trigger('click');
			       		document.getElementById('loader').style.display = 'none';
			       	});
    		}
    		$http.post($rootScope.baseUrl + $scope.controller + '/updateworkerorder',{workers:list,track_id:$scope.currentRoute.track.id}).success(
				function(data) {
					document.getElementById('loader').style.display='none';
					if(data!='changed')
						$rootScope.message = 'ארעה שגיאה בעדכון הנתונים';
					else
						$rootScope.message = 'הנתונים התעדכנו';
//					if($scope.collecting || (!$scope.collecting)&&$scope.reverseTrack!=undefined&&$scope.currentRoute.track.id==$scope.reverseTrack.track.id) // הורדתי כי לאחר גרירה לפעמים לא התעדכנו מרחקים נכונים
						calculateHourByWaiting($scope.currentRoute);
					angular.element('#saved-toggle').trigger('click');
			if(document.getElementById('mymap').style.display=='block')
				$scope.showMap($scope.currentRoute);
				getOneRoute($rootScope.track.track.id);
				})						
				.error(function(){
					$rootScope.message = 'ארעה שגיאה בעדכון הנתונים';
					angular.element('#saved-toggle').trigger('click');
					document.getElementById('loader').style.display = 'none';
				});
    		//if($scope.collecting||(!$scope.collecting&&$scope.currentRoute.track.id==$scope.reverseTrack.track.id))
			//	$scope.track.workers=$filter('orderBy')($scope.track.workers, "hour");
			//else if(!$scope.collecting||(!$scope.collecting&&$scope.currentRoute.track.id==$scope.track.track.id))
				$scope.track.workers=$filter('orderBy')($scope.track.workers, "track_order");
    		if(!$scope.$$phase)
    			$scope.$apply();
    	}
    	
	  	 var map;
	  	 //set map
    	function myMap(way,start,end,last_id,first_id) {
    		var center;
    		if(way.length)
    			center=way[Math.floor(way.length/2)].location;
    		// else
    			// center=;
			var mapCanvas = document.getElementById("mymap");
			var mapOptions = {center: center, zoom: 11};
			// ,mapTypeId: google.maps.MapTypeId.ROADMAP;
			map = new google.maps.Map(mapCanvas,mapOptions);
			// var flightPath = new google.maps.Polyline({
			    // path: way,
			    // strokeColor: "#0000FF",
			    // strokeOpacity: 0.8,
			    // strokeWeight: 2
			  // });
			  
			  // //if there is a way with two or more places
			  // if(way.length>1)
			 	// flightPath.setMap(map);
			 // else{
			 	// var marker = new google.maps.Marker({position:way[0]});
  				 // marker.setMap(map);
			 // }
			 
			// angular.forEach(way,function(waypoint){
				// console.log('lat '+waypoint.location.lat());
				// console.log('lng '+waypoint.location.lng());
			// });
						 
			 //directions
			 var directionsDisplay = new google.maps.DirectionsRenderer;
			  directionsDisplay.setMap(map);
			var directionsService=new google.maps.DirectionsService;
			 directionsService.route({
            	origin: start,
			 	waypoints:way,
           		destination: end,
			 	travelMode: google.maps.TravelMode.DRIVING}
			 	, function(response, status) {
          if (status == 'OK') {
            directionsDisplay.setDirections(response);
            document.getElementById('duration').style.display = 'block';
            var sum = 0;
            for(var i = 0;i<directionsDisplay.directions.routes[0].legs.length;i++){
            	sum+=directionsDisplay.directions.routes[0].legs[i].duration.value;
            }
            sum/=60;
            var message;
            if(sum>60)
            	message = Math.floor(sum/60).toString() + ' שעות ו' + Math.round(sum%60).toString() + ' דקות';
            else
            	message = Math.round(sum).toString()+' דקות';
            	
            //change content of element according to travel time
            document.getElementById('duration').innerHTML='משך המסלול: '+message;
          } else {
            alert('שגיאה בחישוב מסלול');
          }
        });
		 }
		 
	  	 //show map
	  	 $scope.showMap = function(track){
	  	 	
	  	 	$scope.trackOfMap = track;
	  	 	
	  	 	var way = [];
	  	 	var hospitalLocation = new google.maps.LatLng(32.0851095,34.8440055);
			var start,end,i,length,tmp;
			
			// make an array off all addresses
			var waypoint = {};
			
			//if track-shift is collect
			if(($scope.collecting&&$scope.trackOfMap.track.id==$scope.track.track.id)||(!$scope.collecting&&$scope.reverseTrack&&$scope.trackOfMap.track.id==$scope.reverseTrack.track.id)
			||(!$scope.collecting&&$scope.newTrack&&$scope.trackOfMap.track.id==$scope.newTrack.track.id)){
				i = 1;
				length = $scope.trackOfMap.workers.length;
				// start=new google.maps.LatLng($scope.track.workers[0].addresses[$scope.track.workers[0].index].lat,$scope.track.workers[0].addresses[$scope.track.workers[0].index].lng);
				start = $scope.trackOfMap.workers[0].addresses[$scope.trackOfMap.workers[0].index].original_address;
				end = hospitalLocation;
			}
			else if((!$scope.collecting&&$scope.trackOfMap.track.id==$scope.track.track.id)||($scope.collecting&&$scope.trackOfMap.track.id==$scope.reverseTrack.track.id)
			||($scope.collecting&&$scope.trackOfMap.track.id==$scope.newTrack.track.id)){
				i = 0;
				length = $scope.trackOfMap.workers.length-1;
				start = hospitalLocation;
				// end=new google.maps.LatLng($scope.track.workers[length].addresses[$scope.track.workers[length].index].lat,$scope.track.workers[length].addresses[$scope.track.workers[length].index].lng);
				end = $scope.trackOfMap.workers[length].addresses[$scope.trackOfMap.workers[length].index].original_address;
			}
			for(waypoint = {};i<length;i++){
				// if($scope.track.workers[i].addresses[$scope.track.workers[i].index].lat){
					// waypoint.location=new google.maps.LatLng($scope.track.workers[i].addresses[$scope.track.workers[i].index].lat,$scope.track.workers[i].addresses[$scope.track.workers[i].index].lng);
					// console.log('lat in '+i+' : '+waypoint.location.lat());
					// console.log('lng in '+i+' : '+waypoint.location.lng());
					if($scope.trackOfMap.workers[i].addresses){
						waypoint.location = $scope.trackOfMap.workers[i].addresses[$scope.trackOfMap.workers[i].index].original_address;
						waypoint.stopover = true;
						tmp = angular.copy(waypoint);
						way.push(tmp);
					}
				// }
					// way.push(new google.maps.LatLng(Number($scope.track.workers[i].addresses[$scope.track.workers[i].index].lat),Number($scope.track.workers[i].addresses[$scope.track.workers[i].index].lng)));
			}
			//$rootScope.message='שגיאה בחישוב מסלול';
	  	 	document.getElementById('mymap').style.display = 'block';
	  	 	var first_id = $scope.trackOfMap.workers[0].id;
	  	 	var last_id = $scope.trackOfMap.workers[$scope.trackOfMap.workers.length-1].id;
	  	 	myMap(way,start,end,last_id,first_id);
	  	 }
    	
    	//change track order
    	$scope.changeTrackOrder = function(track){
    		if(!track.workers.length || track.workers.length<2){
    			return;
    		}
    		$scope.currentTrack = track;
    		var j = 1;
    		for(var i = $scope.currentTrack.workers.length-1;i>-1;i--){
    			$scope.currentTrack.workers[i].track_order = j++;
    		}
    		document.getElementById('loader').style.display = 'block';
			$http.post($rootScope.baseUrl + $scope.controller + '/changetrackorder',{track_id:$scope.currentTrack.track.id,workers:$scope.currentTrack.workers}).success(
				function(data) {
					document.getElementById('loader').style.display = 'none';
					if(data!='changed')
						$rootScope.message = 'ארעה שגיאה בהפיכת המסלול';
					else{
						
						$rootScope.message = 'הפיכת המסלול נשמרה';
						// if($scope.currentTrack.track.shift.indexOf('איסוף'==-1))
							 $scope.currentTrack.workers = $filter('orderBy')($scope.currentTrack.workers, "track_order");
						if(document.getElementById('mymap').style.display=='block')
							$scope.showMap($scope.currentTrack);		
						changeDuration($scope.currentTrack);								
					}
					angular.element('#saved-toggle').trigger('click');
				})
				.error(function(){
					document.getElementById('loader').style.display = 'none';
					$rootScope.message = 'ארעה שגיאה בהפיכת המסלול';
					angular.element('#saved-toggle').trigger('click');
				});
    	}
    	
    	//change total duration of track
    	function changeDuration (track) {
    		if(!track.workers)
    			return;
    		
			//set total duration for all track
    		track.trackDuration = 0;
    		for(var i = 0;i<track.workers.length;i++){
    			track.trackDuration+=Number(track.workers[i].duration);
    		}
    		var place;
    		 if(track.track.shift.indexOf('איסוף')!=-1){
    			place=track.workers.length-1;
    		}
    		else{
    			place = 0;
    		}
    		if(track.workers.length>0&&track.workers[place].addresses&&track.workers[place].addresses[track.workers[place].index].travel_time){
    			track.trackDuration-=Number(track.workers[place].duration);
    			track.trackDuration+=Number(track.workers[place].addresses[track.workers[place].index].travel_time);
    		}
		}
		
		$scope.setCurrTrack = function(track){
			$scope.currTrack = track;
		}
		
		//add worker to track
		$scope.addWorker = function(){
			if(!$scope.worker)
				return;
			document.getElementById('loader').style.display = 'block';
			$http.post($rootScope.baseUrl + $scope.controller + '/addworkertoline',{track_id:$scope.currTrack.track.id,worker:$scope.worker,order:!$scope.currTrack.workers?1:$scope.currTrack.workers.length+1}).success(
				function(data) {
					document.getElementById('loader').style.display = 'none';
					if(data.data&&data.data.includes('exists in current track'))
						$rootScope.message = 'העובד כבר קיים במסלול זה';
					else if(data.data&&data.data.includes('exists in current shift'))
						$rootScope.message = 'העובד כבר משובץ  היום במסלול אחר במשמרת הנוכחית';
					else{
						$rootScope.message = 'העובד נוסף למסלול';
						$scope.worker.index = 0;
						$scope.worker.duration = 0;
						$scope.worker.hour = new Date($filter('date')($rootScope.date,'MM/dd/yyyy') + ' ' + data.hour);
						// for(var i = 0;i<$scope.worker.addresses.length;i++){
							// if($scope.worker.addresses[i].primary_address==1){
								// $scope.worker.index = i;
								// break;
							// }
						// }
						for(var i = 0;i<$scope.worker.addresses.length;i++){
							if($scope.worker.addresses[i].original_address==$scope.worker.address){
								$scope.worker.index = i;
								break;
							}
						}
						// $scope.worker.index = $scope.setInitialAddress($scope.worker);
						if(!$scope.currTrack.workers)
							$scope.currTrack.workers = [];
						$scope.currTrack.workers.push($scope.worker);
						if($scope.currTrack.track.shift.indexOf('איסוף')!=-1){
							calculateHourByWaiting($scope.currTrack);
						//	$scope.track.workers = $filter('orderBy')($scope.track.workers, 'hour');
						}
						changeDuration($scope.currTrack);
					}
					angular.element('#saved-toggle').trigger('click');
					
				})
				.error(function(){
					$rootScope.message = 'ארעה שגיאה בהוספת העובד למסלול';
					angular.element('#saved-toggle').trigger('click');
					document.getElementById('loader').style.display = 'none';
				});
		}
		
		$scope.changeWorkerShift = function(){
			document.getElementById('loader').style.display = 'block';
			$http.post($rootScope.baseUrl + $scope.controller + '/change_shift',{worker_id:$scope.currentWorker.id,track:$scope.currTrack,shift:$scope.new_shift,line:$scope.new_line,order:!$scope.currTrack.workers?1:$scope.currTrack.workers.length+1}).success(
			function(data) {
				document.getElementById('loader').style.display = 'none';
				if(data=='success')
					$rootScope.message = 'העובד הועבר משמרת';
				else{
					$rootScope.message = 'ארעה שגיאה';

				}
				angular.element('#saved-toggle').trigger('click');
				changeDuration($scope.currTrack);
			})
			.error(function(){
				$rootScope.message = 'ארעה שגיאה';
				angular.element('#saved-toggle').trigger('click');
				document.getElementById('loader').style.display = 'none';
			});
		}
		
		//add new line
		// $scope.addNewLine = function(){
			// if(!$scope.newLine)
				// return;
			// document.getElementById('loader').style.display='block';
			// $http.post($rootScope.baseUrl+$scope.controller+'/addnewline',{new_line:$scope.newLine,today:$scope.track.track.track_date}).success(
				// function(data) {
					// document.getElementById('loader').style.display='none';
					// if(data=='line exists')
						// $rootScope.message='הקו כבר קיים במערכת';
					// else
						// $rootScope.message='הקו נוסף בהצלחה';
					// angular.element('#saved-toggle').trigger('click');					
					// })
					// .error(function(){
					// document.getElementById('loader').style.display='none';
					// $rootScope.message='ארעה שגיאה בהוספת הקו';
					// angular.element('#saved-toggle').trigger('click');
				// });					
		// }
		
		function getOneRoute(track_id){
			document.getElementById('loader').style.display = 'block';
			$http.post($rootScope.baseUrl + $scope.controller + '/get_one_route',{track_id:track_id})
			.success(function(data){
				document.getElementById('loader').style.display = 'none';
				$scope.track = data;
				$scope.track_lines = $scope.track.lines;
				angular.forEach($scope.track.workers,function(worker){
					worker.hour = new Date($filter('date')($rootScope.date,'MM/dd/yyyy') + ' ' + worker.hour);
					// worker.index = worker.addresses.findIndex(a=>a.primary_address==1);
					worker.index = worker.addresses.findIndex(a=>a.original_address==worker.address);
				});
	    		if($scope.track && $scope.track.workers && $scope.track.workers.length){
	    			//2018-01-29 $rootScope.date=new Date($scope.track.track.track_date);
	    			if($rootScope.shift && $rootScope.shift!=''){
	    				$rootScope.shift = $scope.track.track.shift;
	    			}
	    		}				
				//calculate total duration of track
	    		changeDuration($scope.track);
		    		
				// $scope.toCalc=true;
				
				// if($scope.track && $scope.track.track.shift.indexOf('איסוף')!=-1)
					// calculateHourByWaiting($scope.track);
					
				//convert duration of each worker to number
				angular.forEach($scope.track.workers,function(worker){
					worker.duration = Number(worker.duration);
				});
				
				// //order workers according to shift
				//if($scope.track.track.shift.indexOf('איסוף')!=-1){
				//	$scope.track.workers = $filter('orderBy')($scope.track.workers, "hour");
				//	$scope.track.workers = $filter('orderBy')($scope.track.workers, "track_order");
				//}
				//else
					$scope.track.workers = $filter('orderBy')($scope.track.workers, "track_order");
					
				if($scope.track && $scope.track.track.shift.indexOf('איסוף')!=-1)
					calculateHourByWaiting($scope.track);
				
				// // for $rootScope.track without getOneRoute()
				// // convert mysql date to js date
				// var hourStr;
				// for(var i = 0;$scope.track.workers&&i<$scope.track.workers.length;i++){
					// $scope.track.workers[i].hour = new Date($filter('date')($rootScope.date,'MM/dd/yyyy') + ' ' + $scope.track.workers[i].hour);
					// // $scope.track.workers[i].hour=new Date($scope.track.workers[i].hour);
					// // hourStr=$scope.track.workers[i].hour|"00:00:00";
					// // hourStr=$scope.track.workers[i].hour.getHours()+':'+$scope.track.workers[i].hour.getMinutes+':'+$scope.track.workers[i].hour.getSeconds()|"00:00:00";
					// // $scope.track.workers[i].hour=new Date($rootScope.current_date+' '+hourStr);
				// }
	    		
	    		// //set primary address index
	    		// for(var i=0;$scope.track.workers&&i<$scope.track.workers.length;i++){
					// for(var j=0;$scope.track.workers[i].addresses&&j<$scope.track.workers[i].addresses.length;j++){
						// if($scope.track.workers[i].addresses[j].primary_address==1)
							// $scope.track.workers[i].index = j;
					// }
				// }
				// for(var i=0;i<$scope.track.workers.length;i++){
					// $scope.track.workers[i].index = 0;
				// }
				
				
				//set shift of worker equals to track's shift
				var duration = 0;
				for(var i = 0;$scope.track.workers&&i<$scope.track.workers.length;i++){
					$scope.track.workers[i].shift = $scope.track.track.shift;
					if((($scope.track.track.shift.indexOf('איסוף')!=-1)&&i==$scope.track.workers.length-1)||(($scope.track.track.shift.indexOf('איסוף')==-1)&&i==0)){
						var travel_time = 0;
						if($scope.track.workers[i].addresses){
							for(var j = 0;j<$scope.track.workers[i].addresses.length;j++){
				    			if($scope.track.workers[i].addresses[j].original_address==$scope.track.workers[i].address)
				    				travel_time = $scope.track.workers[i].addresses[j].travel_time;
				    		}
						}           
						if(travel_time){
							duration = parseInt(duration) + parseInt(travel_time);
						}
						
					}
					else{
						duration = parseInt(duration) + parseInt($scope.track.workers[i].duration); 
					}
				}	
				$scope.track.trackDuration = duration;			    						
			})
			.error(function(){
				document.getElementById('loader').style.display = 'none';
				$rootScope.message = 'ארעה שגיאה שליפת נתוני מסלול';
				angular.element('#saved-toggle').trigger('click');
			});
		}
		
		function getOneNewRoute(track_id){
			document.getElementById('loader').style.display = 'block';
			$http.post($rootScope.baseUrl + $scope.controller + '/get_one_route',{track_id:track_id})
			.success(function(data){
				document.getElementById('loader').style.display = 'none';
				$scope.newTrack = data;
				$scope.newTrack.saved = 1;
				angular.forEach($scope.newTrack.workers,function(worker){
					worker.hour = new Date($filter('date')($rootScope.date,'MM/dd/yyyy') + ' ' + worker.hour);
					worker.index = worker.addresses.findIndex(a=>a.original_address==worker.address);
				});
	    		if($scope.newTrack && $scope.newTrack.workers && $scope.newTrack.workers.length){
	    			if($rootScope.shift && $rootScope.shift!=''){
	    				$rootScope.shift = $scope.newTrack.track.shift;
	    			}
	    		}				
				//calculate total duration of track
	    		changeDuration($scope.newTrack);				
				//convert duration of each worker to number
				angular.forEach($scope.newTrack.workers,function(worker){
					worker.duration = Number(worker.duration);
				});				
				$scope.newTrack.workers = $filter('orderBy')($scope.newTrack.workers, "track_order");					
				if($scope.newTrack && $scope.newTrack.track.shift.indexOf('איסוף')!=-1)
					calculateHourByWaiting($scope.newTrack);
				//set shift of worker equals to track's shift
				var duration = 0;
				for(var i = 0;$scope.newTrack.workers&&i<$scope.newTrack.workers.length;i++){
					$scope.newTrack.workers[i].shift = $scope.newTrack.track.shift;
					if((($scope.newTrack.track.shift.indexOf('איסוף')!=-1)&&i==$scope.newTrack.workers.length-1)||(($scope.newTrack.track.shift.indexOf('איסוף')==-1)&&i==0)){
						var travel_time = 0;
						if($scope.newTrack.workers[i].addresses){
							for(var j = 0;j<$scope.newTrack.workers[i].addresses.length;j++){
				    			if($scope.newTrack.workers[i].addresses[j].original_address==$scope.newTrack.workers[i].address)
				    				travel_time = $scope.newTrack.workers[i].addresses[j].travel_time;
				    		}
						}           
						if(travel_time){
							duration = parseInt(duration) + parseInt(travel_time);
						}
						
					}
					else{
						duration = parseInt(duration) + parseInt($scope.newTrack.workers[i].duration); 
					}
				}	
				$scope.newTrack.trackDuration = duration;			    						
			})
			.error(function(){
				document.getElementById('loader').style.display = 'none';
				$rootScope.message = 'ארעה שגיאה שליפת נתוני מסלול';
				angular.element('#saved-toggle').trigger('click');
			});
		}
		
    	//first function for initialize the page
    	function init(){
    		if(!$rootScope.track || !$rootScope.track.track.id){
    			// $rootScope.date = null;
    			// $rootScope.shift = null;
    			$location.path('/stations');
    			return;
    		}
    		getOneRoute($rootScope.track.track.id);
    		// $scope.track = $rootScope.track;
    		// $rootScope.track = {track:{},workers:{}};

    		
    		// for $rootScope.track without getOneRoute()
    		// if($scope.track && $scope.track.workers && $scope.track.workers.length)
    			// $scope.track.start_hour=new Date($scope.track.workers[0].hour);
    		
			//get all workers
			document.getElementById('loader').style.display='block';
			$http.post($rootScope.baseUrl+'worker/getallworkers',{track:$rootScope.track.track.id}).success(
				function(data) {
					document.getElementById('loader').style.display='none';
					$scope.workers = data.workers;
					})
					.error(function(){
					$rootScope.message='ארעה שגיאה בשליפת עובדים';
					angular.element('#saved-toggle').trigger('click');
				});			

    	}
    	
    	init();
    	
    	$scope.addNewTrack = function(){
			if(!$scope.newTrack)
				return;
			document.getElementById('loader').style.display='block';
			$http.post($rootScope.baseUrl+$scope.controller+'/addnewline',{new_line:$scope.newTrack,today:$rootScope.date,get_model:1})
			.success(function(data) {
					document.getElementById('loader').style.display='none';
					if(data=='line exists')
						$rootScope.message='הקו כבר קיים במערכת';
					else
						$rootScope.message='הקו נוסף בהצלחה';
					angular.element('#saved-toggle').trigger('click');
					$scope.newTrack = data;
					$scope.newTrack.saved = 1;
			 })
			.error(function(){
					document.getElementById('loader').style.display='none';
					$rootScope.message='ארעה שגיאה בהוספת הקו';
					angular.element('#saved-toggle').trigger('click');
			 });					
		}
  }

})();
