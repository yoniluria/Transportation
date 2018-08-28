(function () {
  'use strict';

  angular.module('RouteSpeed.pages.shifts')
      .controller('shiftsCtrl', shiftsCtrl);

  /** @ngInject */
  function shiftsCtrl($scope,$rootScope,$http,$location,$state, connectPOSTService, connectGETService, connectDELETEService,$compile) {
  	
  		//init************************************************************
    	$rootScope.module='shifts';     
    	$scope.controller='shift';
    	$rootScope.headline = "משמרות";
    	// $scope.newShift={};
    	// $scope.title_btn_save="הוסף";
    	var input = $('#clock_hour');
		input.clockpicker({
		  autoclose: true,
		}).change(function(){
		$scope.newShift.hour = this.value;
	});
	$("#filter_hour").clockpicker({
		  autoclose: true
		  }).change(function(){
		  	if(!$scope.shiftfilter)$scope.shiftfilter={};
		  	if(this.value==""||this.value==null)
		  	delete $scope.shiftfilter.hour;
		  	else
		  	$scope.shiftfilter.hour=this.value;
		  });	
   		//get all shifts
		$scope.getShifts = function() {
			connectGETService.fn($scope.controller + '/getallshifts').then(function success(data) {
				$scope.shifts = data.data.shifts;
				console.log($scope.shifts);
						}, function error(error) {
							alert('שגיאה ארעה בעת נסיון לקבלת נתונים');
						});
		}
		
    	$scope.getShifts();
		
   //end init*********************************************************
   
   //crud *****************************************************************
    	//save new shift or update
		$scope.save = function() {
			
			var newShift = angular.copy($scope.newShift);
			
			$http.post($rootScope.baseUrl+$scope.controller+'/saveshift',newShift)
			.success(function(data){
				if(data!='ok'){
					$rootScope.message = data;
				}
				else{
					$rootScope.message = 'הנתונים נשמרו';
					// $scope.newShift = {};
					delete $scope.submitted;
					// $scope.title_btn_save="הוסף";
					$scope.getShifts();
					angular.element('#saved-toggle').trigger('click');
				}
			})
			.error(function(){
				$rootScope.message = 'בעיה בשמירת נתונים, נסה שוב מאוחר יותר';
				angular.element('#saved-toggle').trigger('click');
			});
			
		}
	$scope.editshift=function(shift){
		$scope.newShift=shift;
		$scope.title_btn_save="עדכן";
	}	
	
	$scope.deleteshift=function(shift){
	var r = confirm("האם אתה בטוח שברצונך למחוק משמרת זו?");
	if (r == true) {
	   			connectPOSTService.fn($scope.controller + '/deleteshift', {id:shift.id}).then(function(data) {
				if (data.data != "ok") {
					// alert(data.data);
					$rootScope.message = "לא ניתן למחוק משמרת זאת";
				} else {
					$rootScope.message = "המשמרת נמחקה";
					$scope.getShifts();
				}
				$("#saved").modal("toggle");
				setTimeout(function(){$("#saved").modal("toggle");},1500);
			}, function(e) {
				$scope.message = "בעיה בשמירת נתונים, נסה שוב מאוחר יותר";
			});
	} else {
	    alert("You pressed Cancel!");
	}
	}	
	//end crud ******************************************************************

	//functions **********************************************************************
	$scope.filtershifts=function(){
		console.log($scope.shiftfilter);
		if(!$scope.shiftfilter.name)
		delete $scope.shiftfilter.name;
	}
	//end functions **********************************************************************	
  }
  

})();