
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.reports')
      .controller('ReportsCtrl', ReportsCtrl);
  /** @ngInject */
  function ReportsCtrl($scope,$rootScope,$http,$location,$state,$filter) {
  	var monthFormat =  buildLocaleProvider("MMM-YYYY");
  	var ymdFormat =  buildLocaleProvider( "YYYY-MM-DD");
  	
  	function buildLocaleProvider(formatString) {
        return {
            formatDate: function (date) {
                if (date) return moment(date).format(formatString);
                else return null;
            },
            parseDate: function (dateString) {
                if (dateString) {
                    var m = moment(dateString, formatString, true);
                    return m.isValid() ? m.toDate() : new Date(NaN);
                }
                else return null;
            }
        };
    }
  
    	$rootScope.module=        'reports';
    	$scope.controller=   	   'reports';
    	$rootScope.headline='דוחות';
		$scope.exportExcel = function(){
			
			var dateReport = $scope.dateReport;
			document.getElementById('loader').style.display = 'block';
			$http.post($rootScope.baseUrl + 'sendto/report_one' ,{date:dateReport})
    		.success(function(data){
    			document.getElementById('loader').style.display = 'none';
				var data = data;
				var a = document.getElementById('csv');  
			    a.textContent='download';
			    a.download="MyFile.xls";
			    a.href='data:text/csv;charset=utf-8,%EF%BB%BF'+encodeURIComponent(data);   
			    a.click();	
    		})
    		.error(function(){
    			$rootScope.message = 'ארעה שגיאה';
    			angular.element('#saved-toggle').trigger('click');
    		});
		}
		
		$scope.exportExcelMonthly = function(){
			$scope.exportExcel('month');
		}
		
		$scope.exportExcelDayly = function(){
			$scope.exportExcel('day');
		}
		
    
    /*var startDate = new Date();
	
	$('.from').datepicker({
	    autoclose: true,
	    minViewMode: 1,
	    format: 'mm/yyyy'
	}).on('changeDate', function(selected){
	        startDate = new Date(selected.date.valueOf());
	        startDate.setDate(startDate.getDate(new Date(selected.date.valueOf())));
	        $('.to').datepicker('setStartDate', startDate);
	    });*/ 
	    
  }

})();
