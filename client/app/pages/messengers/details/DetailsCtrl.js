
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.messengers')
      .controller('DetailsCtrl', DetailsCtrl);

  /** @ngInject */
  function DetailsCtrl($scope,$filter ,connectPOSTService ,connectPUTService,$rootScope,$location) {
    $rootScope.subModule= 			   'messengers.details';
    $scope.invalidPassword							 =false;
     
     $scope.saveMessenger=function(isValid){
     	if(isValid){
     		   $scope.invalidPassword	=false;
     		   angular.forEach( $scope.messengers, function(value, key) {
				    if(value.id!=$scope.$parent.currentMessenger.id&&value.name==$scope.$parent.currentMessenger.name&&value.password==$scope.$parent.currentMessenger.password){
				    	$scope.invalidPassword	=true;
				    	return;
				    }
				});
     	       $scope.submitted=false;
     	       
				if( $scope.invalidPassword)
								   return;
				
     	      
		        if(! $scope.$parent.currentMessenger.id){
		     		$scope.$parent.currentMessenger.license_expired=$scope.$parent.currentMessenger.license_expired.toString();
			     	connectPOSTService.fn($scope.controller+'/newmesseger',$scope.$parent.currentMessenger).then(function(data) {
			     		if(data.data.id){
			     				
			  			    $rootScope.message="שליח חדש נוסף בהצלחה";
							triggerAlert();
						    $scope.messengers.push(data.data);
						    $rootScope.allowEdit=false;
						
						     
					     }
					},function(e){
						$rootScope.message="בעיה בשמירת נתונים, נסה שוב מאוחר יותר";
						triggerAlert();
					});
			  	}
			  	else{
			  		
			  	/*
					  if($scope.$parent.currentMessenger.license_expired)
										 $scope.$parent.currentMessenger.license_expired=$scope.$parent.currentMessenger.license_expired.toLocaleDateString();*/
				  if($scope.$parent.currentMessenger.license_expired)
                        $scope.$parent.currentMessenger.license_expired=$filter('date')($scope.$parent.currentMessenger.license_expired,'yyyy-MM-dd').toString()
			  		connectPUTService.fn($scope.controller+'/updatemesseger',$scope.$parent.currentMessenger.id,$scope.$parent.currentMessenger).then(function(data) {
			  			if(data.data.id){
			  			$rootScope.message="שליח עודכן בהצלחה";
						triggerAlert();
			  			var index=$filter('getByIdFilter')($scope.messengers,data.data.id);
			  			if(index!= -1)
			  			   data.data.track=$scope.messengers[index].track;
			  			   data.data.redemptions=$scope.messengers[index].redemptions;
			  			   $scope.messengers[index]=data.data;
			  			   $scope.$parent.editMessenger($scope.messengers[index]);
			  			   $rootScope.allowEdit=true;
			  			}
					   
					},function(e){
						$rootScope.message="בעיה בשמירת נתונים, נסה שוב מאוחר יותר";
						triggerAlert();
					});
	  			}
	  	}
	 }
    function triggerAlert(){
     	angular.element('#saved-toggle').trigger('click');
	    setTimeout(function(){ 
				angular.element('#saved').trigger('click'); 
		}, 2000);
     }
	


  }

})();
