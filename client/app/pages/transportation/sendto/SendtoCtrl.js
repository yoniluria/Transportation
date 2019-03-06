
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.sendto')
      .controller('SendtoCtrl', SendtoCtrl);
  /** @ngInject */
  function SendtoCtrl($scope,$rootScope,$http,$location,$state,$filter,connectPOSTService) {
    	$rootScope.module=        'sendto';
    	$scope.controller=   	   'sendto';
    	$scope.sendToNames = ['בית החולים','סדרן','נהג'];
    	$rootScope.headline='שלח ל' + $scope.sendToNames[$rootScope.forward] + ' ';

		$scope.sendEmail = function(){
			if($rootScope.forward==2&&(!$scope.sendToFilter || !$scope.sendToFilter.driver.id)){
				$rootScope.message = 'נא בחר נהג';
				angular.element('#saved-toggle').trigger('click');
				return;
			}
			$rootScope.order_page('content');
			if(!$scope.$$phase){
    			$scope.$apply();
    		}
			document.getElementById('loader').style.display = 'block';
			var data = document.getElementById('content').innerHTML;
			var tracks_ids = $scope.tracks.map(t=>t.track.id);
			var ushers = [];
			if($rootScope.ushers){
				ushers = $rootScope.ushers;
			}
			var driver_id = null;
			if($scope.sendToFilter&&$scope.sendToFilter.driver.id){
				driver_id = $scope.sendToFilter.driver.id;
			}
			var dataObj = {
				date:$filter('date')($rootScope.date,'MM/dd/yy'),
				tracks_ids:tracks_ids,
				data:data,
				is_to_usher:$rootScope.forward==1,
				ushers:ushers,
				driver_id:driver_id
			};
			var shift_name = $rootScope.shift_id!=undefined?$rootScope.shifts.filter(s=>s.id==$rootScope.shift_id)[0].name:'כל המשמרות';
			dataObj.shiftName = shift_name;
			$http.post($rootScope.baseUrl + $scope.controller + '/send_email',dataObj)
			.success(function(data){
				$rootScope.message = 'המייל/ים נשלח/ו בהצלחה';
				angular.element('#saved-toggle').trigger('click');
				document.getElementById('loader').style.display = 'none';
			})
			.error(function(){
				$rootScope.message = 'ארעה שגיאה בשליחת המייל';
				angular.element('#saved-toggle').trigger('click');
				document.getElementById('loader').style.display='none';
			});
		}
		$scope.sendMessageToDrivers = function  () {
			var data = []; 
			angular.forEach($scope.all_tracks,function(track){
					if(track.isHospital==2&&track.driver){
					/*angular.forEach(track.workers,function(worker){
						worker.date = track.track.date;
						worker.shift = track.track.shift;
						worker.line_number = track.track.combined_line;
					});*/
					data.push(track);
				}
			});
			if(!data.length){
				$rootScope.message = "לא נמצאו מסלולי נהגים.";
				angular.element('#saved-toggle').trigger('click');
				return;
			}
			connectPOSTService.fn('sendto/send_message_to_drivers', {data:data}).then(function(data) {
				if(data.data.status=='ok'){
					$rootScope.message = "ההודעות נשלחו בהצלחה.";
					/*
					if(data.data.warnings != ''){
											$rootScope.message = data.data.warnings;
										}*/
					
					if(data.data.failed_sms.length){
						$rootScope.message = data.data.failed_sms.length +" הודעות נכשלו.";
					}
					angular.element('#saved-toggle').trigger('click');
					
					
				}else{
					$rootScope.message = data.data.msg;
					angular.element('#saved-toggle').trigger('click');
				}
				
			}, function(e) {
				//document.getElementById('loader').style.display='none';
				$rootScope.message = "בעיה בשליחת SMS, נסה שוב מאוחר יותר";
				angular.element('#saved-toggle').trigger('click');
			});
		  
		}		
		
		$scope.getDataList = function(){
			if($scope.sendToFilter.driver&&$scope.sendToFilter.driver.id==null){
				$scope.sendToFilter.driver.id = undefined;
			}
			if($scope.sendToFilter.track&&$scope.sendToFilter.track.description==null){
				$scope.sendToFilter.track.description = undefined;
			}
		}

		// not working after devide to shifts
		// $scope.$watch(function(scope){return scope.sendToFilter},
		// function(){
			// if($scope.filtered){
				// angular.forEach($scope.all_shifts,function(shift){
					// shift.filteredWorkers = 0;
					// angular.forEach($scope.filtered,function(track){
						// if(track.track.shift_id==shift.id){
							// shift.filteredWorkers += track.workers.length;
						// }
					// });					
				// });
			// }
		// });
		
		//first function for initialize the page
		function init(){
			$scope.all_tracks = $rootScope.selectedTracks;
			if(!$rootScope.forward){
				$location.path('/sort');
			}
			$scope.shift_id = $rootScope.shift_id;
			if(!$scope.shift_id || $scope.shift_id==''){
				$scope.shift = {name:'כל המשמרות'};
			}
			else{
				$scope.shift = $rootScope.shifts.filter(s=>s.id==$scope.shift_id)[0];
			}
			$rootScope.headline += $scope.shift.name;
			$scope.tracks = $rootScope.selectedTracks;
			$scope.all_shifts = $rootScope.shifts;
			$scope.all_maps = [];
			angular.forEach($scope.all_shifts,function(shift){
				shift.tracks = $scope.tracks.filter(t=>t.track.shift_id==shift.id);
				shift.isCollecting = shift.name.indexOf('איסוף')!=-1;
				shift.filteredWorkers = 0;
				angular.forEach(shift.tracks,function(track){
					track.hasMap = track.workers.findIndex(w=>w.img)!=-1;
					angular.forEach(track.workers,function(worker){
						if(worker.img&&worker.img!=""){
							$scope.all_maps.push(worker.img);
						}
					});	
					shift.filteredWorkers += track.workers.length;
				});					
			});
			var places;
			$scope.all_cities = [];
			angular.forEach($scope.tracks,function(track){
				angular.forEach(track.workers,function(worker){
					worker.hour = new Date($filter('date')($rootScope.date,'MM/dd/yy') + ' ' + worker.hour);
				});
				track.workers = $filter('orderBy')(track.workers, 'track_order');
				places = track.track.description.split(',');
				places = places.filter(Boolean);
				if(track.track.shift.indexOf('איסוף')!=-1){
					track.from = places[0];
					track.to = 'מעיני הישועה';
//					track.workers = $filter('orderBy')(track.workers, 'hour');
					/*track.start_hour = new Date(track.workers[0].hour);
					track.start_hour = new Date(track.start_hour.setMinutes(-10));*/
					track.start_hour = new Date(track.workers[0].hour - 10 * 60000);
				}
				else{
					track.from = 'מעיני הישועה';
					track.to = places[places.length-1];
//					track.workers = $filter('orderBy')(track.workers, 'track_order');
					var shift_hour = $rootScope.shifts.filter(s=>s.id==track.track.shift_id)[0].hour;
					track.start_hour = new Date(new Date($filter('date')($rootScope.date,'MM/dd/yy') + ' ' + shift_hour).setMinutes(-5));
				}
				angular.forEach(places,function(city){
					city = city.trim();
					if($scope.all_cities.indexOf(city)==-1)
						$scope.all_cities.push(city);
				});
			});			
		}
		
		init();
		
		$scope.heightPage = 0;
		$scope.lastShift = 0;
		$scope.page = 0;
		
		$scope.calcHeight = function(id,type){
			
			var track = $scope.tracks.filter(t=>t.track.id==id)[0];
			var shift_id = track.track.shift_id;
			var shift = $scope.all_shifts.filter(s=>s.id==shift_id)[0];
			var main_line = 0;
			/*if(shift.tracks[0].track.id==track.track.id){
				main_line = 96;
			}*/
			shift.isCollecting = shift.name.indexOf('איסוף')!=-1;
			if(type==1){
				var cnt = parseInt(track.workers.length) * parseInt(30); 
			}
			else{
				var cnt = 0;
				$('.worker_line[data-track="'+id+'"]').each(function(){
					cnt = parseInt(cnt) + parseInt($(this).css('height')) + parseInt('1');
				});
			}						
			/*if(shift.isCollecting){
				//$scope.lastHeight = parseInt(144) + parseInt(cnt) + parseInt(main_line);
				$scope.lastHeight = parseInt(163) + parseInt(cnt) + parseInt(main_line);
			}
			else{
				$scope.lastHeight = parseInt(97) + parseInt(cnt) + parseInt(main_line);
				//$scope.lastHeight = parseInt(136) + parseInt(cnt) + parseInt(main_line);
			}*/
			//$scope.lastHeight = parseInt(134) + parseInt(cnt) + parseInt(main_line);
			$scope.lastHeight = parseInt(79) + parseInt(cnt) + parseInt(main_line);
			$scope.heightPage = parseInt($scope.heightPage) + parseInt($scope.lastHeight);
			if(shift_id!=$scope.lastShift){
				$scope.heightPage = $scope.lastHeight;
				$scope.heightPage = parseInt($scope.heightPage) + parseInt(96);
				$scope.page = parseInt($scope.page)+parseInt(1);
				$scope.lastShift = shift_id;
				return true;
			}	
			//if($scope.heightPage>1122){ 	
			if($scope.heightPage>1045){  
			//if($scope.heightPage>1035){  
				if(shift.tracks[0].track.id!=track.track.id){
					$scope.lastHeight = parseInt($scope.lastHeight) + parseInt(96);
				} 
				$scope.heightPage = $scope.lastHeight;
				$scope.heightPage = parseInt($scope.heightPage) + parseInt(96);
				$scope.page = parseInt($scope.page)+parseInt(1);
				return true;
			}
			return false;
			
		}
		
		$scope.show_header_print = function(){
			if($scope.heightPage>1045){
				$scope.heightPage = $scope.lastHeight;
				return true;
			}
			return false;
		}
		
		$rootScope.show_print = function(id){
			$rootScope.order_page(id);
		    window.print();
    	}  
    	
    	$rootScope.order_page = function(id){
    		$scope.heightPage = 0;
			$scope.lastShift = 0;
			$scope.page = 0;
			var track;var stat;var last;
			$('.top_border').removeClass('top_border');
			$('.div_track').each(function(){
				track = $(this).attr('data-track');
				last = $scope.lastShift;
				stat = $scope.calcHeight(track,2);
				if(stat==true){
					$(this).find('.height_div').addClass('show_cot');
					if(last!=0){
						$(this).find('.height_div').addClass('page_break');
					}
					$(this).find('.height_div').find('.num_page').text($scope.page);
					$(this).find('.t02').addClass('top_border');
				}
				else{
					$(this).find('.height_div').addClass('hide_cot');
				}
			});   
			$('.height_div:not(.show_cot):not(.hide_cot)').each(function(){
				$(this).addClass('show_cot');
				$scope.page = parseInt($scope.page)+parseInt(1);
				$(this).find('.num_page').text($scope.page);
			});
			$('.num_pages').text($scope.page);
    	}
    	
    	$scope.countOf = function(text) {
		    var s = text ? text.split(/\s+/) : 0; 
		    return s ? s.length : '';
		};

  }

})();
