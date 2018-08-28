
(function () {
  'use strict';

  angular.module('RouteSpeed.theme')
  .filter('sumByKeyFilter', function() {
   return function(data, key) {
            if (typeof(data) === 'undefined' || typeof(key) === 'undefined') {
                return 0;
            }
 
            var sum = 0;
            for (var i = data.length - 1; i >= 0; i--) {
            	if(parseInt(data[i][key]))
                sum += parseInt(data[i][key]);
            }
 
            return sum;
        };
});
  /** @ngInject */


})();
