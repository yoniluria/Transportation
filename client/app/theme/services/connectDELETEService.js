
(function () {
  'use strict';

  angular.module('RouteSpeed.theme')
    .service('connectDELETEService',  function($rootScope,$http,$location) {
     var dataStorage;//storage for cache
    
     
     return {fn:function(url,id) {
     	 	var header=localStorage.getItem("authKey");
	        return dataStorage =  	$http.delete($rootScope.baseUrl+url+'&id='+id,{
   												headers: {'X-CSRF-TOKEN': header}
									})
	                         .then(function (response) {
					              return response;
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