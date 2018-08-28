(function () {
  'use strict';

  angular.module('RouteSpeed.pages.driver')
      .controller('DriverCtrl', DriverCtrl);

  /** @ngInject */
  function DriverCtrl($scope,$rootScope,$http,$filter) {
    	$rootScope.module='driver';     
    	$scope.controller='messengers';
    	$rootScope.headline = "נהגים";
    	$scope.text = 'הוסף';
    	
    	$scope.filterAlerts = function(driver){
    		if(!$scope.show_alerts){
    			// return $filter((driver.driving_license_expire | dateDiff:currentDate)<-1||(driver.car_license_expire | dateDiff:currentDate)<-1||(driver.insurance_expire | dateDiff:currentDate)<-1||(driver.activation_license_expire | dateDiff:currentDate)<-1||(driver.safety_expire | dateDiff:currentDate)<-1||(driver.winter_test_expire | dateDiff:currentDate)<-1||(driver.more_expire | dateDiff:currentDate)<-1);
    			return !($filter('dateDiff')(driver.driving_license_expire,$scope.currentDate)<-1 || $filter('dateDiff')(driver.car_license_expire,$scope.currentDate)<-1 || $filter('dateDiff')(driver.insurance_expire,$scope.currentDate)<-1 || $filter('dateDiff')(driver.activation_license_expire,$scope.currentDate)<-1 || $filter('dateDiff')(driver.safety_expire,$scope.currentDate)<-1 || $filter('dateDiff')(driver.winter_test_expire,$scope.currentDate)<-1 || $filter('dateDiff')(driver.more_expire,$scope.currentDate)<-1);
    		}
    		else{
    			return true;
    		}
    	}
    	
    	$scope.modify = function(messenger){
    		$scope.newMessenger = messenger;
    		$scope.text = 'עדכן';
		}
    	
    	//get all messengers
    	$scope.getMessengers = function(){
			document.getElementById('loader').style.display='block';
			$http.post($rootScope.baseUrl+$scope.controller+'/getallmessengers').success(
				function(data) {
					document.getElementById('loader').style.display='none';
					$scope.messengers = data;
					angular.forEach($scope.messengers,function(driver){
						driver.driving_license_expire = new Date(driver.driving_license_expire);
						driver.car_license_expire = new Date(driver.car_license_expire);
						driver.insurance_expire = new Date(driver.insurance_expire);
						driver.activation_license_expire = new Date(driver.activation_license_expire);
						driver.safety_expire = new Date(driver.safety_expire);
						driver.winter_test_expire = new Date(driver.winter_test_expire);
						driver.more_expire = new Date(driver.more_expire);
					});
					$scope.selectedMessengers=$scope.messengers;
					})
					.error(function(){
					$rootScope.message='ארעה שגיאה בשליפת נתוני הנהגים';
					angular.element('#saved-toggle').trigger('click');
				});		    		
    	}
    	
    	//save new messenger
    	
    	$scope.save = function(){
    		document.getElementById('loader').style.display='block';
    		var newMessenger = angular.copy($scope.newMessenger);
    		$http.post($rootScope.baseUrl+$scope.controller+'/savemessenger',newMessenger).success(
						function(data) {
							document.getElementById('loader').style.display='none';
					       	  		document.getElementById('loader').style.display='none';
					       	  		if(data!='saved'){
    				$rootScope.message = 'ארעה שגיאה בשמירת הנתונים';
    			}
    			else{
    				$rootScope.message = "הנתונים נשמרו";
    				$scope.submitted = false;
    				$scope.text = 'הוסף';
					$scope.newMessenger = {is_usher:false};
					$scope.getMessengers();
    			}
    			angular.element('#saved-toggle').trigger('click');})
					       	  		.error(function(){
					       	  			$scope.message = "בעיה בשמירת נתונים, נסה שוב מאוחר יותר";
					       	  			angular.element('#saved-toggle').trigger('click');
					       	  		});
		}
  
  	//choose messenger to delete - before approval
		$scope.sendMessengerToDelete = function(messenger) {
			$scope.messengerToDelete = messenger;
		}
  
  
  	$scope.deleteMessenger = function() {
  		document.getElementById('loader').style.display='block';
  		$http.post($rootScope.baseUrl+$scope.controller+'/deletemessenger',{data:$scope.messengerToDelete.id}).success(
						function(data) {
					       	  		document.getElementById('loader').style.display='none';
					       	  		$rootScope.message='הנהג נמחק';
					       	  		$scope.newMessenger = {is_usher:false};
					       	  		$scope.getMessengers();
					       	  		angular.element('#saved-toggle').trigger('click');})
					       	  		.error(function(){
					       	  			document.getElementById('loader').style.display='none';
					       	  			$rootScope.message='ארעה שגיאה במחיקת הנהג';
					       	  			angular.element('#saved-toggle').trigger('click');
					       	  		});
		}
		
		
		//first function for initialize the page
		function init(){
			$scope.currentDate = new Date();
			$scope.newMessenger = {is_usher:false};
			$scope.getMessengers();
		};
		
		init();
		
}

})();