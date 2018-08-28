
(function () {
  'use strict';

  angular.module('RouteSpeed.theme')
  .filter('dateDiff', function() {
  	var magicNumber = (1000 * 60 * 60 * 24);
  	
  return function (toDate, fromDate) {
    if(toDate && fromDate){
    	if((typeof fromDate)=="string")
    	var fromDate=new Date(fromDate);
    	fromDate=new Date(fromDate.getUTCFullYear(),fromDate.getUTCMonth(),fromDate.getUTCDate());
    	if((typeof toDate)=="string")
    	var toDate=new Date(toDate);
    	toDate=new Date(toDate.getUTCFullYear(),toDate.getUTCMonth(),toDate.getUTCDate());
      var dayDiff = Math.floor((toDate - fromDate) / magicNumber);
      if (angular.isNumber(dayDiff)){
        return dayDiff;
      }
    }
    return -1;
   }
    
  });

  /** @ngInject */


})();
