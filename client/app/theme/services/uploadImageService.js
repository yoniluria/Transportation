
(function () {
  'use strict';

  angular.module('RouteSpeed.theme')
    .service('uploadImageService',  function($http,$rootScope) {
     var dataStorage;//storage for cache

     return {fn:function(url,fd) {
        //var header=localStorage.getItem("authKey");
        return dataStorage = $http.post($rootScope.baseUrl+url,fd,{
        									 headers: {
   												 	'Content-Type': undefined,
   												 	'X-CSRF-TOKEN': "a97da629b098b75c294dffdc3e463904_c6b6f1f9ea497f9ff6d05bbfc2f5c3"}
									})
			                         .then(function (response) {
							              return response;
							        },function (err) {
								             //$location.path('/login');
								     });
        
        
        /*
         $.ajax({
                                       url:$rootScope.baseUrl+url,
                                       data: fd,
                                       contentType: false,
                                       processData: false,
                                       type: 'POST',
                                       success: function(response){
                                           return response;
                                       },
                                       error: function(response){
                                          return response;
                                       }     
           });*/
        

    }
    }

});

  /** @ngInject */
  

})();