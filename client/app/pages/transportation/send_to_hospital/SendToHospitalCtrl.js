
(function () {
  'use strict';

  angular.module('RouteSpeed.pages.send_to_hospital')
      .controller('SendToHospitalCtrl', SendToHospitalCtrl);
  /** @ngInject */
  function SendToHospitalCtrl($scope,$rootScope,$http,$location,$state,$filter) {
    	$rootScope.module=        'send_to_hospital';
    	$scope.controller=   	   'sendto';
    	$scope.sendToNames = ['בית החולים','סדרן','נהג'];
    	$rootScope.headline='שלח ל' + $scope.sendToNames[$rootScope.forward] + ' ';
    	//$rootScope.headline='שלח זמנים לבית החולים ';
		
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
			/*var dataObj = {
				date:$filter('date')($rootScope.date,'MM/dd/yy'),
				tracks_ids:tracks_ids,
				data:data,
				is_to_usher:$rootScope.forward==1,
				ushers:ushers,
				driver_id:driver_id
			};
			document.getElementById('loader').style.display = 'block';
			var data = document.getElementById('content').innerHTML;
			var tracks_ids = $scope.tracks.map(t=>t.track.id);*/
			var dataObj = {};    
			if($rootScope.forward==0){
				dataObj.date = $filter('date')($rootScope.date,'MM/dd/yy');
				dataObj.tracks_ids = tracks_ids;
				dataObj.data = data;
				dataObj.hospital_email = $rootScope.hospital_email;
				dataObj.is_to_usher = $rootScope.forward==1;
			}
			else{
				var dataObj = {
					date:$filter('date')($rootScope.date,'MM/dd/yy'),
					tracks_ids:tracks_ids,
					data:data,
					is_to_usher:$rootScope.forward==1,
					ushers:ushers,
					driver_id:driver_id
				};
			}
			var shift_name = $rootScope.shift_id!=undefined?$rootScope.shifts.filter(s=>s.id==$rootScope.shift_id)[0].name:'כל המשמרות';
			dataObj.shiftName = shift_name;
			$http.post($rootScope.baseUrl + $scope.controller + '/send_email_to_hospital',dataObj)
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
			/*document.getElementById('loader').style.display = 'block';
			var data = document.getElementById('content').innerHTML;
			var tracks_ids = $scope.tracks.map(t=>t.track.id);
			$http.post($rootScope.baseUrl + $scope.controller + '/send_email_to_hospital',{date:$filter('date')($rootScope.date,'MM/dd/yy'),tracks_ids:tracks_ids,data:data,hospital_email:$rootScope.hospital_email})
			.success(function(data){
				$rootScope.message = 'המייל נשלח בהצלחה';
				angular.element('#saved-toggle').trigger('click');
				document.getElementById('loader').style.display = 'none';
			})
			.error(function(){
				$rootScope.message = 'ארעה שגיאה בשליחת המייל';
				angular.element('#saved-toggle').trigger('click');
				document.getElementById('loader').style.display = 'none';
			});*/
		}
		
		function getHospitalEmail(){
			document.getElementById('loader').style.display = 'block';
			$http.post($rootScope.baseUrl + $scope.controller + '/get_hospital_email',{name:'hospital_email'})
    		.success(function(data){
    			document.getElementById('loader').style.display = 'none';
    			$rootScope.hospital_email = data;
    		})
    		.error(function(){
    			document.getElementById('loader').style.display = 'none';
    		});			
		}
		
		$scope.$watch(function(scope){return scope.filtered},
		function(){
			$scope.filteredWorkers = 0;
			if($scope.filtered){
				angular.forEach($scope.filtered,function(track){
					$scope.filteredWorkers += track.workers.length;
				});
			}
		});
		
		function init(){
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
					shift.filteredWorkers += track.workers.length;
					angular.forEach(track.workers,function(worker){
						if(worker.img&&worker.img!=""){
							$scope.all_maps.push(worker.img);
						}
					});	
					track.workers = $filter('orderBy')(track.workers, 'worker_name');
				});					
			});			
			var address;
			angular.forEach($scope.tracks,function(track){
				angular.forEach(track.workers,function(worker){
					worker.hour = new Date($filter('date')($rootScope.date,'MM/dd/yy') + ' ' + worker.hour);
					// address = worker.address.split(',');
					// worker.street = address[0];
					// worker.city = address[1];
				});
			});
			getHospitalEmail();
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
			shift.isCollecting = shift.name.indexOf('איסוף')!=-1;
			if(type==1){
				var cnt = parseInt(track.workers.length) * parseInt(30); 
			}
			else{
				var cnt = 0;
				$('.worker_line[data-track="'+id+'"]').each(function(){
					cnt = parseInt(cnt) + parseInt($(this).css('height')) + parseInt('1');
				});
				cnt = parseInt(cnt) + parseInt('2');
			}						
			$scope.lastHeight = parseInt(23) + parseInt(cnt) + parseInt(main_line);
			$scope.heightPage = parseInt($scope.heightPage) + parseInt($scope.lastHeight);
			if(shift_id!=$scope.lastShift){
				$scope.heightPage = $scope.lastHeight;
				$scope.heightPage = parseInt($scope.heightPage) + parseInt(125);
				$scope.page = parseInt($scope.page)+parseInt(1);
				$scope.lastShift = shift_id;
				return true;
			}	
			if($scope.heightPage>1045){  
				if(shift.tracks[0].track.id!=track.track.id){
					$scope.lastHeight = parseInt($scope.lastHeight) + parseInt(125);
				} 
				$scope.heightPage = $scope.lastHeight;
				$scope.heightPage = parseInt($scope.heightPage) + parseInt(125);
				$scope.page = parseInt($scope.page)+parseInt(1);
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
			var track;var stat;var last;var cot;
			$('.table_workers').find('thead').hide();
			
			$('.div_track').each(function(){
				track = $(this).attr('data-track');
				last = $scope.lastShift;
				stat = $scope.calcHeight(track,2);
				if(stat==true){
					$(this).find('.height_div').addClass('show_cot');
					$(this).find('.table_workers').find('thead').show();
					cot = $(this).find('.table_workers').find('tbody').find('tr:first-child');
					cot.find('td').each(function(index){						
						$(this).css('width',cot.find('td').eq(index).css('width'));
					});
					if(last!=0){
						$(this).find('.height_div').addClass('page_break');
					}
					$(this).find('.height_div').find('.num_page').text($scope.page);
				}
				else{
					$(this).find('.height_div').addClass('hide_cot');
					$(this).find('.table_workers').find('tbody').find('tr:first-child').find('td').each(function(index){						
						$(this).css('width',cot.find('td').eq(index).css('width'));
					});
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
