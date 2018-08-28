
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.messengers')
      .controller('RedemptionsCtrl', RedemptionsCtrl);

  /** @ngInject */
  function RedemptionsCtrl($scope,$rootScope,$filter,connectGETService) {
  	   $rootScope.subModule= 		  		'messengers.redemptions';
       $scope.controller=								  'expenses';
       $scope.redemptions;
       $scope.expensesSum;
    
       
	   
       $scope.getExpensesByDate=function(){
       	  if($scope.currentMessenger.id)
       	
	       	   connectGETService.fn('expenses/expensesmessenger&messenger='+$scope.currentMessenger.id+'&datefirst='+$filter('date')($scope.$parent.from_date_redemptions,'yyyy-MM-dd').toString()+'&datesecend='+$filter('date')($scope.$parent.until_date_redemptions,'yyyy-MM-dd').toString()).then(function(data) {
			        if($scope.currentMessenger&&$scope.currentMessenger.id){
			  			var index=$filter('getByIdFilter')($scope.messengers,$scope.currentMessenger.id);
			  			if(index!= -1){
			  			   $scope.currentMessenger.redemptions=data.data.track;
			  			   $scope.currentMessenger.expenses=data.data.expenses;
			  			   $scope.messengers[index]=$scope.currentMessenger;
			  			}
			  		}
			  		},function(e){
					
				});
       	
       };
      
    
       $scope.getDate=function(date){
       	  return new Date(date);
       };
       
	   


  }

})();
