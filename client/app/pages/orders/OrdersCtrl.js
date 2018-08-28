
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.orders')
      .controller('OrdersCtrl', OrdersCtrl)
	  .filter('formatDate',function(){
    	return function(input){
    		var date=new Date(input);
    		if ( Object.prototype.toString.call(date) === "[object Date]" ) {
				  // it is a date
				  if ( isNaN( date.getTime() ) ) {  // d.valueOf() could also work
				    // date is not valid
				     return 0;
				  }
				  else {
				    // date is valid
				    return date;
				  }
				}
				else {
				  // not a date
				  return 0;
				}
    		}
    		})
.filter('dateDiff', function () {
  var magicNumber = (1000 * 60 * 60 * 24);

  return function (toDate, fromDate) {
    if(toDate && fromDate){
    	if((typeof fromDate)=="string")
    	var fromDate=new Date(fromDate);
    	if((typeof toDate)=="string")
    	var toDate=new Date(toDate);
      var dayDiff = Math.floor((toDate - fromDate) / magicNumber);
      if (angular.isNumber(dayDiff)){
        return dayDiff;
      }
    }
    return -1;
    
  };
});
  /** @ngInject */
  function OrdersCtrl($scope,$state,$rootScope,$filter,$http,$location,connectGETService,connectPUTService,connectPOSTService,connectDELETEService,$q) {
  	
        $rootScope.module=        'orders';
	  	$scope.controller= 	       'order';
	    $scope.orders					  ;
	    $scope.filterByMessenger=       -1;
	    $rootScope.order_date             ;
	    $scope.currentdate     =new Date();
	    $scope.exportAll= 			 false;
	    $scope.filterTrackId 			 ;
	    $scope.currentdate.setDate($scope.currentdate.getDate() - 1);
	  	$scope.getOrders=function(){
			  		if($rootScope.colapseArea)
			  			document.getElementById('colapseArea').style.height='auto';
	     			 var date = $filter('date')($rootScope.order_date, "yyyy-MM-dd");
		            connectGETService.fn( $scope.controller+'/getallorder&date='+date.toString()).then(function(data) {
					     $scope.orders= data.data;
					     $scope.allOrders=data.data;
					     $scope.exportAll=false;
					     $scope.checkAll();
					     $scope.checkAllOld();
					     if($state.params.id){	
					     	
						     	 var index=$filter('getByIdFilter')($scope.allOrders,$state.params.id);
						     	 if(index>-1){
						     		$rootScope.newOrder=$scope.allOrders[index];
							     	$scope.editOrder($rootScope.newOrder);
							     }
							     else{
							     	$location.path('/orders');
				           			if(!$scope.$$phase)
				    					$scope.$apply();
							     }
						}
						else{
							$scope.newOrder={};
				    	    $scope.newOrder.time_order=new Date();
				    	    $scope.newOrder.tempTime=($rootScope.settings.temp_workday_start.getHours()+$rootScope.settings.temp_workday_start.getMinutes()/100).toString();
			    	    }
						},function(e){
						
						});
				
		 			if(!$scope.messengers){
				            connectGETService.fn( 'messengers'+'/messenger').then(function(data) {
							     $scope.messengers= data.data;
							     $scope.messengers.splice(0, 0, {id:0,name:"שיבוץ אוטומטי"});
							     $scope.messengers.splice(0, 0, {id:-1,name:"בחר שליח"});
							    
							   
							},function(e){
								
							});
					}
				
				 
					// $scope.times=[];
					// for(var i=0;i<7;i++)
					// {   $scope.times[i]={};
					// $scope.times[i].time=new Date();
					// $scope.times[i].time.setMinutes($scope.times[i].time.getMinutes() + (i*5));
					// $scope.times[i].timeString=$filter('date')($scope.times[i].time, "HH:mm");
					// }
					// $scope.newOrder.time_order=$scope.times[0];
					
					/*$scope.newOrder.categories=[];*/
					
	     }
	     
	var init =function(){
	 	/*
		 if(!$scope.categories){
							 connectGETService.fn( 'definition'+'/profiloption').then(function(data) {
								  $scope.categories= data.data;
							 },function(e){
																});
						 }	*/
	  $scope.listToExport=[];
	  $scope.listToExportOld=[];
	  $scope.getOrders();	
	 
	  }();
	 
		$scope.getRoutesByDate=function(){
			document.getElementById('loader').style.display='block';
			 connectGETService.fn( $scope.controller+'/getallorder&date='+($filter('date')($rootScope.order_date, "yyyy-MM-dd").toString()).toString()).then(function(data) {
			 	    if(data ){
			 	    	console.log(data);
			 	       $scope.allOrders=data.data;
				        $scope.orders=data.data;
				        $scope.exportAll=false;
				         $scope.exportAllOld=false;
				        $scope.checkAll();
				         $scope.checkAllOld();
				         $scope.searchAll();
				   //     $scope.filterOrder();
				       }
				       document.getElementById('loader').style.display='none';
				  },function(e){
				  	document.getElementById('loader').style.display='none';
						
				});	
		}
	  $scope.setBetweenHours=function(){
	  
	  }();
	  $scope.colapseOrderArea=function(){
	  	if(!	$rootScope.colapseArea){
	  	    document.getElementById('colapseArea').style.height='auto';
		  	
		  	if($state.params.id){
		  		$location.path('/orders');
				if(!$scope.$$phase)
					  $scope.$apply();
		  	}
	  	}
	  	else{
	  		 document.getElementById('colapseArea').style.height='60px';
	  	}
	  	$rootScope.colapseArea=!$rootScope.colapseArea;
	  
	  }
	 $scope.save=function(){
	 	             $rootScope.colapseArea=false;
	 		         document.getElementById('colapseArea').style.height='60px';
	 				$scope.submitted=false;
	 				var newOrder=angular.copy($scope.newOrder);
	 				newOrder.categories=[];
	 				// var date=new Date(newOrder.date.getFullYear(), newOrder.date.getMonth(), newOrder.date.getDate(), newOrder.time_order.time.getHours(), newOrder.time_order.time.getMinutes(), newOrder.time_order.time.getSeconds());
	 				if(newOrder.time_order && newOrder.time_order !='undefined'&&!newOrder.time_set){
	 				   	 newOrder.time_order=$filter('date')(new Date(newOrder.time_order.getFullYear(), newOrder.time_order.getMonth(), newOrder.time_order.getDate(),0 ,0 ,0), "yyyy-MM-dd HH:mm:ss");

	 				}
	 				else if(newOrder.tempTime && newOrder.tempTime!='undefined' && newOrder.time_order && newOrder.time_order!='undefined' )
	 					newOrder.time_order=$filter('date')(new Date(newOrder.time_order.getFullYear(), newOrder.time_order.getMonth(), newOrder.time_order.getDate(), Math.floor(newOrder.tempTime),Math.round(newOrder.tempTime*100%100) ,0), "yyyy-MM-dd HH:mm:ss");
	 				
	 				else if(newOrder.time_order && newOrder.time_order !='undefined')
	 				     newOrder.time_order=$filter('date')(newOrder.time_order, "yyyy-MM-dd");
	 			
	 				if(newOrder.id)//אם במצב עריכה
	  				{
	  					if(newOrder.address.components && newOrder.address.components != "undefined" ){
	  						newOrder.city = newOrder.address.components.city;
	  						newOrder.street = newOrder.address.components.street;
	  						newOrder.number = newOrder.address.components.streetNumber;
	  					}
	  					if( newOrder.address.components.location && newOrder.address.components.location != "undefined"){
	  						newOrder.lat = newOrder.address.components.location.lat;
	  						newOrder.lng = newOrder.address.components.location.long;
	  						
	  					}
	  					//newOrder.lat = newOrder.address.location.lat;
	  				// $http.post($rootScope.baseUrl+$scope.controller+'/uptime_orderorder',newOrder)
					// .success(function(data){
					// $scope.getOrders();
					// })
					// .error(function(data){$scope.getOrders();});
					connectPOSTService.fn($scope.controller+'/updateorder',newOrder).then(function(data) {
						$scope.newOrder={};
						$rootScope.newOrder={};
						$scope.message="הנתונים נשמרו";
					   	toggleModal(); 
					    setTimeout(function(){
					    
					    	$location.path('/orders');
				           	if(!$scope.$$phase)
				    			$scope.$apply();
				    		
					    }, 1000);
			           
					},function(e){
						$scope.message="בעיה בשמירת נתונים, נסה שוב מאוחר יותר";
					    toggleModal();
						$scope.getOrders();
					});
	  				}
					else//יצירת חדש
					{
					connectPOSTService.fn($scope.controller+'/saveorder',newOrder).then(function(data) {
					
			        $scope.getOrders();
			         $scope.message="הנתונים נשמרו";
					    toggleModal();
					    $scope.newOrder={};
				    	$scope.newOrder.time_order=new Date();
				    	$scope.newOrder.tempTime=($rootScope.settings.temp_workday_start.getHours()+$rootScope.settings.temp_workday_start.getMinutes()/100).toString();
					},function(e){
						$scope.message="בעיה בשמירת נתונים, נסה שוב מאוחר יותר";
					    toggleModal();
						$scope.getOrders();
					});
					
					
					}
					
	 }
	function toggleModal () {
		                  angular.element('#saved-toggle').trigger('click');
					    setTimeout(function(){ 
					    	angular.element('#saved').trigger('click'); 
					    	var element=document.getElementsByClassName('modal-backdrop');
							if(element[0])
							   element[0].parentNode.removeChild(element[0]);
					    }, 1000);
		
	}
	$scope.editOrder=function(order){
		document.getElementById('colapseArea').style.height='auto';
		if($state.params.id)
		   var url=$state.$current.url.prefix+order.id;
		else  var url=$state.$current.url.prefix+'/'+order.id;
		$location.path(url);
		$scope.newOrder=angular.copy(order);
		$scope.newOrder.num_order=parseInt($scope.newOrder.num_order, 10);
		$scope.newOrder.price=parseInt($scope.newOrder.price, 10);
		$scope.newOrder.floor=parseInt($scope.newOrder.floor, 10); 
		$scope.newOrder.stop_stay=parseInt($scope.newOrder.stop_stay, 10);
		//המרה לאוביקט תאריך על מנת להציגו נכון
		if($scope.newOrder.time_order)
		$scope.newOrder.time_order=new Date($scope.newOrder.time_order);
		//המרה לאוביקט תאריך על מנת להציגו נכון
		if($scope.newOrder.time_order&&$rootScope.hours&&$rootScope.hours.length>0){
			$scope.newOrder.time_order=new Date($scope.newOrder.time_order);
			var temp=$scope.newOrder.time_order.getHours()+$scope.newOrder.time_order.getMinutes()/100;
			for (var i=0; i < $rootScope.hours.length-1; i++) {
				var from=$rootScope.hours[i].id,to=$rootScope.hours[i + 1].id;
				if(to<from)
					 to=Math.floor(from)+Math.floor(Math.abs((Math.round(from*100)%100)+parseInt($rootScope.settings.time_destination_load)) / 60)+(((Math.abs((Math.round(from*100)%100)+parseInt($rootScope.settings.time_destination_load))) % 60)%100)/100
						    		
				if (to> temp && from <= temp)
			    	$scope.newOrder.tempTime=$rootScope.hours[i].id.toString(); 
			};
			if(!$scope.newOrder.tempTime)$scope.newOrder.tempTime=$rootScope.hours[$rootScope.hours.length - 1].id.toString();
			
		}
		//עדכון השעות מהשעה שהיתה למשך חצי שעה

		//שליפת השליח
		/*
		var index=$filter('getByIdFilter')($scope.messengers,$scope.newOrder.messengerr.id);
				$scope.newOrder.messenger=$scope.messengers[index];*/
		
		$rootScope.newOrder=$scope.newOrder;
	}
	
	$scope.delOrder=function(order){
		$scope.orderForDelete=order;	
	}

	$scope.deleteOrder=function(){
				connectDELETEService.fn( $scope.controller+'/deleteorder',$scope.orderForDelete.id).then(function(data) {
			     var index=$filter('getByIdFilter')($scope.orders,$scope.orderForDelete.id);
			     if(index!=-1)
			        $scope.orders.splice(index, 1);
			     var index=$filter('getByIdFilter')($scope.allOrders,$scope.orderForDelete.id);
			     if(index!=-1)
			        $scope.allOrders.splice(index, 1);   
			    $location.path('/orders');	
			    if(!$scope.$$phase)
			    $scope.$apply();
			},function(e){
				
			});
	}
	$scope.deleteAllOrders=function(){
		        if($scope.isNew)
		        $scope.ordersForDelete=$scope.listToExport;
		        else  $scope.ordersForDelete=$scope.listToExportOld;
				connectPOSTService.fn( $scope.controller+'/deleteallorders',$scope.ordersForDelete).then(function(data) {
					 angular.forEach($scope.ordersForDelete, function(value, key) {
					 	         var index=$filter('getByIdFilter')($scope.orders,value.id);
							     if(index!=-1)
							        $scope.orders.splice(index, 1);
							     var index=$filter('getByIdFilter')($scope.allOrders,value.id);
							     if(index!=-1)
							        $scope.allOrders.splice(index, 1);  
					});
			           $scope.message=$scope.ordersForDelete.length+" רשומות נמחקו בהצלחה ";
					    angular.element('#saved-toggle').trigger('click');
					    setTimeout(function(){ 
					    	angular.element('#saved').trigger('click'); 
					    }, 2000);
				    $location.path('/orders');
				    if(!$scope.$$phase)
				    	$scope.$apply();
			},function(e){
				
			});
	}
	$scope.chooseCategory=function(subcategory)
	{
		angular.forEach($scope.newOrder.categories,function(category){
			if(category.optionid==subcategory.optionid)
			{
				if($scope.newOrder.categories.indexOf(category)!=-1)
				delete $scope.newOrder.categories[$scope.newOrder.categories.indexOf(category)]
			}
		});
		
		$scope.newOrder.categories.push(subcategory);
		
	}
	
	$scope.toExport=function(order){
		if($scope.listToExport.indexOf(order)==-1)
		{
			$scope.listToExport.push(order);
		}
		else{
			var index=$scope.listToExport.indexOf(order);
			$scope.listToExport.splice(index,1);
		}
		
		
	}
	$scope.toExportOld=function(order){
		if($scope.listToExportOld.indexOf(order)==-1)
		{
			$scope.listToExportOld.push(order);
		}
		else{
			var index=$scope.listToExportOld.indexOf(order);
			$scope.listToExportOld.splice(index,1);
		}
		
		
	}
	
	$scope.checkAll=function(){
		$scope.exportAll=!$scope.exportAll;
		if($scope.exportAll){
			 $scope.listToExport=[];
			 angular.forEach($scope.orders, function(value, key) {
			 	if(value.track_id==null)
					$scope.listToExport.push(value);  
			});
		}
		else
		$scope.listToExport=[];
	}
		$scope.checkAllOld=function(){
		$scope.exportAllOld=!$scope.exportAllOld;
		if($scope.exportAllOld){
			 $scope.listToExportOld=[];
			 angular.forEach($scope.orders, function(value, key) {
			 	if(value.track_id!=null)
					$scope.listToExportOld.push(value);  
			});
		}
		else
		$scope.listToExportOld=[];
	}
	
	function filterByParameter(param,secondParam,value){
		
			return function(element) {
			       	    if(!element[param])return false;
						if(secondParam && secondParam != "undefined"&&secondParam != ''&&secondParam != ""){
						    if(!element[param][secondParam])return false;
		    				return element[param][secondParam].toString().indexOf(value.toString())!=-1;
		    			}
				        return element[param].toString().indexOf(value.toString())!=-1;
		    }	
    }
    function filterByAll(value){
		
			return function(element) {
				var tmp=angular.copy(element);
				tmp.time_order= $filter('date')(new Date(tmp.time_order), "dd.MM HH:mm"); 
				var isEquale=false;
				var arr=[{first:'address',second:'name'},{first:'customer_name'},{first:'remarks'},{first:'num_order'},{first:'time_order'},{first:'messengerr',second:'name'}]
				    for (var i=0; i < arr.length; i++) {
				    	if(!arr[i].second){
				    		if(tmp[arr[i].first]&&tmp[arr[i].first].toString().indexOf(value.toString())!=-1){
				    		    isEquale=true;
				    		    break;
				    		   }
				    	}
				    	else{
				    		if(tmp[arr[i].first]&&tmp[arr[i].first][arr[i].second]&&tmp[arr[i].first][arr[i].second].toString().indexOf(value.toString())!=-1){
				    			isEquale=true;
				    		    break;
				    		}
				    	}
					     
					};
				        return isEquale;
		    }	
    }
    function filterByParameterEquals(param,secondParam,value){
		
			return function(element) {
						if(secondParam && secondParam != "undefined"&&secondParam != '')
		    				return element[param][secondParam]==value;
				        return element[param]==value;
		    }	
    }
	function filterByDateParameter(param,value){
		
			return function(element) {
				var date=new Date(element[param]);
				date.setHours(0, 0, 0, 0);
				value.setHours(0, 0, 0, 0);
				return (new Date(date.getFullYear(),date.getMonth(),date.getDate())).getTime()==value.getTime();
				        
		    }	
    }
   $scope.searchAll=function(){
		$scope.orders=$scope.allOrders;
	  	if($scope.searchInput&&$scope.searchInput!=""){
	  		$scope.orders =$scope.orders.filter(filterByAll($scope.searchInput));
	  	}
	  		
	}
	$scope.filterOrder=function(){
		$scope.orders=$scope.allOrders;
	  	if($scope.filterAddress&&$scope.filterAddress!="")
	  		$scope.orders = $scope.orders.filter(filterByParameter('address','name',$scope.filterAddress));
	  	if($scope.filterCustomer&&$scope.filterCustomer!="")
	  		$scope.orders = $scope.orders.filter(filterByParameter('customer_name',null,$scope.filterCustomer));
	  	if($scope.filterOrderPhone&&$scope.filterOrderPhone!="")
	  		$scope.orders = $scope.orders.filter(filterByParameter('phone','',$scope.filterOrderPhone));
	  	// if($scope.filterMessenger&&$scope.filterMessenger!=""&&$scope.filterMessenger!="בחר שליח")
	  		// $scope.orders = $scope.orders.filter(filterByParameterEquals('messengerr','id',$scope.filterMessenger));
	  /*
		  if($scope.filterOrderDate)
					$scope.orders = $scope.orders.filter(filterByDateParameter('time_order',$scope.filterOrderDate));*/
	  
	  /*
		  if($scope.filterEstimatedArrivalTime)
					$scope.orders = $scope.orders.filter(filterByDateParameter('estimated_time_arrival',$scope.filterEstimatedArrivalTime));*/
	/*
		if($scope.filterTrackId&&$scope.filterTrackId!="")
				  $scope.orders = $scope.orders.filter(filterByParameterEquals('track_id','',$scope.filterTrackId));*/
		if(!$scope.isNew&&$scope.filterByMessenger!=null&&$scope.filterByMessenger.toString()!=""&&$scope.filterByMessenger!=-1)
	  		$scope.orders = $scope.orders.filter(filterByParameterEquals('messengerr','id',$scope.filterByMessenger));
	  	if($scope.filterOrderNum&&$scope.filterOrderNum!="")
	  		$scope.orders = $scope.orders.filter(filterByParameterEquals('num_order','',$scope.filterOrderNum));
	  
	  	
	}
	$scope.isInvalid=function(){
		var element=document.getElementById('xls_table');
		if(!element)return true;
		if(element.getElementsByClassName("error").length>0)
			return true;
		return false;
	}
	$scope.loadXLS=function(){
		
	}
		$scope.dataProcessing=function(output){
			var result=JSON.parse(output);
			document.getElementById('loader').style.display='block';
			
	/*
			function chainedAjax(param1, param2) {
					  var something = something;
					  return $http({})
						.then(function(responseData) {
						  // processing 
						  return $http({});
						})
						.then(function(responseData) {
						  // processing
						  return $http({});
						})
					}*/
					var requests = [];
					var arr=result;
					var tmp=[];
					angular.forEach(arr, function(value, key) {
						tmp=tmp.concat(value);
					}); 
					//angular.forEach(tmp, function(value, key) {
						   var  count=tmp.length;
						   var index=0;
					       while(count>0){
					       	  requests.push(connectPOSTService.fn($scope.controller+'/saveordersfromxls',{data:tmp.slice(index, index+100)}).then(function(data) {return data.data},function(e){})); 
					          index+=100;
					          count-=100;
					       }	 	     
				//	});
				
				
				 /*
				  angular.forEach(tmp, function(item) {
									 requests.push(chainedAjax(item.param1, item.param2));
								   });*/
				 
				  
				  $q.all(requests)
				    .then(function(data) {
					 	document.getElementById('loader').style.display='none';
						$scope.result=result;
						var arr=[];
						angular.forEach(data, function(value, key) {
							arr=arr.concat(value);
						}); 
						$scope.orders_result=$filter('orderBy')(arr, 'address.name');
						angular.element('#xls_compare-toggle').trigger('click');
					})
				    .catch(function(err) {
					  if(e.status==504){
							$scope.message="טעינת הקובץ נכשלה, נסה לטעון קובץ קטן יותר";
								   
						}
						else $scope.message="טעינת הקובץ נכשלה, נסה לבדוק את תקינות הקובץ ולטעון מחדש ";
						    angular.element('#saved-toggle').trigger('click');
								    setTimeout(function(){ 
								    	angular.element('#saved').trigger('click'); 
								    }, 2000);
						document.getElementById('loader').style.display='none';
					});
			
			
			
			
			
		/*	var tmp=output;
			angular.forEach(tmp, function(value, key) {
				   var  count=value.length;
			       while(value.length){
			       	   fruits.slice(1, 3);
			       }	 	     
			});
			connectPOSTService.fn($scope.controller+'/saveordersfromxls',{data:output}).then(function(data) {
				document.getElementById('loader').style.display='none';
					$scope.result=result;
					$scope.orders_result=data.data;
					angular.element('#xls_compare-toggle').trigger('click');

			        
		},function(e){
			if(e.status==504){
				$scope.message="טעינת הקובץ נכשלה, נסה לטעון קובץ קטן יותר";
					   
			}
			else $scope.message="טעינת הקובץ נכשלה, נסה לבדוק את תקינות הקובץ ולטעון מחדש ";
			    angular.element('#saved-toggle').trigger('click');
					    setTimeout(function(){ 
					    	angular.element('#saved').trigger('click'); 
					    }, 2000);
			document.getElementById('loader').style.display='none';
		});*/
			 
		   document.getElementById('xls').value=''; 
		  	
		
		
		}
	


	$scope.saveOrders=function(){
		//console.log($scope.approval_form);
		if(!$scope.approval_form.$valid){
			return;
		}
		$('#dissmiss_order').click();
		connectPOSTService.fn($scope.controller+'/saveallorders',$scope.orders_result).then(function(data) {
							 $state.go($state.current, {}, {reload: true}); //second parameter is for $stateParams
				},function(e){
					
				});
		
	}
	$scope.createRoute=function(){
		if(!$scope.drivers_number){
			return;
		}
		
		if($scope.listToExport.length <=0){
			return;
		}
		$rootScope.listToExportSize = $scope.listToExport.length;
		var data={
			data:{stops: $scope.listToExport,
					drivers:$scope.drivers_number
				}
		}
		document.getElementById('loader').style.display='block';
			connectPOSTService.fn('track/optimizebytime',data.data).then(function(data) {
				document.getElementById('loader').style.display='none';
						if(data.data.status == 'successfuly done'){
			     			console.log(data);
			     		
			     			var unembedded_size = data.data.data.length;
			           		$scope.message=" שובצו בהצלחה " + ($rootScope.listToExportSize - unembedded_size)+" מתוך: "+ $rootScope.listToExportSize;
					    	angular.element('#saved-toggle').trigger('click');
					    
					    	setTimeout(function(){$location.path('/routes');},3000);
							
						}
						else if(data.data.status == 'error'){
						
			           		$scope.message=" שגיאה! " + data.data.response;
					    	angular.element('#saved-toggle').trigger('click');	
							
						}
					    
					},function(e){
						document.getElementById('loader').style.display='none';
						console.log(e);
			});
	}
	
	///////////////////////test/////////////////////////////////
	



var X = XLSX;
var XW = {
	/* worker message */
	msg: 'xlsx',
	/* worker scripts */
	rABS: './xlsxworker2.js',
	norABS: './xlsxworker1.js',
	noxfer: './xlsxworker.js'
};

var rABS = typeof FileReader !== "undefined" && typeof FileReader.prototype !== "undefined" && typeof FileReader.prototype.readAsBinaryString !== "undefined";
if(!rABS) {
/*
	document.getElementsByName("userabs")[0].disabled = true;
	document.getElementsByName("userabs")[0].checked = false;*/

}

var use_worker = typeof Worker !== 'undefined';
if(!use_worker) {
/*
	document.getElementsByName("useworker")[0].disabled = true;
	document.getElementsByName("useworker")[0].checked = false;*/

}

var transferable = use_worker;
if(!transferable) {
	/*
	document.getElementsByName("xferable")[0].disabled = true;
		document.getElementsByName("xferable")[0].checked = false;*/
	
}

var wtf_mode = false;

function fixdata(data) {
	var o = "", l = 0, w = 10240;
	for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
	o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
	return o;
}

function ab2str(data) {
	var o = "", l = 0, w = 10240;
	for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint16Array(data.slice(l*w,l*w+w)));
	o+=String.fromCharCode.apply(null, new Uint16Array(data.slice(l*w)));
	return o;
}

function s2ab(s) {
	var b = new ArrayBuffer(s.length*2), v = new Uint16Array(b);
	for (var i=0; i != s.length; ++i) v[i] = s.charCodeAt(i);
	return [v, b];
}

function xw_noxfer(data, cb) {
	var worker = new Worker(XW.noxfer);
	worker.onmessage = function(e) {
		switch(e.data.t) {
			case 'ready': break;
			case 'e': console.error(e.data.d); break;
			case XW.msg: cb(JSON.parse(e.data.d)); break;
		}
	};
	var arr = rABS ? data : btoa(fixdata(data));
	worker.postMessage({d:arr,b:rABS});
}

function xw_xfer(data, cb) {
	var worker = new Worker(rABS ? XW.rABS : XW.norABS);
	var xx;
	worker.onmessage = function(e) {
		switch(e.data.t) {
			case 'ready': break;
			case 'e': console.error(e.data.d); break;
			default: xx=(ab2str(e.data).replace(/\n/g,"\\n").replace(/\r/g,"\\r"));  cb(JSON.parse(xx)); break;
		}
	};
	if(rABS) {
		var val = s2ab(data);
		worker.postMessage(val[1], [val[1]]);
	} else {
		worker.postMessage(data, [data]);
	}
}

function xw(data, cb) {
	transferable =true;
	if(transferable) xw_xfer(data, cb);
	else xw_noxfer(data, cb);
}

function get_radio_value( radioName ) {
	var radios = document.getElementsByName( radioName );
	for( var i = 0; i < radios.length; i++ ) {
		if( radios[i].checked || radios.length === 1 ) {
			return radios[i].value;
		}
	}
}

function to_json(workbook) {
	var result = {};
	workbook.SheetNames.forEach(function(sheetName) {
		var roa = X.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
		if(roa.length > 0){
			result[sheetName] = roa;
		}
	});
	return result;
}

function to_csv(workbook) {
	var result = [];
	workbook.SheetNames.forEach(function(sheetName) {
		var csv = X.utils.sheet_to_csv(workbook.Sheets[sheetName]);
		if(csv.length > 0){
			result.push("SHEET: " + sheetName);
			result.push("");
			result.push(csv);
		}
	});
	return result.join("\n");
}

function to_formulae(workbook) {
	var result = [];
	workbook.SheetNames.forEach(function(sheetName) {
		var formulae = X.utils.get_formulae(workbook.Sheets[sheetName]);
		if(formulae.length > 0){
			result.push("SHEET: " + sheetName);
			result.push("");
			result.push(formulae.join("\n"));
		}
	});
	return result.join("\n");
}

var tarea = document.getElementById('b64data');
function b64it() {
	if(typeof console !== 'undefined') console.log("onload", new Date());
	var wb = X.read(tarea.value, {type: 'base64',WTF:wtf_mode});
	process_wb(wb);
}

function process_wb(wb) {
	var output = "";
	switch('json') {
		case "json":
			output = JSON.stringify(to_json(wb), 2, 2);
			break;
		case "form":
			output = to_formulae(wb);
			break;
		default:
		output = to_csv(wb);
	}
	if(output){
		$scope.dataProcessing(output);
	}
	/*
	if(out.innerText === undefined) out.textContent = output;
		else out.innerText = output;
		if(typeof console !== 'undefined') console.log("output", new Date());*/
	
}





var xlf = document.getElementById('xlf');
$scope.handleFile=function (e) {
	rABS = true;
	use_worker = true;
	var files = e.target.files;
	var f = files[0];
	{
		var reader = new FileReader();
		var name = f.name;
		reader.onload = function(e) {
			if(typeof console !== 'undefined') console.log("onload", new Date(), rABS, use_worker);
			var data = e.target.result;
			if(use_worker) {
				xw(data, process_wb);
			} else {
				var wb;
				if(rABS) {
					wb = X.read(data, {type: 'binary'});
				} else {
				var arr = fixdata(data);
					wb = X.read(btoa(arr), {type: 'base64'});
				}
				process_wb(wb);
			}
		};
		if(rABS) reader.readAsBinaryString(f);
		else reader.readAsArrayBuffer(f);
	}
}

/*
if(xlf.addEventListener) xlf.addEventListener('change', handleFile, false);
*/















	$scope.func = function() {


var data = {
	data:[
  {
    "street": "רבנו תם",
    "number": 2,
    "city": "בני ברק",
    "": "",
    "lng": 34.8353013,
    "lat": 32.0843078,
    "phone": "054-2000181",
    "customer_name": "אסף",
    "address": "רבנו תם 2  בני ברק , ישראל"
  },
  {
    "street": "מלאכי",
    "number": 20,
    "city": "בני ברק",
    "": "",
    "lng": 34.8394004,
    "lat": 32.0851087,
    "phone": "054-2000181",
    "customer_name": "אפיק",
    "address": "מלאכי 20  בני ברק , ישראל"
  },
  {
    "street": "דון יוסף נשיא",
    "number": 15,
    "city": "בני ברק",
    "": "",
    "lng": 34.8393058,
    "lat": 32.0813578,
    "phone": "054-2000181",
    "customer_name": "אפק",
    "address": "דון יוסף נשיא 15  בני ברק , ישראל"
  },
  {
    "street": "שמעון הצדיק",
    "number": 4,
    "city": "בני ברק",
    "": "",
    "lng": 34.8408286,
    "lat": 32.0863097,
    "phone": "054-2000181",
    "customer_name": "אפרים",
    "address": "שמעון הצדיק 4  בני ברק , ישראל"
  },
  {
    "street": "רבן יוחנן בן זכאי",
    "number": 40,
    "city": "בני ברק",
    "": "",
    "lng": 34.8310297,
    "lat": 32.081852,
    "phone": "054-2000181",
    "customer_name": "אראל",
    "address": "רבן יוחנן בן זכאי 40  בני ברק , ישראל"
  },
  {
    "street": "יהודית",
    "number": 7,
    "city": "בני ברק",
    "": "",
    "lng": 34.8276415,
    "lat": 32.0777409,
    "phone": "054-2000181",
    "customer_name": "ארבל",
    "address": "יהודית 7  בני ברק , ישראל"
  },
  {
    "street": "סמדר",
    "number": 3,
    "city": "רמת גן",
    "": "",
    "lng": 34.8146301,
    "lat": 32.0941203,
    "phone": "054-2000181",
    "customer_name": "ארד",
    "address": "סמדר 3  רמת גן , ישראל"
  },
  {
    "street": "שדרות העם הצרפתי",
    "number": 60,
    "city": "רמת גן",
    "": "",
    "lng": 34.8177025,
    "lat": 32.0943204,
    "phone": "054-2000181",
    "customer_name": "ארז",
    "address": "שדרות העם הצרפתי 60  רמת גן , ישראל"
  },
  {
    "street": "הפודים",
    "number": 15,
    "city": "רמת גן",
    "": "",
    "lng": 34.8180757,
    "lat": 32.0917693,
    "phone": "054-2000181",
    "customer_name": "ארי",
    "address": "הפודים 15  רמת גן , ישראל"
  },
  {
    "street": "מגדים",
    "number": 7,
    "city": "רמת גן",
    "": "",
    "lng": 34.8216858,
    "lat": 32.0884849,
    "phone": "054-2000181",
    "customer_name": "אריאל",
    "address": "מגדים 7  רמת גן , ישראל"
  },
  {
    "street": "משה שרת",
    "number": 45,
    "city": "רמת גן",
    "": "",
    "lng": 34.8156329,
    "lat": 32.0874353,
    "phone": "054-2000181",
    "customer_name": "אריה",
    "address": "משה שרת 45  רמת גן , ישראל"
  },
  {
    "street": "המעפיל",
    "number": 23,
    "city": "רמת גן",
    "": "",
    "lng": 34.8166494,
    "lat": 32.090195,
    "phone": "054-2000181",
    "customer_name": "אריק",
    "address": "המעפיל 23  רמת גן , ישראל"
  },
  {
    "street": "מנחם",
    "number": 8,
    "city": "בני ברק",
    "": "",
    "lng": 34.8250376,
    "lat": 32.0875289,
    "phone": "054-2000181",
    "customer_name": "ארן",
    "address": "מנחם 8  בני ברק , ישראל"
  },
  {
    "street": "מקובר",
    "number": 1,
    "city": "בני ברק",
    "": "",
    "lng": 34.8262373,
    "lat": 32.084751,
    "phone": "054-2000181",
    "customer_name": "ארנון",
    "address": "מקובר 1  בני ברק , ישראל"
  },
  {
    "street": "הירקון",
    "number": 78,
    "city": "בני ברק",
    "": "",
    "lng": 34.8327441,
    "lat": 32.0983219,
    "phone": "054-2000181",
    "customer_name": "אשד",
    "address": "הירקון 78  בני ברק , ישראל"
  },
  {
    "street": "אברבנאל",
    "number": 45,
    "city": "בני ברק",
    "": "",
    "lng": 34.8411631,
    "lat": 32.095312,
    "phone": "054-2000181",
    "customer_name": "אשכול",
    "address": "אברבנאל 45  בני ברק , ישראל"
  },
  {
    "street": "נתן",
    "number": 45,
    "city": "רמת גן",
    "": "",
    "lng": 34.8173189,
    "lat": 32.0817126,
    "phone": "054-2000181",
    "customer_name": "אשר",
    "address": "נתן 45  רמת גן , ישראל"
  },
  {
    "street": "החשמונאים",
    "number": 45,
    "city": "תל אביב יפו",
    "": "",
    "lng": 34.7780712,
    "lat": 32.0706607,
    "phone": "054-2000181",
    "customer_name": "אדר",
    "address": "החשמונאים 45  תל אביב יפו , ישראל"
  }
]
	};
		
			
		
		$.ajax({
					url : 'https://route-speed.com/routeSpeed/web/index.php?r=track/automatictrack',
					data : data,
					type : 'post',
					headers : {
						'X-CSRF-TOKEN' : localStorage.getItem("authKey")
					}
		
				}).then(function(response) {
					console.log(response);
				},function(error){
					console.log(error);
				});
		
	}
	 

  }

})();


