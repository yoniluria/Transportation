
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.sort')
      .controller('SortCtrl', SortCtrl);
  /** @ngInject */
  function SortCtrl($scope,$rootScope,$http,$location,$state,$filter,$timeout) {
    	$rootScope.module=        'sort';
    	$scope.controller=   	   'sort';
    	$rootScope.headline = 'מיין משלוח';
    	
    	$scope.resetChecking = function(){
    		var element;
    		angular.forEach($scope.tracks,function(track){
    			track.selected = false;
    			element = document.getElementById(track.track.id);
    			if(element){
    				element.checked = false;
    			}
    		});
    		$rootScope.selectedTracks = [];
    	}
    	
    	$scope.checkingAll = function(){
    		var element;
    		$rootScope.selectedTracks = [];
    		angular.forEach($scope.tracks,function(track){
    			track.selected = true;
    			element = document.getElementById(track.track.id);
    			if(element){
    				element.checked = true;
    				$rootScope.selectedTracks.push(track);
    			}
    		});
    	}
    	
    	//get all tracks and shifts
    	function getTracksByDate(){
    		document.getElementById('loader').style.display = 'block';
			$http.post($rootScope.baseUrl + $scope.controller + '/gettracksbydate',{date:$filter('date')($rootScope.date,'yyyy-MM-dd')}).success(
			function(data) {
				$scope.tracks = data;
				var selectedTracks = $rootScope.selectedTracks;
				$rootScope.selectedTracks = [];
				angular.forEach($scope.tracks,function(track){
					if(selectedTracks.filter(t=>t.track.id == track.track.id).length){
						$scope.addToSelectedTracks(track);
					}
				});
				// angular.forEach($rootScope.selectedTracks,function(selectedTrack){
					// track = $scope.tracks.filter(t=>t.track.id == selectedTrack.track.id)[0];
					// $scope.addToSelectedTracks(track);
				// });
				document.getElementById('loader').style.display = 'none';
			})
			.error(function(){
				document.getElementById('loader').style.display = 'none';
				$rootScope.message = 'ארעה שגיאה בשליפת נתוני המסלולים';
				angular.element('#saved-toggle').trigger('click');
			});    		
    	}
    	
    	$scope.getDataList = function(){
    		if(!$scope.sortfilter.track.shift_id){
    			$scope.sortfilter.track.shift_id = undefined;
    		}
    		if($scope.sortfilter.isHospital!=2){
    			$scope.sortfilter.track.meesenger = undefined;
    		}
    		if(!$scope.sortfilter.track.meesenger){
    			$scope.sortfilter.track.meesenger = undefined;
    		}
    	}
    	
    	//add track to selected tracks
    	$scope.addToSelectedTracks = function(track){
    		if(!track.selected){
    			track.selected = true;
    			$rootScope.selectedTracks.push(track);
    		}
    		else{
    			track.selected = false;
    			var i = $rootScope.selectedTracks.findIndex(t=>t.track.id==track.track.id);
    			$rootScope.selectedTracks.splice(i,1);
    		}
    	}
    	
    	//redirect page to 'send to'
    	$scope.send = function(){
    		$rootScope.sortfilter = $scope.sortfilter;
    		var path;
    		$rootScope.forward = $scope.forward;
    		$rootScope.shift_id = $scope.sortfilter.track.shift_id;
    		if($scope.sortfilter.isHospital==1){
    			$rootScope.ushers = $scope.ushers;
    			path = '/send_to_hospital';
    		}
    		else{
    			$rootScope.ushers = $scope.ushers;
    			path = '/sendto';
    		}
    		$timeout(function(){
    			$location.path(path);
    		},500);
    	}
    	
    	$scope.$watch(function(scope){return $rootScope.date},
		function(){
			getTracksByDate();
		});    	
    	
    	//first function for initialize the page
    	function init(){
    		$scope.shifts = $rootScope.shifts;
    		// $scope.date = $rootScope.current_date;
    		if(!$rootScope.selectedTracks){
    			$rootScope.selectedTracks = [];
    		}
    		getTracksByDate();
    		if($rootScope.sortfilter){
    			$scope.sortfilter = $rootScope.sortfilter;
    		}
    		else{
    			$scope.sortfilter = {};
    			$scope.sortfilter.track = {};
    			if($rootScope.shift){
	    			// $scope.sortfilter.track.shift = $rootScope.shift;
	    			$scope.sortfilter.track.shift_id = $rootScope.shifts.filter(s=>s.name==$rootScope.shift)[0].id;
	    			// $scope.sortfilter.track.shift = $scope.shifts.filter(s=>s.name==$rootScope.shift)[0];
	    		}
	    		else{
	    			// $scope.sortfilter.track.shift = undefined;
	    			$scope.sortfilter.track.shift_id = undefined;
	    		}
    		}
    		// $scope.sortfilter.track.shift = $rootScope.lshift;
    		// $scope.sortfilter.track.shift = {name:$rootScope.shift};
    	}
    	
    	init();
	}
})();
