(function() {'use strict';

	angular.module('RouteSpeed.pages', ['ui.router','RouteSpeed.pages.test', 'RouteSpeed.pages.login' , 'RouteSpeed.pages.stations' , 'RouteSpeed.pages.workers' , 'RouteSpeed.pages.lines' , 'RouteSpeed.pages.static_lines', 'RouteSpeed.pages.sendto', 'RouteSpeed.pages.send_to_hospital', 'RouteSpeed.pages.sort', 'RouteSpeed.pages.reports', 'RouteSpeed.pages.definitions' , 'RouteSpeed.pages.oneroute' , 'RouteSpeed.pages.shifts' , 'RouteSpeed.pages.driver' , 'RouteSpeed.pages.orders', 'RouteSpeed.pages.messengers', 'RouteSpeed.pages.routes', 'RouteSpeed.pages.settings', 'RouteSpeed.pages.dashbord' , 'RouteSpeed.pages.distances']).config(routeConfig).run(function($rootScope, $window, $http, $location,$filter, connectGETService, editableOptions) {
		editableOptions.theme = 'bs3';
		$rootScope.headline = 'הסעות';
		$rootScope.module = 'login';
		$rootScope.order_date = new Date();
		$rootScope.from_date_routes = new Date();
		$rootScope.url = 'http://185.70.251.252/transportation/client/';
		$rootScope.baseUrl = 'http://185.70.251.252/transportation/server/web/index.php?r=';
		$rootScope.imgUrl = 'http://185.70.251.252/transportation/server/web/img/maps/';
		$rootScope.localImgUrl = 'assets/img/iconmap/';
		$rootScope.isNew = true;
		// $rootScope.hospital_email = 'info@mhmc.co.il';
		// $rootScope.hospital_email = 'yeudit@sayyes.co.il';
		var object = localStorage.getItem("authKey");

		/*
		if (!object) {
		
					$location.path('/login');
		
				}*/
		
  	 	// $rootScope.logOut=function(){
	  	 	// localStorage.removeItem("authKey");
	  	 	// $location.path('/login');
	  	 // }
		//$rootScope.getSettings = function() {
            // if(localStorage.getItem("authKey"))
			// connectGETService.fn('definition/alldefinition').then(function(data) {
				// if (data) {
					// $rootScope.settings = data.data;
					// $rootScope.settings.temp_workday_start = new Date($rootScope.settings.workday_start);
					// $rootScope.settings.temp_workday_end = new Date($rootScope.settings.workday_end);
					// if ($rootScope.settings.time_destination_load) {
						// $rootScope.hours = [];
						// var start = ($rootScope.settings.temp_workday_start.getHours() + $rootScope.settings.temp_workday_start.getMinutes() / 100), end = ($rootScope.settings.temp_workday_end.getHours() + $rootScope.settings.temp_workday_end.getMinutes() / 100);
						// if (end < start)
							// end += 24;
						// for (var i = start; i < end; ) {
// 
							// var from = i, to = Math.floor(i) + Math.floor(Math.abs((Math.round(i * 100) % 100) + parseInt($rootScope.settings.time_destination_load)) / 60) + (((Math.abs((Math.round(i * 100) % 100) + parseInt($rootScope.settings.time_destination_load))) % 60) % 100) / 100;
							// var tmp_to = to;
							// if (to >= 24)
								// to = to - 24;
							// if (from >= 24)
								// from -= 24;
							// $rootScope.hours.push({
								// value : (Math.floor(to)) + ":" + (("0" + (Math.round(to * 100) % 100)).slice(-2)) + " - " + (Math.floor(from)) + ":" + (("0" + (Math.round(from * 100) % 100)).slice(-2)),
								// id : (Math.round(from * 100) / 100).toString()
							// });
							// i = tmp_to;
// 
						// };
						// if (to > end) {
							// $rootScope.hours.pop();
						// }
					// }
				// }
// 
			// }, function(e) {
// 
			// });
//////////////////
		//};

		$rootScope.initialize = function() {
			var input = document.getElementsByClassName('searchTextField');
			for (var i = 0; i < input.length; i++) {
				var autocomplete = new google.maps.places.Autocomplete(input[i]);
				google.maps.event.addListener(autocomplete, 'place_changed', function() {
					var place = autocomplete.getPlace();
					document.getElementById('city_' + input[0].id).value = place.name;
					document.getElementById('cityLat_' + input[0].id).value = place.geometry.location.lat();
					document.getElementById('cityLng_' + input[0].id).value = place.geometry.location.lng();

				});
			};

		}
		
    	$rootScope.convertToHebrew = function(date){
    		var day = $filter('date')(date,'EEEE');
    		var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    		var hebrewDays = ['יום ראשון','יום שני','יום שלישי','יום רביעי','יום חמישי','יום שישי','שבת קדש'];
    		return hebrewDays[days.indexOf(day)];
    	}		
		
		// $rootScope.getGeoLocation = function(input) {
			// var autocomplete = new google.maps.places.Autocomplete(input);
			// var place = autocomplete.getPlace();
			// var location = {
				// city : place.name,
				// lat : place.geometry.location.lat(),
				// lng : place.geometry.location.lng()
			// }
			// return location;
		// }
		// $rootScope.routeTo = function(url) {
			// $window.location.href = url;
		// }
	var history = [];
    $rootScope.$on('$stateChangeSuccess', function() {
       	 history.push($location.$$path);
   	 });	
   			 
    $rootScope.back = function () {
        var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
        $location.path(prevUrl);
    };  
    
    function doneyet() { 
	  document.body.onfocus = ""; 
	  alert("after print dialog"); 
	} 	
    
    	$rootScope.print = function(id){
			/*var mywindow = window.open('', 'PRINT', 'height=400,width=600');
		
		    mywindow.document.write('<!DOCTYPE html><html><head><meta charset="utf-8">'+
  			'<meta http-equiv="X-UA-Compatible" content="IE=edge">'+
  			'<meta name="viewport" content="width=device-width, initial-scale=1"><title>' + document.title  + '</title>');
		    mywindow.document.write('</head><body style="direction: rtl;" >');
		    mywindow.document.write('<h1>' + document.title  + '</h1><img style="width: 67px;float: left;" class="ng-scope" src="http://185.70.251.252/transportation/client/assets/img/logo.png">');
		    mywindow.document.write(document.getElementById(id).innerHTML);
		    mywindow.document.write('</body></html>');
		
		    mywindow.document.close(); // necessary for IE >= 10
		    mywindow.focus(); // necessary for IE >= 10*/
		
		    /*mywindow.print();
		    mywindow.close(); 
		    return false;*/
		    /*var html = $('#content').html();
		    $rootScope.print_text = html;
		    $('.printPage').click();*/
		    window.print();
    	}    		 
   			 		
		$rootScope.init = function() {
			
			$http.post($rootScope.baseUrl+'shift/getallshifts')
			.success(function(data){
				$rootScope.shifts = data.shifts;
				$rootScope.shifts_names = data.shifts_names;
			})
			.error(function(){
				
			});
			
			$http.post($rootScope.baseUrl+'messengers/getallmessengers')
			.success(function(data){
				$rootScope.drivers = data;
			})
			.error(function(){
				
			});	
			
			$http.post($rootScope.baseUrl+'staticlines/get_all_static_lines')
			.success(function(data){
				$rootScope.static_lines = data;
			})
			.error(function(){
				
			});	
			
			//$rootScope.getSettings();
		}();
		
		$rootScope.date = new Date();
		$rootScope.shift = null
		
		$rootScope.changeLocation=function(url){
			$location.path(url);
		}

	});

	/** @ngInject */
	function routeConfig($urlRouterProvider, $stateProvider, $mdDateLocaleProvider) {
		$mdDateLocaleProvider.formatDate = function(date) {
			return moment(date).format('D.M.YYYY');
		};

		$urlRouterProvider.otherwise('/stations');

	}

})();
