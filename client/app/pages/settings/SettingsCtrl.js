
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.settings')
      .controller('SettingsCtrl', SettingsCtrl);

  /** @ngInject */
  function SettingsCtrl($scope,$rootScope,$location, $state,$filter,connectGETService,connectPUTService,uploadImageService) {
  	
	  	$rootScope.module=		'settings';
	  	$scope.controller= 	  'definition';
	    $scope.settings;
	    
	  
	
	     
	     $scope.saveSettings=function(isValid){
			 if(isValid){
			 	     if(!$rootScope.settings.time_destination_load||!parseInt($rootScope.settings.time_destination_load))
                            $rootScope.settings.time_destination_load= Math.abs($rootScope.settings.temp_workday_end - $rootScope.settings.temp_workday_start) / 60000;
			 		
			 		$rootScope.settings.workday_start=$filter('date')(new Date($rootScope.settings.temp_workday_start), "yyyy-MM-dd HH:mm:ss");
			 		$rootScope.settings.workday_end=$filter('date')(new Date($rootScope.settings.temp_workday_end), "yyyy-MM-dd HH:mm:ss");

			  		connectPUTService.fn($scope.controller+'/savedefinition',$rootScope.settings.id,$rootScope.settings).then(function(data) {
			  			$rootScope.settings= data.data;
			  			$rootScope.getSettings();
			  			$rootScope.message="הנתונים נשמרו";
					    angular.element('#saved-toggle').trigger('click');
					    setTimeout(function(){ 
					    	angular.element('#saved').trigger('click'); 
					    }, 2000);
					},function(e){
						$rootScope.message="בעיה בשמירת נתונים, נסה שוב מאוחר יותר";
					    angular.element('#saved-toggle').trigger('click');
					    setTimeout(function(){ 
					    	angular.element('#saved').trigger('click'); 
					    }, 2000);
					});
			 }
			 
	  	 }
	
	  	 $scope.uploadImage=function(event){
	  	 	if(!event.target.files||event.target.files.length==0)
			   return;
	        var formData=new FormData();
	        formData.append("file",event.target.files[0]);
	  		uploadImageService.fn($scope.controller+'/uploadimage',formData).then(function(data) {
	  			       $rootScope.settings.image_file= data.data;
	  			       $state.reload();
							
			 },function(e){
		     });
			 document.getElementById('upload').value=''; 
	  	 };
	  	 $scope.getProfile=function(title){
	  	 	if($rootScope.settings)
		  	 	    return $rootScope.settings.profile;
	  	    return null;
		 }


  }

})();










 
