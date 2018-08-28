
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.lines')
      .controller('LinesCtrl', LinesCtrl);
  /** @ngInject */
  function LinesCtrl($scope,$rootScope,$http,$location,$state,$filter) {
    	$rootScope.module =        'lines';
    	$scope.controller =   	   'lines';
    	$rootScope.headline = 'קווי הסעות ';
    	
    	//get all tracks
    	function getAllTracks(){
    		document.getElementById('loader').style.display='block';
			$http.post($rootScope.baseUrl+$scope.controller+'/getalltracks',{date:$filter('date')($rootScope.date,'yyyy-MM-dd'),shift:$scope.shift}).success(
			function(data) {
				$scope.tracks=data.tracks;
				$scope.drivers=data.drivers;
				document.getElementById('loader').style.display='none';
			})
			.error(function(){
				$rootScope.message='ארעה שגיאה בשליפת נתוני הקווים';
				angular.element('#saved-toggle').trigger('click');
				document.getElementById('loader').style.display='none';
			});
    	}
    	
    	//get workers of specific track
    	$scope.getWorkers=function(track){
    		// if($scope.selectedTrack&&track.track.id==$scope.selectedTrack.track.id)
    			// return;
    		$scope.selectedTrack=track;
    		$scope.isCollectShift = $scope.selectedTrack.track.shift.indexOf('איסוף')!=-1;
    		document.getElementById('loader').style.display='block';
			$http.post($rootScope.baseUrl+$scope.controller+'/getworkers',{track_id:$scope.selectedTrack.track.id}).success(
			function(data) {
				$scope.selectedTrack.workers=data;
				angular.forEach($scope.selectedTrack.workers,function(worker){
					worker.connection.hour = new Date($filter('date')($rootScope.date, "MM/dd/yyyy") + ' ' + worker.connection.hour); 
				});
				if($scope.isCollectShift){
					$scope.selectedTrack.workers = $filter('orderBy')($scope.selectedTrack.workers,'connection.hour');
				}
				else{
					$scope.selectedTrack.workers = $filter('orderBy')($scope.selectedTrack.workers,'connection.track_order');
				}				
				document.getElementById('loader').style.display='none';
			})
			.error(function(){
				$rootScope.message='ארעה שגיאה בשליפת נתוני העובדים';
				angular.element('#saved-toggle').trigger('click');
			});
    	}
    	
    	//save track
    	$scope.saveTrack=function(){
     		document.getElementById('loader').style.display='block';
			$http.post($rootScope.baseUrl+$scope.controller+'/savetrack',{track:$scope.selectedTrack.track}).success(
			function(data) {
				if(data!='updated')
					$rootScope.message='ארעה שגיאה בעדכון נתוני הקו';
				else{
					$rootScope.message='הקו עודכן בהצלחה!';
					// $scope.selectedTrack.track.
				}
				document.getElementById('loader').style.display='none';										
				angular.element('#saved-toggle').trigger('click');				
			})
			.error(function(){
				$rootScope.message='ארעה שגיאה בעדכון נתוני הקו';
				document.getElementById('loader').style.display='none';			
				angular.element('#saved-toggle').trigger('click');
			});   	    		
    	}
    	
    	// update all workers details
    	$scope.saveWorkers = function(){
    		document.getElementById('loader').style.display='block';
    		$http.post($rootScope.baseUrl + $scope.controller + '/update_worekrs',{data:$scope.selectedTrack})
    		.success(function(data){
    			$rootScope.message='הנתונים נשמרו בהצלחה';
    			angular.element('#saved-toggle').trigger('click');
    			document.getElementById('loader').style.display='none';
    		})
    		.error(function(){
    			$rootScope.message='ארעה שגיאה בשמירת הנתונים';
    			angular.element('#saved-toggle').trigger('click');
    			document.getElementById('loader').style.display='none';
    		});
    	}
    	
    	// update worker for track
    	$scope.updateWorker=function(connection,address){
     		document.getElementById('loader').style.display='block';
			$http.post($rootScope.baseUrl+$scope.controller+'/updateworkerfortrack',{connection:connection,address:address}).success(
			function(data) {
				if(data!='updated')
					$rootScope.message='ארעה שגיאה בעדכון נתוני העובד';
				else{
					$rootScope.message='העובד עודכן בהצלחה!';
					if($scope.isCollectShift){
						$scope.selectedTrack.workers = $filter('orderBy')($scope.selectedTrack.workers,'connection.hour');
					}
					else{
						$scope.selectedTrack.workers = $filter('orderBy')($scope.selectedTrack.workers,'connection.track_order');
					}
				}
				document.getElementById('loader').style.display='none';										
				angular.element('#saved-toggle').trigger('click');				
			})
			.error(function(){
				$rootScope.message='ארעה שגיאה בעדכון נתוני העובד';
				document.getElementById('loader').style.display='none';			
				angular.element('#saved-toggle').trigger('click');
			});   		
    	}
    	
    	$scope.$watch(function(scope){return $rootScope.date},
		function(){
			getAllTracks();
		});
    	
    	//first function for initialize page
    	function init(){
    		$scope.shift = $rootScope.lshift;
    		$scope.shiftName = $scope.shift?$scope.shift:'כל המשמרות';
    		$rootScope.headline += $scope.shiftName;
    		//2018-01-29 $scope.date=$rootScope.current_date;
    		//2018-01-29 $rootScope.date=$scope.date;
    		$rootScope.shift = $scope.shift;
    		getAllTracks();
    	}
    	
    	init();
	}
})();
