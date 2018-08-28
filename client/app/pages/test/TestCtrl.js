
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.test')
      .controller('TestCtrl', TestCtrl);

  /** @ngInject */
  function TestCtrl($scope,$rootScope,$http,$location,$state) {
    	$rootScope.module=        'TEST';
    	$scope.controller=   	   'site';
    	$scope.authentication =function(){
	         $http.post( $rootScope.baseUrl+$scope.controller+'/login',{data:$scope.auth}).then(function(data) {
				 $scope.login_failed=false;
				 /*var object = {value: data.data, timestamp: new Date().getTime()}*/
				 localStorage.setItem('authKey',data.data );
				 
				 $location.path('/dashbord');
				 
				 
				   
				},function(e){
				   $scope.login_failed=true;
			 });
	    }
	


  }

})();
