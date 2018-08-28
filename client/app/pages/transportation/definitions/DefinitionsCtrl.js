(function () {
  'use strict';

  angular.module('RouteSpeed.pages.definitions')
      .controller('DefinitionsCtrl', DefinitionsCtrl);

  /** @ngInject */
  function DefinitionsCtrl($scope,$rootScope,$http,$filter) {
    	$rootScope.module='definitions';     
    	$scope.controller='definitions';
    	$rootScope.headline = "הגדרות";
    	
    	$scope.save = function(){
    		document.getElementById('loader').style.display='block';
    		$http.post($rootScope.baseUrl + $scope.controller + '/save_definition',{data:$scope.hospital_email})
    		.success(function(data){
    			document.getElementById('loader').style.display='none';
    			$rootScope.message = 'ההגדרה נשמרה בהצלחה';
    			angular.element('#saved-toggle').trigger('click');
    		})
    		.error(function(){
    			document.getElementById('loader').style.display='none';
    			$rootScope.message = 'ארעה שגיאה בשמירת ההגדרה';
    			angular.element('#saved-toggle').trigger('click');
    		});    		
    	}
    	
    	function init(){
    		document.getElementById('loader').style.display='block';
    		$http.post($rootScope.baseUrl + $scope.controller + '/get_definitions',{})
    		.success(function(data){
    			document.getElementById('loader').style.display='none';
    			$scope.definitions = data;
    			$scope.hospital_email = $scope.definitions[0];
    		})
    		.error(function(){
    			document.getElementById('loader').style.display='none';
    		});
    	}
    	
    	init();
		
}

})();