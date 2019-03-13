
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
    			$("#hideTable").append(data);
				$("#yourHtmTable").table2excel({
				    exclude: ".excludeThisClass",
				    name: "Worksheet Name",
				    filename: "SomeFile" //do not include extension
				});
				retuen;
    			var tab_text = data;
    			var tab_text="<table border='2px'><tr bgcolor='#87AFC6'><td width='7%'>שם אחראי</td>"+
		"<td width='7%'>מערכת</td>"+
		"<td width='25%'>מודול</td>"+
		"<td width='25%'>משימה</td>"+	
		"<td width='10%'>שעת התחלה</td>"+
		"<td width='10%'>שעת סיום</td>"+
		"<td width='7%'>סה''כ שעות</td>"+
		"<td width='35%'>תאור</td></tr><tr></table>";
    			tab_text= tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
			    tab_text= tab_text.replace(/<img[^>]*>/gi,""); // remove if u want images in your table
			    tab_text= tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params
			
			    var ua = window.navigator.userAgent;
			    var msie = ua.indexOf("MSIE "); 
			
			    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
			    {
			        txtArea1.document.open("txt/html","replace");
			        txtArea1.document.write(tab_text);
			        txtArea1.document.close();
			        txtArea1.focus(); 
			        var sa=txtArea1.document.execCommand("SaveAs",true,"Say Thanks to Sumit.xls");
			    }  
			    else                 //other browser not tested on IE 11
			        var sa = window.open('data:application/vnd.ms-excel; charset=UTF-8,' + encodeURIComponent(tab_text));  
			
			    return (sa);	
    		})
    		.error(function(){
    			$rootScope.message = 'ארעה שגיאה';
    			angular.element('#saved-toggle').trigger('click');
    		});
			/*var tab_text="<table border='2px'><tr bgcolor='#87AFC6'><td width='7%'></td>"+
				"<td width='7%'></td>"+
				"<td width='25%'></td>"+
				"<td width='25%'></td>"+	
				"<td width='10%'></td>"+
				"<td width='10%'></td>"+
				"<td width='7%'></td>"+
				"<td width='35%'></td></tr><tr>";
		    var textRange; var j=0;
		    tab = document.getElementById('tableHours'); // id of table
		
		    for(j = 0 ; j < tab.rows.length ; j++) 
		    {     
		        tab_text=tab_text+tab.rows[j].innerHTML+"</tr>";
		        //tab_text=tab_text+"</tr>";
		    }
		
		    tab_text=tab_text+"</table>";
		    tab_text= tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
		    tab_text= tab_text.replace(/<img[^>]*>/gi,""); // remove if u want images in your table
		    tab_text= tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params
		
		    var ua = window.navigator.userAgent;
		    var msie = ua.indexOf("MSIE "); 
		
		    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
		    {
		        txtArea1.document.open("txt/html","replace");
		        txtArea1.document.write(tab_text);
		        txtArea1.document.close();
		        txtArea1.focus(); 
		        sa=txtArea1.document.execCommand("SaveAs",true,"Say Thanks to Sumit.xls");
		    }  
		    else                 //other browser not tested on IE 11
		        sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));  
		
		    return (sa);*/
		}
		
		$scope.dateFields = [
                {
                    type: 'date',
                    required: false,
                    binding: 'applicant.pickADate',
                    label: 'Standard Date Field - picking day, month and year',
                    startView: 'day',
                    mode: 'day',
                    locale: ymdFormat
                },
                {
                    type: 'date',
                    required: true,
                    binding: 'applicant.dateOfBirth',
                    label: 'Date of Birth (date picker that starts with month and year, but still needs day)',
                    startView: 'month',
                    mode: 'day',
                    locale: ymdFormat
                },
                {
                    type: 'date',
                    required: false,
                    binding: 'applicant.expectedGraduation',
                    startView: 'month',
                    label: 'Credit Card Expiry - Year/Month picker',
                    mode: 'month',
                    locale: monthFormat
                }
    ];
    
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
