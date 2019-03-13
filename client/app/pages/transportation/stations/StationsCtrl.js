(function () {
  'use strict';

  angular.module('RouteSpeed.pages.stations')
      .controller('StationsCtrl', StationsCtrl);
  /** @ngInject */
  function StationsCtrl($scope,$rootScope,$http,$location,$state,connectGETService,connectPOSTService,connectDELETEService,$filter,$q,$timeout) {
    	$rootScope.module=        'stations';
    	$scope.controller=   	   'track';
    	$scope.radio_day = 'all_week';
    	$scope.radio_day_update_xls = 'all_week';
    	$scope.xls_filter_lines = [];
    	$scope.update_xls_filter_lines = [];
    	
    	// show map of selected tracks
    	$scope.showMap = function(){
    		
    	}
    	
    	$scope.changeDate = function(){
    		// if($scope.selectedDate)
    			// $rootScope.date = $scope.selectedDate;
    		// if($rootScope.date)
    			// $scope.current_date=$rootScope.date;
    		// else
    			// $scope.current_date=$filter('date')($scope.selectedDate, "dd/MM/yyyy");
    		// $rootScope.current_date=$scope.current_date;
    		// $scope.current_shift=$scope.selectedShift;
    		//$rootScope.headline = "מסך קליטת נתוני הסעות - בוקר - איסוף  8:30 "+$scope.current_date+"  "+$scope.convertToHebrew();
    		if($rootScope.shift){
    			$scope.current_shift=$rootScope.shift;
    			// $rootScope.shift = null;
    		}
    		else if(!$scope.trackfilter||!$scope.trackfilter.track.shift)
    		// else if($scope.trackfilter&&$scope.trackfilter.track&&$scope.trackfilter.track.shift=="")
    			$scope.current_shift='כל המשמרות';
    		// $rootScope.headline = $scope.current_shift+"  מסך קליטת נתוני הסעות -   "+$scope.current_date+"  "+$rootScope.convertToHebrew($scope.selectedDate);
    		$rootScope.headline = $scope.current_shift+"  מסך קליטת נתוני הסעות -   "+$filter('date')($rootScope.date, "dd/MM/yyyy")+"  "+$rootScope.convertToHebrew($rootScope.date);
    		// $rootScope.current_date=new Date($scope.selectedDate);
    	}
    	
    	$scope.remove_updated_by_date = function(){
    		connectGETService.fn($scope.controller+'/remove_updated&date='+$filter('date')($rootScope.date,'yyyy-MM-dd').toString()).then(function(data) {
    			angular.forEach($scope.selectedTracks,function(track){
					angular.forEach(track.workers,function(worker){
						if(worker.updated==1){
							worker.updated=0;
						}
					});
				});
       	  		$rootScope.message = 'עודכן בהצלחה';
   	  			angular.element('#saved-toggle').trigger('click');
   	  		}
   	  		,function(e){
   	  			$rootScope.message = 'ארעה שגיאה';
   	  			angular.element('#saved-toggle').trigger('click');
   	  		});
    	}
    	
    	// //get all tracks
    	// $scope.getTracks=function(){
    		// connectGETService.fn($scope.controller + '/getallroute').then(function success(data) {
				// $scope.tracks = data.data;
				// $scope.selectedTracks=angular.copy($scope.tracks);
				// $scope.drivers=[];
				// for(var i=0;i<$scope.tracks.length;i++){
    				// if($scope.tracks[i].driver)
    					// $scope.drivers.push($scope.tracks[i].driver);
    		// }
    		// // $scope.x={selectedDate:new Date()};
    		// // $scope.x.selectedDate=new Date();
				// // $scope.getDrivers();
			// }, function error(error) {
				// alert('שגיאה ארעה בעת נסיון לקבלת נתוני עובדים');
			// });
    	// }
    	
    	$scope.getShiftIndex=function (shift){
    		for(var i=0;i<$scope.oneWayError.length;i++){
    			if($scope.oneWayError[i].shift==shift)
    				return i;
    		}
    	}
    	
    	function diff_minutes(dt2, dt1) 
		 {
		
		  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
		  diff /= 60;
		  return Math.abs(Math.round(diff));
		  
		 }
    	
    	$scope.getTracksByDate = function(){
    		if($rootScope.shift){
    			$scope.trackfilter = {};
    			$scope.trackfilter.track = {};
    			$scope.trackfilter.track.shift = $rootScope.shift;
    			$scope.trackfilter.track.line_number = $rootScope.line_number;
    		}
    		$scope.changeDate();
    		document.getElementById('loader').style.display = 'block';
	        connectGETService.fn($scope.controller + '/getallallroute&date='+ $filter('date')($rootScope.date,'yyyy-MM-dd').toString()).then(function success(data) {
	        document.getElementById('loader').style.display = 'none';
			$scope.tracks = data.data;
			$scope.orderTracks = ['track.shift_id','track.track_order'];
			if($scope.new_line_id){
				$scope.changeTrackChecking($scope.new_line_id);
			}
			angular.forEach($scope.tracks,function(track){
				if($rootScope.checkedTracksIds && $rootScope.checkedTracksIds.indexOf(track.track.id)!=-1){
					track.checked = true;
				}
				else{
					track.checked = false;
				}
			});
			
			//set primary address index
			for(var i = 0;$scope.tracks.length&&i<$scope.tracks.length;i++){
				$scope.tracks[i]['num_workers'] = $scope.tracks[i].workers?$scope.tracks[i].workers.length:0;
				for(var j = 0;$scope.tracks[i].workers&&$scope.tracks[i].workers.length&&j<$scope.tracks[i].workers.length;j++){
					for(var k = 0;$scope.tracks[i].workers[j].addresses&&$scope.tracks[i].workers[j].addresses.length&&k<$scope.tracks[i].workers[j].addresses.length;k++){
						// if($scope.tracks[i].workers[j].addresses[k].primary_address==1)
						if($scope.tracks[i].workers[j].addresses[k].original_address==$scope.tracks[i].workers[j].address)
							$scope.tracks[i].workers[j].index = k;
					}
				}
			}
			$scope.selectedTracks = angular.copy($scope.tracks);
			for(var i = 0;i<$scope.tracks.length;i++){
    			//order workers according to shift
			//if($scope.tracks[i].track.shift.indexOf('איסוף')!=-1)
			//	$scope.tracks[i].workers = $filter('orderBy')($scope.tracks[i].workers, "hour");
			//else
				$scope.tracks[i].workers = $filter('orderBy')($scope.tracks[i].workers, "track_order");
    		}
			// $scope.selecteslist=angular.copy($scope.selectedTracks);
			$scope.shifts = [];
			// for(var i=0;i<$scope.selectedTracks.length;i++){
				// if($scope.shifts.indexOf($scope.selectedTracks[i].track.shift)==-1)
					// $scope.shifts.push($scope.selectedTracks[i].track.shift);
			// }
			for(var i = 0;i<$scope.tracks.length;i++){
				if($scope.shifts.indexOf($scope.tracks[i].track.shift)==-1)
					$scope.shifts.push($scope.tracks[i].track.shift);
			}
			$scope.lines = [];
			$scope.drivers = [];
			for(var i = 0;i<$scope.tracks.length;i++){
				if($scope.lines.indexOf($scope.tracks[i].track.combined_line)==-1){
					$scope.lines.push($scope.tracks[i].track.combined_line);
				}
				if($scope.tracks[i].driver){
					$scope.drivers.push($scope.tracks[i].driver);
				}
    		}
    		// var curDate=new Date();
    		var hourStr = "00:00:00";
    		for(var i = 0;i<$scope.tracks.length;i++){
    			for(var j = 0;$scope.tracks[i].workers&&j<$scope.tracks[i].workers.length;j++){
    				// if($scope.tracks[i].workers[j].hour)
    					// hourStr=$scope.tracks[i].workers[j].hour;
    				// console.log(hourStr);
    				// $scope.tracks[i].workers[j].hour=new Date(curDate.getFullYear(),curDate.getMonth(),curDate.getDate(),
    				// hourStr[0]+hourStr.hour[1],
    				// hourStr[3]+hourStr[4],
    				// hourStr[6]+hourStr[7]);
    				// console.log($scope.tracks[i].workers[j].hour);
    				if($scope.tracks[i].workers[j].hour)
    					hourStr=$scope.tracks[i].workers[j].hour;
    				$scope.tracks[i].workers[j].hour=new Date($filter('date')($rootScope.date,'MM/dd/yy')+' '+hourStr);
    			}
    		}
    			$scope.workers_details = {};
    			angular.forEach($scope.tracks,function(track){
    				angular.forEach(track.workers,function(worker){
    					if(!$scope.workers_details[worker.id]){
    						$scope.workers_details[worker.id] = [];
    					}
    					if(!$scope.workers_details[worker.id][track.track.shift_id]){
    						$scope.workers_details[worker.id][track.track.shift_id] = [];
    					}
    					$scope.workers_details[worker.id][track.track.shift_id].push(track.track.id);
    				});
    			});   
    			
			$scope.workers_shifts = {};
			// angular.forEach($scope.tracks,function(track){
				// angular.forEach(track.workers,function(worker){
					// if(!$scope.workers_shifts[worker.id]){
						// $scope.workers_shifts[worker.id] = [];
					// }
					// if(!$scope.workers_shifts[worker.id][track.track.shift]){
						// $scope.workers_shifts[worker.id][track.track.shift] = [];
					// }
					// angular.forEach(worker.addresses,function(address){
						// $scope.workers_shifts[worker.id][track.track.shift].push(address.original_address);
					// });
				// });
			// });
			
			angular.forEach($scope.tracks,function(track){
				angular.forEach(track.workers,function(worker){
					if(!$scope.workers_shifts[worker.id]){
						$scope.workers_shifts[worker.id] = [];
					}
					if(!$scope.workers_shifts[worker.id][track.track.shift]){
						$scope.workers_shifts[worker.id][track.track.shift] = [];
					}
					$scope.workers_shifts[worker.id][track.track.shift]['address'] = [worker.address];
					// angular.forEach(worker.addresses,function(address){
						// $scope.workers_shifts[worker.id][track.track.shift].push(address.original_address);
					// });
				});
			});			
			
    		$scope.workers_in_tracks = {};
    		angular.forEach($scope.tracks,function(track){
    			angular.forEach(track.workers,function(worker){
    				if(!$scope.workers_in_tracks[worker.id]){
    					$scope.workers_in_tracks[worker.id] = [];
    				}
   					if($scope.workers_in_tracks[worker.id][track.track.id]===undefined){
   						$scope.workers_in_tracks[worker.id][track.track.id] = 0;
   					}
   					$scope.workers_in_tracks[worker.id][track.track.id]++;  
   				});
    		});    	
    		var collect;
    		for(var i = 0;i<$scope.tracks.length;i++){
				// $scope.tracks[i].track_duration=diff_minutes($scope.tracks[i].workers[0].hour,$scope.tracks[i].workers[$scope.tracks[i].workers.length-1].hour);
				// $scope.tracks[i].track_duration=$scope.tracks[i].workers[0].hour-$scope.tracks[$scope.tracks[i].workers.length-1].workers[0].hour;
				// $scope.tracks[i].track_duration=Math.floor($scope.tracks[i].track_duration / (1000*60*60*24));
				// $scope.tracks[i].track_duration=0;
				$scope.tracks[i].track_duration = 0;
				for(var j=0;$scope.tracks[i].workers&&j<$scope.tracks[i].workers.length;j++){
					$scope.tracks[i].track_duration += Number($scope.tracks[i].workers[j].duration);
				}
	    		if($scope.tracks[i].track.shift.indexOf('איסוף')!=-1)
	    			collect = true;		
	    		else		
	    			collect = false;
				if(collect&&$scope.tracks[i].workers&&$scope.tracks[i].workers.length){
					if($scope.tracks[i].workers[$scope.tracks[i].workers.length-1].index!=undefined){
						$scope.tracks[i].track_duration -= Number($scope.tracks[i].workers[$scope.tracks[i].workers.length-1].duration);
						$scope.tracks[i].track_duration += Number($scope.tracks[i].workers[$scope.tracks[i].workers.length-1].addresses[$scope.tracks[i].workers[$scope.tracks[i].workers.length-1].index].travel_time);
					}
				}
				else if($scope.tracks[i].workers&&$scope.tracks[i].workers.length){
					if($scope.tracks[i].workers[0].index!=undefined){
					$scope.tracks[i].track_duration -= Number($scope.tracks[i].workers[0].duration);
					$scope.tracks[i].track_duration += Number($scope.tracks[i].workers[0].addresses[$scope.tracks[i].workers[0].index].travel_time);
					}
				}
			}
    		// $scope.workers=[];
    		// for(var i=0;i<$scope.selectedTracks.length;i++){
    			// for(var j=0;j<$scope.selectedTracks[i].workers.length;j++){
    				// if($scope.workers.indexOf($scope.selectedTracks[i].workers[j].id)==-1)
    					// $scope.workers.push($scope.selectedTracks[i].workers[j].id);
    			// }
    		// }
    		
    		$scope.oneWayError = [];
    		for(var i = 0;i<$scope.selectedTracks.length;i++){
    			$scope.oneWayError[i] = {};
    			$scope.oneWayError[i].shift=$scope.shifts[$scope.shifts.indexOf($scope.selectedTracks[i].track.shift)];
    			$scope.oneWayError[i].workers = [];
    		}
    		
    		for(var i = 0;i<$scope.selectedTracks.length;i++){
    			for(var j = 0;$scope.selectedTracks[i].workers&&j<$scope.selectedTracks[i].workers.length;j++){
    				$scope.oneWayError[$scope.getShiftIndex($scope.selectedTracks[i].track.shift)].workers.push($scope.selectedTracks[i].workers[j].id);
    			}
    		}
    		if(!$rootScope.checkedTracksIds){
    			$rootScope.checkedTracksIds = [];
    		}
    		$scope.getDataList();
			}, function error(error) {
				$rootScope.message = 'שגיאה ארעה בעת נסיון לקבלת נתוני עובדים';
				angular.element('#saved-toggle').trigger('click');
				document.getElementById('loader').style.display = 'none';
			});   
		}
    	
    	//set first value in select to be the current address
    	$scope.setInitialAddress = function(addresses,address){
    		if(addresses)
    		for(var i = 0;i<addresses.length;i++){
    			// if(addresses[i].is_current==1)
    				// return addresses[i];
    			if(addresses[i].original_address==address)
    				return addresses[i];
    		}
    	}
    	
    	
    	/////////////////     excel file     ///////////////////
    	$scope.dataProcessing = function(output){
			var result = JSON.parse(output);
			// document.getElementById('loader').style.display='block';
					var requests = [];
					var arr = result;
					var tmp = [];
					angular.forEach(arr, function(value, key) {
						tmp = tmp.concat(value);
					}); 
					
					////////////////////////
					if($scope.status){
						$http.post($rootScope.baseUrl+$scope.controller+'/saveordersfromxls',{data:tmp,filter:$scope.xls_filter_lines.map(l=>l.line_number),radio_day:$scope.radio_day}).success(
						function(data) {
					       	  		document.getElementById('loader').style.display='none';
					       	  		if(data.status != "ok"){
					       	  			$rootScope.message = data.data;
					       	  			angular.element('#saved-toggle').trigger('click');
					       	  		}
					       	  		else{
					       	  			$rootScope.message = 'הקובץ נטען בהצלחה';
					       	  			if(data.warnings!=''){
					       	  				$rootScope.message = data.warnings;
					       	  			}
					       	  			angular.element('#saved-toggle').trigger('click');
					       	  			return data.data;
					       	  		}
					       	  		})
					       	  		.error(function(){
					       	  			alert("error");
					       	  			document.getElementById('loader').style.display='none';
					       	  		});
					// connectPOSTService.fn($scope.controller+'/saveordersfromxls',{data:tmp})
					       	  	// .then(function(data) {
					       	  		// // document.getElementById('loader').style.display='none';
					       	  		// return data.data}
					       	  		// ,function(e){});
					       	  		//it does'nt work, it calls ajax twice
					   }
					   else{
					   	$http.post($rootScope.baseUrl+$scope.controller+'/updateordersfromxls',{data:tmp,filter:$scope.update_xls_filter_lines.map(l=>l.line_number),radio_day:$scope.radio_day_update_xls})
						.success(function(data) {
									document.getElementById('loader').style.display='none';
					       	  		if(data.status != "ok"){
					       	  			$rootScope.message = data.data;
					       	  			angular.element('#saved-toggle').trigger('click');
					       	  		}
					       	  		else{
					       	  			$rootScope.message = 'הקובץ עודכן בהצלחה';
					       	  			angular.element('#saved-toggle').trigger('click');
					       	  			$scope.differences = data.data;
					       	  			$scope.show_differences = true;
						       	  		$scope.getTracksByDate();
					       	  		}
									/*if(data[0]!=undefined&&data[0]['details']==undefined&&data[0].startsWith("line")){
					       	  			data = data[0].replace("line","");
					       	  			$rootScope.message = "הקובץ לא עלה בהצלחה, נמצאה שגיאה באקסל בשורה "+data;
					       	  			angular.element('#saved-toggle').trigger('click');
					       	  		}
					       	  		else{
					       	  			document.getElementById('loader').style.display='none';
						       	  		$rootScope.differences = data;
						       	  		$rootScope.show_differences = true;
						       	  		$scope.getTracksByDate();
					       	  		}*/					  
					       	  		})
					       	  		.error(function(){
					       	  			$rootScope.message='ארעה שגיאה בחישוב השינויים';
					       	  			angular.element('#saved-toggle').trigger('click');
					       	  		});
					   	// connectPOSTService.fn($scope.controller+'/updateordersfromxls',{data:tmp})
					       	  	// .then(function(data) {
					       	  		// // document.getElementById('loader').style.display='none';
					       	  		// return data.data}
					       	  		// ,function(e){});
					   }
					///////////////////////      	  		
						   // var  count=tmp.length;
						   // var index=0;
					       // while(count>0){
					       	  // requests.push(connectPOSTService.fn($scope.controller+'/saveordersfromxls',{
					       	  	// data:tmp.slice(index, index+100)})
					       	  	// .then(function(data) {
					       	  		// return data.data}
					       	  		// ,function(e){})); 
					          // index+=100;
					          // count-=100;
					       // }	 	     
				  
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
			
		   // document.getElementById('xls').value=''; 
		}
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

}

var use_worker = typeof Worker !== 'undefined';
if(!use_worker) {

}

var transferable = use_worker;
if(!transferable) {
	
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
		if($scope.status){
			$timeout(function(){
				$scope.getTracksByDate();
			},2000);			
		}
	}
	
}

var xlf = document.getElementById('xlf');

    	//load excel file with tracks details
    	$scope.handleFile = function (e,status) {
    		$scope.status = status;
    	document.getElementById('loader').style.display = 'block';
		rABS = true;
		use_worker = true;
		var files = e.target.files;
		var f = files[0];
		if(!f)
		{
			document.getElementById('loader').style.display = 'none';
			return;
		}
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
		document.getElementById('xlsx_load').value = '';
		document.getElementById('xlsx_update').value = '';	
	}	
	
    	///////////////////////  end excel file    //////////////////////////////
    	
    	//filter selectedTracks according to the selected parameters
    	function filterByParameter(object,param,value){
    		return function(element){
    			if(object=='driver')
    				if(param=='id'){
    					if(!element.driver||element.driver.id!=value)
    						return false;
    					}
    				else{
    					if(!element.driver)
    						return false;
    					else if(element.driver.name.indexOf(value)==-1
    					&&element.driver.address.indexOf(value)==-1
    					&&element.driver.id.indexOf(value)==-1)
    						return false;
    				} 
    			if(object=='track'){
    				if(param=='checked'){
    					if(value&&element.checked!=value)
    						return false;
    				}
    				else if(param=='combined_line'){
    					if(element.track.combined_line!=value.track.combined_line)
    						return false;
    				}
    				else if(param=='shift'){
    					if(element.track.shift!=value)
    						return false;
    				}
    				else{
    					if(value==1){
    						for(var i = 0;element.workers&&i<element.workers.length;i++){
    						if($scope.oneError(element.workers[i].id))
    							return true;
    					}
    					return false;
    					}
    					if(value==2){
    						for(var i = 0;element.workers&&i<element.workers.length;i++){
    						if($scope.differentAddresses(element.workers[i]))
    							return true;
    					}
    					return false;
    					}
    					else if(value==3){
    						for(var i = 0;element.workers&&i<element.workers.length;i++){
    						if($scope.doubleError(element.workers[i].id))
    							return true;
    					}
    					return false;
    					}
    					else if(value==4){
    						for(var i = 0;element.workers&&i<element.workers.length;i++){
    						if($scope.doubleInTrackError(element.workers[i].id))
    							return true;
    					}
    					return false;
    					}
    				}
    			}
    			return true;
    		}
    	}
    	
    	$scope.changeTrackChecking = function(track_id){
    		var checked = $scope.tracks.filter(t=>t.track.id==track_id);
    		var index;
    		$scope.tracks.filter(t=>t.track.id==track_id)[0].checked = !$scope.tracks.filter(t=>t.track.id==track_id)[0].checked;
    		
    		// if checked - add track id to array
    		if($scope.tracks.filter(t=>t.track.id==track_id)[0].checked){
    			$rootScope.checkedTracksIds.push(track_id);
    		}
    		
    		// if not checked - remove track id from array
    		else{
    			index = $rootScope.checkedTracksIds.indexOf(track_id);
    			if(index!=-1){
    				$rootScope.checkedTracksIds.splice(index,1);
    			}
    		}
    	}
    	
    	//get selected tracks
    	$scope.getDataList = function(){
    		if($scope.trackfilter && $scope.trackfilter.track.combined_line==null){
    			$scope.trackfilter.track.combined_line = undefined;
    			$rootScope.line_number = undefined;
    		}
    		if($scope.trackfilter&&$scope.trackfilter.track&&$scope.trackfilter.track.shift)
    			$rootScope.shift = $scope.trackfilter.track.shift;
    		if($scope.trackfilter&&$scope.trackfilter.track&&$scope.trackfilter.track.line_number)
    			$rootScope.line_number = $scope.trackfilter.track.line_number;    			
    		$scope.selectedTracks=angular.copy($scope.tracks);
    		if($scope.selectedDriver)
    			$scope.selectedTracks = $scope.selectedTracks.filter(filterByParameter('driver','id',$scope.selectedDriver));
    		// if($scope.selectedTrack)
    			// $scope.selectedTracks=$scope.selectedTracks.filter(filterByParameter('track','combined_line',$scope.selectedTrack));
    		if($scope.selectedNameIdCity)
    			$scope.selectedTracks=$scope.selectedTracks.filter(filterByParameter('driver','nameIdCity',$scope.selectedNameIdCity));
    		// if($scope.selectedShift){
    			// $scope.current_shift=$scope.selectedShift;
    			// $scope.selectedTracks=$scope.selectedTracks.filter(filterByParameter('track','shift',$scope.selectedShift));
    			// $scope.changeDate();
    		// }
    			// $scope.selectedTracks=$scope.selectedTracks.filter(filterByParameter('track','shift',$scope.selectedShift));
    		if($scope.selectedError)
    			$scope.selectedTracks=$scope.selectedTracks.filter(filterByParameter('track','error',$scope.selectedError));
    		if($rootScope.checked!==undefined)
    			$scope.selectedTracks=$scope.selectedTracks.filter(filterByParameter('track','checked',$rootScope.checked));
    	// if($scope.selectedTrack===undefined||$scope.selectedTrack!==null)
    	// $scope.selecteslist=angular.copy($scope.selectedTracks);
    	// if(!$scope.$$phase){
    		// $scope.$apply();
    	// }
    	
    	//change the count of passengers
    	$scope.workers = [];
    	if(!$scope.trackfilter||!$scope.trackfilter.track.shift){
    		for(var i = 0;i<$scope.selectedTracks.length;i++){
    			for(var j = 0;$scope.selectedTracks[i].workers&&j<$scope.selectedTracks[i].workers.length;j++){
    				if($scope.workers.indexOf($scope.selectedTracks[i].workers[j].id)==-1)
    					$scope.workers.push($scope.selectedTracks[i].workers[j].id);
    			}
    		}
    	}
    	
    	else{
    		for(var i=0;$scope.filtered&&i<$scope.filtered.length;i++){
    			for(var j=0;$scope.filtered[i].workers&&j<$scope.filtered[i].workers.length;j++){
    				if($scope.workers.indexOf($scope.filtered[i].workers[j].id)==-1)
    					$scope.workers.push($scope.filtered[i].workers[j].id);
    			}
    		}
    	}
    	
    		// if($rootScope.shift){
    			// $scope.current_shift=$rootScope.shift;
    			// $scope.changeDate();
    		// }
    		if($scope.trackfilter&&$scope.trackfilter.track.shift){
    			$scope.current_shift = $scope.trackfilter.track.shift;
    			$scope.changeDate();
    		}
    		
    		if($scope.trackfilter&&$scope.trackfilter.track.combined_line===null)
				$scope.trackfilter.track.combined_line = '';
    		
    		if(!$scope.$$phase){
    		$scope.$apply();
    	}
    	}
    	
    	$scope.show_map_for_tracks = function(){
    		
    	}
    	
    		// if($rootScope.date)
    			// $scope.selectedDate=$rootScope.date;
    		// else
    			// $scope.selectedDate=new Date();
    		// $rootScope.date = $scope.selectedDate;
    		//2018-01-30 $rootScope.shift = '';
    		$scope.getTracksByDate();
			$http.post($rootScope.baseUrl+'staticlines/get_all_static_lines')
			.success(function(data){
				$rootScope.static_lines = data;
			})
			.error(function(){
				
			});	
			
		$scope.addNewTrack = function(){
			if(!$scope.newTrack)
				return;
			document.getElementById('loader').style.display='block';
			$http.post($rootScope.baseUrl+$scope.controller+'/addnewline',{new_line:$scope.newTrack,today:$rootScope.date}).success(
				function(data) {
					document.getElementById('loader').style.display='none';
					$scope.new_line_id = data;
					// $scope.newTrack.checked = true;
					// $scope.changeTrackChecking(data);
					if(data=='line exists')
						$rootScope.message='הקו כבר קיים במערכת';
					else
						$rootScope.message='הקו נוסף בהצלחה';
					angular.element('#saved-toggle').trigger('click');
					$scope.getTracksByDate();
					// $scope.changeTrackChecking(data);
					})
					.error(function(){
					document.getElementById('loader').style.display='none';
					$rootScope.message='ארעה שגיאה בהוספת הקו';
					angular.element('#saved-toggle').trigger('click');
				});					
		}
			    		
    		$scope.sendTrackToDelete = function(track){
    			$scope.trackToDelete = track;
    		}
    		
    		$scope.deleteTrack = function(){
			document.getElementById('loader').style.display='block';
			$http.post($rootScope.baseUrl+$scope.controller+'/deletetrack',{track_id:$scope.trackToDelete.track.id}).success(
				function(data) {
					document.getElementById('loader').style.display='none';
					$rootScope.message='הקו נמחק בהצלחה';
					angular.element('#saved-toggle').trigger('click');
					$scope.getTracksByDate();					
					})
					.error(function(){
					document.getElementById('loader').style.display='none';
					$rootScope.message='ארעה שגיאה במחיקת הקו';
					angular.element('#saved-toggle').trigger('click');
				});					
    		}
    		
    		// $scope.$watch(function(scope) { return scope.trackfilter.track.combined_line },
              // function() {
                  // $scope.workers=[];
    		// for(var i=0;i<$scope.selectedTracks.length;i++){
    			// for(var j=0;j<$scope.selectedTracks[i].workers.length;j++){
    				// if($scope.workers.indexOf($scope.selectedTracks[i].workers[j].id)==-1)
    					// $scope.workers.push($scope.selectedTracks[i].workers[j].id);
    			// }
    		// }});
    		
    		$scope.oneError = function(id){
    			var worker_shifts = [];
    			if(!$scope.oneWayError || !$scope.oneWayError.length)
    				return;
    			for(var i=0;i<$scope.oneWayError.length;i++){
    				if($scope.oneWayError[i].workers.indexOf(id)!=-1)// מסלולים בתאריכים שונים - שגיאה
    				// if($scope.oneWayError[i].workers.indexOf(id)!=-1&&$scope.oneWayError[i].shift!='לילה - איסוף'&&$scope.oneWayError[i].shift!='בוקר - פיזור')
    					worker_shifts.push($scope.oneWayError[i].shift);
    			}
    			for(var i=0,b=-1,c=-1,d=-1,e=-1;i<worker_shifts.length;i++){
    				if(b==-1)
    					b = worker_shifts[i].indexOf("איסוף");
    				if(c==-1)
    					c = worker_shifts[i].indexOf("פיזור");
					if(d==-1)
    					d = worker_shifts[i].indexOf("בוקר - פיזור");
					if(e==-1)
    					e = worker_shifts[i].indexOf("לילה - איסוף");
    			}
    			if(d!=-1||e!=-1){
    				return false;
    			}
    			return (b!=-1)!=(c!=-1);
    		}
    		
    		$scope.differentAddresses = function(worker){
    			// if($scope.workers_shifts[worker.id]['בוקר - איסוף'] && $scope.workers_shifts[worker.id]['צהריים - פיזור'] && $scope.workers_shifts[worker.id]['בוקר - איסוף'][worker.index]!=$scope.workers_shifts[worker.id]['צהריים - פיזור'][worker.index]){
    				// return true;
    			// }
    			// if($scope.workers_shifts[worker.id]['צהריים - איסוף'] && $scope.workers_shifts[worker.id]['לילה - פיזור'] && $scope.workers_shifts[worker.id]['צהריים - איסוף'][worker.index]!=$scope.workers_shifts[worker.id]['לילה - פיזור'][worker.index]){
    				// return true;
    			// } 
    			if($scope.workers_shifts[worker.id]['בוקר - איסוף'] && $scope.workers_shifts[worker.id]['צהריים - פיזור'] && $scope.workers_shifts[worker.id]['בוקר - איסוף']['address'][0]!=$scope.workers_shifts[worker.id]['צהריים - פיזור']['address'][0]){
    				return true;
    			}
    			if($scope.workers_shifts[worker.id]['צהריים - איסוף'] && $scope.workers_shifts[worker.id]['לילה - פיזור'] && $scope.workers_shifts[worker.id]['צהריים - איסוף']['address'][0]!=$scope.workers_shifts[worker.id]['לילה - פיזור']['address'][0]){
    				return true;
    			}
    			if($scope.workers_shifts[worker.id]['לילה - איסוף'] && $scope.workers_shifts[worker.id]['בוקר - פיזור'] && $scope.workers_shifts[worker.id]['לילה - איסוף']['address'][0]!=$scope.workers_shifts[worker.id]['בוקר - פיזור']['address'][0]){
    				return true;
    			}     			   			
    			// for(var shift in $scope.workers_shifts[id]){
    				// if($scope.workers_shifts[id][shift].length>1){
    					// return true;
    				// }
    			// }
    			return false;
    		}    		
    		
    		$scope.doubleError = function(id){
    			if(!$scope.workers_details){
    				return false;
    			}
    			
			  	if(0+($scope.workers_details[id][1]?$scope.workers_details[id][1].length:0)+
			  		($scope.workers_details[id][3]?$scope.workers_details[id][3].length:0)
			  		+($scope.workers_details[id][5]?$scope.workers_details[id][5].length:0)>1)
			  		return true;
				if(0+($scope.workers_details[id][2]?$scope.workers_details[id][2].length:0)+
			  		($scope.workers_details[id][4]?$scope.workers_details[id][4].length:0)
			  		+($scope.workers_details[id][6]?$scope.workers_details[id][6].length:0)>1)
				  	return true;
    			
    			return false;
    		}  
    		
    		$scope.doubleInTrackError = function(id){
    			for(var track in $scope.workers_in_tracks[id]){
    				if($scope.workers_in_tracks[id][track]>1){
    					return true;
    				}
    			}
    			return false;
    		}     		  		
    		
    		$scope.file = function(){
    			$scope.show_differences = false;
    			angular.element('#xlsx_load').trigger('click');
    		}
    		
    		$scope.update_file=function(){
    			
    			angular.element('#xlsx_update').trigger('click');
    		}    		
    		
    		
    			/**********************drag & drop*****************************/

		/**
		 * dnd-dragging determines what data gets serialized and send to the receiver
		 * of the drop. While we usually just send a single object, we send the array
		 * of all selected items here.
		 */
		$scope.getSelectedItemsIncluding = function(list, item) {
			item.selected = true;
			return list.order.filter(function(item) {
				return item.selected;
			});
		};

		/**
		 * We set the list into dragging state, meaning the items that are being
		 * dragged are hidden. We also use the HTML5 API directly to set a custom
		 * image, since otherwise only the one item that the user actually dragged
		 * would be shown as drag image.
		 */
		$scope.onDragstart = function(list, event) {
			$scope.fromRoute = list;
			list.dragging = true;
			if (event.dataTransfer.setDragImage) {

			}
		};

		/**
		 * In the dnd-drop callback, we now have to handle the data array that we
		 * sent above. We handle the insertion into the list ourselves. By returning
		 * true, the dnd-list directive won't do the insertion itself.
		 */
		
			
		$scope.setDraggedWorker = function(worker,track){
			$scope.draggedWorker = worker;
			$scope.old_track = track;
			$scope.copied_workers=angular.copy(track.workers);
		}
		
		$scope.onDrop = function(track_id) {
			if(track_id==$scope.old_track.track.id){
				$scope.exists = true;
				//$scope.updateWorkerOrder($scope.old_track,$scope.old_track.workers)
				return;
			}
			document.getElementById('loader').style.display = 'block';
				$http.post($rootScope.baseUrl + $scope.controller + '/addworkertotrack',{worker_id:$scope.draggedWorker.id,new_track_id:track_id,old_track_id:$scope.old_track.track.id}).success(
						function(data) {
							if(data=='exists'){
								$scope.exists = true;
								$rootScope.message = 'העובד כבר קיים במסלול זה';
								angular.element('#saved-toggle').trigger('click');
							}
							document.getElementById('loader').style.display = 'none';
							setTimeout(function(){
					       	  			$scope.getTracksByDate();
					       	  			if(!$scope.$$phase){
							    			$scope.$apply();
							    		}
					       	  		} ,0);
							})
					       	.error(function(){
					       		$rootScope.message = 'ארעה שגיאה בשמירת הנתונים';
					       		angular.element('#saved-toggle').trigger('click');
					       		document.getElementById('loader').style.display = 'none';
					       	});
		}
		/**
		 * Last but not least, we have to remove the previously dragged items in the
		 * dnd-moved callback.
		 */
		$scope.onMoved = function(list) {
			list.order = list.order.filter(function(item) {
				return !item.selected;
			});
		};
		
		
		    $scope.updateWorkerOrder = function(track,list){
		    	if(track.track.id!=$scope.old_track.track.id){
				return;
				}
    		$scope.currentRoute = track;
    		var i = 1;
    		angular.forEach(list,function(worker){
    			worker.track_order = i++;
    			worker.duration = $scope.copied_workers[i-2].duration;
    			if($scope.currentRoute.track.id==$scope.old_track.track.id)
    				worker.hour = new Date($scope.copied_workers[i-2].hour);
    			else
    				worker.hour = $scope.copied_workers[i-2].hour;
    			worker = worker;
    		});
    		// $scope.track.workers=list;
    		document.getElementById('loader').style.display = 'block';
    		$http.post($rootScope.baseUrl + $scope.controller + '/updateworkerorder',{workers:list,track_id:$scope.currentRoute.track.id}).success(
				function(data) {
					document.getElementById('loader').style.display = 'none';
					if(data!='changed')
						$rootScope.message='ארעה שגיאה בעדכון הנתונים';
					else
						$rootScope.message='הנתונים התעדכנו';
					// if($scope.collecting || (!$scope.collecting)&&$scope.currentRoute.track.id==$scope.reverseTrack.track.id)
						// calculateHourByWaiting($scope.currentRoute);
					angular.element('#saved-toggle').trigger('click');
				})						
				.error(function(){
					$rootScope.message='ארעה שגיאה בעדכון הנתונים';
					angular.element('#saved-toggle').trigger('click');
					document.getElementById('loader').style.display='none';
				});
    		//if($scope.collecting||(!$scope.collecting&&$scope.currentRoute.track.id==$scope.reverseTrack.track.id))
			//	$scope.track.workers=$filter('orderBy')($scope.old_track.workers, "hour");
			//else if(!$scope.collecting||(!$scope.collecting&&$scope.currentRoute.track.id==$scope.track.track.id))
				$scope.track.workers=$filter('orderBy')($scope.old_track.workers, "track_order");
    		if(!$scope.$$phase)
    			$scope.$apply();
    	}
    	
		/***************************************************/
		
		//set <th> of track according to the current shift
		$scope.setTh = function(shift){
			var b = shift.indexOf('פיזור');
			if(b!=-1){
				$scope.collecting = false;
				return 'סדר';
			}
			$scope.collecting = true;
			return 'שעה';
		}
		
		//order worker by order or hour, according to his current track shift
		$scope.sortMe = function(){
			return function(element) {
			  return element.track_order || element.hour;
			}
		}
		
		$scope.$watch(function(scope){if(scope.trackfilter&&scope.trackfilter.track.shift)return scope.trackfilter.track.shift},function(){
			if($scope.trackfilter&&$scope.trackfilter.track&&$scope.trackfilter.track.shift=="")
				$scope.changeDate();
			if($scope.trackfilter&&$scope.trackfilter.track){
				$rootScope.lshift = $scope.trackfilter.track.shift;
				$rootScope.shift = $scope.trackfilter.track.shift;
			}
				// $rootScope.lshift=$scope.trackfilter.track.shift;
		   // $scope.workers=[];
    		// for(var i=0;i<$scope.filtered.length;i++){
    			// for(var j=0;j<$scope.filtered[i].workers.length;j++){
    				// if($scope.workers.indexOf($scope.filtered[i].workers[j].id)==-1)
    					// $scope.workers.push($scope.filtered[i].workers[j].id);
    			// }
    		// }
    		
    		$scope.lines = [];
    		if(!$scope.trackfilter||!$scope.trackfilter.track.shift){
    			if($scope.selectedTracks)
    			for(var i = 0;i<$scope.selectedTracks.length;i++){
    				$scope.lines.push($scope.selectedTracks[i].track.combined_line);
    			}
    		}
    		else{
	    		// for(var i=0;i<$scope.filtered.length;i++){
	    			// if($scope.filtered[i].track.shift==$scope.trackfilter.track.shift)
	    				// $scope.lines.push($scope.filtered[i].track.combined_line);
	    			// }
	    				// for(var i = 0;$scope.tracks&&i<$scope.tracks.length;i++){
	    			// if($scope.tracks[i].track.shift==$scope.trackfilter.track.shift)
	    				// $scope.lines.push($scope.tracks[i].track.combined_line);
	    			// }
    		}
		});
		
		//change workers count after filtered changed
		$scope.$watch(function(scope){if(scope.filtered)return scope.filtered},
		function(){
			$scope.workers = [];
			if($scope.filtered){
	    		for(var i = 0;i<$scope.filtered.length;i++){
	    			if($scope.filtered[i].workers&&$scope.filtered[i].workers.length)
	    			for(var j = 0;j<$scope.filtered[i].workers.length;j++){
	    				if($scope.workers.indexOf($scope.filtered[i].workers[j].id)==-1)
	    					$scope.workers.push($scope.filtered[i].workers[j].id);
	    			}
	    		}		
	    		if(!$scope.trackfilter || !$scope.trackfilter.track.combined_line){
	    			$scope.lines = [];
		    		angular.forEach($scope.filtered,function(track){
		    			if($scope.lines.indexOf(track.track.combined_line)==-1 && ((!$scope.selectedDriver) || ($scope.selectedDriver && $scope.selectedDriver==track.track.meesenger))){
		    				$scope.lines.push(track.track.combined_line);
		    			}
		    		}); 	    			
	    		}
			}
		});
		
		$scope.$watch(function(scope){return $rootScope.date},
		function(){
			$scope.getTracksByDate();
		});		
		
		//on select change the url to oneroute
		$scope.showByRoute = function(track){
			$rootScope.track = track;
			$location.path('/oneroute');
		}
		
		$scope.print_tracks = function(){
			var i = 1;var arr = [];var num;var max;
			$scope.orderTracks = ['num_workers'];			
	    	setTimeout(function(){
	    		$('.station-track').removeClass('height_track');
				$('.li_line').addClass('line_print');
				$('.station_div').each(function(){
					num = ($('.station_div').eq(parseInt(i)-parseInt(1)).find('.station-track').css('height')).replace('px','');   
					arr.push(num);
					if(i%4==0){
						max = Math.max.apply(null, arr);
						$('.station_div').eq(parseInt(i)-parseInt(1)).find('.station-track').css('height',max+'px');
						$('.station_div').eq(parseInt(i)-parseInt(1)).prev().find('.station-track').css('height',max+'px');
						$('.station_div').eq(parseInt(i)-parseInt(1)).prev().prev().find('.station-track').css('height',max+'px');
						$('.station_div').eq(parseInt(i)-parseInt(1)).prev().prev().prev().find('.station-track').css('height',max+'px');
						arr = [];
					}
					i++;
				});
				$('.station-track').addClass('height_track');  
				$('.li_line').removeClass('line_print');
   	  			window.print();
   	  		} ,1000);
			
		}
		
		var map;
    	function myMap(way,start,end,last_id,first_id,map,color) {
    		
			
			 var directionsDisplay = new google.maps.DirectionsRenderer({
			    polylineOptions: {
			      strokeColor: color
			    }
			  });
			  directionsDisplay.setMap(map);
			var directionsService=new google.maps.DirectionsService;
			 directionsService.route({
            	origin: start,
			 	waypoints:way,
           		destination: end,
			 	travelMode: google.maps.TravelMode.DRIVING}
			 	, function(response, status) {
          if (status == 'OK') {
            directionsDisplay.setDirections(response);
            document.getElementById('duration').style.display = 'block';
            var sum = 0;
            for(var i = 0;i<directionsDisplay.directions.routes[0].legs.length;i++){
            	sum+=directionsDisplay.directions.routes[0].legs[i].duration.value;
            }
            sum/=60;
            var message;
            if(sum>60)
            	message = Math.floor(sum/60).toString() + ' שעות ו' + Math.round(sum%60).toString() + ' דקות';
            else
            	message = Math.round(sum).toString()+' דקות';
            document.getElementById('duration').innerHTML='משך המסלול: '+message;
          } else {
            alert('שגיאה בחישוב מסלול');
          }
        });
		 }
		 
		 $scope.show_map_for_tracks = function(){
		 	var mapCanvas = document.getElementById("mymap");
		 	var center;
		 	var map;
		 	var colors = ['red','blue','green','yellow'];
		 	var index = 0;
    		
		 	angular.forEach($scope.selectedTracks,function(track){
    			$scope.trackOfMap = track;
		  	 	var way = [];
		  	 	var hospitalLocation = new google.maps.LatLng(32.0851095,34.8440055);
				var start,end,i,length,tmp;
				var waypoint = {};		
				var shift = track.track.shift;
				var collecting;
				
				var b = shift.indexOf('פיזור');
				if(b!=-1){
					collecting = false;
				}
				else{
					collecting = true;
				}	
				
				if(collecting==true){
					i = 1;
					length = $scope.trackOfMap.workers.length;
					start = $scope.trackOfMap.workers[0].addresses[$scope.trackOfMap.workers[0].index].original_address;
					end = hospitalLocation;
				}
				else{
					i = 0;
					length = $scope.trackOfMap.workers.length-1;
					start = hospitalLocation;
					end = $scope.trackOfMap.workers[length].addresses[$scope.trackOfMap.workers[length].index].original_address;
				}
				for(waypoint = {};i<length;i++){
						if($scope.trackOfMap.workers[i].addresses){
							waypoint.location = $scope.trackOfMap.workers[i].addresses[$scope.trackOfMap.workers[i].index].original_address;
							waypoint.stopover = true;
							tmp = angular.copy(waypoint);
							way.push(tmp);
						}
				}
		  	 	document.getElementById('mymap').style.display = 'block';
		  	 	var first_id = $scope.trackOfMap.workers[0].id;
		  	 	var last_id = $scope.trackOfMap.workers[$scope.trackOfMap.workers.length-1].id;
		  	 	if(map==undefined){
		  	 		if(way.length)
		    			center=way[Math.floor(way.length/2)].location;
					var mapOptions = {center: center, zoom: 11};
					map = new google.maps.Map(mapCanvas,mapOptions);
		  	 	}
		  	 	
		  	 	myMap(way,start,end,last_id,first_id,map,colors[index]);
		  	 	index++;
    		});
		 }
		 
		 $scope.sortLines = function(line) {
		   return parseInt(line);
		};
		
  }

})();
