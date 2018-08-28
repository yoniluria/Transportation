
(function () {
  'use strict';

  angular.module('RouteSpeed.theme')
    .service('connectPUTService',  function($rootScope,$http,$location) {
     var dataStorage;//storage for cache
     
     return {fn:function(url,id,data) {
     		var header=localStorage.getItem("authKey");
	        return dataStorage =  	$http.put($rootScope.baseUrl+url,data,{
   												headers: {'X-CSRF-TOKEN': header}
									})
	                         .then(function (response) {
				                if (typeof data == 'object') 
				                     return response;
						              return JSON.parse(response);
						        },function (err) {
						                
						            if(err.status==401)
								             $location.path('/login');
								             else throw err;
						        });

    }
    }

});

  /** @ngInject */
  

})();