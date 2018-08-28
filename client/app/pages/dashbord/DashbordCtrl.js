(function() {'use strict';

	angular.module('RouteSpeed.pages.dashbord').controller('DashbordCtrl', DashbordCtrl);

	/** @ngInject */
	function DashbordCtrl($scope, $rootScope, connectGETService, $filter) {
		var track_markers = [];
		var test_arrays = [];
		var markers = [];
		var center1;
		var map;
		var k = 0;
		var mapDiv;
		var directionsDisplay = [];
		var drives_markers = [];
		var drivers_interval;
		$rootScope.module = 'dashbord';
		var g_response = [];
		$scope.controller = 'track';
		$scope.routes = [];
		$scope.currentRoute = false;
		$scope.now = true;
		/*
		function compare(a, b) {
					if (a.stop_index < b.stop_index)
						return -1;
					if (a.stop_index > b.stop_index)
						return 1;
					return 0;
				}
		*/
		
		
	$scope.$on('$destroy',function(){
    	if(drivers_interval)
    	clearInterval(drivers_interval);
	});



	$scope.getTime = function(timeInSeconds) {
		var t = timeInSeconds / 60 / 60;
		t = Math.round(t * 100) / 100;

		var rem_part = t % 1;
		rem_part = rem_part * (60 / 100);

		var int_part = Math.floor(t);
		var result = int_part + rem_part;
		result = Math.round(result * 100) / 100;
		rem_part = Math.round(rem_part * 100) / 100;
		var a = rem_part.toString();
		if (a.length < 4 && a.length > 1) {
			result = result + '0';
		}
		return result;

	}


		$scope.test_splitArray = function() {
			var array = test_routes;
			for (var i = 0; i < array.length; ) {
				if (array[i]) {
					var track_id = array[i].track;
					var next_track = track_id;
					var temp_array = [];
					while (track_id === next_track && i < array.length) {
						temp_array.push({
							lat : array[i].lat,
							lng : array[i].lng
						});
						i++;
						if (i < array.length) {
							next_track = array[i].track;
						}

					}
					if (temp_array.length > 0) {
						test_arrays.push({
							track_id : track_id,
							coordinates : temp_array
						});
					}
				} else {
					console.log(i);
				}
			}
			setIntervals_test();
		}
		function setmarkers(coordinates, marker, i) {
			marker[i].setPosition(new google.maps.LatLng(coordinates.lat, coordinates.lng));
		}

		function doSetTime(i, j, markers, d) {
			var s = setTimeout(function() {
				setmarkers(test_arrays[i].coordinates[j], markers, i);
				console.log(i + ' j ' + j);
			}, d);
		}

		function setIntervals_test() {

			var delay = 4000;
			var settimeouts = [];
			for (var i = 0; i < test_arrays.length; i++) {
				var marker;
				var delay = 4000;
				//var len = test_arrays[i].coordinates.length >60?60:20;
				for (var j = 30; j < test_arrays[i].coordinates.length; j++) {
					if (j == 30) {
						var index = $filter('getByIdFilter')($scope.routes, "" + test_arrays[i].track_id + "");
						if (index == null || index == 'undefined' || index == -1) {

							marker = makeMarker1(new google.maps.LatLng(test_arrays[i].coordinates[j].lat, test_arrays[i].coordinates[j].lng), map, "" + test_arrays[i].track_id + "")
						} else {
							var current_r = $scope.routes[index];
							var driver_icon = $rootScope.localImgUrl + 'car' + (current_r.color + 1) + '.png';
							var title = current_r.messenger.name + ' ' + current_r.messenger.lastname;
							marker = makeMarker_test(new google.maps.LatLng(test_arrays[i].coordinates[j].lat, test_arrays[i].coordinates[j].lng), driver_icon, map, title);

						}
						markers.push(marker);
					}

					doSetTime(i, j, markers, delay);

					delay += 4000;
				}
			}
		}

		function refreshDrivers() {

			connectGETService.fn($scope.controller + '/tracknow').then(function(response) {
				if (response.data.length > 0 && response.data != 'error') {
                   		$scope.routes = response.data; 
	                  var index =	$filter('getByIdFilter')($scope.routes, $rootScope.selectedRoute.id);
	                  if(index>-1)
	                     $scope.orders=$scope.routes[index].orders;
					for (var i = 0; i < drives_markers.length; i++) {
						var index = $filter('getByIdFilter')(response.data, drives_markers[i].track_id);
						var index1 = $filter('getByIdFilter')($scope.routes, drives_markers[i].track_id);
						if (index >= 0 && index1 >= 0 && $scope.routes[index1].color >= 0) {
							drives_markers[i].marker.setPosition(new google.maps.LatLng(response.data[index].messenger.lat, response.data[index].messenger.lng));

						}
						//drivers_intervals
					}
				}

			}, function(error) {
			});

		}

		function setDrivesInterval() {
			drivers_interval = setInterval(refreshDrivers, 5000);
		}

		//init drives' icons on map
		$scope.initDrivers = function(data) {

			for (var i = 0; i < 10 && i < data.length; i++) {
				var driver_icon = $rootScope.localImgUrl + 'car' + (data[i].color + 1) + '.png';
				var title = data[i].messenger.name + ' ' + data[i].messenger.lastname;
				var driver_lat = Number(data[i].messenger.lat);
				var driver_lng = Number(data[i].messenger.lng);
				var mkr = makeMarker(new google.maps.LatLng(driver_lat, driver_lng), driver_icon, map, title);
				drives_markers.push({
					track_id : data[i].id,
					marker : mkr
				});
			}
			setDrivesInterval();

		}

		$scope.getRoutes = function() {
			connectGETService.fn($scope.controller + '/tracknow').then(function(response) {

				if (response.data.length > 0 && response.data != 'error') {

					$scope.routes = response.data;

					/*
					 for (var g = 0; g < 10 && g < $scope.routes.length; g++) {
					 $scope.routes[g].color = g;
					 colors[g].occupied = 1;
					 }*/

					var i, j;
					if ($scope.routes[0].orders) {
						$scope.orders = $scope.routes[0].orders;
						$scope.currentRoute = true;
						//$scope.$apply();
					}

					//search for the least occupied color
					for ( i = 0; i < $scope.routes.length; i++) {

						for (var g = 0; g < 100; g++) {
							for (var h = 0; h < colors.length && colors[h].occupied != g; h++);
							if (h < colors.length) {
								break;
							}
						}

						if (h < colors.length) {
							$scope.routes[i].color = h;
							colors[h].occupied += 1;
						}
						var orders = $scope.routes[i].orders;
						//var orders = orders.sort(compare);
						if (orders && orders != "undefined") {

							for ( j = 0; j < orders.length && orders[j].status != 0; j++);
							$scope.routes[i].curr_index = j;
							$scope.routes[i].current_stop = orders[j];

						}
					}

					$scope.selectRoute($scope.routes[0]);
					$scope.initDrivers(response.data);
				} else {
					var map1;
					var center1 = {
						lat : 32.045,
						lng : 34.7507
					};
					map1 = new google.maps.Map(document.getElementById('mymap'), {
						zoom : 11,
						center : center1,
						mapTypeControlOptions : {
							//style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
							/*mapTypeIds : ['roadmap', 'terrain'],
							 position : google.maps.ControlPosition.BOTTOM_CENTER*/
						}
					});
				}

				var center1 = {
					lat : 32.045,
					lng : 34.7507
				};

				console.log($scope.routes);
			}, function(e) {

			});

		};
		$(document).ready(function() {
			$scope.getRoutes();
		});
		$scope.displayOrders = function(route) {
			if(route.selected == true){
				route.selected = false;
				$scope.currentRoute = false;
				return;
			}
			for (var h = 0; h < $scope.routes.length; h++) {
				$scope.routes[h].selected = false;
			}
			$scope.currentRoute = true;
			route.selected = true;
			$scope.orders = route.orders;
			$scope.curr_index = route.curr_index;
		}
		$scope.selectRoute = function(route) {
			for (var h = 0; h < $scope.routes.length; h++) {
				$scope.routes[h].selected = false;
			}
			route.selected = true;
			$scope.curr_index = route.curr_index;
			var i = $filter('getByIdFilter')($scope.routes, route.id);
			$scope.orders = route.orders;
			if (g_response[i]) {
				for(var u = 0; u < g_response[i].length;u++){
					g_response[i][u].setMap(null);
				}
				g_response[i] = null;
				document.getElementById(route.id).style.backgroundColor = '#d3d7db';
				colors[route.color].occupied -= 1;
				var markers_array = track_markers[i].mkr_array;
				//route.color = null;
				if (markers_array && markers_array != 'undefined') {
					for (var j = 0; j < markers_array.length; j++) {
						markers_array[j].setPosition(null);
					}
				}
				return;
			}
			$rootScope.selectedRoute = route;
			//$rootScope.orders = route.orders;

			initializeRoute();

		};

		function success() {
			/*
			 for (var i = 0; i < 10 && colors[i].occupied; i++);

			 if (i < 10 && (!$rootScope.selectedRoute.color || $rootScope.selectedRoute.color == "undefined")) {
			 $rootScope.selectedRoute.color = i;
			 colors[i].occupied += 1;
			 }*/

			/*
			 var destin = {
			 lat : $scope.orders[$scope.orders.length - 1].lat,
			 lng : $scope.orders[$scope.orders.length - 1].lng
			 }*/

			var ways = [];
			center1 = {
				lat : 32.045,
				lng : 34.7507
			};
			for (var i = 0; i < $scope.orders.length && i < 23; i++) {
				ways.push({
					location : {
						lat : Number($scope.orders[i].lat),
						lng : Number($scope.orders[i].lng)
					}
				});
			}
			/*
			 if (ways.length > 0)
			 ways.pop();*/

			var directionsService = new google.maps.DirectionsService;
			if (!map || map == "undefined") {
				//map1 = null;
				map = new google.maps.Map(document.getElementById('mymap'), {
					zoom : 11,
					center : center1,
					mapTypeControlOptions : {
						//style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
						/*mapTypeIds : ['roadmap', 'terrain'],
						 position : google.maps.ControlPosition.BOTTOM_CENTER*/
					}
				});
			}
			directionsDisplay[$rootScope.selectedRoute.id] = new google.maps.DirectionsRenderer({
				map : map,
				preserveViewport : true,
				suppressMarkers : true
			});

			if (map) {
				mapDiv = document.getElementById('mymap');
				mapDiv.map = map;
			}
			//}
			directionsDisplay[$rootScope.selectedRoute.id].setMap(map);
			var destination = new google.maps.LatLng(Number($rootScope.settings.lat_office), Number($rootScope.settings.lng_office));

			if ($scope.orders.length > 23) {
				destination = new google.maps.LatLng(Number($scope.orders[i].lat), Number($scope.orders[i].lng));
			}
			directionsService.route({
				origin : new google.maps.LatLng(Number($rootScope.settings.lat_office), Number($rootScope.settings.lng_office)),
				destination : destination,

				waypoints : ways,
				//optimizeWaypoints : true,
				travelMode : 'DRIVING',
			}, function(response, status) {
				document.getElementById('map').visibility = "visible";
				console.log(response);
				if (status === 'OK') {
					var current_route = $rootScope.selectedRoute;
					var index = $filter('getByIdFilter')($scope.routes, current_route.id);
					localStorage.setItem('geocoded_waypoints', JSON.stringify(response.geocoded_waypoints));
					var current_color = colors[current_route.color].color;
					document.getElementById(current_route.id).style.backgroundColor = current_color;

					var dividedRoute = false;
					if (current_route.orders.length > 23) {
						dividedRoute = true;
					}
					directionsDisplay[$rootScope.selectedRoute.id].setOptions({
						polylineOptions : {
							strokeColor : current_color
						}
					});
					directionsDisplay[$rootScope.selectedRoute.id].setDirections(response);

					var leg = response.routes[0].legs[0];
					var markers_array = [];
					var title = response.routes[ 0 ].legs[0].start_address;
					var ic = $rootScope.localImgUrl + 'A' + (current_route.color + 1) + '.png';
					var mkr_start = makeMarker(response.routes[ 0 ].legs[0].start_location, ic, map, title);
					for (var i = 1; i < response.routes[0].legs.length; i++) {
						var ic = $rootScope.localImgUrl + colors[current_route.color].icon_prefix + (i) + '.png';
						var title = response.routes[ 0 ].legs[i].start_address;
						var mkr = makeMarker(response.routes[ 0 ].legs[i].start_location, ic, map, title);
						markers_array.push(mkr);
					}

					markers_array.push(mkr_start);
					track_markers[index] = {
						track_id : current_route.id,
						mkr_array : markers_array
					};
					//$scope.initDrivers($scope.routes);
					g_response[index] = [];
					g_response[index].push(directionsDisplay[$rootScope.selectedRoute.id]);
					//if there are more than 23 stops
					if (dividedRoute) {
						putNextPart(current_route, index, current_route.color);

					}
				} else {
					window.alert('Directions request failed due to ' + status);
				}

			});

		}

		function nextPart(h, route, index, current_color, routeLen) {
			var directionsService = new google.maps.DirectionsService;
			var dLength = directionsDisplay.length;
			directionsDisplay[dLength] = new google.maps.DirectionsRenderer({
				map : map,
				preserveViewport : true,
				suppressMarkers : true
			});
			//prepare waypoints array for google
			var orders = route.curOrders;
			if (orders) {
				var latlng = [];
				for (var j = 1; j < orders.length && j <= 23; j++) {
					if (orders[j].lng && orders[j].lat) {
						latlng.push({
							location : {
								lat : Number(orders[j].lat),
								lng : Number(orders[j].lng)
							}
						});
					}
				}

				if (orders[0] && orders[0] != "undefined" && orders[orders.length - 1] && orders[orders.length - 1] != "undefined" && latlng.length > 0) {
					var destination = new google.maps.LatLng(Number($rootScope.settings.lat_office), Number($rootScope.settings.lng_office));
					var origin = new google.maps.LatLng(Number(orders[0].lat), Number(orders[0].lng));
					if (h < routeLen) {
						destination = new google.maps.LatLng(Number(orders[j - 1].lat), Number(orders[j - 1].lng));
					}
					directionsService.route({
						origin : origin,
						destination : destination,
						waypoints : latlng,
						travelMode : 'DRIVING',
					}, function(response, status) {
						if (status === 'OK') {
							var current_route = route;
							directionsDisplay[dLength].setDirections(response);
							//determain route's color
							if (current_color >= 0 && current_color != 'undefined') {
								directionsDisplay[dLength].setOptions({
									polylineOptions : {
										strokeColor : colors[current_color].color
									}
								});
							}
							var leg = response.routes[ 0 ].legs[0];
							var markers_array = [];

							for (var i = 0; i < (response.routes[0].legs.length); i++) {
								var ic = $rootScope.localImgUrl + colors[current_route.color].icon_prefix + (i + h + 1) + '.png';
								var title = response.routes[ 0 ].legs[i].start_address;
								var mkr = makeMarker(response.routes[ 0 ].legs[i].start_location, ic, map, title);
								markers_array.push(mkr);
							}
							track_markers[index].mkr_array = track_markers[index].mkr_array.concat(markers_array);
							g_response[index].push(directionsDisplay[dLength]);
						} else {
							window.alert('Directions request failed due to ' + status);
						}
					});
				}

			}

		}

		//put next part of route on map
		function putNextPart(route, i, color) {
			var current_color = color;
			var routeLen = route.orders.length;
			var index = i;
			var loopLen = (routeLen / 23) - 1;
			if (routeLen % 23) {
				routeLen++;
			}

			route.curOrders = [];
			route.curOrders = route.curOrders.concat(route.orders);
			for (var h = 0; h < routeLen && route.orders.length; h++) {
				for (var f = 0; f < 23; f++) {
					route.curOrders.shift();
				}
				nextPart(h + 23, route, index, color, routeLen);
			}

		}

		function makeMarker1(position, map, title) {
			if (map) {
				mapDiv = document.getElementById('mymap');
				mapDiv.map = map;
			}
			map = document.getElementById('mymap').map;
			var marker = new SlidingMarker({
				position : position,
				map : map,
				duration : 5000,
				title : title
			});
			var infowindow = new google.maps.InfoWindow({
				content : title
			});
			marker.addListener('click', function() {
				infowindow.open(map, marker);
			});
			return marker;
		}

		function makeMarker_test(position, icon, map, title) {
			if (map) {
				mapDiv = document.getElementById('mymap');
				mapDiv.map = map;
			}
			map = document.getElementById('mymap').map;
			var marker = new SlidingMarker({
				position : position,
				map : map,
				icon : icon,
				duration : 5000,
				title : title
			});
			var infowindow = new google.maps.InfoWindow({
				content : title
			});
			marker.addListener('click', function() {
				infowindow.open(map, marker);
			});
			return marker;
		}

		function makeMarker(position, icon, map, title) {
			if (map) {
				mapDiv = document.getElementById('mymap');
				mapDiv.map = map;
			}
			map = document.getElementById('mymap').map;
			var marker = new SlidingMarker({
				position : position,
				map : map,
				icon : icon,
				duration : 10000,
				title : title
			});
			var infowindow = new google.maps.InfoWindow({
				content : title
			});
			marker.addListener('click', function() {
				infowindow.open(map, marker);
			});
			return marker;
		}


		
		
		function fail(error) {
			$.getJSON("http://ipinfo.io", function(ipinfo) {
				console.log("Found location [" + ipinfo.loc + "] by ipinfo.io");
				var latLong = ipinfo.loc.split(",");
			});
			console.log(error);
		}


		$scope.initSettings = function() {
			$rootScope.getSettings();
		}();
		function initializeRoute() {

			//get current location
			success();

		}

		var colors = [{
			color : '#FF0013',
			occupied : false,
			icon_prefix : '1.'
		}, {
			color : '#FF0098',
			occupied : false,
			icon_prefix : '2.'
		}, {
			color : '#613B9E',
			occupied : false,
			icon_prefix : '3.'
		}, {
			color : '#0049FF',
			occupied : false,
			icon_prefix : '4.'
		}, {
			color : '#00CFFF',
			occupied : false,
			icon_prefix : '5.'
		}, {
			color : '#00B23B',
			occupied : false,
			icon_prefix : '6.'
		}, {
			color : '#EAE400',
			occupied : false,
			icon_prefix : '7.'
		}, {
			color : '#FF7900',
			occupied : false,
			icon_prefix : '8.'
		}, {
			color : '#563515',
			occupied : false,
			icon_prefix : '9.'
		}, {
			color : '#050505',
			occupied : false,
			icon_prefix : '10.'
		}];
		/////////////////////--new tracks--
		/*
		var test_routes = [{
		track : 6,
		lat : 32.0928807,
		lng : 34.8223569
		}, {
		track : 6,
		lat : 32.0928807,
		lng : 34.8223569
		}, {
		track : 6,
		lat : 32.0928807,
		lng : 34.8223569
		}, {
		track : 6,
		lat : 32.0928807,
		lng : 34.8223569
		}];*/

		var test_routes = [{
			track : 5,
			lat : 32.0928807,
			lng : 34.8223569
		}, {
			track : 5,
			lat : 32.0928807,
			lng : 34.8223569
		}, {
			track : 5,
			lat : 32.0928807,
			lng : 34.8223569
		}, {
			track : 5,
			lat : 32.0929316,
			lng : 34.8224432
		}, {
			track : 5,
			lat : 32.0929316,
			lng : 34.8224432
		}, {
			track : 5,
			lat : 32.0928791,
			lng : 34.8224863
		}, {
			track : 5,
			lat : 32.0929331,
			lng : 34.8223138
		}, {
			track : 5,
			lat : 32.0929331,
			lng : 34.8223138
		}, {
			track : 5,
			lat : 32.0929856,
			lng : 34.8222707
		}, {
			track : 5,
			lat : 32.0929856,
			lng : 34.8222707
		}, {
			track : 5,
			lat : 32.09285454,
			lng : 34.82251576
		}, {
			track : 5,
			lat : 32.09284883,
			lng : 34.82250772
		}, {
			track : 5,
			lat : 32.09291171,
			lng : 34.82322245
		}, {
			track : 5,
			lat : 32.0925691,
			lng : 34.8223569
		}, {
			track : 5,
			lat : 32.09466323,
			lng : 34.82465363
		}, {
			track : 5,
			lat : 32.09568661,
			lng : 34.82477326
		}, {
			track : 5,
			lat : 32.0955245,
			lng : 34.82507091
		}, {
			track : 5,
			lat : 32.09536883,
			lng : 34.82525798
		}, {
			track : 5,
			lat : 32.0955973,
			lng : 34.8252467
		}, {
			track : 5,
			lat : 32.0955973,
			lng : 34.8252467
		}, {
			track : 5,
			lat : 32.09537843,
			lng : 34.82521589
		}, {
			track : 5,
			lat : 32.09538207,
			lng : 34.82521452
		}, {
			track : 5,
			lat : 32.09538504,
			lng : 34.82520875
		}, {
			track : 5,
			lat : 32.09539137,
			lng : 34.82519427
		}, {
			track : 5,
			lat : 32.09539618,
			lng : 34.82519051
		}, {
			track : 5,
			lat : 32.0955973,
			lng : 34.8252467
		}, {
			track : 5,
			lat : 32.09540013,
			lng : 34.82517665
		}, {
			track : 5,
			lat : 32.09540062,
			lng : 34.82517669
		}, {
			track : 5,
			lat : 32.09540592,
			lng : 34.8251687
		}, {
			track : 5,
			lat : 32.09571817,
			lng : 34.8247111
		}, {
			track : 5,
			lat : 32.09513154,
			lng : 34.82463769
		}, {
			track : 5,
			lat : 32.0951618,
			lng : 34.8247723
		}, {
			track : 5,
			lat : 32.09499726,
			lng : 34.82466038
		}, {
			track : 5,
			lat : 32.09580544,
			lng : 34.82454826
		}, {
			track : 5,
			lat : 32.09545892,
			lng : 34.82329656
		}, {
			track : 5,
			lat : 32.09523409,
			lng : 34.82215612
		}, {
			track : 5,
			lat : 32.09646043,
			lng : 34.82168983
		}, {
			track : 5,
			lat : 32.09667627,
			lng : 34.82171582
		}, {
			track : 5,
			lat : 32.0961611,
			lng : 34.8215806
		}, {
			track : 5,
			lat : 32.09665497,
			lng : 34.82169253
		}, {
			track : 5,
			lat : 32.09653745,
			lng : 34.82140803
		}, {
			track : 5,
			lat : 32.0952426,
			lng : 34.8196022
		}, {
			track : 5,
			lat : 32.09500058,
			lng : 34.8195051
		}, {
			track : 5,
			lat : 32.09498687,
			lng : 34.81950986
		}, {
			track : 5,
			lat : 32.09365037,
			lng : 34.81716661
		}, {
			track : 5,
			lat : 32.09386758,
			lng : 34.81592305
		}, {
			track : 5,
			lat : 32.0936595,
			lng : 34.81472325
		}, {
			track : 5,
			lat : 32.0936725,
			lng : 34.8148517
		}, {
			track : 5,
			lat : 32.0936725,
			lng : 34.8148517
		}, {
			track : 5,
			lat : 32.0936725,
			lng : 34.8148517
		}, {
			track : 5,
			lat : 32.0937265,
			lng : 34.8146792
		}, {
			track : 5,
			lat : 32.09370748,
			lng : 34.81600287
		}, {
			track : 5,
			lat : 32.09420218,
			lng : 34.81739853
		}, {
			track : 5,
			lat : 32.09442549,
			lng : 34.81746832
		}, {
			track : 5,
			lat : 32.09466641,
			lng : 34.81822226
		}, {
			track : 5,
			lat : 32.0956392,
			lng : 34.81844796
		}, {
			track : 5,
			lat : 32.09500971,
			lng : 34.81925429
		}, {
			track : 5,
			lat : 32.09466422,
			lng : 34.81889955
		}, {
			track : 5,
			lat : 32.09358254,
			lng : 34.81734199
		}, {
			track : 5,
			lat : 32.09350608,
			lng : 34.81733694
		}, {
			track : 5,
			lat : 32.09351743,
			lng : 34.81730601
		}, {
			track : 5,
			lat : 32.09352433,
			lng : 34.81732067
		}, {
			track : 5,
			lat : 32.09236969,
			lng : 34.81794611
		}, {
			track : 5,
			lat : 32.09174457,
			lng : 34.81807997
		}, {
			track : 5,
			lat : 32.09155482,
			lng : 34.81808508
		}, {
			track : 5,
			lat : 32.0910222,
			lng : 34.81710173
		}, {
			track : 5,
			lat : 32.0915861,
			lng : 34.8177849
		}, {
			track : 5,
			lat : 32.09232303,
			lng : 34.81583328
		}, {
			track : 5,
			lat : 32.09234158,
			lng : 34.81583409
		}, {
			track : 5,
			lat : 32.09234624,
			lng : 34.81580722
		}, {
			track : 5,
			lat : 32.09234327,
			lng : 34.81580345
		}, {
			track : 5,
			lat : 32.0930645,
			lng : 34.81690619
		}, {
			track : 5,
			lat : 32.09238629,
			lng : 34.81802445
		}, {
			track : 5,
			lat : 32.09095751,
			lng : 34.81863901
		}, {
			track : 5,
			lat : 32.09018543,
			lng : 34.82033375
		}, {
			track : 5,
			lat : 32.09057522,
			lng : 34.82229959
		}, {
			track : 5,
			lat : 32.0905297,
			lng : 34.821408
		}, {
			track : 5,
			lat : 32.0885009,
			lng : 34.82252741
		}, {
			track : 5,
			lat : 32.08848207,
			lng : 34.82180569
		}, {
			track : 5,
			lat : 32.0884298,
			lng : 34.821918
		}, {
			track : 5,
			lat : 32.0883985,
			lng : 34.82091882
		}, {
			track : 5,
			lat : 32.0884761,
			lng : 34.8216237
		}, {
			track : 5,
			lat : 32.0883853,
			lng : 34.8205454
		}, {
			track : 5,
			lat : 32.08416454,
			lng : 34.81947961
		}, {
			track : 5,
			lat : 32.08397054,
			lng : 34.81770711
		}, {
			track : 5,
			lat : 32.08397835,
			lng : 34.8162265
		}, {
			track : 5,
			lat : 32.0839576,
			lng : 34.8173967
		}, {
			track : 5,
			lat : 32.08413256,
			lng : 34.81530706
		}, {
			track : 5,
			lat : 32.08411279,
			lng : 34.81534126
		}, {
			track : 5,
			lat : 32.0854022,
			lng : 34.81536634
		}, {
			track : 5,
			lat : 32.08661027,
			lng : 34.81531954
		}, {
			track : 5,
			lat : 32.08730083,
			lng : 34.81540308
		}, {
			track : 5,
			lat : 32.08728642,
			lng : 34.81573448
		}, {
			track : 5,
			lat : 32.08768686,
			lng : 34.81767226
		}, {
			track : 5,
			lat : 32.08663561,
			lng : 34.81881312
		}, {
			track : 5,
			lat : 32.08526151,
			lng : 34.81803601
		}, {
			track : 5,
			lat : 32.0854537,
			lng : 34.8182162
		}, {
			track : 5,
			lat : 32.0839917,
			lng : 34.81721269
		}, {
			track : 5,
			lat : 32.08403773,
			lng : 34.81858795
		}, {
			track : 5,
			lat : 32.08415785,
			lng : 34.81928513
		}, {
			track : 5,
			lat : 32.08413247,
			lng : 34.81923905
		}, {
			track : 5,
			lat : 32.08400274,
			lng : 34.81925617
		}, {
			track : 5,
			lat : 32.0839073,
			lng : 34.8194239
		}, {
			track : 5,
			lat : 32.08495767,
			lng : 34.81964422
		}, {
			track : 5,
			lat : 32.08686568,
			lng : 34.82017519
		}, {
			track : 5,
			lat : 32.08762394,
			lng : 34.82057913
		}, {
			track : 5,
			lat : 32.08765504,
			lng : 34.82055985
		}, {
			track : 5,
			lat : 32.08765442,
			lng : 34.82055561
		}, {
			track : 5,
			lat : 32.0878941,
			lng : 34.8203729
		}, {
			track : 5,
			lat : 32.08765868,
			lng : 34.82054816
		}, {
			track : 5,
			lat : 32.08895957,
			lng : 34.82066499
		}, {
			track : 5,
			lat : 32.09027783,
			lng : 34.8199199
		}, {
			track : 5,
			lat : 32.08953225,
			lng : 34.81835349
		}, {
			track : 5,
			lat : 32.08941409,
			lng : 34.81719467
		}, {
			track : 5,
			lat : 32.0908481,
			lng : 34.81658047
		}, {
			track : 5,
			lat : 32.0904303,
			lng : 34.8167497
		}, {
			track : 5,
			lat : 32.0902013,
			lng : 34.8163615
		}, {
			track : 5,
			lat : 32.09022815,
			lng : 34.81665356
		}, {
			track : 5,
			lat : 32.09144718,
			lng : 34.81634917
		}, {
			track : 5,
			lat : 32.09239449,
			lng : 34.81578403
		}, {
			track : 5,
			lat : 32.0924666,
			lng : 34.81589568
		}, {
			track : 5,
			lat : 32.0932318,
			lng : 34.81742018
		}, {
			track : 5,
			lat : 32.0917896,
			lng : 34.8181299
		}, {
			track : 5,
			lat : 32.09010947,
			lng : 34.81913837
		}, {
			track : 5,
			lat : 32.0899936,
			lng : 34.82016486
		}, {
			track : 5,
			lat : 32.08842081,
			lng : 34.82050804
		}, {
			track : 5,
			lat : 32.08675434,
			lng : 34.82003835
		}, {
			track : 5,
			lat : 32.08510226,
			lng : 34.81967945
		}, {
			track : 5,
			lat : 32.08409101,
			lng : 34.81949423
		}, {
			track : 5,
			lat : 32.0840484,
			lng : 34.81942343
		}, {
			track : 5,
			lat : 32.08392552,
			lng : 34.81877976
		}, {
			track : 5,
			lat : 32.0840246,
			lng : 34.8183025
		}, {
			track : 5,
			lat : 32.08330287,
			lng : 34.81761794
		}, {
			track : 5,
			lat : 32.08192391,
			lng : 34.81735141
		}, {
			track : 5,
			lat : 32.0816367,
			lng : 34.81728735
		}, {
			track : 5,
			lat : 32.08170741,
			lng : 34.81732548
		}, {
			track : 5,
			lat : 32.08169583,
			lng : 34.81734156
		}, {
			track : 5,
			lat : 32.0817273,
			lng : 34.817181
		}, {
			track : 5,
			lat : 32.0817512,
			lng : 34.8173535
		}, {
			track : 5,
			lat : 32.08169152,
			lng : 34.81732996
		}, {
			track : 5,
			lat : 32.08169153,
			lng : 34.81732954
		}, {
			track : 5,
			lat : 32.08169156,
			lng : 34.81732904
		}, {
			track : 5,
			lat : 32.08169058,
			lng : 34.8173289
		}, {
			track : 5,
			lat : 32.0817242,
			lng : 34.8174398
		}, {
			track : 5,
			lat : 32.0817258,
			lng : 34.8173104
		},
		/*
		 {track:7,lat:32.08170408,lng:34.81730972},
		 {track:7,lat:32.08170416,lng:34.81730613},
		 {track:7,lat:32.0817045,lng:34.81729989},
		 {track:7,lat:32.0817042,lng:34.81729883},
		 {track:7,lat:32.0818322,lng:34.8170947},
		 {track:7,lat:32.08281515,lng:34.81603495},
		 {track:7,lat:32.08413813,lng:34.81539524},
		 {track:7,lat:32.08550123,lng:34.81523716},
		 {track:7,lat:32.0850745,lng:34.8151968},
		 {track:7,lat:32.08825649,lng:34.81480944},
		 {track:7,lat:32.08824717,lng:34.81467151},
		 {track:7,lat:32.08821798,lng:34.81477752},
		 {track:7,lat:32.08875593,lng:34.81599496},
		 {track:7,lat:32.08946726,lng:34.8185804},
		 {track:7,lat:32.0891778,lng:34.8172673},
		 {track:7,lat:32.089833,lng:34.8189063},
		 {track:7,lat:32.0898299,lng:34.8191651},
		 {track:7,lat:32.09057346,lng:34.82184178},
		 {track:7,lat:32.0906912,lng:34.82249886},
		 {track:7,lat:32.09074521,lng:34.8224705},
		 {track:7,lat:32.09074622,lng:34.82246449},
		 {track:7,lat:32.09123599,lng:34.82264627},
		 {track:7,lat:32.0907493,lng:34.8225726},
		 {track:7,lat:32.09304018,lng:34.82218383},
		 {track:7,lat:32.09326689,lng:34.82217765},
		 {track:7,lat:32.09421712,lng:34.82220631},
		 {track:7,lat:32.0947037,lng:34.8218825},
		 {track:7,lat:32.0946512,lng:34.8219256},
		 {track:7,lat:32.0953587,lng:34.8235215},
		 {track:7,lat:32.0959833,lng:34.8233921},
		 {track:7,lat:32.09657681,lng:34.8275715},
		 {track:7,lat:32.09699021,lng:34.82875658},
		 {track:7,lat:32.09727258,lng:34.82977252},
		 {track:7,lat:32.09769467,lng:34.8307259},
		 {track:7,lat:32.09792314,lng:34.83127715},
		 {track:7,lat:32.0979132,lng:34.8311553},
		 {track:7,lat:32.0981229,lng:34.83229761},
		 {track:7,lat:32.09859522,lng:34.83364359},
		 {track:7,lat:32.09962598,lng:34.83379309},
		 {track:7,lat:32.10017627,lng:34.83365922},
		 {track:7,lat:32.10068437,lng:34.83650142},
		 {track:7,lat:32.1007589,lng:34.84088754},
		 {track:7,lat:32.10050456,lng:34.84405876},
		 {track:7,lat:32.10022384,lng:34.84527356},
		 {track:7,lat:32.100447,lng:34.8445667},
		 {track:7,lat:32.09614476,lng:34.84589474},
		 {track:7,lat:32.0943416,lng:34.845041},
		 {track:7,lat:32.09264941,lng:34.84467983},
		 {track:7,lat:32.09268156,lng:34.84467025},
		 {track:7,lat:32.09271922,lng:34.84466473},
		 {track:7,lat:32.09258382,lng:34.84381189},
		 {track:7,lat:32.09278806,lng:34.84121922},
		 {track:7,lat:32.0931215,lng:34.8408583},
		 {track:7,lat:32.09520421,lng:34.84088887},
		 {track:7,lat:32.09547001,lng:34.84094555},*/

		{
			track : 7,
			lat : 32.09540381,
			lng : 34.84056182
		}, {
			track : 6,
			lat : 32.09526185,
			lng : 34.84030979
		}, {
			track : 6,
			lat : 32.09529934,
			lng : 34.84034827
		}, {
			track : 6,
			lat : 32.09532105,
			lng : 34.8403516
		}, {
			track : 6,
			lat : 32.09543949,
			lng : 34.84018244
		}, {
			track : 6,
			lat : 32.09510927,
			lng : 34.8409754
		}, {
			track : 6,
			lat : 32.09419162,
			lng : 34.84094771
		}, {
			track : 6,
			lat : 32.0935379,
			lng : 34.840772
		}, {
			track : 6,
			lat : 32.09299972,
			lng : 34.84057593
		}, {
			track : 6,
			lat : 32.09289571,
			lng : 34.83857748
		}, {
			track : 6,
			lat : 32.09281867,
			lng : 34.83640293
		}, {
			track : 6,
			lat : 32.09262354,
			lng : 34.83527062
		}, {
			track : 6,
			lat : 32.0922894,
			lng : 34.83366107
		}, {
			track : 6,
			lat : 32.09235057,
			lng : 34.83339271
		}, {
			track : 6,
			lat : 32.0923047,
			lng : 34.8333979
		}, {
			track : 6,
			lat : 32.09058903,
			lng : 34.83352395
		}, {
			track : 6,
			lat : 32.08893724,
			lng : 34.8339663
		}, {
			track : 6,
			lat : 32.08724427,
			lng : 34.83384049
		}, {
			track : 6,
			lat : 32.08647476,
			lng : 34.83380031
		}, {
			track : 6,
			lat : 32.0859664,
			lng : 34.8337429
		}, {
			track : 6,
			lat : 32.0859664,
			lng : 34.8337429
		}, {
			track : 6,
			lat : 32.08406366,
			lng : 34.83390632
		}, {
			track : 6,
			lat : 32.08420054,
			lng : 34.83516084
		}, {
			track : 6,
			lat : 32.08447267,
			lng : 34.83523712
		}, {
			track : 6,
			lat : 32.08457719,
			lng : 34.83532533
		}, {
			track : 6,
			lat : 32.08488731,
			lng : 34.83522358
		}, {
			track : 6,
			lat : 32.08567389,
			lng : 34.83534999
		}, {
			track : 6,
			lat : 32.08563463,
			lng : 34.83534195
		}, {
			track : 6,
			lat : 32.08563849,
			lng : 34.8353264
		}, {
			track : 6,
			lat : 32.08562695,
			lng : 34.83533348
		}, {
			track : 6,
			lat : 32.0856296,
			lng : 34.8358129
		}, {
			track : 6,
			lat : 32.08567324,
			lng : 34.83630135
		}, {
			track : 6,
			lat : 32.08570169,
			lng : 34.83630804
		}, {
			track : 6,
			lat : 32.08563209,
			lng : 34.83714586
		}, {
			track : 6,
			lat : 32.08545287,
			lng : 34.83867695
		}, {
			track : 6,
			lat : 32.08477014,
			lng : 34.83858456
		}, {
			track : 6,
			lat : 32.08504812,
			lng : 34.83903541
		}, {
			track : 6,
			lat : 32.08518045,
			lng : 34.83942057
		}, {
			track : 6,
			lat : 32.08521877,
			lng : 34.83938645
		}, {
			track : 6,
			lat : 32.08520905,
			lng : 34.83938637
		}, {
			track : 6,
			lat : 32.08537198,
			lng : 34.83870167
		}, {
			track : 6,
			lat : 32.0857918,
			lng : 34.8395215
		}, {
			track : 6,
			lat : 32.0858658,
			lng : 34.83947092
		}, {
			track : 6,
			lat : 32.08581227,
			lng : 34.83947944
		}, {
			track : 6,
			lat : 32.0847031,
			lng : 34.83993582
		}, {
			track : 6,
			lat : 32.08459741,
			lng : 34.84011835
		}, {
			track : 6,
			lat : 32.08460582,
			lng : 34.84011517
		}, {
			track : 6,
			lat : 32.0845903,
			lng : 34.8401252
		}, {
			track : 6,
			lat : 32.08439595,
			lng : 34.8401773
		}, {
			track : 6,
			lat : 32.08295857,
			lng : 34.84096301
		}, {
			track : 6,
			lat : 32.08158716,
			lng : 34.84081019
		}, {
			track : 6,
			lat : 32.08118152,
			lng : 34.84018526
		}, {
			track : 6,
			lat : 32.08139299,
			lng : 34.83966577
		}, {
			track : 6,
			lat : 32.0811844,
			lng : 34.8405564
		}, {
			track : 6,
			lat : 32.0813798,
			lng : 34.8394353
		}, {
			track : 6,
			lat : 32.0812772,
			lng : 34.84029036
		}, {
			track : 6,
			lat : 32.08152102,
			lng : 34.8409214
		}, {
			track : 6,
			lat : 32.08150258,
			lng : 34.84096904
		}, {
			track : 6,
			lat : 32.0815166,
			lng : 34.8409877
		}, {
			track : 6,
			lat : 32.0833109,
			lng : 34.8407289
		}, {
			track : 6,
			lat : 32.08361728,
			lng : 34.84063146
		}, {
			track : 6,
			lat : 32.08426327,
			lng : 34.84031728
		}, {
			track : 6,
			lat : 32.08431821,
			lng : 34.84028447
		}, {
			track : 6,
			lat : 32.08434113,
			lng : 34.84023773
		}, {
			track : 6,
			lat : 32.08579103,
			lng : 34.83965145
		}, {
			track : 6,
			lat : 32.08633197,
			lng : 34.84066847
		}, {
			track : 6,
			lat : 32.08630977,
			lng : 34.84106966
		}, {
			track : 6,
			lat : 32.08632515,
			lng : 34.8410798
		}, {
			track : 6,
			lat : 32.0863167,
			lng : 34.84108778
		}, {
			track : 6,
			lat : 32.08624596,
			lng : 34.84036041
		}, {
			track : 6,
			lat : 32.08595759,
			lng : 34.83972943
		}, {
			track : 6,
			lat : 32.08592999,
			lng : 34.83978202
		}, {
			track : 6,
			lat : 32.0859444,
			lng : 34.8397802
		}, {
			track : 6,
			lat : 32.0859444,
			lng : 34.8397802
		}, {
			track : 6,
			lat : 32.08595615,
			lng : 34.83952993
		}, {
			track : 6,
			lat : 32.08598258,
			lng : 34.83947679
		}, {
			track : 6,
			lat : 32.08595828,
			lng : 34.83942128
		}, {
			track : 6,
			lat : 32.08593461,
			lng : 34.83943069
		}, {
			track : 6,
			lat : 32.08511019,
			lng : 34.83854782
		}, {
			track : 6,
			lat : 32.08407928,
			lng : 34.83824297
		}, {
			track : 6,
			lat : 32.08416812,
			lng : 34.83733263
		}, {
			track : 6,
			lat : 32.0842634,
			lng : 34.83659975
		}, {
			track : 6,
			lat : 32.0841682,
			lng : 34.83614943
		}, {
			track : 6,
			lat : 32.0840927,
			lng : 34.8362441
		}, {
			track : 6,
			lat : 32.083176,
			lng : 34.83467024
		}, {
			track : 6,
			lat : 32.08322489,
			lng : 34.83371795
		}, {
			track : 6,
			lat : 32.08249365,
			lng : 34.83387553
		}, {
			track : 6,
			lat : 32.08207977,
			lng : 34.83390937
		}, {
			track : 6,
			lat : 32.08200913,
			lng : 34.83292572
		}, {
			track : 6,
			lat : 32.08204718,
			lng : 34.83211867
		}, {
			track : 6,
			lat : 32.08166854,
			lng : 34.83197561
		}, {
			track : 6,
			lat : 32.08193427,
			lng : 34.83179331
		}, {
			track : 6,
			lat : 32.0819798,
			lng : 34.831061
		}, {
			track : 6,
			lat : 32.08173414,
			lng : 34.83105115
		}, {
			track : 6,
			lat : 32.08172971,
			lng : 34.83103135
		}, {
			track : 6,
			lat : 32.08101756,
			lng : 34.83099997
		}, {
			track : 6,
			lat : 32.07989701,
			lng : 34.83068303
		}, {
			track : 6,
			lat : 32.07888779,
			lng : 34.829255
		}, {
			track : 6,
			lat : 32.0786303,
			lng : 34.8285676
		}, {
			track : 6,
			lat : 32.07870233,
			lng : 34.82855951
		}, {
			track : 6,
			lat : 32.07876398,
			lng : 34.82857658
		}, {
			track : 6,
			lat : 32.0782157,
			lng : 34.82740805
		}, {
			track : 6,
			lat : 32.0775654,
			lng : 34.82761062
		}, {
			track : 6,
			lat : 32.0774713,
			lng : 34.8277913
		}, {
			track : 6,
			lat : 32.0774173,
			lng : 34.8279638
		}, {
			track : 6,
			lat : 32.07846835,
			lng : 34.82840737
		}, {
			track : 6,
			lat : 32.07841191,
			lng : 34.82739982
		}, {
			track : 6,
			lat : 32.07837266,
			lng : 34.82542967
		}, {
			track : 6,
			lat : 32.07906825,
			lng : 34.8253746
		}, {
			track : 6,
			lat : 32.08094252,
			lng : 34.82552784
		}, {
			track : 6,
			lat : 32.08254005,
			lng : 34.82545271
		}, {
			track : 6,
			lat : 32.08315894,
			lng : 34.8264564
		}, {
			track : 6,
			lat : 32.08448374,
			lng : 34.826243
		}, {
			track : 6,
			lat : 32.08593238,
			lng : 34.82613085
		}, {
			track : 6,
			lat : 32.0868917,
			lng : 34.82645767
		}, {
			track : 6,
			lat : 32.0863692,
			lng : 34.8262387
		}, {
			track : 6,
			lat : 32.0869414,
			lng : 34.8261524
		}, {
			track : 6,
			lat : 32.0880205,
			lng : 34.8249448
		}, {
			track : 6,
			lat : 32.08731858,
			lng : 34.82497309
		}, {
			track : 6,
			lat : 32.08730908,
			lng : 34.82498761
		}, {
			track : 6,
			lat : 32.08690957,
			lng : 34.82569566
		}, {
			track : 6,
			lat : 32.08618911,
			lng : 34.82574546
		}, {
			track : 6,
			lat : 32.08603322,
			lng : 34.82595976
		}, {
			track : 6,
			lat : 32.08487487,
			lng : 34.82611893
		}, {
			track : 6,
			lat : 32.08423731,
			lng : 34.82657312
		}, {
			track : 6,
			lat : 32.08478366,
			lng : 34.82632839
		}];
		;

	}

})(); 