	(function() {
	'use strict';

	angular.module('RouteSpeed.pages.workers').controller('WorkersCtrl', WorkersCtrl);

	/** @ngInject */
	function WorkersCtrl($scope, $rootScope, $http, $location, $state, $filter, connectPOSTService, connectGETService, connectDELETEService,uploadImageService) {
		$rootScope.module = 'workers';
		// $rootScope.imgUrl="http://185.70.251.252/transportation/server/web/img/maps/";
		$scope.controller = 'worker';
		$rootScope.headline = "רשימת עובדים";
		$scope.addresses = [{}, {}];
		$scope.text = 'הוסף';

		$scope.getDistance = function(index){
			$http.post($rootScope.baseUrl+$scope.controller+'/get_distance',{address:$scope.addresses[index].original_address})
			.success(function(data){
			})
			.error(function(){
			});
		}

//upload map image
	 $scope.uploadImage=function(event,index){
	 	document.getElementById('loader').style.display='block';
	  	 	if(!event.target.files||event.target.files.length==0)
			   return;
	        var formData=new FormData();
	        formData.append("file",event.target.files[0]);
	  		uploadImageService.fn($scope.controller+'/uploadimage',formData).then(function(data) {
	  					document.getElementById('loader').style.display='none';
	  			       $scope.map_file=data.data.img;
	  			       $scope.addresses[index].id=data.data.id;
	  			       $scope.addresses[index].map_file=data.data.img;
	  			       $rootScope.image_file= data.data.img	;
	  			       //$state.reload();
							
			 },function(e){
			 	console.log(e);
		     });
	  	 };


$scope.modify = function(worker){
    //$scope.editingData[worker.id] = true;
    $scope.newWorker = worker;
    $scope.addresses = worker.addresses;
    $scope.text = 'עדכן';
}


$scope.update = function(worker){
	document.getElementById('loader').style.display='block';
	connectPOSTService.fn($scope.controller + '/updateworker', worker).then(function(data) {
		document.getElementById('loader').style.display='none';
				if (data.data != "ok") {
					$rootScope.message = data.data;
					$rootScope.message='הנתונים התעדכנו';
					angular.element('#saved-toggle').trigger('click');
				} else {
					$rootScope.message = "הנתונים התעדכנו";
					angular.element('#saved-toggle').trigger('click');
				}
				$scope.getWorkers();
				$scope.getdatalist();
			}, function(e) {
				document.getElementById('loader').style.display='none';
				$scope.message = "בעיה בשמירת נתונים, נסה שוב מאוחר יותר";
			});
    $scope.editingData[worker.id] = false;
}
		//save new worker
		$scope.save = function() {
			$scope.newWorker.addresses = $scope.addresses;
			document.getElementById('loader').style.display='block';
			var newWorker = angular.copy($scope.newWorker);
			//connectPOSTService.fn($scope.controller + '/saveworker', newWorker).then(function(data) {
			$http.post($rootScope.baseUrl + $scope.controller + '/saveworker',newWorker).success(function(data){   
				document.getElementById('loader').style.display='none';
				if (data != "ok") {
					$rootScope.message = "בעיה בשמירת נתונים, נסה שוב מאוחר יותר";
					angular.element('#saved-toggle').trigger('click');
				} else {
					$rootScope.message = "הנתונים נשמרו"
					angular.element('#saved-toggle').trigger('click');
					$scope.text = 'הוסף';
					$scope.newWorker = {};
					$scope.addresses = [{}, {}];
					$scope.getWorkers();
					$scope.getdatalist();
				}
				$scope.submitted = false;
			})
	       	.error(function(){
	       		$rootScope.message = "בעיה בשמירת נתונים, נסה שוב מאוחר יותר";
				angular.element('#saved-toggle').trigger('click');
				document.getElementById('loader').style.display='none';
				$scope.submitted = false;
	       	});
			/*}, function(e) {
				$rootScope.message = "בעיה בשמירת נתונים, נסה שוב מאוחר יותר";
				angular.element('#saved-toggle').trigger('click');
				document.getElementById('loader').style.display='none';
				$scope.submitted = false;
			});*/
		}
		//get all workers
		$scope.getWorkers = function() {
			document.getElementById('loader').style.display='block';
			connectGETService.fn($scope.controller + '/getallworkers').then(function success(data) {
				document.getElementById('loader').style.display='none';
				$scope.workers = data.data.workers;
				$scope.static_lines = data.data.static_lines;
				$scope.setPrimaryAddressIndex();
				$scope.addressesList = [];
				$scope.subLines = [];
				for(var i = 0;i<$scope.workers.length;i++){
					if($scope.subLines.indexOf($scope.workers[i].sub_line)==-1){
						$scope.subLines.push($scope.workers[i].sub_line);
					}
					for(var j = 0;j<$scope.workers[i].addresses.length;j++){
						// $scope.workers[i].addresses[j].city = $scope.workers[i].addresses[j].original_address.split(',')[1];
						$scope.addressesList.push($scope.workers[i].addresses[j]);
						$scope.workers[i].addresses[j].travel_time = Number($scope.workers[i].addresses[j].travel_time);
					}
				}
				$scope.editingData = {};

		for (var i = 0, length = $scope.workers.length; i < length; i++) {
 		 $scope.editingData[$scope.workers[i].id] = false;
		}
		$scope.getdatalist();
			}, function error(error) {
				alert('שגיאה ארעה בעת נסיון לקבלת נתונים');
			});
		}
		$scope.searchAll = function() {
			$scope.selectedWorkers = $scope.workers;
			if ($scope.searchInput && $scope.searchInput != "") {
				$scope.selectedWorkers = $scope.selectedWorkers.filter(filterByAll($scope.searchInput));
			}

		}
		function filterByAll(value) {
			return function(element) {
				var tmp = angular.copy(element);
				var isEquale = false;
				var arr = [{
					first : 'id'
				}, {
					first : 'name'
				}, {
					first : 'phone'
				}, {
					first : 'department'
				}, {
					first : 'addresses',
					second : 'country'
				}, {
					first : 'addresses',
					second : 'street_number'
				}, {
					first : 'addresses',
					second : 'original_address'
				}, {
					first : 'addresses',
					second : 'street'
				}, {
					first : 'addresses',
					second : 'line_number'
				}];
				for (var i = 0; i < arr.length; i++) {
					if (!arr[i].second) {
						if (tmp[arr[i].first] && tmp[arr[i].first].toString().indexOf(value.toString()) != -1) {
							isEquale = true;
							break;
						}
					} else {
						if (tmp[arr[i].first])
							for (var j = 0; j < tmp[arr[i].first].length; j++) {
								if (tmp[arr[i].first][j][arr[i].second] && tmp[arr[i].first][j][arr[i].second].toString().indexOf(value.toString()) != -1) {
									isEquale = true;
									break;
								};

							}
					}

				};
				return isEquale;
			}
		}

		$scope.getWorkers();
		function filterByParameter(param, secondParam, value) {

			return function(element) {
				if (!element[param])
					return false;
				if (secondParam && secondParam != "undefined" && secondParam != '' && secondParam != "") {
					for (var i = 0; i < element[param].length; i++) {
						if (!element[param][i][secondParam])
							return false;
						return element[param][i][secondParam].toString().indexOf(value.toString()) != -1;
					}
				}
				return element[param].toString().indexOf(value.toString()) != -1;
			}
		}
		
		$scope.setPrimaryAddressIndex=function(){
			for(var i=0;i<$scope.workers.length;i++){
				for(var j=0;j<$scope.workers[i].addresses.length;j++){
					if($scope.workers[i].addresses[j].primary_address==1)
						$scope.workers[i].index= j;
				}
			}
		}
		
		$scope.filterParam = function(param, value) {
			$scope.selectedWorkers = $scope.workers.filter(filterByParameter(param, null, value));
		}
		//choose worker to delete - before approval
		$scope.sendWorkerToDelete = function(worker) {
			$scope.workerToDelete = worker;

		}
		//delete worker - after approval
		$scope.deleteWorker = function() {
			document.getElementById('loader').style.display='block';
			connectDELETEService.fn($scope.controller + '/deleteworker', $scope.workerToDelete.id).then(function success(data) {
				document.getElementById('loader').style.display='none';
				if (data.data != "ok") {
					$rootScope.message = "שגיאה ארעה בניסיון למחיקת הנתונים";
					$rootScope.message = "העובד נמחק מהמערכת";
					angular.element('#saved-toggle').trigger('click');
					$scope.getWorkers();
					$scope.getdatalist();
				} else {
					$rootScope.message = "העובד נמחק מהמערכת";
					angular.element('#saved-toggle').trigger('click');
					//alert($rootScope.message);
				}
				$scope.getWorkers();
				$scope.getdatalist();
			}, function error(error) {
				document.getElementById('loader').style.display='none';
				$rootScope.message = "שגיאה ארעה בניסיון למחיקת הנתונים(1)";
				$rootScope.message = " 1המחיקה נשמרה";
				angular.element('#saved-toggle').trigger('click');
			});
		}
		$scope.getdatalist = function() {
			// document.getElementById('loader').style.display='block';
			$scope.selectedWorkers = $scope.workers;
			if ($scope.selectedId != undefined && $scope.selectedId != '')
				$scope.selectedWorkers = $scope.selectedWorkers.filter(filterByParameter('id', null, $scope.selectedId));
			if ($scope.selectedName != undefined && $scope.selectedName != '')
				$scope.selectedWorkers = $scope.selectedWorkers.filter(filterByParameter('name', null, $scope.selectedName));
			if ($scope.selectedAddress != undefined && $scope.selectedAddress != '')
				$scope.selectedWorkers = $scope.selectedWorkers.filter(filterByParameter('addresses', 'original_address', $scope.selectedAddress));
			if ($scope.selectedCity != undefined && $scope.selectedCity != '')
				$scope.selectedWorkers = $scope.selectedWorkers.filter(filterByParameter('addresses', 'city', $scope.selectedCity));
			if ($scope.selectedLineNumber != undefined && $scope.selectedLineNumber != '')
				$scope.selectedWorkers = $scope.selectedWorkers.filter(filterByParameter('addresses', 'line_number', $scope.selectedLineNumber));
			// setTimeout(function(){
				// document.getElementById('loader').style.display='none';
			// },1000);
		}
		
		
		$scope.addAddress = function() {
			$scope.addresses.push({});
		}
		
		$scope.noReults=function(){
			return $scope.selectedWorkers&&!$scope.selectedWorkers.length;
		}
			
	}

})();
