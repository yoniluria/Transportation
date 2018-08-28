(function() {'use strict';

	angular.module('RouteSpeed.pages.routes').controller('RoutesCtrl', RoutesCtrl);

	/** @ngInject */
	function RoutesCtrl($scope, $state, $window, $rootScope, $filter, connectGETService, connectPOSTService, connectDELETEService) {
		$rootScope.module = 'routes';
		$scope.controller = 'track';
		$scope.currentRoute = null;
		$scope.isColapseMap = false;
		//$scope.from_date_routes = new Date((new Date()).getTime() - 6 * 24 * 60 * 60 * 1000);
		$scope.until_date_routes = new Date();
		$scope.today = new Date();

		$scope.until_date = new Date();
		var track_markers = [];
		var g_response = [];
		//var colors = ['#FF0013', '#FF0098', '#613B9E', '#0049FF', '#00CFFF', '#00B23B', '#EAE400', '#FF7900', '#563515', '#050505'];
		var colors = [{
			color : '#FF0013',
			occupied : 0,
			icon_prefix : '1.'
		}, {
			color : '#FF0098',
			occupied : 0,
			icon_prefix : '2.'
		}, {
			color : '#613B9E',
			occupied : 0,
			icon_prefix : '3.'
		}, {
			color : '#0049FF',
			occupied : 0,
			icon_prefix : '4.'
		}, {
			color : '#00CFFF',
			occupied : 0,
			icon_prefix : '5.'
		}, {
			color : '#00B23B',
			occupied : 0,
			icon_prefix : '6.'
		}, {
			color : '#EAE400',
			occupied : 0,
			icon_prefix : '7.'
		}, {
			color : '#FF7900',
			occupied : 0,
			icon_prefix : '8.'
		}, {
			color : '#563515',
			occupied : 0,
			icon_prefix : '9.'
		}, {
			color : '#050505',
			occupied : 0,
			icon_prefix : '10.'
		}];
		var map;
		var mapDiv;
		var directionsDisplay = [];
		$scope.display_unembedded = true;
		
		$scope.delUnembeddedTrack = function(){
		
			connectPOSTService.fn('order/updatetrackid', {
				data : $scope.unembedded_stops
			}).then(function success(response){
				if(response.data == "success"){
					
					$scope.unembedded_stops = null;
					$scope.unembedded_drag = null;
				
				}
			
			},function error(error){
			});
		
		
		}
		
		
		$scope.toggleStops = function(){
			$('#unembedded_body').toggle();
			$scope.display_unembedded = !$scope.display_unembedded;
			
				if (!$scope.$$phase)
					$scope.$apply();
		
		}
		
		
		$scope.colapseMap = function() {
			$scope.isColapseMap = !$scope.isColapseMap;
			if ($scope.isColapseMap) {
				document.getElementById('half').style.height = '0px';
				document.getElementById('mymap').style.height = ' calc(100vh - 115px)';
				google.maps.event.trigger(map, "resize");
			} else {
				document.getElementById('half').style.height = '48vh';
				document.getElementById('mymap').style.height = 'calc(52vh - 114px)';
				google.maps.event.trigger(map, "resize");
			}

		}

		$scope.printInvoice = function(route = null, index = null){
			
			if(!route){
				routes = $scope.tracks;
				
			}

			var routes;
			if (!routes &&(!route.length || route.length === 'undefined')) {
				routes = [];
				routes.push(route);
			}
			var stops_array = [];
			for (var i = 0; i < routes.length; i++) {
				for(var j = 0; j < routes[i].order.length;j++){
					if(!index){
						routes[i].order[j].index = i+1;
					}
					else{
						routes[i].order[j].index = index+1;
					}
					stops_array.push(routes[i].order[j]);
				}
				
			}

			if (routes.length > 0) {

				stops_array.sort(function(a, b) {
					return parseFloat(a.num_order) - parseFloat(b.num_order);
				});
			}

			var elementPage = '<html lang="en" ><head> <meta charset="utf-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1"> <script src="assets/js/jquery.min.js"></script> <script src="assets/js/bootstrap.min.js"></script> <link rel="stylesheet" href="assets/css/bootstrap.min.css"> <link rel="stylesheet" href="assets/css/bootstrap-rtl.css"> <link rel="stylesheet" href="assets/css/style.css"> <link rel="stylesheet" href="assets/css/font-awesome.min.css"> <link rel="" href="assets/fonts/glyphicons-halflings-regular.eot"> <link rel="" href="assets/fonts/glyphicons-halflings-regular.svg"> <link rel="" href="assets/fonts/glyphicons-halflings-regular.ttf"> <link rel="" href="assets/fonts/glyphicons-halflings-regular.woff"> <link href="https://fonts.googleapis.com/css?family=Assistant:200,300,400,600,700,800" rel="stylesheet"><script type="text/javascript" charset="UTF-8" src="https://maps.googleapis.com/maps-api-v3/api/js/28/4/intl/iw_ALL/common.js"></script><script type="text/javascript" charset="UTF-8" src="https://maps.googleapis.com/maps-api-v3/api/js/28/4/intl/iw_ALL/util.js"></script><script type="text/javascript" charset="UTF-8" src="https://maps.googleapis.com/maps-api-v3/api/js/28/4/intl/iw_ALL/stats.js"></script></head><body onload="window.print()"  style="padding-right: 0px;"><div class="under-header aaa ng-scope" ui-view="" style="  padding-top: 0px;width: 100%;">'
			elementPage += '<div style=" min-height: 955px;" class="col-md-12 ng-scope" >'+'<header style=" position: relative; background: #5d5e62 !important;width: 100%;-webkit-print-color-adjust: exact;" class=""><div class="personal-logo " style=" "><img class="img-responsive ng-scope" src="'+$rootScope.imgUrl+$rootScope.settings.image_file+'"></div><img style="" class="logo-route" src="assets/img/logoroutespeed.svg"></header>' + '<h3 style=" text-align: center;">'+$rootScope.settings.business_name+'-חשבוניות</h3><p class="print_p" ><div class="col-md-12 ng-scope"><br><table class="table" id="table_print"><thead><tr><th>מספר הזמנה </th><th>מספר מסלול</th></tr></thead>';


			elementPage += '<tbody><tr>';
			angular.forEach(stops_array, function(value, key) {
				elementPage += '<tr><td> ' + (value.num_order || '') + ' </td><td> ' + value.index + ' </td></tr>';
			});
			elementPage += '</tbody></table></div></div>';
		
		elementPage += '</div></body></html>';

		var popupWin = window.open('', '_blank');
		popupWin.document.open();
		popupWin.document.write(elementPage);
		popupWin.document.close();

	}

	$scope.show_tooltip = function(id){
		$('#note'+id).toggle();
	}

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
	$scope.printNow = function() {
		var routes = $scope.routeToPrint;
		if (routes && (routes.length === 'undefined' || !routes.length)) {
			routes = [];
			routes.push($scope.routeToPrint);

		}

			var elementPage = '<html lang="en" ><head><style type="text/css">table { page-break-inside:auto }tr    { page-break-inside:avoid; page-break-after:auto }thead { display:table-header-group }tfoot { display:table-footer-group }</style> <meta charset="utf-8"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="viewport" content="width=device-width, initial-scale=1"> <script src="assets/js/jquery.min.js"></script> <script src="assets/js/bootstrap.min.js"></script> <link rel="stylesheet" href="assets/css/bootstrap.min.css"> <link rel="stylesheet" href="assets/css/bootstrap-rtl.css"> <link rel="stylesheet" href="assets/css/style.css"> <link rel="stylesheet" href="assets/css/font-awesome.min.css"> <link rel="" href="assets/fonts/glyphicons-halflings-regular.eot"> <link rel="" href="assets/fonts/glyphicons-halflings-regular.svg"> <link rel="" href="assets/fonts/glyphicons-halflings-regular.ttf"> <link rel="" href="assets/fonts/glyphicons-halflings-regular.woff"> <link href="https://fonts.googleapis.com/css?family=Assistant:200,300,400,600,700,800" rel="stylesheet"><style>@media print{@page {size: landscape}}</style><script type="text/javascript" charset="UTF-8" src="https://maps.googleapis.com/maps-api-v3/api/js/28/4/intl/iw_ALL/common.js"></script><script type="text/javascript" charset="UTF-8" src="https://maps.googleapis.com/maps-api-v3/api/js/28/4/intl/iw_ALL/util.js"></script><script type="text/javascript" charset="UTF-8" src="https://maps.googleapis.com/maps-api-v3/api/js/28/4/intl/iw_ALL/stats.js"></script></head><body onload="window.print()"  style="padding-right: 0px;"><div class="under-header aaa ng-scope" ui-view="" style="  padding-top: 0px;width: 100%;">'

		angular.forEach(routes, function(value, key) {
			if (value.order.length > 0) {
				if (key === 0) {
					//elementPage += '<div style="    min-height: 955px;" class="col-md-12 ng-scope" >' + '<header style="    position: relative; background: #5d5e62 !important;width: 100%;" class=""><div class="personal-logo " style=" "><img class="img-responsive ng-scope" ng-src="https://route-speed.com/dev/routeSpeed/web/img/definition/28/chelsea-95a50f3d45.png" src="https://route-speed.com/dev/routeSpeed/web/img/definition/28/chelsea-95a50f3d45.png"></div><img style="" class="logo-route" src="assets/img/logoroutespeed.svg"></header>' + '<h3 style=" text-align: center;">' + $rootScope.settings.business_name + '-מסלול</h3><p class="print_p" >מספר מסלול: <span>' + value.id + '</span></p><p class="print_p">תאריך:<span>' + $filter('date')(value.track_date, 'dd.MM').toString() + '</span></p><p class="print_p">שעת יציאה:<span >' + $filter('date')(value.track_date, 'HH.mm').toString() + '</span></p><p class="print_p">שליח:<span>' + (value.messenger ? (value.messenger.name + ' ' + value.messenger.lastname) : 'לא מוגדר') + '</span></p><p class="print_p">זמן: <span>' + (value.time / 60).toFixed(2) + ' דקות</span></p><p class="print_p">אורך מסלול: <span>' + value.distance.toString() + ' ק"מ</span></p><div class="col-md-12 ng-scope"><h3>תחנות:</h3><br><table class="table"><tbody><tr><th> מספר הזמנה </th><th> שם לקוח </th><th> טלפון </th><th>כתובת </th><th> קומה </th><th> כמות</th><th> איסוף תשלום </th><th> תאריך ושעת הזמנה</th></tr>';
				elementPage += '<div style="height:';
				var height = (value.order.length /10)*595;
				elementPage += height+'px;">';
				elementPage += '<div style="    min-height: 955px;" class="col-md-12 ng-scope" >' + '<div ><div class="col-sm-12"><div class="col-sm-6"><div class="col-sm-6"><p style=" font-size: 25px; font-weight: 600;">סידור לנהג לתאריך:</p></div><div class="col-sm-6"><p style=" font-size: 25px; font-weight: 600;">'+$filter('date')(value.track_date, 'dd/MM/yyyy').toString()+'</p></div></div><div class="col-sm-6"><div class="col-sm-6"><p style=" font-size: 25px; font-weight: 600;"><span>מסלול :</span><span>'+(parseInt(key)+1)+'</span></p></div><div class="col-sm-6"><p style=" font-size: 25px; font-weight: 600;"><span>מסלול :</span><span>'+(parseInt(key)+1)+'</span></p></div></div></div><div class="col-sm-12"><div class="col-sm-6"><div class="col-sm-4"><p style="font-size: 20px; font-weight: 600;">נהג:</p></div><div class="col-sm-4"><p style="font-size: 20px; font-weight: 600;">'+(value.messenger ? (value.messenger.name + ' ' + value.messenger.lastname) : '0000 0000')+'</p></div></div><div class="col-sm-6"><div class="col-sm-4"><p style="font-size: 20px; font-weight: 600;">רכב:</p></div><div class="col-sm-4"><p style="font-size: 20px; font-weight: 600;">'+(value.messenger ? (value.messenger.car_number ) : '00000')+'</p></div></div></div><div class="col-sm-12"><table style=" class="table"><tbody><tr style=" background: #ddd;"><th> </th><th> כמות </th><th> קוד לקוח </th><th> שם לקוח </th><th> כתובת </th><th>תעודה מס </th><th>לשימוש הנהג </th><th> הערות </th><th> גז</th><th> זר </th><th> גמבו</th><th> כדורים</th></tr>';
				
				 

				} else {
					//elementPage += '<div class="col-md-12 ng-scope" style="min-height: 955px;page-break-inside: avoid;">' + '<header style="    position: relative; background: #5d5e62 !important;width: 100%;" class=""><div class="personal-logo " style=" "><img class="img-responsive ng-scope" ng-src="https://route-speed.com/dev/routeSpeed/web/img/definition/28/chelsea-95a50f3d45.png" src="https://route-speed.com/dev/routeSpeed/web/img/definition/28/chelsea-95a50f3d45.png"></div><img style="" class="logo-route" src="assets/img/logoroutespeed.svg"></header>' + '<h3 style=" text-align: center;">' + $rootScope.settings.business_name + '-מסלול</h3><p class="print_p" >מספר מסלול: <span>' + value.id + '</span></p><p class="print_p">תאריך:<span>' + $filter('date')(value.track_date, 'dd.MM').toString() + '</span></p><p class="print_p">שעת יציאה:<span >' + $filter('date')(value.track_date, 'HH.mm').toString() + '</span></p><p class="print_p">שליח:<span>' + (value.messenger ? (value.messenger.name + ' ' + value.messenger.lastname) : 'לא מוגדר') + '</span></p><p class="print_p">זמן: <span>' + (value.time / 60).toFixed(2) + ' דקות</span></p><p class="print_p">אורך מסלול: <span>' + value.distance.toString() + ' ק"מ</span></p><div class="col-md-12 ng-scope"><h3>תחנות:</h3><br><table class="table"><tbody><tr><th> מספר הזמנה </th><th> שם לקוח </th><th> טלפון </th><th>כתובת </th><th> קומה </th><th> כמות</th><th> איסוף תשלום </th><th> תאריך ושעת הזמנה</th></tr>';
					elementPage += '<div style="height:';
				var height = (value.order.length /10)*595;
				elementPage += height+'px;">';
					elementPage += '<div class="col-md-12 ng-scope" style="min-height: 955px;page-break-inside: avoid;">' + '<div ><div class="col-sm-12"><div class="col-sm-6"><div class="col-sm-6"><p style=" font-size: 25px; font-weight: 600;">סידור לנהג לתאריך:</p></div><div class="col-sm-6"><p style=" font-size: 25px; font-weight: 600;">'+$filter('date')(value.track_date, 'dd/MM/yyyy').toString()+'</p></div></div><div class="col-sm-6"><div class="col-sm-6"><p style=" font-size: 25px; font-weight: 600;"><span>מסלול :</span><span>'+(parseInt(key)+1)+'</span></p></div><div class="col-sm-6"><p style=" font-size: 25px; font-weight: 600;"><span>מסלול :</span><span>'+(parseInt(key)+1)+'</span></p></div></div><div class="col-sm-6"></div></div><div class="col-sm-12"><div class="col-sm-4"><div class="col-sm-6"><p style="font-size: 20px; font-weight: 600;">נהג:</p></div><div class="col-sm-6"><p style="font-size: 20px; font-weight: 600;">0000 0000</p></div></div><div class="col-sm-4 col-sm-offset-4"><div class="col-sm-6"><p style="font-size: 20px; font-weight: 600;">רכב:</p></div><div class="col-sm-6"><p style="font-size: 20px; font-weight: 600;">'+(value.messenger ? (value.messenger.car_number ) : '00000')+'</p></div></div></div><div class="col-sm-12"><table class="table"><tbody><tr style=" background: #ddd;"><th> </th><th> כמות </th><th> קוד לקוח </th><th> שם לקוח </th><th> כתובת </th><th>תעודה מס </th><th>לשימוש הנהג </th><th> הערות </th><th> גז</th><th> זר </th><th> גמבו</th><th> כדורים</th></tr>';
				}

				angular.forEach(value.order, function(value, key) {
				//	elementPage += '<tr><td> ' + (value.num_order || '') + ' </td><td> ' + value.customer_name + ' </td><td> ' + value.phone + ' </td><td><i class="fa fa-map-marker" aria-hidden="true"></i>' + value.street + ' ' + value.number + ' ' + value.city + ' </td><td> ' + (value.floor ? value.floor : '' ) + ' </td><td> ' + (value.amount || '') + ' </td><td> ₪' + (value.price || 0) + ' </td><td> ' + ((value.time_set) ? $filter('date')(new Date(value.time_order), 'dd.MM HH:mm').toString() : '') + ' </td></tr>';
					
					elementPage += '<tr><td> '+(parseInt(key)+1)+' </td><td ><p style="border: 1px solid black;">'+(value.amount?value.amount:0)+'</p></td><td> '+(value.customer_id?value.customer_id:'')+' </td><td> ' + (value.customer_name?value.customer_name:'') + ' </td><td><i class="fa fa-map-marker" aria-hidden="true"></i> ' + (value.street?value.street:'') + ' ' + (value.number?value.number:'' ) + ' ' + (value.city?value.city:'' ) + ' </td><td> '+value.num_order+' </td><td > <p style=" height: 24px;border: 1px solid black;"> </p></td><td> '+($scope.getOrderDetail(value.orders_details,'הערות'))+'</td><td> '+($scope.getOrderDetail(value.orders_details,'גזים'))+'</td><td> '+($scope.getOrderDetail(value.orders_details,'זר'))+'</td><td> '+($scope.getOrderDetail(value.orders_details,'גמבו'))+'</td><td> '+($scope.getOrderDetail(value.orders_details,'כדורים'))+'</td></tr>';
				});
				elementPage += '</tbody></table></div></div></div></div>';
			}
		});
		elementPage += '</div></body></html>';

		var popupWin = window.open('', '_blank');
		popupWin.document.open();
		popupWin.document.write(elementPage);
		popupWin.document.close();

	}
	$scope.getOrderDetail=function(obj,attr){
		var tmp=$filter('filter')(obj, {attr: attr});
		if(tmp&&tmp[0])
		   return tmp[0].value;
		return '--';
	}
	$scope.printAll = function() {
		if (!$scope.tracks || $scope.tracks.length <= 0) {
			return;
		}
		$scope.routeToPrint = $scope.tracks;
		for (var i = 0; i < $scope.tracks.length; i++) {
			if (!$scope.tracks[i].messenger) {
				$('#no_driver').click();
				return;
			}
		}
		$scope.printNow();
		

	}

	$scope.print = function(route) {
		if (!route)
			return;
		$scope.routeToPrint = route;
		if (!route.messenger) {

			$('#no_driver').click();
			return;
		}
		$scope.printNow();
	}

	$scope.deleteAllTrack = function() {
		for (var i = 0; i < $scope.tracks.length; i++) {
			$scope.trackForDelete = $scope.tracks[i];
			$scope.deleteTrack($scope.tracks[i]);

		}
	}

	$scope.delTrack = function(track) {
		$scope.trackForDelete = track;
	}
	$scope.deleteTrack = function(track = 'default') {
		if (track === 'default') {
			var track = $scope.trackForDelete;
		}

		if (!track)
			return;
		if (track.id) {
			connectDELETEService.fn($scope.controller + '/deletetrack', track.id).then(function(data) {
				var i = $filter('getByIdFilter')($scope.tracks, track.id);
				if (g_response[i]) {
					g_response[i][0].setMap(null);
				}
				if (colors[$scope.tracks[i].color])
					colors[$scope.tracks[i].color].occupied = 0;
				if (track_markers[i])
					var markers_array = track_markers[i].mkr_array;
				if (markers_array && markers_array != 'undefined') {
					for (var j = 0; j < markers_array.length; j++) {
						markers_array[j].setPosition(null);
					}
				}
				if (i != -1)
					$scope.tracks.splice(i, 1);
				if (!$scope.$$phase)
					$scope.$apply();
			}, function(e) {

			});
		}
	}
	$scope.delStop = function(stop, index) {
		$scope.stopForDelete = stop;
		angular.element('#delete-modal-toggle').trigger('click');
	}
	$scope.deleteStop = function() {
		var stop = $scope.stopForDelete;
		if (!stop)
			return;
		var track_index = $filter('getByIdFilter')($scope.tracks, stop.track_id);
		if (stop && track_index != -1) {
			connectPOSTService.fn('order/deletestop', {
				data : stop
			}).then(function(data) {
				if (data) {
					var index = $scope.tracks[track_index].order.indexOf(stop);
					if (index != -1) {
						var tracks = angular.copy($scope.tracks);
						tracks[track_index].order.splice(index, 1);
						$scope.tracks = tracks;
						if (!$scope.$$phase)
							$scope.$apply();
						$rootScope.message = "המחיקה נשמרה";
						angular.element('#saved-toggle').trigger('click');
						setTimeout(function() {
							angular.element('#saved').trigger('click');
						}, 2000);
					}
					for (var h = 0; h < g_response[track_index].length; h++) {
						g_response[track_index][h].setMap(null);
					}
					g_response[track_index] = null;
					var devided = false;
					if ($scope.tracks[track_index] && $scope.tracks[track_index].order.length > 23) {
						devided = true;
					}
					putRouteOnMap($scope.tracks[track_index], track_index, devided, true);

				}

			}, function(e) {
				$rootScope.message = "בעיה בשמירת נתונים, נסה שוב מאוחר יותר";
				angular.element('#saved-toggle').trigger('click');
				setTimeout(function() {
					angular.element('#saved').trigger('click');
				}, 2000);
			});
		}

	}

	$scope.getMessengers = function() {
		connectGETService.fn('messengers/getallmessgers').then(function(data) {
			if (data)
				$scope.messengers = data.data;

		}, function(e) {

		});
	}();

	$scope.setMap = function(tracks) {

		mapDiv = document.getElementById('mymap');
		mapDiv.map = map;
		var directionsService = new google.maps.DirectionsService;
		var devidedRoute = false;
		var k = 0;
		var len = tracks.length > 10 ? (tracks.length - 10) : 0;
		var j = 0
		var devideRoutes = false;
		for (var i = (tracks.length - 1); i > len; i--) {
			if (tracks[i] && tracks[i] != 'undefined' && tracks[i].order && tracks[i].order != 'undefined') {
				devideRoutes = false;
				if (tracks[i].order.length > 23) {
					devidedRoute = true;
				}
				putRouteOnMap(tracks[i], i, devidedRoute, false);
			}
		}
		//directionsDisplay.setMap(map);
	}
	function makeMarker(position, icon, map, title) {
		map = document.getElementById('mymap').map;
		var marker = new google.maps.Marker({
			position : position,
			map : map,
			icon : icon,
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


	$scope.selectRoute = function(route, reCalcDuration) {
		var i = $filter('getByIdFilter')($scope.tracks, route.id);
		//if route on map - remove from map
		if (g_response[i]) {
			for (var h = 0; g_response[i] && h < g_response[i].length; h++) {
				g_response[i][h].setMap(null);

			}
			g_response[i] = null;
			document.getElementById(route.id).style.backgroundColor = 'transparent';
			colors[route.color].occupied -= 1;
			var markers_array = track_markers[i].mkr_array;
			route.color = null;
			if (markers_array && markers_array != 'undefined') {
				for (var j = 0; j < markers_array.length; j++) {
					markers_array[j].setPosition(null);
				}
			}
		} else {
			var devidedRoute = false;
			if (route.order && route.order.length > 23) {
				devidedRoute = true;
			}
			putRouteOnMap(route, i, devidedRoute, reCalcDuration);
		}
	}
	function putRouteOnMap(route, i, devidedRoute, reCalcDuration) {
		//search for unoccupied color
		var tracksize = $scope.tracks.length;
		var current_color;
		if (route.color >= 0 && route.color != null && route.color != 'undefined') {
			current_color = route.color;
		} else {
			for (var g = 0; g < 100; g++) {
				for (var j = 0; j < colors.length && colors[j].occupied != g; j++);
				if (j < colors.length) {
					break;
				}
			}

			if (j < colors.length) {
				current_color = j;
				colors[current_color].occupied += 1;
			}
		}
		var index = i;
		var directionsService = new google.maps.DirectionsService;
		var dLength = directionsDisplay.length;
		directionsDisplay[dLength] = new google.maps.DirectionsRenderer({
			map : map,
			preserveViewport : true,
			suppressMarkers : true
		});
		//prepare waypoints array for google
		var orders = route.order;
		if (orders) {
			var latlng = [];
			for (var j = 0; j < orders.length && j < 23; j++) {
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
				if (orders.length > 23) {
					destination = new google.maps.LatLng(Number(orders[j].lat), Number(orders[j].lng));
				}
				directionsService.route({
					origin : new google.maps.LatLng(Number($rootScope.settings.lat_office), Number($rootScope.settings.lng_office)),
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
							colors[current_color].occupied += 1;
							current_route.color = current_color;
						}
						document.getElementById(route.id).style.backgroundColor = colors[current_color].color;
						var leg = response.routes[ 0 ].legs[0];
						var markers_array = [];
						var ic = $rootScope.localImgUrl + 'A' + (current_route.color + 1) + '.png';
						var duration = 0;
						var distance = 0;
						var mkr_start = makeMarker(response.routes[ 0 ].legs[0].start_location, ic, map, title);
						if (reCalcDuration) {
							duration += response.routes[0].legs[0].duration.value;
							distance += response.routes[0].legs[0].distance.value;
						}
						for (var i = 1; i < response.routes[0].legs.length; i++) {
							if (reCalcDuration) {
								duration += response.routes[0].legs[i].duration.value;
								if (i != (response.routes[0].legs.length - 1)) {
									duration += (Number(route.order[i].stop_stay) * 60);
								}
								distance += response.routes[0].legs[i].distance.value;
							}
							var ic = $rootScope.localImgUrl + colors[current_route.color].icon_prefix + (i) + '.png';
							var driverText = "";
							if(current_route['messenger']){
								driverText = 'נהג: '+current_route['messenger']['name']+' '+current_route['messenger']['lastname']+'<br />';
							}
							var indexText = 'מספר מסלול: '+(tracksize - index)+'<br />';
							var title = driverText +''+indexText+' כתובת:'+response.routes[ 0 ].legs[i].start_address;
							var mkr = makeMarker(response.routes[ 0 ].legs[i].start_location, ic, map, title);
							markers_array.push(mkr);
						}
						markers_array.push(mkr_start);
						track_markers[index] = {
							track_id : current_route.id,
							mkr_array : markers_array
						};
						if (reCalcDuration) {
							$scope.tracks[index].time = duration;
							$scope.tracks[index].distance = (distance / 1000);
							if (!$scope.$$phase)
								$scope.$apply();
						}
						g_response[index] = [];
						g_response[index].push(directionsDisplay[dLength]);

						//if there are more than 23 stops
						if (devidedRoute) {
							putNextPart(route, index, current_color, reCalcDuration);

						}
					} else {
						//window.alert('Directions request failed due to ' + status);
					}
				});
			}
		}

	}

	function nextPart(h, route, index, current_color, routeLen, reCalcDuration) {
		var tracksize = $scope.tracks.length;
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
						var distance = 0;
						var duration = 0;
						if (reCalcDuration) {
							duration += response.routes[0].legs[0].duration.value;
							distance += response.routes[0].legs[0].distance.value;
						}
						for (var i = 0; i < (response.routes[0].legs.length); i++) {
							if (reCalcDuration) {
								distance += response.routes[0].legs[i].distance.value;
								duration += response.routes[0].legs[i].duration.value;
								if (i != (response.routes[0].legs.length - 1)) {
									duration += (Number(route.order[i].stop_stay) * 60);
								}
							}
							var ic = $rootScope.localImgUrl + colors[current_route.color].icon_prefix + (i + h + 1) + '.png';
							
							var driverText = "";
							if(route['messenger']){
								driverText = 'נהג: '+route['messenger']['name']+' '+route['messenger']['lastname']+'<br />';
							}
							var indexText = 'מספר מסלול: '+(tracksize - index)+'<br />';
							var title = driverText +''+indexText+' כתובת:'+response.routes[ 0 ].legs[i].start_address;
							//var title = response.routes[ 0 ].legs[i].start_address;
							var mkr = makeMarker(response.routes[ 0 ].legs[i].start_location, ic, map, title);
							markers_array.push(mkr);
						}

						if (reCalcDuration) {
							$scope.tracks[index].time += duration;
							$scope.tracks[index].distance += (distance / 1000);
							if (!$scope.$$phase)
								$scope.$apply();
						}
						track_markers[index].mkr_array = track_markers[index].mkr_array.concat(markers_array);
						g_response[index].push(directionsDisplay[dLength]);
					} else {
						//window.alert('Directions request failed due to ' + status);
					}
				});
			}

		}

	}

	//put next part of route on map
	function putNextPart(route, i, color, reCalcDuration) {
		var current_color = color;
		var routeLen = route.order.length;
		var index = i;
		var loopLen = (routeLen / 23) - 1;
		if (routeLen % 23) {
			routeLen++;
		}

		route.curOrders = [];
		route.curOrders = route.curOrders.concat(route.order);
		for (var h = 0; h < routeLen && route.order.length; h++) {
			for (var f = 0; f < 23; f++) {
				route.curOrders.shift();
			}
			nextPart(h + 23, route, index, color, routeLen, reCalcDuration);
		}

	}

	function getRandomColor() {
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}

 $scope.filterFn = function(item) {
        // must have array, and array must be empty
        return item.order && item.order.length > 0;
      };
	$scope.getRoutesByDate = function() {
		document.getElementById('loader').style.display = 'block';
		connectGETService.fn($scope.controller + '/getallallroute&date=' + $filter('date')($rootScope.from_date_routes, 'yyyy-MM-dd').toString() + '&untildate=' + $filter('date')($rootScope.from_date_routes, 'yyyy-MM-dd').toString()).then(function(data) {

			if (data){
				$scope.unembedded_stops = data.data.unembedded.order;
				$scope.unembedded_drag = data.data.unembedded;
			}
		     	
				$scope.tracks =$filter('filter')(data.data.routes,$scope.filterFn);
			angular.forEach($scope.tracks, function(value, key) {
				/*
				 value['color'] = getRandomColor();
				 value.dragging = false;

				 */
				value.tempDate = new Date(value.track_date);
				if (value.track_date && $rootScope.hours && $rootScope.hours.length > 0) {
					value.track_date = new Date(value.track_date);
					var temp = value.track_date.getHours() + value.track_date.getMinutes() / 100;
					for (var i = 0; i < $rootScope.hours.length - 1; i++) {
						var from = $rootScope.hours[i].id, to = $rootScope.hours[i + 1].id;
						if (to < from)
							to = Math.floor(from) + Math.floor(Math.abs((Math.round(from * 100) % 100) + parseInt($rootScope.settings.time_destination_load)) / 60) + (((Math.abs((Math.round(from * 100) % 100) + parseInt($rootScope.settings.time_destination_load))) % 60) % 100) / 100

						if (to > temp && from <= temp)
							value.tempTime = $rootScope.hours[i].id.toString();
					};
					if (!value.tempTime)
						value.tempTime = $rootScope.hours[$rootScope.hours.length - 1].id.toString();
					if (value.order[0] && value.order[0].time_set == false) {
						value.tempTime = null;
					}

				}
				/*
				 angular.forEach(value.order, function(order, key) {
				 order.selected=false;
				 });*/

			});
			var center1 = {
				lat : 32.045,
				lng : 34.7507
			};
			setTimeout(function() {
				map = new google.maps.Map(document.getElementById('mymap'), {
					zoom : 11,
					center : center1,
					mapTypeControlOptions : {
						//style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
						//mapTypeIds : ['roadmap', 'terrain'],
					}

				});
				$scope.setMap($scope.tracks);
			}, 500);
			document.getElementById('loader').style.display = 'none';
		}, function(e) {
			document.getElementById('loader').style.display = 'none';
		});

	};
	$scope.getRoutes = function() {
		$scope.getRoutesByDate();
	}();
	$scope.getDate = function(date) {
		return new Date(date);

	}
	/*

	 $scope.editRoute = function(route) {
	 if (route.id) {
	 $scope.currentRoute = route;
	 $scope.currentRoute.track_date = new Date($scope.currentRoute.track_date);
	 }

	 }*/

	$scope.save = function() {
		angular.forEach($scope.tracks, function(item) {
			if (item.id == 178 || item.order.length <= 0) {
				//console.log(item);
			} else {
				try {

					$scope.model = angular.toJson(item, true);
					$scope.modelAsJson = angular.toJson(item.order, true);
				} catch(err) {
					/*
					 console.log(err);
					 console.log(item);*/

				}
			}
		});
		//$scope.modelAsJson = angular.toJson($scope.tracks, true);
		if ($scope.tracks) {
			/*
			angular.forEach($scope.tracks, function(value, key) {
							value.track_date = $filter('date')(new Date(value.tempDate.getFullYear(), value.tempDate.getMonth(), value.tempDate.getDate(), Math.floor(value.tempTime), Math.round(value.tempTime * 100 % 100), 0), "yyyy-MM-dd HH:mm:ss");
						});*/
			
			connectPOSTService.fn($scope.controller + '/updateallroutes', {
				data : $scope.tracks
			}).then(function(data) {
				if (data) {
					$rootScope.message = "הנתונים נשמרו";
					angular.element('#saved-toggle').trigger('click');
					setTimeout(function() {
						angular.element('#saved').trigger('click');
					}, 2000);
				}
				$scope.getRoutesByDate();

			}, function(e) {
				$rootScope.message = "בעיה בשמירת נתונים, נסה שוב מאוחר יותר";
				angular.element('#saved-toggle').trigger('click');
				setTimeout(function() {
					angular.element('#saved').trigger('click');
				}, 2000);
			});

		}
	}
	/**********************drag & drop*****************************/

	/**
	 * dnd-dragging determines what data gets serialized and send to the receiver
	 * of the drop. While we usually just send a single object, we send the array
	 * of all selected items here.
	 */
	$scope.getSelectedItemsIncluding = function(list, item) {
		item.selected = true;
		return list.order.filter(function(item) {
			return item.selected;
		});
	};

	/**
	 * We set the list into dragging state, meaning the items that are being
	 * dragged are hidden. We also use the HTML5 API directly to set a custom
	 * image, since otherwise only the one item that the user actually dragged
	 * would be shown as drag image.
	 */
	$scope.onDragstart = function(list, event) {
		$scope.fromRoute = list;

		list.dragging = true;
		if (event.dataTransfer.setDragImage) {
			/*
			 var img = new Image();
			 img.src = 'framework/vendor/ic_content_copy_black_24dp_2x.png';
			 event.dataTransfer.setDragImage(img, 0, 0);*/

		}
	};

	/**
	 * In the dnd-drop callback, we now have to handle the data array that we
	 * sent above. We handle the insertion into the list ourselves. By returning
	 * true, the dnd-list directive won't do the insertion itself.
	 */
	$scope.onDrop = function(list, items, index) {
		//var i = $scope.fromRoute.findIndex(findObj);

		var found = $filter('getByIdFilter')($scope.fromRoute.order, items[0].id);

		$scope.fromRoute.order.splice(found, 1);
		$scope.toRoute = list;

		angular.forEach(items, function(item) {
			item.selected = false;
			item.track_id = list.id
		});
		list.order = list.order.slice(0, index).concat(items).concat(list.order.slice(index));
		var index = 0;
		angular.forEach(list.order, function(item) {
			item.stop_index = index++;
		});
		if (!$scope.$$phase)
			$scope.$apply();
		$scope.selectRoute($scope.fromRoute, false);

		$scope.selectRoute($scope.toRoute, false);

		setTimeout(function() {

			$scope.selectRoute($scope.fromRoute, true);
			$scope.selectRoute($scope.toRoute, true);
			return true;
		}, 1000);
	}
	/**
	 * Last but not least, we have to remove the previously dragged items in the
	 * dnd-moved callback.
	 */
	$scope.onMoved = function(list) {
		list.order = list.order.filter(function(item) {
			return !item.selected;
		});
	};

	// Generate the initial model

	/*
	angular.forEach($scope.tracks, function(list) {
	for (var i = 1; i <= 4; ++i) {
	list.items.push({label: "Item " + list.listName + i});
	}
	});*/

	// Model to JSON for demo purpose

	/*
	$scope.$watch('$scopetracks', function(model) {
	if(model){
	$scope.modelAsJson = angular.toJson(model, true);
	}
	}, true);*/

	/***************************************************/

}
})();
