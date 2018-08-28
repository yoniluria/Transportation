
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.messengers')
      .controller('MessengersRoutesCtrl', RoutesCtrl);

  /** @ngInject */
  function RoutesCtrl($scope,$rootScope,$filter,connectGETService) {
     $rootScope.subModule= 			   		     'messengers.routes';
     $scope.controller=								 		 'track';
     


 
    $scope.getRoutesByDate=function(){
   	  if($scope.currentMessenger.id)
   	
       	   connectGETService.fn('expenses/expensesmessenger&messenger='+$scope.currentMessenger.id+'&datefirst='+$filter('date')($scope.$parent.from_date_routes,'yyyy-MM-dd').toString()+'&datesecend='+$filter('date')($scope.$parent.until_date_routes,'yyyy-MM-dd').toString()).then(function(data) {
		        if($scope.currentMessenger&&$scope.currentMessenger.id){
		  			var index=$filter('getByIdFilter')($scope.messengers,$scope.currentMessenger.id);
		  			if(index!= -1){
		  			   $scope.currentMessenger.track=data.data.track;
		  			   $scope.messengers[index]=$scope.currentMessenger;
		  			}
		  		}
		  		},function(e){
				
			});
   	
   };
   $scope.reason=function(order){
   	 if (order.status==2) {
   	     $rootScope.message=order.message;
   	     if(!$rootScope.message||$rootScope.message=='')
   	        $rootScope.message='אין הודעה';
   	     
   	     angular.element('#reason-toggle').trigger('click');
	     setTimeout(function(){ 
			angular.element('#reason').trigger('click'); 
		 }, 2000);
	 }
   }

	


  }

})();
