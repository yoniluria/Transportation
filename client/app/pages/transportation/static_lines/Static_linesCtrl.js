
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.static_lines')
      .controller('Static_linesCtrl', Static_linesCtrl);
  /** @ngInject */
  function Static_linesCtrl($scope,$rootScope,$http,$location,$state,$filter) {
    	$rootScope.module=        'static_lines';
    	$scope.controller=   	   'staticlines';
    	$rootScope.headline='נהול קווים';
    	$scope.title_btn_save = 'הוסף';
    	
    	$scope.editLine = function(line){
    		$scope.newLine = line;
    		$scope.title_btn_save = 'עדכן';
    	}
    	
    	$scope.save = function(){
    		document.getElementById('loader').style.display='block';
    		$http.post($rootScope.baseUrl+$scope.controller+'/save_static_line',{data:$scope.newLine})
    		.success(function(data){
    			document.getElementById('loader').style.display='none';
    			$rootScope.message = 'הנתונים נשמרו בהצלחה';
    			angular.element('#saved-toggle').trigger('click');
    			$scope.title_btn_save = 'הוסף';
    			$scope.newLine = null;
    			$scope.submitted = false;
    			getAllStaticLines();
    		})
    		.error(function(){
    			document.getElementById('loader').style.display='none';
    			$rootScope.message = 'שגיאה בשמירת הנתונים';
    			angular.element('#saved-toggle').trigger('click');
    		});
    	}
    	
    	$scope.setLineToDelete = function(line){
    		$scope.lineToDelete = line;
    	}
    	
    	$scope.deleteLine = function(){
    		document.getElementById('loader').style.display='block';
    		$http.post($rootScope.baseUrl+$scope.controller+'/delete_static_line',{line_id:$scope.lineToDelete.id})
    		.success(function(data){
    			document.getElementById('loader').style.display='none';
    			$rootScope.message = 'הקו נמחק בהצלחה';
    			angular.element('#saved-toggle').trigger('click');
    			getAllStaticLines();
    		})
    		.error(function(){
    			document.getElementById('loader').style.display='none';
    			$rootScope.message = 'שגיאה במחיקת קו';
    			angular.element('#saved-toggle').trigger('click');
    		});
    	}
    	
    	function getAllStaticLines(){
    		document.getElementById('loader').style.display='block';
    		$http.post($rootScope.baseUrl+$scope.controller+'/get_all_static_lines')
    		.success(function(data){
    			document.getElementById('loader').style.display='none';
    			$scope.static_lines = data;
    		})
    		.error(function(){
    			document.getElementById('loader').style.display='none';
    			$rootScope.message = 'שגיאה בשליפת נתוני קווים סטטיים';
    			angular.element('#saved-toggle').trigger('click');
    		});    		
    	}
    	
    	function init(){
			getAllStaticLines();
    	}
    	
    	init();
    	
	}
})();
