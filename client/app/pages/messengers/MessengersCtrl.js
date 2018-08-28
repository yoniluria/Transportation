
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.messengers')
      .controller('MessengersCtrl', MessengersCtrl);

  /** @ngInject */
  function MessengersCtrl($scope,$rootScope,$state,$filter,$window,$http,$location,connectGETService,connectDELETEService,connectPOSTService) {
  	 $rootScope.module=                   'messengers';
  	 $scope.controller= 				  'messengers';
     $scope.module= 			   $state.current.name;
     $scope.messengers                                ;
     $scope.currentMessenger=					  null;
  	 $scope.from_date_redemptions=			new Date((new Date()).getTime() - 6 * 24 * 60 * 60 * 1000);
     $scope.until_date_redemptions=         new Date();
     $scope.from_date_routes=				new Date((new Date()).getTime() - 6 * 24 * 60 * 60 * 1000);
	 $scope.until_date_routes=				new Date();
     
     $scope.getMessengers=function(){
     	    if(!$scope.messengers){
	            connectGETService.fn( $scope.controller+'/getallmessgers').then(function(data) {
				     $scope.messengers= data.data;
				     if($state.params.id){
				     	 var index=$filter('getByIdFilter')($scope.messengers,$state.params.id);
				     	 if(index>-1){
				     		$scope.currentMessenger=$scope.messengers[index];
				     		$scope.currentMessenger.redemptions=$scope.messengers[index].track;
				     		if($scope.currentMessenger.license_expired)
				     		$scope.currentMessenger.license_expired=new Date($scope.currentMessenger.license_expired);
				     		$rootScope.allowEdit=true;
				     	}
				     		else{
				     			  $location.path('/messengers');
				     			  if(!$scope.$$phase)
				    			 	 $scope.$apply();
				     		}
				     		
				     }
				     else { 
				     	$rootScope.allowEdit=false;
				     	$scope.currentMessenger=null;
				     }
				   /*
					  if($scope.messengers.length>0)
												$scope.editMessenger($scope.messengers[0]);
											 else  $scope.currentMessenger={};*/
				   
				},function(e){
					
				});
			}
			else if(!$state.params.id){
				if($scope.messengers.length>0)
				   $scope.editMessenger($scope.messengers[0]);
				else  $scope.currentMessenger={};
			}
     }();
     
     $scope.createMessenger=function(){
        $scope.currentMessenger ={};
        $rootScope.allowEdit=true;
         var url=$state.$current.url.prefix;
       
        if(!$scope.$$phase)
				$scope.$apply();
		$location.path('/messengers/details');
     };
     
	 $scope.editMessenger=function(messenger){
		$scope.currentMessenger =messenger;
		$rootScope.allowEdit=true;
		$scope.currentMessenger.redemptions=messenger.track;
		if($scope.currentMessenger.license_expired)
		$scope.currentMessenger.license_expired=new Date($scope.currentMessenger.license_expired);

		if($state.params.id)
		   var url=$state.$current.url.prefix+messenger.id;
		else  var url=$state.$current.url.prefix+'/'+messenger.id;
		$location.path(url);
		
     };
     
     $scope.deleteMessenger=function(){
     	
     	if($scope.currentMessenger.id){
	        connectDELETEService.fn( $scope.controller+'/deletemessenger',$scope.currentMessenger.id).then(function(data) {
			     var index=$filter('getByIdFilter')($scope.messengers,$scope.currentMessenger.id);
			     if(index!=-1)
			        $scope.messengers.splice(index, 1);
			    $rootScope.allowEdit=false;
			    $location.path('/messengers');
			    if(!$scope.$$phase)
			    	$scope.$apply();
			},function(e){
				
			});
	     }
     };
     

     $scope.getNumberOrDefault=function(number){
     	return (!number)?0:number; 
     	
     }
       $scope.getDate=function(date){
     	return new Date(date);
     	
     }
      $scope.searchLocation=function(url){
     	
     	
     }
      $scope.saveDrawing=function(){
     	if($scope.pluckAmount&&$scope.currentMessenger.id){
     			connectPOSTService.fn('expenses/savedaily',{id:$scope.currentMessenger.id,amount:$scope.pluckAmount}).then(function(data) {
			     		if(data.data){
			     			    var date=new Date();
			     			    date.setHours(0, 0, 0, 0);
			     			    $scope.from_date_redemptions.setHours(0, 0, 0, 0);
			     			    $scope.until_date_redemptions.setHours(0, 0, 0, 0);
			     			    if(date>=$scope.from_date_redemptions&&date<=$scope.until_date_redemptions)
			     			      $scope.currentMessenger.expenses.daily= parseInt($scope.currentMessenger.expenses.daily)+parseInt(data.data.daily);
			     				$scope.pluckAmount=null;
						        
					     }
					},function(e){
						
					});
     	}
     	
     }
     
  }

})();
