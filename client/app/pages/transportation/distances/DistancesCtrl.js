(function () {
  'use strict';

  angular.module('RouteSpeed.pages.distances')
      .controller('DistancesCtrl', DistancesCtrl);

  /** @ngInject */
  function DistancesCtrl($scope,$rootScope,$http,$filter) {
    	$rootScope.module='distances';     
    	$scope.controller='distances';
    	$rootScope.headline = "זמני המתנה";
    	
    	$scope.searchDistance = function(){
    		document.getElementById('loader').style.display = 'block';
    		$http.post($rootScope.baseUrl + $scope.controller + '/get_distances',{search:$scope.search}).success(
			function(data) {
				$scope.distances = data;
				document.getElementById('loader').style.display = 'none';
			})
			.error(function(){
				document.getElementById('loader').style.display = 'none';
				$rootScope.message = 'ארעה שגיאה בשליפת המרחקים';
				angular.element('#saved-toggle').trigger('click');
			});  
    	}
    	
    	$scope.setDuration = function(source,destination,duration){
    		var dis = {source:source,destination:destination,duration:duration};
    		document.getElementById('loader').style.display = 'block';
    		$http.post($rootScope.baseUrl + $scope.controller + '/set_duration',{distance:dis}).success(
			function(data) {
				document.getElementById('loader').style.display = 'none';
				$rootScope.message = 'עודכן בהצלחה';
				angular.element('#saved-toggle').trigger('click');
			})
			.error(function(){
				document.getElementById('loader').style.display = 'none';
				$rootScope.message = 'ארעה שגיאה';
				angular.element('#saved-toggle').trigger('click');
			});
    	}
    	$scope.deleteDistance = function(source,destination,duration){
    		var dis = {source:source,destination:destination,duration:duration};
    		document.getElementById('loader').style.display = 'block';
    		$http.post($rootScope.baseUrl + $scope.controller + '/delete',{distance:dis}).success(
			function(data) {
				document.getElementById('loader').style.display = 'none';
				$rootScope.message = 'נמחק בהצלחה';
				angular.element('#saved-toggle').trigger('click');
				$scope.searchDistance();
			})
			.error(function(){
				document.getElementById('loader').style.display = 'none';
				$rootScope.message = 'ארעה שגיאה';
				angular.element('#saved-toggle').trigger('click');
			});
    	}
		
}

})();