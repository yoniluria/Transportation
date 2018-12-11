<?php

namespace app\controllers;

use Yii;
use app\models\Track;
use app\models\Worker;
use app\models\Address;
use app\models\Staticlines;
use app\models\HospitalTrack;
use app\models\Shift;
use app\models\Track_for_worker;
use app\models\TrackSearch;
use yii\web\Controller;

use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use app\models\Order;
use app\models\Messengers;
use app\models\Expenses;
use app\models\Definition;
use app\models\OrderDetails;
use app\models\Distances;
use yii\helpers\ArrayHelper;
use yii\base\ErrorException;

// ini_set("error_reporting", E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
/**
 * TrackController implements the CRUD actions for Track model.
 */
class TrackController extends Controller    
{
    /**
     * @inheritdoc
     */
     
     
      public function beforeAction($action)
    {
    	
      
      if ($action->id == 'get_one_route' ||$action->id == 'save_workers' ||$action->id == 'optimizebytime' ||$action->id == 'fixedroutes' ||$action->id == 'get_reverse_track' ||$action->id == 'updatetrackdetails' ||$action->id == 'algorithm' ||$action->id =='deletetrack'||$action->id == 'automatictrack'||$action->id == 'optimizedroutes'||$action->id == 'updateallroutes'||$action->id == 'checkfinishtrack'||$action->id =='trackmessenger'||$action->id =='getroute'||$action->id =='getallroute'||$action->id =='tracknow'||$action->id == 'saveordersfromxls'||$action->id == 'updateordersfromxls'||$action->id == 'addworkertotrack'||$action->id == 'updatetrack'||$action->id == 'deleteworker'||$action->id == 'updateworkerfortrack'||$action->id == 'uploadimage'||$action->id == 'changetrackorder'||$action->id == 'updateworkerorder'||$action->id == 'changehours'||$action->id == 'addworkertoline'||$action->id =='addnewline'||$action->id =='change_shift') {
        
            $this->enableCsrfValidation = false;
		    // $this->performAjaxValidation=false;
        }
    header("Access-Control-Allow-Methods: DELETE, POST, GET");
	// header("Access-Control-Allow-Origin: *");
	// header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept,X-CSRF-Token");
	
        return parent::beforeAction($action);
    }
    
    public function behaviors()
    {
        return [
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'delete' => ['POST'],
                ],
            ],
        ];
    }

    /**
     * Lists all Track models.
     * @return mixed
     */
   //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // site function
  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  
  public function actionSave_workers()
  {
	date_default_timezone_set("Asia/Jerusalem");
	$data = json_decode(file_get_contents("php://input"));
	$track = $data->data->track;
	$track_id = $data->data->track->id;
	$workers = $data->data->workers;
	
	$trackModel = Track::findOne($track_id);
	$collecting = (strpos($trackModel->shift, 'איסוף') !== false)?1:0; 
	//$orderby = $collecting==1?'hour':'track_order';
	$orderby = 'track_order';
    //בדיקה האם השעות תקינות-מופיעות לפי הסדר-בסדר עולה - כל שעה גדולה מהשעה שלפניה
    $prev_hour = null;
    foreach ($workers as $key=>$worker) {
        $hour = strtotime($worker->hour);
        if($prev_hour && $prev_hour > $hour){
            print_r(json_encode(['status'=>"error","msg"=>"שעות לא תקינות!!!!"]));die();
        }
        $prev_hour = $hour;
    }   	
	foreach ($workers as $key=>$worker) {
	    $hospital_track = HospitalTrack::find()->where(['combined_line'=>$track->line_number,'shift_id'=>$track->shift_id,'worker_id'=>$worker->id,'date'=>$track->track_date])->one();
        if($hospital_track){
            $hospital_track -> address = $worker->selectedAddress->original_address;
            $hospital_track ->save();
        }
		$connection = Track_for_worker::findOne(['track_id'=>$track_id,'worker_id'=>$worker->id]);
		$connection->duration = $worker->duration;
		$connection->address = $worker->selectedAddress->original_address;
		$connection->instructions = $worker->instructions;
		if(isset($worker->hour)){
			$connection->hour = date('H:i:s',strtotime($worker->hour));
			if($key==0){
				$time = strtotime($connection->hour);
				$time = $time - (15 * 60);
				/*$start_hour = date("H:i:s", $time);
				$trackModel->start_hour = $start_hour;
				$trackModel->save(false);*/
			}
		}
		$connection->save(FALSE);
		// $address = Address::findOne(['worker_id'=>$worker->id,'original_address'=>$worker->addresses[$worker->index]->original_address]);
		$address = Address::findOne(['worker_id'=>$worker->id,'original_address'=>$worker->selectedAddress->original_address]);
		if($address){
			$address->travel_time = $worker->addresses[$worker->index]->travel_time;
			$address->save(FALSE);
		}
		/*----------------------------*/
		if((!$collecting==0&&$key==0)){
			$prev_track = $connection;
			continue;
		}
		if($key==0){
			//print_r($connection);die();
			$prev_track = $connection;
			continue;
		}
		$newDuration = $collecting?$prev_track->duration:$connection->duration;
		$source = $prev_track->address;
		$destination = $connection->address;
		$distance = Distances::find()->where(['source'=>$source,'destination'=>$destination])->orWhere(['source'=>$destination,'destination'=>$source])->one();
		/*if($distance){
			$item = $collecting==1?$prev_track:$connection;
			$item->duration = $distance->duration;
			$item->save(false);
		}
		else if($newDuration>0&&!$distance){
			$distance = new Distances();
			$distance->source = $source; 
			$distance->destination = $destination;    
			$distance->duration = $newDuration;
			$distance->save(false);
		}*/
		if($newDuration>=0){
			if(!$distance){
				$distance = new Distances();
				$distance->source = $source; 
				$distance->destination = $destination;
			} 
			$distance->duration = $newDuration;
			$distance->save(false);
		}
		$prev_track = $connection;
		/*----------------------------*/
	}
    print_r(json_encode(['status'=>"ok","msg"=>""]));die();  	
  }
  
  public function actionGet_one_route()
  {
  	$data = json_decode(file_get_contents("php://input"));
	$track_id = $data->track_id;
	$one_route = array();
	$one_route['track'] = Track::findOne($track_id);
	$one_route['driver'] = Messengers::findOne($one_route['track']->meesenger);
	$one_route['workers'] = array();
	$all_shifts = Shift::find()->select("id,name")->where("name!='".$one_route['track']->shift."'")->asArray()->all();
	$all_shifts = ArrayHelper::map($all_shifts, 'name', 'name');   
	foreach ($all_shifts as $key => $value) {
		$all_shifts[$key] = [];
		$all_shifts[$key]['shift'] = $key;
		$all_shifts[$key]['lines'] = Track::find()->select("combined_line")->where("track_date = '".$one_route['track']->track_date."' and shift = '".$key."'")->all();
	}
	$one_route['lines'] = $all_shifts;
	$connections = Track_for_worker::find()->where(['track_id'=>$track_id])->all();
	if($connections){
		foreach ($connections as $connection) {
			$worker = Worker::find()->where(['id'=>$connection->worker_id])->asArray()->one();
			$worker['addresses'] = Address::find()->where(['worker_id'=>$connection->worker_id])->all();
			$worker['address'] = $connection->address;
			$worker['duration'] = $connection->duration;
			$worker['hour'] = $connection->hour;
			$worker['track_order'] = $connection->track_order;
			$worker['instructions'] = $connection->instructions;
			$one_route['workers'][] = $worker;
		}		
	}
	Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
	return $one_route;
  }
  
 	public function actionDeletetrack()
 	{
		$data = json_decode(file_get_contents("php://input"));
		$track_id = $data->track_id;
		$track_model = Track::findOne($track_id);
		
		$all_workers = Track_for_worker::find()->where("track_id = ".$track_id)->all();
		foreach ($all_workers as $key => $value) {
			$hospital_track_model = HospitalTrack::find()->where(['shift'=>$track_model->shift,'date'=>$track_model->track_date,'worker_id'=>$value->worker_id])->one();
			if($hospital_track_model){
				$hospital_track_model->delete();
			}
			$value->delete();
		}
		
		//Track_for_worker::deleteAll(['track_id'=>$track_id]);
		Track::deleteAll(['id'=>$track_id]);		
		
		die('deleted');
 	}
    
	  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	  
	  public function actionAddworkertotrack()
	  {
	  	
	  	$data = json_decode(file_get_contents("php://input"));
		
		//get details
		$old_track_id = $data->old_track_id;
		$new_track_id = $data->new_track_id;
		$worker_id = $data->worker_id;
		
		//check if worker already exists in new_track
		$connection = Track_for_worker::findOne(['track_id'=>$new_track_id,'worker_id'=>$worker_id]);
		if($connection){
			die('exists');
		}
		
		
		//find old connection duration
		$old_connection = Track_for_worker::findOne(['track_id'=>$old_track_id,'worker_id'=>$worker_id]);
		$duration = $old_connection->duration;
		$address = $old_connection->address;
		$trackModel = Track::findOne($old_track_id);
		$collecting = (strpos($trackModel->shift, 'איסוף') !== false)?1:0; 
		
		
		//delete connection of dragged worker and old track
	  	$old_connection->delete();
		
		//create connection between dragged worker and new track
		/*$trackModel = Track::findOne($new_track_id);
		$collecting = (strpos($trackModel->shift, 'איסוף') !== false)?1:0;
		if($collecting){
			$prev_track = Track_for_worker::find()->where("track_id = ".$new_track_id)->orderBy(['id'=>SORT_DESC])->limit("1")->one();
			$source = $prev_track->address;
			$destination = $address;
		}else{
			$prev_track = Track_for_worker::find()->where("track_id = ".$new_track_id)->orderBy(['id'=>SORT_ASC])->limit("1")->one();
			$source = $address;
			$destination = $prev_track->address;
		}
		$distance = Distances::find()->where("source = '".$source."' and destination = '".$destination."'")->one();
		if($distance){
			$duration = $distance->duration;
		}else{
			$duration = 0;
		}
		$prev_track->duration = $duration;*/
		
		/*if($collecting){
			$prev_track = Track_for_worker::find()->where("track_id = ".$new_track_id)->orderBy(['id'=>SORT_DESC])->limit("1")->one();
			$source = $prev_track->address;
			$destination = $address;
		}else{
			$prev_track = Track_for_worker::find()->where("track_id = ".$new_track_id)->orderBy(['id'=>SORT_ASC])->limit("1")->one();
			$source = $address;
			$destination = $prev_track->address;
		}
		$distance = Distances::find()->where(['source'=>$source,'destination'=>$destination])->one();
		if($distance){
			$duration = $distance->duration;
		}else{
			$duration = 0;
		}
		$prev_track->duration = $duration;
		$prev_track->save(false);*/
		
		//$orderby = $collecting==1?'hour':'track_order';
		$orderby = 'track_order';
		$all_prev_tracks = Track_for_worker::find()->where("track_id = ".$old_track_id)->orderBy($orderby)->all();
		$i = 0;
		foreach ($all_prev_tracks as $key => $value) { /* עדכון טבלת מקור */
			
			if(($collecting==1&&$key==(count($all_prev_tracks)-1))||(!$collecting==0&&$key==0)){
				$time = 0;
				$adressModel = Address::find()->where(['worker_id'=>$value->worker_id,'original_address'=>$value->address])->one();
				if($adressModel){
					$time = $adressModel->travel_time;
				}
				$value->duration = $time;
				$value->save(false);
			}
			if($key==0){
				$prev_track = $value;
				continue;
			}
			$source = $prev_track->address;
			$destination = $value->address;
			$distance = Distances::find()->where(['source'=>$source,'destination'=>$destination])->orWhere(['source'=>$destination,'destination'=>$source])->one();
			if($distance){
				$duration = $distance->duration;
			}else{
				$duration = 0;
			}

			$item = $collecting==1?$prev_track:$value;
			$item->duration = $duration;
			$item->save(false);
			$prev_track = $value;
			
		}
		
		
		
		$travel_time = 0;
		if($address){
			$adress = Address::find()->where(['worker_id'=>$worker_id,'original_address'=>$address])->one();
			if($adress){
				$travel_time = $adress->travel_time;
			}
		}
		
		$track_for_worker = new Track_for_worker();
		$track_for_worker->track_id = $new_track_id;
		$track_for_worker->worker_id = $worker_id;
		$new_track = Track::findOne($new_track_id);
		$shift = Shift::findOne($new_track->shift_id);
		if($shift){
			$track_for_worker->hour = $shift->hour;
		}
		//$track_for_worker->duration = $duration;
		$track_for_worker->address = $address;
		$track_for_worker->duration = $travel_time;
		if($track_for_worker->save(false)){
			$trackModel = Track::findOne($new_track_id);
		$collecting = (strpos($trackModel->shift, 'איסוף') !== false)?1:0;
		//$orderby = $collecting==1?'hour':'track_order';
		$orderby = 'track_order';
		$order_num = Track_for_worker::find()->select('track_order')->where("track_id = ".$new_track_id)->orderBy([$orderby => SORT_DESC])->limit('1')->one();
		$track_for_worker->track_order = intval($order_num->track_order)+intval(1);
		$track_for_worker->save(false);
		//$all_new_tracks = Track_for_worker::find()->where("track_i = ".$new_track_id)->orderBy($orderby)->all();
		$sql = "SELECT * FROM `track_for_worker` WHERE track_id = ".$new_track_id." ORDER BY track_order IS NULL, track_order";
		$all_new_tracks = Track_for_worker::findBySql($sql)->all(); 
		$i = 0;
		$track_order_num = 0;
		$num = 1;
		foreach ($all_new_tracks as $key => $value) { /* עדכון טבלת יעד */
				$value['track_order'] = $num;
				$value->save();
				$num++;
				if(($collecting==1&&$key==(count($all_new_tracks)-1))||(!$collecting==0&&$key==0)){
					$time = 0;
					$adressModel = Address::find()->where(['worker_id'=>$value->worker_id,'original_address'=>$value->address])->one();
					if($adressModel){
						$time = $adressModel->travel_time;
					}
					$value->duration = $time;
					$value->save(false);
				}
				if($key==0){
					$prev_track = $value;
					continue;
				}
				$source = $prev_track->address;
				$destination = $value->address;
				$distance = Distances::find()->where(['source'=>$source,'destination'=>$destination])->orWhere(['source'=>$destination,'destination'=>$source])->one();
				if($distance){
					$duration = $distance->duration;
				}else{
					$duration = 0;
				}
				
				$item = $collecting==1?$prev_track:$value;
				$item->duration = $duration;
				//echo $duration.' '.$item->id.' - ';
				$item->save(false);
				$track_order_num = $item->track_order>$track_order_num?$item->track_order:$track_order_num;
				$prev_track = $value;
				
			}
			return json_encode(["changed"]);
		}
			
		return json_encode(["error"]);
	  }
	  
 public function actionDeleteUnembeddedtrack($id){
 	
	//$model = Track::findOne($id);
	//print_r($model);die();
       if($model!=null){
       	$orders=Order::find()->where(['track_id'=>$model->id])->all();
       	foreach ($orders as $key => $value) {
			  $order=Order::findOne($value->id);
			  
			
			  if($order!=null) {
			  	$order->track_id=null;
				$order->save(false);  
				
			  }
			  else {echo "error";die();}
		}
       $model->delete();
       echo "OK";die();
       }
       else{
           echo "error";die();
       }
	//print_r(json_encode($r));die();
 }
	
	 
     public function actionGetroute(){
         $datee =date('Y-m-d');
         $cancel_date = date($datee, strtotime("+1 days")); 
         $cancel_date= date('Y-m-d', strtotime("tomorrow"));  
          $today=date("Y-m-d");
          $meesenger=$_REQUEST['data']['messenger']; 
              
             // הזמנה עדין לא התחילה ברירת מחדל שלה 1 לא רשום באופציות
              $track=Track::find()->joinWith("orders")->select('`track`.*,count(`order`.id)')->where(['`track`.status'=>1])->orWhere(['`track`.status'=>3])->andWhere(['meesenger'=>$meesenger])->andWhere(['between', 'track_date', $today, $cancel_date])->orderBy(['track_date'=>SORT_ASC])->groupBy('`track`.id')->having('count(`order`.id)>0')->one();
              $id = 1221;
			 
			  //print_r($track);die();
              //$trackTest = Track::find()->where(['status'=>1])->orWhere(['status'=>3])->andWhere(['meesenger'=>$_REQUEST['data']['messenger']])->andWhere(['between', 'track_date', $today, $cancel_date])->asArray()->all();
			 $trackTest = Track::find()->where(['id'=>1221])->asArray()->all();
			// 
             // file_put_contents('currentRouteRequest_2014.txt',$track->id );
              // echo "df";die();
             // print_r($track);die();
              if($track!=null){
            	 $track['status']=3;
				  //print_r($track);die();	
             	 $track->save(false);
             	 $station=Order::find()->where(['track_id'=>$track['id']])->orderBy('stop_index')->asArray()->all();
			  	$arr = [];
				
				//die();
			  	foreach ($station as $key => $value) {
			  		
			  		//$value['orders_details']=OrderDetails::find()->where(['fk_order'=>$value['id']])->asArray()->all();
					 array_push($arr,$value);
				  }
					
			  }
              if($station==null || count($station) < 1){
              	  echo "null";die();
			  }
			  	
				  
				 //try=$order->send_sms("0542774133","דניאל",'http://sayyes.co.il');
				 			
				/*
				if(count($station)==1)
									  $station=$station[0];
								   */
				
                 $data=json_encode($arr);
                 print_r($data);die();
                
         }

	//recalculate duration and distance of an existing route
	public function actionRecalculateDuration(){
		$t = json_decode(file_get_contents("php://input"));
		$track = Track::find()->where(['id'=>$t['id']])->asArray()->one();
		$track_orders = Order::find()->where(['track_id'=>$track['id']])->asArray()->all();
		
		$subArrays = array_chunk($track_orders, 23);
		$track_duration = 0;
		$track_distance = 0;
		$def = Definition::find()->asArray()->one();
		for($i = 0;$i < count($subArrays); $i++){
			$current_route = $subArrays[$i];
			//$output = array_slice($track_orders, $i,); 	
			if($i == 0){
				$origin = (object)['lat'=>$def['lat_office'],'lng'=>$def['lng_office' ]];
				}
				else{
				$subLen = count($subArrays[$i-1]);
				$prev = $subArrays[$i-1][$subLen];
				$origin = (object)[
			'lat'=>$prev['lat'],'lng'=>$prev['lng']];
			}
			$len = count($subArrays);
			if($i == ($len-1)){
				$destination = (object)['lat'=>$def['lat_office'],'lng'=>$def['lng_office']];
			}
			else{
				$next = $subArrays[$i+1][0];
				$destination = (object)['lat'=>$next['lat'],'lng'=>$next['lng']];
			}
			$track_result = array();
			$track_result = prepartArrayForGoogle($current_route,$track_result);
			//send to google
			
			$google_result = $track->getGoogleDirectionsB($origin,$destination,$track_result[0],true);
			//sum duration of stops
			$google_result_size = count($google_result[routes][0][legs]);
			
			
			for($h = 0; $h < ($google_result_size-1); $h++){
				$track_duration += $google_result[routes][0][legs][$h][duration][value];
				$track_distance += $google_result[routes][0][legs][$h][distance][value];
				if($current_route[$h]){
				$track_duration += ($current_route[$h]['stop_stay']*60);	
				//print_r(json_encode($current_route));die();
				}
			}
			
			
		}
		$track['distance'] = $track_distance;
		$track['time'] = $track_duration;
		if($track->save(false)){
			print_r('ok');die();
		}
		else{
			print_r('error');die();
		}

	}


     
	 public function actionAutomatictrack()
	 {
	 	$arr = $_REQUEST['data'];
		$stops =  array();
		//print_r(json_encode($_REQUEST['data']));die();
		//print_r(json_encode($_REQUEST));die();
		for($h = 0;$h < count($arr);$h++){
			//$temp = $arr[$h]['Point']['coordinates'];
			
			//$commaindex = strpos($temp, ",");
			//$lat =(float) strstr($temp, ',', true);
			
			//$temp1 = substr($temp,$commaindex,(strrpos($temp, ",",$commaindex)-$commaindex));
			//$lng = (float)substr($temp1, 1);
			
			//$url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='.trim($lat).','.trim($lng).'&language=he&sensor=false';
			
				//$json = file_get_contents($url);
				//$data=json_decode($json);
				//$status = $data->status;
				//if($status=="OK"){
					
					$obj = array('number' => $arr[$h]['number'],
									'street'=>$arr[$h]['street'],
									'city'=>$arr[$h]['city'],
									'lat'=>$arr[$h]['lat'],
									'lng'=>$arr[$h]['lng'],
									'address'=>$arr[$h]['address'],
									
									 ); 
									// print_r(json_encode($obj));die();
					array_push($stops,$obj);
				//}
				//else{
				
				//}
			//print_r(json_encode($lng));die();
			
		}
 	
		$k = 0;
		
		//print_r(count($stops)/8);die();
	 	//for($i = 0;$i < (count($stops)/8);$i++){
	 		//print_r('here');die();
								$cur_date = date('Y-m-d H:i:s');
					 /* $track = new Track(); 
					 $track->track_date = $cur_date;
					 $track->meesenger = 1;
					 $track->region = 'merchaz';
					 if(!$track->save(false)){
						 print_r('error track');die();
					 }
					 $cur_id = $track->id;*/
		 
			//$stops_arr = array('' => , );
			//for($j = 0;$j < 8 && $k < count($stops);$j++){
				
			for($j = 0;$j < count($stops);$j++){
				
				$cur_stop = new Order();
				
				$cur_stop->status = 0;
				//print_r(json_encode($cur_stop));die();		
				$cur_stop->time_order = $cur_date;
				//$cur_stop->address = $stops[$k]['address'];
				$cur_stop->city = $stops[$k]['city'];
				$cur_stop->street = $stops[$k]['street'];
				$cur_stop->number = $stops[$k]['number'];
				$cur_stop->lat = $stops[$k]['lat'];
				$cur_stop->lng = $stops[$k]['lng'];
				$cur_stop->address = $stops[$k]['address'];
				$cur_stop->messenger = 1;
				$cur_stop->stop_stay = 15;
				$cur_stop->customer_name = 'יוני לוריא';
				$cur_stop->phone = '0584447665';
				$cur_stop->price = 160.3;
				//$cur_stop->track_id = $cur_id;
				//array_push($stops_arr,$cur_stop);
				$k++;
				if($cur_stop->save(false))
				{
					
				}
				else{
					print_r('error while saving stop');die();
				}
					
			}
			
			print_r('ock');die();
					// }
			
		
		 
	 }

     public function actionCheckfinishtrack()
      {
          $track_id = (int)$_REQUEST['data'][track_id];
		  if(!is_int($track_id)){
		  	echo "error";
			  die();
		  };
        $track=Track::find()->where(['id'=>$_REQUEST['data'][track_id]])->one();
        
        if($track!=null)
          {
            //סטטוס של מסלול שהושלם
           $track->status=4;
		   if($track->save(false)){
		   	echo "ok";
		   	die();
		   }
		   
		   
		   
          }
        else{ echo "error";}die();
     }
	  
      //פונקציה ששולחת את המסלולים והתחנות שעכשיו בטיפול
      public function actionTracknow()
      {
            $today=date("Y-m-d");
             $datee =date('Y-m-d');
     	   	 $cancel_date = date($datee, strtotime("+1 days")); 
       		  $cancel_date= date('Y-m-d', strtotime("tomorrow")); 
              $track=Track::find()->where(['status'=>3])->andWhere(['between', 'track_date', $today, $cancel_date])->asArray()->all();
              $index=0;$arr=[];
              foreach ($track as $key => $value) {
              	
                  $arr[$index]=$value;
				  
                  $order=Order::find()->where(['track_id'=>$value[id]])->orderBy('stop_index')->asArray()->all();
				  $messenger = Messengers::find()->where(['id'=>$value[meesenger]])->asArray()->one();
				 $current_order = 0;
				  foreach ($order as $key => $value) {
					  if($value['status']==0){
					  	$current_order = $value; 
					  }
				  }
				  //$current_order = Order::find()->where(['track_id'=>$value[id]])->andWhere(['status'=>0])->asArray()->one();
				  file_put_contents('current.txt', $current_order);
				  $expenses = Expenses::find()->where(['track_id'=>$value[id]])->sum('expensess');
				  $arr[$index]['current_stop']=	$current_order;			
				  $arr[$index]['orders'] = $order;
				  $arr[$index]['messenger'] = $messenger;
				  $arr[$index]['expenses'] = number_format((float)$expenses, 2, '.', '');
				  $index ++;
				  //print_r(json_encode($arr));die();
                  /*
                  foreach ($order as $key => $value2) {
                                        $arr[$index][]=$value2;
                                    }*/
                  
              }
			  
              if($track!=null)
                {
                  //׳¡׳˜׳˜׳•׳¡ ׳©׳� ׳�׳¡׳�׳•׳� ׳©׳”׳•׳©׳�׳�
                 //$track->status=4;
                 print_r(json_encode($arr));
                }
              else{ echo "error";}
      die();
     }
     
    //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //end site function
  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        
     
  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 //admin functions
 //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 //מסלולים המבוצעים gfahu
  /*
  public function actionTracknow(){
    $tody=date('Y-m-d');
    $tomorrow = date('Y-m-d', strtotime("tomorrow"));
    $todaynow= date('Y-m-d H:i');
    $track=Track::find()->where(['between', 'track_date', $tody, $tomorrow ])->andWhere(['>', 'track_date', $todaynow ])->joinWith('expenses')->asArray()->all();
    $data=json_encode($track);
    print_r($data);die();    
  
    }*/
  
 
 
     //מסלולים לשליח
       public function actionTrackmessenger(){
        $messeger=1;
        $track=Track::find()->select('expenses.expensess,track.*')->where(['meesenger'=>$messeger])->andWhere(['between', 'track_date', "2016-12-11", "2016-12-13" ])->joinWith('expenses')->asArray()->all();
        $arr=[];
        $index=0;
          foreach ($track as   $value) {
            $arr[]=array();
            $arr[$index][0]=$value;
            $station=Order::find()->where(['track_id'=>$value[id]])->orderBy('stop_index')->asArray()->all();
            $arr[$index][1]=$station;
            $index++;
            
        }
          print_r($arr);die();
          $data=json_encode($arr);
          print_r($data);die();
          print_r($arr);die();
    }
       
      
         //רשימת מסלולים
         public function actionGetallroute(){
         	
			$all_tracks=Track::find()->asArray()->all();
			$tracks=[];
			$index=0;
			foreach ($all_tracks as $value) {
				$tracks[$index]['workers'] = Worker::find()->where(['combined_line'=>$value['combined_line']])->asArray()->all();
				$i=0;
				foreach ($tracks[$index]['workers'] as $worker) {
					$tracks[$index]['workers'][$i]['addresses'] = Address::find()->where(['worker_id'=>$tracks[$index]['workers'][$i]['id']])->asArray()->all();
					$i++;
				}
				$tracks[$index]['combined_line']=$value['combined_line'];
				$tracks[$index]['track']=$value;
				$drivers=Messengers::find()->where(['track_id'=>$value['id']])->asArray()->all();
				foreach ($drivers as $driver) {
					$tracks[$index]['driver']=$driver;
				}
				$index++;
			}
			print_r(json_encode($tracks));die();
			
         }
		 
		 
		  // protected function performAjaxValidation($model)
        // {
                // if(isset($_POST['ajax']) && $_POST['ajax']==='issue-form')
                // {
                        // echo CActiveForm::validate($model);
                        // Yii::app()->end();
                // }
        // }
        
        public function actionChangetrackorder()
        {
        	$data = json_decode(file_get_contents("php://input"));
			$track_id = $data->track_id;
			$workers = $data->workers;
			foreach ($workers as $worker) {
				$connection = Track_for_worker::findOne(['track_id'=>$track_id,'worker_id'=>$worker->id]);
				$connection->track_order = $worker->track_order;
				$connection->save(false);
			}
			print_r(json_encode(["changed"]));die();
			//die('changed');
		}
        
	 	public function actionSaveordersfromxls()
	 	{
		 	ini_set('max_execution_time', 0); 
			$data = json_decode(file_get_contents("php://input"));
			$radio_day = $data->radio_day;
			$active_lines = Staticlines::find()->where(['is_active'=>1])->all();
			$filter = array_map(function($line){return $line->line_number;}, $active_lines); 
			$sheet = $data->data;
			$length = count($sheet);
			$index;
			$i;
			$j = 1;
			$date = strtotime($sheet[0]->ShiftDate);
			$curr_date = date('Y-m-d',$date);
            
            //מחיקת קווים ישנים אם קיימים
			$old_tracks = Track::find()->where(['track_date'=>$curr_date])->all();
			if($old_tracks){
				HospitalTrack::deleteAll(['date'=>$curr_date]);
				foreach ($old_tracks as $old_track) {
					Track_for_worker::deleteAll(['track_id'=>$old_track->id]);
					$old_track->delete();
				}
			}
			$tommotow = date('Y-m-d',strtotime(' +1 days',$date));
			$morning_shift = 2; // id of morning shift	
			//מעבר על כל הרשומות באקסל		
			for($index = 0;$index<$length;$index++){
				try{
				    //מעבר על השורות של פרטי המסלולים
					if(!isset($sheet[$index]->SSN)){
    					if(isset($track)&&$track&&isset($track->id)&&$track->id>0){
    						$all_workers = Track_for_worker::find()->where("track_id = ".$track->id)->all();
    						if(!$all_workers){
    							$track->delete();
    						}
    					}
    					$i = 1;
    					$track = new Track();
    					$details = explode(':', $sheet[$index]->ShemSidur);						
    					if(!isset($details[1])||$details[1]=="")
    						$track->region = "";
    					else
    						$track->region = preg_replace("/[0-9]+/", "", $details[0]);
    					$combined_line = filter_var($details[0], FILTER_SANITIZE_NUMBER_INT);
    					$track->line_number = $combined_line;
    					$track->combined_line = $combined_line;
    					if($radio_day=="shabat"||($radio_day=="all_week"&&in_array($combined_line, $filter))){
    						$shift_name = $sheet[$index]->ShiftName;
    						$track->shift = $shift_name;
    						$shift_details = Shift::findOne(['name'=>$shift_name]);
    						$track->shift_id = $shift_details->id;
    						$static_line = Staticlines::findOne(['line_number'=>$combined_line]);
    						if($static_line){
    							$track->meesenger = $static_line->driver_id;
    							$track->description = $static_line->description;
    						}
    						$track->track_date = $curr_date;
    						if(!$static_line){
    							$track->description = $details[1];
    						}
    						$j++;
    						
    						$track->save(false);						
    					}
    
    					$index++;
    				}
    				//אם הגיע לסוף האקסל
    				if(!isset($sheet[$index]->SSN)){
    					die('loaded1');
    				}
                    
                    //אם הקו קיים במערך הקווים או שהאקסל של שבת
    				if($radio_day=="shabat"||($radio_day=="all_week"&&in_array($combined_line, $filter))){
    					//שליפת העובד הנוכחי
    					$worker = Worker::findOne($sheet[$index]->SSN);
    					if(!$worker){
    						$worker = new Worker();
    						$worker->id = $sheet[$index]->SSN;
    					}
                        // אם השדה כתובת מאותחלת מאתחל את הכובת והעיר
    					if(isset($sheet[$index]->Address1)){
    						$address_string = ltrim($sheet[$index]->Address1).', '.ltrim($sheet[$index]->City);
    					}
                        //אחרת מאתחל את העיר
    					else{
    						$address_string = ltrim($sheet[$index]->City);
    					}	
    					
    					$escort = FALSE;
    					if(isset($sheet[$index]->Address1)&&strstr($sheet[$index]->Address1, 'ללא ליווי')===FALSE){
    						$escort = true;
    					}
    					else{
    						$address_string = str_replace('(ללא ליווי)', '', $address_string);
    						$address_string = str_replace('(ללא מלווה)', '', $address_string);
    						$escort = false;
    					}
    					$address_string = str_replace('(ללא ליווי)', '', $address_string);
    					$address_string = str_replace('(ללא מלווה)', '', $address_string);
    					$last_address=Address::find()->where(['worker_id'=>$worker->id])->one();
    					$all_addresses = Address::find()->where(['worker_id'=>$worker->id])->all();
    					foreach ($all_addresses as $curr_address) {
    						if(strstr($curr_address->original_address, $address_string)){
    							$curr_address->is_current = 1;
    						}
    						else{
    							$curr_address->is_current = null;
    						}
    						$curr_address->save(false);
    					}
    					$track_address = Address::findOne(['worker_id'=>$worker->id,'original_address'=>$address_string]);
    					if(!$last_address || !$track_address){
    					   $address = new Address();
    						if(!Address::findOne(['worker_id'=>$worker->id,'primary_address'=>1])){
    							$address->primary_address = 1;
    							$address->is_current = 1;
    							$worker->combined_line = $combined_line;					
    							$worker->save(false);
    						}
        					$address->original_address = $address_string;
        					if(strchr($address_string, ",")){
        						$address->city = explode(",", $address_string)[1];
        					}
                            $address->combined_line = $combined_line;
        					$address->escort = $escort;
        					$address->worker_id = $worker->id;
        					$address->save(false);
    					}
    					if($track_address&&!$track_address->combined_line){
    						$track_address->combined_line = $combined_line;
    						$track_address->save(false);
    					}
    					if($track_address&&(($track_address->primary_address==1&&$worker->sub_line&&$worker->sub_line>=0)||($track_address->sub_line&&$track_address->sub_line!=""))){
    						$search_line = ($track_address->primary_address==1&&$worker->sub_line&&$worker->sub_line>=0)?$worker->sub_line:$track_address->sub_line;
    						$sub_line = Staticlines::findOne(['line_number'=>$search_line]);
    						
    						$sub_track = Track::findOne(['track_date'=>$curr_date,'shift_id'=>Shift::findOne(['name'=>$shift_name])->id,'combined_line'=>$search_line]);
    						if(!$sub_track){
    							$sub_track = new Track();
    							$sub_track->meesenger = $sub_line->driver_id;
    							$sub_track->line_number = $combined_line;
    							$sub_track->combined_line = $search_line;
    							if(!$track_address->combined_line){
    								$track_address->combined_line = $combined_line;
    								$track_address->save(false);
    							}
    							$sub_track->description = $sub_line->description;
    							$sub_track->shift = $shift_name;
    							$sub_track->shift_id = Shift::findOne(['name'=>$shift_name])->id;
    							$sub_track->track_date = $curr_date;
    							$sub_track->save(FALSE);
    						}
    						$connection = new Track_for_worker();
    						$connection->track_id = $sub_track->id;
    						$connection->worker_id = $worker->id;
    						$connection->address = $address_string;
    						$all_connections = Track_for_worker::find()->where(['track_id'=>$sub_track->id])->all();
    						if($all_connections){
    							$last_track_order = count($all_connections);
    						}
    						else{
    							$last_track_order = 0;
    						}
    						$connection->track_order = $last_track_order + 1;
    						$connection->hour = Shift::findOne(['name'=>$shift_name])->hour;
    						$connection->duration = 0;
    						$connection->save(FALSE);
    					}
    					else{
    						//save track for worker
    						$track_for_worker = new Track_for_worker();
    						$track_for_worker->track_id = $track->id;
    						$track_for_worker->worker_id = $worker->id;
    						$track_for_worker->address = $address_string;
    						$track_for_worker->duration = 0;
    						$track_for_worker->track_order = $i;
    						
    						//set hour according to shift
    						date_default_timezone_set("Asia/Jerusalem");
    						$track_for_worker->hour = $shift_details->hour;
    						$track_for_worker->save(false);
    						$i++;							
    					}
    					
    					//save hospital details
    					$hospital_track = new HospitalTrack();
    					$hospital_track->combined_line = $track->line_number;
    					$hospital_track->region = $track->region;
    					$hospital_track->description = $track->description;
    					$hospital_track->shift = $track->shift;
    					$hospital_track->shift_id = Shift::findOne(['name'=>$track->shift])->id;
    					$hospital_track->date = $curr_date;
    					
    					$hospital_track->worker_id = $worker->id;
    					//$hospital_track->track_id = $track->id;					
    
    					
    					if(isset($sheet[$index]->Telephone)){
    						$worker->department = $sheet[$index]->Telephone;
    						$hospital_track->department = $worker->department;	
    					}
    					if(isset($sheet[$index]->CompanyName)){
    						$name = explode(',',$sheet[$index]->CompanyName);
    						$worker->name = ltrim($name[0]).$name[1];
    						$hospital_track->worker_name = $worker->name;
    					}
    					if(isset($sheet[$index]->Watts)){
    						$worker->phone = $sheet[$index]->Watts;
    						$hospital_track->phone = $worker->phone;
    					}
    					
    					
    					$worker->save(false);
    					
    					$hospital_track->address = $address_string;
    					$hospital_track->save(false);
    				}
    			}	
    			catch (ErrorException $e){
    				$index = $index+2;
    				print_r(json_encode(["line".$index]));
    				die();
    			}
    			
    			}
    			$all_tracks_in_date = Track::find()->where(['track_date'=>$curr_date])->all();
    			foreach ($all_tracks_in_date as $track_in_date) {
    				$connections = Track_for_worker::findOne(['track_id'=>$track_in_date->id]);
    				if(!$connections){
    					Track::deleteAll(['id'=>$track_in_date->id]);
    				}
    			}
    			die('loaded');
            
       }

		 public function actionUpdateordersfromxls1(){
		 	ini_set('max_execution_time', 0); 
            $data = json_decode(file_get_contents("php://input"));
			$sheet=$data->data;
			$length=count($sheet);
			$index;
			$errors_in_delete=[];
			
			//loop for delete old workers from all tracks in this sheet
			for($index=0;$index<$length;$index++){
				if(!isset($sheet[$index]->SSN)){
					
					//get the details of current line
					$details=explode(':', $sheet[$index]->ShemSidur);
					$combined_line=filter_var($details[0], FILTER_SANITIZE_NUMBER_INT);
					$shift_name=$sheet[$index]->ShiftName;
					$date=strtotime($sheet[$index]->ShiftDate);
					$shift_date=date('Y-m-d',$date);
					
					//delete old workers from this line
					$track=Track::findOne(['combined_line'=>$combined_line,'shift'=>$shift_name,'track_date'=>$shift_date]);
					
					if($track){
						Track_for_worker::deleteAll(['track_id'=>$track->id]);	
					}
					
					// if($tracks_for_worker){
						// foreach ($tracks_for_worker as $track_for_worker) {
							// // if(!$track_for_worker->delete()){
								// // array_push($errors_in_delete,$track_for_worker);
							// // }
							// $track_for_worker->delete();
						// }						
					// }

					// Track_for_worker::deleteAll(['line'=>$combined_line,'shift_name'=>$shift_name,'shift_date'=>$shift_date]);
					
					//if this track not exists, we add it here
					// $track=Track::find()->where(['combined_line'=>$combined_line,'shift'=>$shift_name,'track_date'=>$shift_date])->one();
					if(!$track){
						$track=new Track();
						$track->combined_line=$combined_line;
						$track->region=preg_replace("/[0-9]+/", "", $details[0]);
						$track->shift=$sheet[$index]->ShiftName;
						$track->shift_id = Shift::findOne(['name'=>$sheet[$index]->ShiftName])->id;
						$date=strtotime($sheet[$index]->ShiftDate);
						$track->track_date=date('Y-m-d',$date);
						$track->description=$details[1];
						$track->save(false);
					}
					
					$index++;
				}

				//delete all track from current worker with this shift and date
				// Track_for_worker::deleteAll(['worker_id'=>$sheet[$index]->SSN,'shift_name'=>$shift_name,'shift_date'=>$shift_date]);
			}

			//loop for connect new workers to tracks in this sheet
			for($index=0;$index<$length;$index++){
			    
				if(!isset($sheet[$index]->SSN)){
					//get the details of current line
					$details=explode(':', $sheet[$index]->ShemSidur);
					$combined_line=filter_var($details[0], FILTER_SANITIZE_NUMBER_INT);
					$shift_name=$sheet[$index]->ShiftName;
					$date=strtotime($sheet[$index]->ShiftDate);
					$shift_date=date('Y-m-d',$date);
					$track = Track::findOne(['track_date'=>$shift_date,'combined_line'=>$combined_line,'shift'=>$shift_name]);
					$index++;
				}
				
					//create a new worker if current worker does'nt exists
					$worker=Worker::findOne($sheet[$index]->SSN);
					if(!$worker){
						$worker=new Worker();
						$worker->id=$sheet[$index]->SSN;
					}
					if(isset($sheet[$index]->Telephone)){
						$worker->department=$sheet[$index]->Telephone;	
					}
					if(isset($sheet[$index]->CompanyName)){
						$name=explode(',',$sheet[$index]->CompanyName);
						$worker->name=ltrim($name[0]).$name[1];
					}
					if(isset($sheet[$index]->Watts)){
						$worker->phone=$sheet[$index]->Watts;	
					}
					$worker->combined_line=$combined_line;
					
					//address for current worker
					if(isset($sheet[$index]->Address1)){
						$address_string=$sheet[$index]->Address1.' '.$sheet[$index]->City;
					}
					else{
						$address_string=$sheet[$index]->City;	
					}
					
					$escort=FALSE;
					if(isset($sheet[$index]->Address1)&&strstr($sheet[$index]->Address1, 'ללא ליווי')===FALSE){
						$escort=true;
					}
					else{
						str_replace('(ללא ליווי)', '', $address_string);
					}
					// $position=strrpos($sheet[$index]->Address1, '/');
					// if($position){
						// $replace=substr($sheet[$index]->Address1, $position);
						// $address_string=str_replace($replace, '',$address_string);
						// $address_string=str_replace('/', '',$address_string);
					// }
					// $google_result=json_decode(file_get_contents('https://maps.googleapis.com/maps/api/geocode/json?address='.urlencode($address_string).'&language=iw&key=AIzaSyDQpBq1mbjdOdsuUeTPFLX9Z3llJ4Iuuqs'),true);
					
					//if current worker had been saved in this sheet we don't save his address twice
					$last_address=Address::find()->where(['worker_id'=>$worker->id])->one();
					if(!$last_address){
					$address=new Address();
					$address->primary_address=1;
					// $address->original_address=$google_result['results'][0]['formatted_address'];
					// $address->lat=$google_result['results'][0]['geometry']['location']['lat'];
					// $address->lng=$google_result['results'][0]['geometry']['location']['lng'];
					$address->original_address = $address_string;
					$address->escort=$escort;
					$address->worker_id=$worker->id;
					$address->save(false);
					}
		
					if(!$worker->save(false)){
						array_push($errors_in_delete,$worker);
					}
					
					//save a new connection between the track and the worker
					$tracks_for_worker=new Track_for_worker();
					// $tracks_for_worker->line=$combined_line;
					// $tracks_for_worker->shift_name=$shift_name;
					// $tracks_for_worker->shift_date=$shift_date;
					$tracks_for_worker->track_id=$track->id;
					$tracks_for_worker->worker_id=$sheet[$index]->SSN;
					if(!$tracks_for_worker->save(false)){
						array_push($errors_in_delete,$tracks_for_worker);
					}
					
			}
			Track::deleteAll(['description'=>null]);
			Worker::deleteAll(['combined_line'=>null]);
			if($errors_in_delete){
				print_r(json_encode($errors_in_delete));
			}
			die('updated');
		}

		// compare two xlsx files
		
		public function add_worker_to_track($worker_value,$options,$index)
		{
			ini_set('memory_limit', '-1');
			$options = explode('|', $options);
			$combined_line = $options[0];
			$region = $options[1];
			$description = $options[2];
			$shift_name = $options[3];
			$curr_date = $options[4];
			$workers_arr = explode('|', $worker_value);
			$worker = Worker::findOne($workers_arr[8]);
			if(!$worker){
				$worker = new Worker();
				$worker->id = $workers_arr[8];
			}
			$subline = $worker->sub_line?$worker->sub_line:$combined_line;
			$original_address = str_replace("'","''",$workers_arr[7]);
			$address_model = Address::find()->where("worker_id = ".$workers_arr[8]." and original_address  = '".$original_address."'")->one();
		    $line_search = $combined_line;
			/*if($address_model&&$address_model->sub_line){
				$subline = $address_model->sub_line;
				$line_search = $subline;
			}
			if($address_model&&$address_model->combined_line){
				$combined_line = $address_model->combined_line;
			}*/
			
			$address_string = $workers_arr[7];
			$address_string = str_replace('(ללא ליווי)', '', $address_string);
			$address_string = str_replace('(ללא מלווה)', '', $address_string);
			$track_address = Address::findOne(['worker_id'=>$worker->id,'original_address'=>$address_string]);
			
			if($track_address&&(($track_address->primary_address==1&&$worker->sub_line&&$worker->sub_line>=0)||($track_address->sub_line&&$track_address->sub_line!=""))){
				$line_search = ($track_address->primary_address==1&&$worker->sub_line&&$worker->sub_line>=0)?$worker->sub_line:$track_address->sub_line;
			}
			/*if($worker->id==208413146){
				echo $line_search;
				print_r($track_address);die();
			}*/		
			$track = Track::findOne(['track_date'=>$curr_date,'shift_id'=>Shift::findOne(['name'=>$shift_name])->id,'combined_line'=>$line_search,'description'=>$description,'region'=>$region]);
			$shift_details = Shift::findOne(['name'=>$shift_name]);
			if(!$track){
				$track = new Track();
				$track->region = $region;
				$track->line_number = $combined_line;
				$track->combined_line = $line_search;
				$track->shift = $shift_name;
				$track->shift_id = $shift_details->id;
				$static_line = Staticlines::findOne(['line_number'=>$combined_line]);
				if($static_line){
					$track->meesenger = $static_line->driver_id;
				}
                $system_line = Staticlines::findOne(['line_number'=>$line_search]);
                if($system_line){
                    $track->description = $system_line->description;
                }
				$track->track_date = $curr_date;
				
				$track->save(false);						
			}
			
			$hospital_track = new HospitalTrack();
			$hospital_track->combined_line = $track->line_number;
			$hospital_track->region = $track->region;
			$hospital_track->description = $track->description;
			$hospital_track->shift = $track->shift;
			$hospital_track->shift_id = Shift::findOne(['name'=>$track->shift])->id;
			$hospital_track->date = $curr_date;
			
			
			$hospital_track->worker_id = $worker->id;					
			$address_string = $workers_arr[7];
			
			if(isset($workers_arr[6])){
				$worker->department = $workers_arr[6];
				$hospital_track->department = $worker->department;	
			}
			if(isset($workers_arr[9])){
				//$name = explode(',',$sheet[$index]->CompanyName);
				$worker->name = $workers_arr[9];
				$hospital_track->worker_name = $worker->name;
			}
			if(isset($workers_arr[5])){
				$worker->phone = $workers_arr[5];
				$hospital_track->phone = $worker->phone;
			}
			
//			$worker->combined_line = $combined_line;
			
			$worker->save(false);
			
			$hospital_track->address = $address_string;
			$hospital_track->save(false);
			$escort = FALSE;
			if(isset($workers_arr[7])&&strstr($workers_arr[7], 'ללא ליווי')===FALSE){
				$escort = true;
			}
			else{
				$address_string = str_replace('(ללא ליווי)', '', $address_string);
				$address_string = str_replace('(ללא מלווה)', '', $address_string);
				$escort = false;
			}
			$address_string = str_replace('(ללא ליווי)', '', $address_string);
			$address_string = str_replace('(ללא מלווה)', '', $address_string);
			$last_address=Address::find()->where(['worker_id'=>$worker->id])->one();
			$all_addresses = Address::find()->where(['worker_id'=>$worker->id])->all();
			foreach ($all_addresses as $curr_address) {
				if($curr_address->original_address && $address_string && strstr($curr_address->original_address, $address_string)){
					$curr_address->is_current = 1;
				}
				else{
					$curr_address->is_current = null;
				}
				$curr_address->save(false);
			}
			//$track_address = Address::findOne(['worker_id'=>$worker->id,'original_address'=>$address_string]);
			if(!$last_address || !$track_address){
			$address = new Address();
				if(!Address::findOne(['worker_id'=>$worker->id,'primary_address'=>1])){
					$address->primary_address = 1;
					$address->is_current = 1;
					$worker->combined_line = $combined_line;
					$worker->save(false);
				}
			$address->original_address = $address_string;
			if(strchr($address_string, ",")){
				$address->city = explode(",", $address_string)[1];
			}
			$address->escort = $escort;
			$address->worker_id = $worker->id;
			$address->save(false);
			}			
			$track_address = Address::findOne(['worker_id'=>$worker->id,'original_address'=>$address_string]);
			if($track_address&&!$track_address->combined_line){
				$track_address->combined_line = $combined_line;
				$track_address->save(false);
			}
			/*if($worker->sub_line){
				$sub_line = Staticlines::findOne(['line_number'=>$worker->sub_line]);
				$sub_track = Track::findOne(['track_date'=>$curr_date,'shift_id'=>Shift::findOne(['name'=>$shift_name])->id,'combined_line'=>$worker->sub_line]);
				if(!$sub_track){
					$sub_track = new Track();
					$sub_track->meesenger = $sub_line->driver_id;
					$sub_track->line_number = $combined_line;
					$sub_track->combined_line = $sub_line->line_number;
					$sub_track->description = $sub_line->description;
					$sub_track->shift = $shift_name;
					$sub_track->shift_id = Shift::findOne(['name'=>$shift_name])->id;
					$sub_track->track_date = $curr_date;
					$sub_track->save(FALSE);
				}
				$connection = new Track_for_worker();
				$connection->track_id = $sub_track->id;
				$connection->worker_id = $worker->id;
				$connection->address = $address_string;
				$all_connections = Track_for_worker::find()->where(['track_id'=>$sub_track->id])->all();
				if($all_connections){
					$last_track_order = count($all_connections);
				}
				else{
					$last_track_order = 0;
				}
				$connection->track_order = $last_track_order + 1;
				$connection->hour = Shift::findOne(['name'=>$shift_name])->hour;
				$connection->duration = 0;
				$connection->updated = 1;
				$connection->save(FALSE);
			}*/
			//else{
				//save track for worker
				$track_for_worker = new Track_for_worker();
				$track_for_worker->track_id = $track->id;
				$track_for_worker->worker_id = $worker->id;
				$track_for_worker->address = $address_string;
				$track_for_worker->duration = 0;
				$track_for_worker->track_order = $index;
				
				//set hour according to shift
				date_default_timezone_set("Asia/Jerusalem");
				$track_for_worker->hour = $shift_details->hour;
				$track_for_worker->updated = 1;
				$track_for_worker->save(false);						
			//}
		}

		public function delete_worker_from_track($hos_is,$options)
		{
			$options = explode('|', $options);
			$combined_line = $options[0];
			$region = $options[1];
			$description = $options[2];
			$shift_name = $options[3];
			$curr_date = $options[4];
			
			$hospital_track = HospitalTrack::findOne($hos_is);
			$worker_id = $hospital_track->worker_id;
            
			$hospital_track->delete();
			$worker = Worker::findOne($worker_id);

			
			/*
			if($worker->sub_line){
							$combined_line = $worker->sub_line;
						}*/
			
			
			//$track = Track::findOne(['track_date'=>$curr_date,'shift_id'=>Shift::findOne(['name'=>$shift_name])->id,'combined_line'=>$combined_line,'description'=>$description,'region'=>$region]);
			if($worker_id == '305493025'||$worker_id == 305493025){
                print_r(json_encode(['$hospital_track'=>(array)$hospital_track,'$worker'=>(array)$worker,'$track'=>(array)$track,'$combined_line'=>$combined_line,'$shift_name'=>$shift_name,'$curr_date'=>$curr_date]));die();
            }
			$track = Track::findOne(['track_date'=>$curr_date,'shift_id'=>Shift::findOne(['name'=>$shift_name])->id,'combined_line'=>$worker->sub_line?$worker->sub_line:$combined_line]);
			if($track){
			    
				$track_for_worker = Track_for_worker::findOne(['track_id'=>$track->id,'worker_id'=>$worker_id]);
				if($track_for_worker){
					$track_for_worker->delete();
				}else{
				   $track = Track::findOne(['track_date'=>$curr_date,'shift_id'=>Shift::findOne(['name'=>$shift_name])->id,'combined_line'=>$combined_line]);
                   if($track){
                        $track_for_worker = Track_for_worker::findOne(['track_id'=>$track->id,'worker_id'=>$worker_id]);
                        if($track_for_worker){
                            $track_for_worker->delete();
                        } 
                   } 
				}
				$all_worker = Track_for_worker::find()->where(['track_id'=>$track->id])->all();
				if(!$all_worker){
					$track->delete();
				}
			}
		}
        public function find_track_details($row,$curr_date)
        {
           $shift_name = $row ->ShiftName;
           $track_details=explode(':', $row->ShemSidur);
           if(!isset($track_details[1])||$track_details[1]==""){
                $region = "";
           }
           else{
                $region = preg_replace("/[0-9]+/", "", $track_details[0]);
           }
           $messenger = null;
           $line = filter_var($track_details[0], FILTER_SANITIZE_NUMBER_INT);
           $static_line = Staticlines::findOne(['line_number'=>$line]);
            if($static_line){
                $messenger = $static_line->driver_id;
                $description = $static_line->description;
            }
            if(!$static_line){
                $description = $track_details[1];
            }
            //test
            //$track11 = Track::findOne(['track_date'=>$curr_date,'shift_id'=>Shift::findOne(['name'=>$shift_name])->id,'line_number'=>$line,'description'=>$description,'region'=>$region]);
           //$description = isset($track_details[1])?$track_details[1]:$track_details[0];
           $track = Track::findOne(['track_date'=>$curr_date,'shift_id'=>Shift::findOne(['name'=>$shift_name])->id,'line_number'=>$line,'description'=>$description,'region'=>$region]);
           
           if(!$track){
               $track = new Track();
               $track -> track_date = $curr_date;
               $track -> shift_id = Shift::findOne(['name'=>$shift_name])->id;
               $track -> shift = $shift_name;
               $track -> line_number = $line;
               $track -> combined_line = $line;
               $track -> description = $description;
               $track -> region = $region;
               $track -> meesenger = $messenger;
               $track -> save();               
           }
           //return (object)['track'=>$track,'$track11'=>$track11?$track11->attributes:null];

           return $track;
		}
public function find_worker_to_track($row,$track,$i,$index)
        {
            try{
                $hospital_track_deleted = [];
                $worker_id =$row->SSN;
                $added_worker = false;
                $sub_track =null;
                //טיפול בכתובת
                // אם השדה כתובת מאותחלת מאתחל את הכובת והעיר
                if(isset($row->Address1)){
                    $address_string = ltrim($row->Address1).', '.ltrim($row->City);
               }
               //אחרת מאתחל את העיר
               else{
                    $address_string = ltrim($row->City);
               }       
                $escort = FALSE;
                if(isset($row->Address1)&&strstr($row->Address1, 'ללא ליווי')===FALSE){
                    $escort = true;
                }
                $address_string = str_replace('(ללא ליווי)', '', $address_string);
                $address_string = str_replace('(ללא מלווה)', '', $address_string);
                //test
                //$hospital_track11 = HospitalTrack::find()->where(['worker_id'=>$worker->id,'combined_line'=>$track->line_number,'region'=>$track->region,'description'=>$track->description,'shift'=>$track->shift,'date'=>$track->track_date])->one();
                 
                $track_for_worker = Track_for_worker::find()->where(['worker_id' =>$worker_id,'address' =>$address_string])->andWhere('track_id in (select id from track where shift="'.$track->shift.'" and track_date="'.$track->track_date.'")')->one();
                 //$hospital_track = HospitalTrack::find()->where(['address'=>$address_string,'worker_id'=>$worker_id,'combined_line'=>$track->line_number,'region'=>$track->region,'description'=>$track->description,'shift'=>$track->shift,'date'=>$track->track_date])->one();
                
                if(!$track_for_worker)
                {
                    
                    //???למחוק את כל נתוני המשמרת הזו
                    $hospital_track_deleted = HospitalTrack::find()->where(['worker_id'=>$worker_id,'shift'=>$track->shift,'date'=>$track->track_date])->asArray()->all();
                    HospitalTrack::deleteAll(['worker_id'=>$worker_id,'shift'=>$track->shift,'date'=>$track->track_date]);
                    
                    Track_for_worker::deleteAll('worker_id ='.$worker_id.' and track_id in (select id from track where shift="'.$track->shift.'" and track_date="'.$track->track_date.'")');
                    
                    
                    //test
                    //$worker11 = Worker::findOne($row->SSN);
                    //שליפת העובד הנוכחי
                    $worker = Worker::findOne($row->SSN);
                    if(!$worker){
                        $worker = new Worker();
                        $worker->id = $row->SSN;
                        $worker->combined_line = $track->line_number;
                    }
                    $worker->department = isset($row->Telephone)?$row->Telephone:null;
                    if(isset($row->CompanyName))
                        $name = explode(',',$row->CompanyName);
                    $worker->name = ltrim($name[0]).$name[1];
                    $worker->phone = isset($row->Watts)?$row->Watts:null;
                    $worker->save(false);
                    
                    $added_worker = true;
                    //save hospital details
                    $hospital_track = new HospitalTrack();
                    $hospital_track->combined_line = $track->line_number;
                    $hospital_track->region = $track->region;
                    $hospital_track->description = $track->description;
                    $hospital_track->shift = $track->shift;
                    $hospital_track->shift_id = $track->shift_id;
                    $hospital_track->date = $track->track_date;
                    $hospital_track->worker_id = $worker->id;
                    $hospital_track->address = $address_string;
                    $hospital_track->department = $worker->department;  
                    $hospital_track->worker_name = $worker->name;
                    $hospital_track->phone = $worker->phone;
                    $hospital_track->save(false);
                    
                    
                    
                   
        
                    $last_address=Address::find()->where(['worker_id'=>$worker->id])->one();
                    $addresses = Address::find()->where(['worker_id'=>$worker->id])->all();
                    foreach ($addresses as $address) {
                        if(strstr($address->original_address, $address_string)){
                            $address->is_current = 1;
                        }
                        else{
                            $address->is_current = null;
                        }
                        $address->save(false);
                    }
                    $track_address = Address::findOne(['worker_id'=>$worker->id,'original_address'=>$address_string]);
                    if(!$last_address || !$track_address){
                       $address = new Address();
                        if(!Address::findOne(['worker_id'=>$worker->id,'primary_address'=>1])){
                            $address->primary_address = 1;
                            $address->is_current = 1;
                        }
                        $address->original_address = $address_string;
                        if(strchr($address_string, ",")){
                            $address->city = explode(",", $address_string)[1];
                        }
                        $address->escort = $escort;
                        $address->worker_id = $worker->id;
                        $address->save(false);
                    }
                    if($track_address&&!$track_address->combined_line){
                        $track_address->combined_line = $track->combined_line;
                        $track_address->save(false);
                    }
                    
                                    
    
                    //test
                    //$track_for_worker11 = null;
                    if($track_address&&(($track_address->primary_address==1&&$worker->sub_line&&$worker->sub_line>=0)||($track_address->sub_line&&$track_address->sub_line!=""))){
                        $search_line = ($track_address->primary_address==1&&$worker->sub_line&&$worker->sub_line>=0)?$worker->sub_line:$track_address->sub_line;
                        $sub_line = Staticlines::findOne(['line_number'=>$search_line]); 
                        $sub_track = Track::findOne(['track_date'=>$track ->track_date,'shift_id'=>$track ->shift_id,'combined_line'=>$search_line]);
                        if(!$sub_track){
                            $sub_track = new Track();
                            $sub_track->meesenger = $sub_line->driver_id;
                            $sub_track->line_number = $track->line_number;
                            $sub_track->combined_line = $search_line;
                            if(!$track_address->combined_line){
                                $track_address->combined_line = $track->line_number;
                                $track_address->save(false);
                            }
                            $sub_track->description = $sub_line->description;
                            $sub_track->shift = $track ->shift;
                            $sub_track->shift_id = $track ->shift_id;
                            $sub_track->track_date = $track ->track_date;
                            $sub_track->save(FALSE);
                        }
                        //test
                        //$track_for_worker11 = Track_for_worker::find()->where(['track_id'=>$sub_track->id,'worker_id'=>$worker->id])->one();
                        
                        //$track_for_worker = Track_for_worker::find()->where(['track_id'=>$sub_track->id,'worker_id'=>$worker->id])->one();
                        //if(!$track_for_worker){
                        $track_for_worker = new Track_for_worker();
                        $track_for_worker->track_id = $sub_track->id;
                        $track_for_worker->worker_id = $worker->id;
                        
                        $all_connections = Track_for_worker::find()->where(['track_id'=>$sub_track->id])->all();
                        if($all_connections){
                            $last_track_order = count($all_connections);
                        }
                        else{
                            $last_track_order = 0;
                        }
                        $track_for_worker->track_order = $last_track_order + 1;
                        $track_for_worker->hour = Shift::findOne(['id'=>$track ->shift_id])->hour;
                        $track_for_worker->duration = 0;
                        $track_for_worker->updated = 1;
                        //}
                        $track_for_worker->address = $address_string;
                        $track_for_worker->save(FALSE);
                    }
                    else{
                        //test
                        //$track_for_worker11 = Track_for_worker::find()->where(['track_id'=>$track->id,'worker_id'=>$worker->id])->one();
                        
                        //$track_for_worker = Track_for_worker::find()->where(['track_id'=>$track->id,'worker_id'=>$worker->id])->one();
                        //if(!$track_for_worker){
                        //save track for worker
                        $track_for_worker = new Track_for_worker();
                        $track_for_worker->track_id = $track->id;
                        $track_for_worker->worker_id = $worker->id;
                        $track_for_worker->duration = 0;
                        $track_for_worker->track_order = $i;
                        //set hour according to shift
                        date_default_timezone_set("Asia/Jerusalem");
                        $track_for_worker->hour =  Shift::findOne(['id'=>$track ->shift_id])->hour;
                        $track_for_worker->updated = 1;
                        //}
                        $track_for_worker->address = $address_string; 
                        $track_for_worker->save(false);
                              
                    }
                    
                    //$t = Track_for_worker::find()->where('track_id in (select id from track where line_number='.$track->line_number.' and region ="'.$track->region.'" and description="'.$track->description.'" and shift="'.$track->shift.'" and track_date="'.$track->track_date.'")')
                    //->andWhere(['worker_id'=>$worker->id])->all();
                    
                }
            }   
            catch (ErrorException $e){
                $index = $index+2;
                print_r(json_encode(["line".$index]));
                die();
            }
            return (object)[
                 //'$sub_track'=>$sub_track?$sub_track->attributes:null,
                 //'track'=>(array)$track->attributes,
                 //'$worker'=>(array)$worker->attributes,
                 //'hospital_track'=>(array)$hospital_track->attributes,
                 '$track_for_worker'=>isset($track_for_worker)?$track_for_worker->attributes:null,
                 
                 //'hospital_track11'=>$hospital_track11?(array)$hospital_track11->attributes:null,
                 //'$worker11'=>$worker11?(array)$worker11->attributes:null,
                 
                 //'$track_for_worker11'=>$track_for_worker11?(array)$track_for_worker11->attributes:null
                 'added_worker'=>$added_worker?(object)['status'=>1,'details'=> $hospital_track -> attributes]:null,
                 //'hospital_track_id'=>$hospital_track->id,
                 'track_for_worker_track_id'=>$track_for_worker?$track_for_worker->track_id:null,
                 'sub_track_id'=>$sub_track?$sub_track->id:null,
                 'hospital_track_deleted'=>array_map(function($val){return (object)['status'=>0,'details'=> $val];}, $hospital_track_deleted)
             ];
            //return $hospital_track->id;
                    
        }
        public function actionUpdateordersfromxls()
        {
            ini_set('max_execution_time', 0);
            $data = json_decode(file_get_contents("php://input"));
            $radio_day = $data->radio_day;
            $sheet = $data->data;
            $active_lines = Staticlines::find()->where(['is_active'=>1])->all();
            $active_lines = array_map(function($line){return $line->line_number;}, $active_lines);
            $date = strtotime($sheet[0]->ShiftDate);
            $curr_date = date('Y-m-d',$date);
            $track_ids = [];
            $track_workers_ids = [];
            $workers_ids = [];
            $hospital_track_ids = [];
            $track_for_worker_ids = [];
            $test = [];
            $result = [];
            $index = 0;
            $track = null;
            foreach ($sheet as $row) {
                if(!isset($row->SSN)){
                    if($track){
                        $tracks_for_worker = Track_for_worker::find()->where('track_id ='.$track->id.' and worker_id not in ('.implode(',', $track_workers_ids).')')->all();
                        foreach ($tracks_for_worker as $key => $track_for_worker) {
                            //$tracks_for_worker = Track_for_worker::deleteAll(['track_id'=>$track -> id]);
                            $curr_track = Track::find()->where(['id'=>$track_for_worker->track_id])->one();
                            if($curr_track){
                                $hospital_tracks_deleted = HospitalTrack::find()->where(['shift'=>$track->shift,'date'=>$track->track_date,'worker_id'=>$track_for_worker->worker_id])->asArray()->all();
                                $hospital_tracks = HospitalTrack::deleteAll(['shift'=>$track->shift,'date'=>$track->track_date,'worker_id'=>$track_for_worker->worker_id]);
                                $hospital_tracks_deleted = array_map(function($val){return (object)['status'=>0,'details'=> $val];}, $hospital_tracks_deleted);
                                $result = array_merge($result,$hospital_tracks_deleted);
                            }
                            $track_for_worker->delete();
                        }
                    }  
                   $track_workers_ids = [];
                   $i =0;
                   $track = $this -> find_track_details($row,$curr_date);
                    if($track){
                       array_push($track_ids,$track ->id); 
                    }
                }
                else{
                   $workers_ids[] = $row->SSN;
                   $track_workers_ids[] = $row->SSN;
                    if($radio_day=="shabat"||($radio_day=="all_week"&&in_array($track -> line_number, $active_lines))){
                       $res = $this -> find_worker_to_track($row,$track,$i,$index);
                       array_push($test,$res);
                       $result = array_merge($result,$res -> hospital_track_deleted);
                       if($res ->added_worker)
                         array_push($result,$res ->added_worker);
                       if($res ->sub_track_id)
                         array_push($track_ids,$res ->sub_track_id);
                       if($res ->track_for_worker_track_id)
                         array_push($track_ids,$res ->track_for_worker_track_id);                       
                       $i++;
                    }
                }
                $index++;
               
            }

            $tracks_for_worker = Track_for_worker::find()->where('(track_id not in('.implode(',', $track_ids).') or worker_id not in ('.implode(',', $workers_ids).')) and track_id  in (select id from track where track_date="'.$curr_date.'")')->all();
            foreach ($tracks_for_worker as $key => $track_for_worker) {
                //$tracks_for_worker = Track_for_worker::deleteAll(['track_id'=>$track -> id]);
                $track = Track::find()->where(['id'=>$track_for_worker->track_id])->one();
                if($track){
                    $hospital_tracks_deleted = HospitalTrack::find()->where(['shift'=>$track->shift,'date'=>$track->track_date,'worker_id'=>$track_for_worker->worker_id])->asArray()->all();
                    $hospital_tracks = HospitalTrack::deleteAll(['shift'=>$track->shift,'date'=>$track->track_date,'worker_id'=>$track_for_worker->worker_id]);
                    $hospital_tracks_deleted = array_map(function($val){return (object)['status'=>0,'details'=> $val];}, $hospital_tracks_deleted);
                    $result = array_merge($result,$hospital_tracks_deleted);
                }
                $track_for_worker->delete();
            }
            print_r(json_encode($result));die();
        }
        
        
		public function actionUpdateordersfromxls2()
		{
			ini_set('max_execution_time', 0);
			$data = json_decode(file_get_contents("php://input"));
			$radio_day = $data->radio_day;
            //כל הקווים בסטטוס פעיל
			$active_lines = Staticlines::find()->where(['is_active'=>1])->all();
            //מספרי קווים 
			$filter = array_map(function($line){return $line->line_number;}, $active_lines);
			$sheet = $data->data;
			$date = strtotime($sheet[0]->ShiftDate);
			$curr_date = date('Y-m-d',$date);
			$shiftArray = Shift::find()->asArray()->all();
            //כל המשמרות ID,NANE
			$shiftArray = ArrayHelper::map($shiftArray, 'name', 'id');
			$workers = null;
			$differences = array();
			$index = 0;
			foreach ($sheet as $row) {
				//try{
				        
				    //תחילת קו
					if(!isset($row->SSN)){
					    //אם מערך העובדים מאותחל כבר...טיפול בעובדים, עובדים שאינם קיימים באקסל זה ימחקו עובדים שקיימים יעודכנו 
						if($workers!=null&&($radio_day=="shabat"||($radio_day=="all_week"&&in_array($combined_line, $filter)))){
							$options = $combined_line.'|'.$region.'|'.$description.'|'.$shift_name.'|'.$curr_date;
							$static_line = Staticlines::findOne(['line_number'=>$combined_line]);
							if($static_line){
								$description = $static_line->description;
							}
                            //שליפת כל מסלולי בית החולים לתאריך זה שתואמים את נתוני קו זה
							$hospital_tracks = HospitalTrack::find()->where(['combined_line'=>$combined_line,'region'=>$region,'description'=>$description,'shift'=>$shift_name,'date'=>$curr_date])->all();
							
							
							$workers_details = array_map(function($w){return $w->combined_line.'|'.$w->region.'|'.$w->description.'|'.$w->shift.'|'.$w->date.'|'.$w->phone.'|'.$w->department.'|'.$w->address.'|'.$w->worker_id.'|'.$w->worker_name;}, $hospital_tracks);
							//אם לא קיימים מסלולי בית חולים לקו זה
							if(!$hospital_tracks){
								$l = 1;
                                //הוספת העובדים של קו זה למסלול
								foreach ($workers as $w => $worker_value) {
									$this->add_worker_to_track($worker_value,$options,$l);
									$l++;
								}
							}
                            //אם  קיימים מסלולי בית חולים לקו זה
							if($hospital_tracks){

									
								foreach ($workers_details as $track) {
									$track_details = explode('|', $track);
                                    //האם קו בית חולים לא קיים במערך העובדים-כלומר יש עובד מסוים שלא קיים כבר - מוחקים אותו
									if(!in_array($track, $workers)){
										$diff = new \stdClass();
										$track_details = explode('|', $track);
										$hospital_track = new HospitalTrack();									
										$worker = Worker::findOne($track_details[8]);
										$original_address = str_replace("'","''",$track_details[7]);
										$address_model = Address::find()->where("worker_id = ".$track_details[8]." and original_address  = '".$original_address."'")->one();
										
										if($address_model&&$address_model->sub_line){
											$hospital_track->combined_line = $address_model->sub_line;
										}
										else{
											$hospital_track->combined_line = $track_details[0];
										}
										$hospital_track->region = $track_details[1];
										$hospital_track->description = $track_details[2];
										$hospital_track->shift = $track_details[3];
										$hospital_track->shift_id = $shiftArray[$hospital_track->shift];
										$hospital_track->date = $track_details[4];
										$hospital_track->phone = $track_details[5];
										$hospital_track->department = $track_details[6];
										$hospital_track->address = $track_details[7];
										$hospital_track->worker_id = $track_details[8];
										$hospital_track->worker_name = $track_details[9];
										$diff->details = $hospital_track;
										$diff->status = 0;
										$hospital_track_model = HospitalTrack::find()->where(['shift'=>$track_details[3],'date'=>$track_details[4],'worker_id'=>$track_details[8]])->one();
										
                                        $hos_id = $hospital_track_model?$hospital_track_model->id:0;
										$this->delete_worker_from_track($hos_id,$options);
										array_push($differences,$diff);
									}
								}
								$l = 1;
								foreach ($workers as $curr_worker) {
								     //האם העובד לא נמצא במסלולי בית החולים-מוסיפים אותו
									if(!in_array($curr_worker, $workers_details)){
										$this->add_worker_to_track($curr_worker,$options,$l);
									}
									$l++;
								}
							}
						}
                        //אתחול נתוני הקו הנוכחי
						unset($workers);
						$workers = array();
						$details=explode(':', $row->ShemSidur);
						if(!isset($details[1])||$details[1]==""){
							$region = "";
						}
						else{
							$region = preg_replace("/[0-9]+/", "", $details[0]);
						}
						$combined_line=filter_var($details[0], FILTER_SANITIZE_NUMBER_INT);
						$description = isset($details[1])?$details[1]:$details[0];
						$shift_name = $row->ShiftName;					
					}
                    //עבר על העובדים של הקו והכנסת הנתונים למערך עובדים
					else{
						$static_line = Staticlines::findOne(['line_number'=>$combined_line]);
						if($static_line){
							$description = $static_line->description;
						}
						$worker = $combined_line.'|'.$region.'|'.$description.'|'.$shift_name.'|'.$curr_date;
						$worker.= '|';
						if(isset($row->Watts)){
							$worker.= $row->Watts;
						}
						$worker.= '|';
						if(isset($row->Telephone)){
							$worker.= $row->Telephone;
						}
						$worker.= '|';
						if(isset($row->Address1)){
							$worker.= ltrim($row->Address1);
						}
						if(isset($row->City)){
							if(isset($row->Address1)){
								$worker.= ', ';
							}
							$worker.= ltrim($row->City);
						}
						$ccc = ltrim($row->City);
						$worker.= '|';
						if(isset($row->SSN)){
							$worker.= $row->SSN;
						}
						$worker.= '|';
						if(isset($row->CompanyName)){
							$name = explode(',', $row->CompanyName);
							$worker.= ltrim($name[0]).$name[1];
						}
						array_push($workers,$worker);
					}
					$index++;
							
			}

			// check last track
					if($workers!=null&&($radio_day=="shabat"||($radio_day=="all_week"&&in_array($combined_line, $filter)))){
						try{
							$options = $combined_line.'|'.$region.'|'.$description.'|'.$shift_name.'|'.$curr_date;
							$hospital_tracks = HospitalTrack::find()->where(['combined_line'=>$combined_line,'region'=>$region,'description'=>$description,'shift'=>$shift_name,'date'=>$curr_date])->all();
							$workers_details = array_map(function($w){return $w->combined_line.'|'.$w->region.'|'.$w->description.'|'.$w->shift.'|'.$w->date.'|'.$w->phone.'|'.$w->department.'|'.$w->address.'|'.$w->worker_id.'|'.$w->worker_name;}, $hospital_tracks);
							if(!$hospital_tracks){
								$l = 1;
								foreach ($workers as $w => $worker_value) {
									$this->add_worker_to_track($worker_value,$options,$l);
									$l++;				
								}
							}
							if($hospital_tracks){
								foreach ($workers_details as $track) {
									if(!in_array($track, $workers)){
										$diff = new \stdClass();
										$track_details = explode('|', $track);
										$hospital_track = new HospitalTrack();
										$worker = Worker::findOne($track_details[8]);
										$address_model = Address::find()->where("worker_id = ".$track_details[8]." and original_address  = '".$track_details[7]."'")->one();
										if($address_model&&$address_model->sub_line){
											$hospital_track->combined_line = $worker->sub_line;
										}
										else{
											$hospital_track->combined_line = $track_details[0];
										}
										$hospital_track->region = $track_details[1];
										$hospital_track->description = $track_details[2];
										$hospital_track->shift = $track_details[3];
										$hospital_track->shift_id = $shiftArray[$hospital_track->shift];
										$hospital_track->date = $track_details[4];
										$hospital_track->phone = $track_details[5];
										$hospital_track->department = $track_details[6];
										$hospital_track->address = $track_details[7];
										$hospital_track->worker_id = $track_details[8];
										$hospital_track->worker_name = $track_details[9];
										$diff->details = $hospital_track;									
										$diff->status = 0;
										$hospital_track_model = HospitalTrack::find()->where(['shift'=>$track_details[3],'date'=>$track_details[4],'worker_id'=>$track_details[8]])->one();
										$hos_id = $hospital_track_model?$hospital_track_model->id:0;
										$this->delete_worker_from_track($hos_id,$options);
										array_push($differences,$diff);
									}
								}
								$l = 1;
								foreach ($workers as $curr_worker) {
									if(!in_array($curr_worker, $workers_details)){
										$this->add_worker_to_track($curr_worker,$options,$l);

									}
									$l++;
								}
							}
						}
						catch (ErrorException $e){
							$index = $index+2;
							print_r(json_encode(["line".$index]));
							die();
						}
					}
			Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
			usort($differences, "sortTracks");
			return $differences;
		}
		 
		 //update track
		 public function actionUpdatetrack()
		 {
		 	// $data = json_decode(file_get_contents("php://input"));
			// $updated_track=$data->data;
			// $worker_id=$data->worker_id;
			// $start_hour=$data->start_hour;
// 
			// // $date=date('Y-m-d',strtotime($updated_track->track->track_date.' +1 day'));
// 			
			// $driver=Messengers::find()->where(['id'=>$updated_track->track->meesenger])->one();
			// if($driver){
			// $new_driver=new Messengers();
// 			
			// //copy old details of driver
			// $new_driver->type=$driver->type;
			// $new_driver->email=$driver->email;
			// $new_driver->authKey=$driver->authKey;
			// $new_driver->address=$driver->address;
			// $new_driver->car_number=$driver->car_number;
			// $new_driver->lat=$driver->lat;
			// $new_driver->lng=$driver->lng;
			// $new_driver->track_id=$driver->track_id; 
			// $new_driver->license_expired=$driver->license_expired;
// 			
			// //copy new details of driver
			// $new_driver->name=$updated_track->driver->name;
			// $new_driver->phone=$updated_track->driver->phone;
// 			
			// //delete old driver
			// $driver->delete();
// 			
			// //save new driver
			// $new_driver->save(false);
			// }
// 			
			// //save details of track
			// // $track=Track::find()->where(['id'=>$updated_track->track->id])->one();
			// $last_date=$track->track_date;
			// $track=Track::findOne($updated_track->track->id);
			// $track->combined_line=$updated_track->track->combined_line;
			// $track->meesenger=$new_driver->id;
			// $track->save(false);
			// die('yes');
			// // if(date_diff(date_create($last_date) ,date_create($date)) ==1)
				// // $date=date('Y-m-d',strtotime($date.' -1 day'));
			// $last_line=$track->combined_line;
// 			
			// //copy old details of track
			// $new_track=new Track();
			// $new_track->region=$track->region;
			// $new_track->line_number=$track->line_number;
			// $new_track->description=$track->description;
			// $new_track->shift=$track->shift;
// 			
			// //copy new details of track
			// // $new_track->track_date=$date;
			// $new_track->combined_line=$updated_track->track->combined_line;
			// if($driver)
				// $new_track->meesenger=$new_driver->id;
// 			
			// //delete old track
			// $track->delete();
// 			
			// //save track
			// $new_track->save(false);
// 			
			// //save details of track for worker
			// $tracks_for_worker=Track_for_worker::find()->where(['line'=>$last_line,'shift_date'=>$last_date,'shift_name'=>$track->shift])->all();
			// foreach ($tracks_for_worker as $track_for_worker) {
				// $new_connection=new Track_for_worker();
// 				
				// //copy old details of connection
				// $new_connection->shift_name=$track_for_worker->shift_name;
				// $new_connection->worker_id=$track_for_worker->worker_id;
				// $new_connection->track_order=$track_for_worker->track_order;
				// $new_connection->hour=$track_for_worker->hour;
				// $new_connection->duration=$track_for_worker->duration;
// 				
				// //copy new details of connection
				// $new_connection->line=$updated_track->track->combined_line;
				// // $new_connection->shift_date=$updated_track->track->track_date;
				// $new_connection->shift_date=$date;
// 				
				// //set start hour of track
				// if($new_connection->worker_id==$worker_id){
					// $new_connection->hour=date('H:i:s',strtotime($start_hour.' +3 hours'));
				// }
// 				
				// //delete old connection
				// $track_for_worker->delete();
// 				
				// //save connection
				// $new_connection->save(false);
			// }
// 			
		 	// die('updated');
		 	
			$data = json_decode(file_get_contents("php://input"));
			$updated_track=$data->data;
			$worker_id=$data->worker_id;
			$start_hour=$data->start_hour;
			
			$track=Track::findOne($updated_track->track->id);
			
			//copy old details of track
			$last_line=$track->combined_line;
			
			//change track details
			$track->combined_line=$updated_track->track->combined_line;
			$track->save(false);
			
			//change connections details
			$connections=Track_for_worker::find()->where(['track_id'=>$track->id])->all();
			foreach ($connections as $connection) {
				// $connection->line=$updated_track->track->combined_line;
				if($connection->worker_id==$worker_id){
					date_default_timezone_set("Asia/Jerusalem");
					$unixTimeStamp = strtotime($start_hour);
					$connection->hour = date('H:i:s', $unixTimeStamp );
				}
					// $connection->hour=date('H:i:s',strtotime($start_hour.' +3 hours'));
				$connection->save(false);
			}
			
			//change driver details
			$driver=Messengers::findOne($updated_track->track->meesenger);
			if($driver){
				$driver->name=$updated_track->driver->name;
				$driver->phone=$updated_track->driver->phone;
				$driver->save(false);
			}
			
			die('updated');
		 }
		 
 		public function actionGetallallroute($date)
 		{
 			// // $all_tracks=Track::find()->where(['track_date'=>$date])->asArray()->all();
 			// $all_tracks=Track_for_worker::find()->where(['shift_date'=>$date])->asArray()->all();
			// $tracks=[];
			// $index=0;
			// foreach ($all_tracks as $value) {
				// $arr=[];
				// $j=0;
				// // $tracks_for_worker=Track_for_worker::find()->where(['line'=>$value['combined_line'],'shift_name'=>$value['shift'],'shift_date'=>$value['track_date']])->all();
				// foreach ($tracks_for_worker as $track_for_worker) {
					// $arr[$j]=Worker::findOne($track_for_worker->worker_id);
					// $j++;
				// }
				// print_r($arr);die(); 
				// $tracks[$index]['workers']=$arr;
				// // $tracks[$index]['workers'] = Worker::find()->where(['combined_line'=>$value['combined_line']])->asArray()->all();
				// $i=0;
				// foreach ($tracks[$index]['workers'] as $worker) {
					// $tracks[$index]['workers'][$i]['addresses'] = Address::find()->where(['worker_id'=>$tracks[$index]['workers'][$i]['id']])->asArray()->all();
					// $i++;
				// }
				// // $tracks[$index]['combined_line']=$value['combined_line'];
				// $tracks[$index]['combined_line']=$value['line'];
				// // $tracks[$index]['track']=$value;
				// $tracks[$index]['track']=Track::find()->where(['combined_line'=>$value['line'],'shift'=>$value['shift_name'],'track_date'=>$value['shift_date']])->one();
				// // $drivers=Messengers::find()->where(['track_id'=>$value['id']])->asArray()->all();
				// $drivers=Messengers::find()->where(['track_id'=>$tracks[$index]['track']['meesenger']])->asArray()->all();
				// foreach ($drivers as $driver) {
					// $tracks[$index]['driver']=$driver;
				// }
				// $index++;
			// }
			$morning_shift = 2; // id of morning shift from `shifts` table
			$tomorrow = date('Y-m-d',strtotime($date. '+1 days'));
			//$tracks_in_date = Track::find()->where(['track_date'=>$date])->andWhere(['<>','shift_id',$morning_shift])->orWhere(['shift_id'=>$morning_shift,'track_date'=>$tomorrow])->asArray()->all();
			$tracks_in_date = Track::find()->where(['track_date'=>$date])->asArray()->all();//print_r(json_encode($tracks_in_date));die();
			$length = count($tracks_in_date);
			$track = [];
			$i = 0;
			foreach ($tracks_in_date as $value) {
			    $orderby = 'track_order';
			    $workers = Track_for_worker::find()->where(['track_id'=>$value['id']])->orderBy($orderby)->all();
                //$track[$i]['workers_array'] = (array)$workers;
                if($workers){
    				$track[$i]['track'] = $value;
    				$static_line = Staticlines::findOne(['line_number'=>$value['line_number']]); 
    				$track[$i]['track']['track_order'] = $static_line->line_order;
    				$driver = Messengers::find()->where(['id'=>$value['meesenger']])->asArray()->all();
    				foreach ($driver as $x) {
    					$track[$i]['driver'] = $x;
    				}
    				$index = 0;
    				// $workers=Track_for_worker::find()->where(['line'=>$value['combined_line'],'shift_name'=>$value['shift'],'shift_date'=>$value['track_date']])->asArray()->all();
    				$collecting = (strpos($value['shift'], 'איסוף') !== false)?1:0; 
    				//$orderby = $collecting==1?'hour':'track_order'; //
    				
    				
    				foreach ($workers as $key1=>$worker) {
    					// $track[$i]['workers'][$index]=Worker::find()->where(['id'=>$worker->worker_id])->one();
    					$current_worker = Worker::find()->where(['id'=>$worker->worker_id])->asArray()->all();
    					foreach ($current_worker as $val) {
    						$track[$i]['workers'][$index] = $val;
    					}
    					$j=0;
    					
    					$addresses = -1;
    					if($current_worker)
    					//$addresses = Address::find()->where(['worker_id'=>$track[$i]['workers'][$index]->id])->asArray()->all();
    					$addresses = Address::find()->where(['worker_id'=>$worker->worker_id])->asArray()->all();
    					// if($addresses)
    					if($addresses){
    						foreach ($addresses as $address) {
    							if($address){
    								$track[$i]['workers'][$index]['addresses'][$j]=$address;
    								$j++;								
    							}
    						}						
    					}
    
    					$track[$i]['workers'][$index]['address']=$worker->address;   
    					$track[$i]['workers'][$index]['track_order']=$worker->track_order?$worker->track_order:'';
    					$track[$i]['workers'][$index]['hour']=$worker->hour;        
    					$track[$i]['workers'][$index]['duration']=$worker->duration;   
    					$track[$i]['workers'][$index]['updated']=$worker->updated;   
    					$index++;
    					
    					/*-----------------------------------------*/
    					
    					if(($collecting==1&&$key1==(count($workers)-1))||(!$collecting==0&&$key1==0)){
    						$time = 0;
    						$adressModel = Address::find()->where(['worker_id'=>$worker->worker_id,'original_address'=>$worker->address])->one();
    						if($adressModel){
    							$time = $adressModel->travel_time;
    						}
    						$worker->duration = $time;
    						$worker->save(false);
    					}
    					if($key1==0){
    						$prev_track = $worker;
    						continue;
    					}
    					$source = $prev_track->address;
    					$destination = $worker->address;
    					$distance = Distances::find()->where(['source'=>$source,'destination'=>$destination])->orWhere(['source'=>$destination,'destination'=>$source])->one();
    					if($distance){
    						$duration = $distance->duration;
    					}else{
    						$duration = 0;
    					}
    					
    					
    					$item = $collecting==1?$prev_track:$worker;
    					$item->duration = $duration;
    					
    					$item->save(false);
    					$prev_track = $worker;
    					
    					/*-----------------------------------------*/
    					
    					
    				}          
                    $i++;	
				}
			}
			print_r(json_encode($track));die();
        }

	public function actionRemove_updated($date)
	{
		$data = json_decode(file_get_contents("php://input"));
		$sql = "SELECT tw.id , tw.updated FROM track_for_worker tw
				inner join track t
				on tw.track_id = t.id
				where t.track_date = '".$date."' and tw.updated = 1";
		$updated = Track_for_worker::findBySql($sql)->all();
		foreach ($updated as $key => $value) {
			$value->updated = 0;
			$value->save(false);
		} 
		return 1;
	}

	//delete worker from current track
	public function actionDeleteworker()
	{
		$data=json_decode(file_get_contents("php://input"));
		$worker_id=$data->worker_id;
		$track=$data->track;
		$workers=$data->track->workers;
		
		$track_model = Track::findOne($track->track->id);
		$hospital_track_model = HospitalTrack::find()->where(['shift'=>$track_model->shift,'date'=>$track_model->track_date,'worker_id'=>$worker_id])->one();
		if($hospital_track_model){
			$hospital_track_model->delete();
		}
		
		//delete tracks for current worker
		Track_for_worker::deleteAll(['worker_id'=>$worker_id,'track_id'=>$track->track->id]);
		
		//save new order of other workers
		if($workers)
		foreach ($workers as $worker) {
			$connection=Track_for_worker::findOne(['worker_id'=>$worker->id,'track_id'=>$track->track->id]);
			if($connection){
				$connection->track_order=$worker->track_order;
				$connection->save(false);
			}
		}
		print_r(json_encode(["deleted"]));die();
		//die('deleted');       	
	}
	
	public function actionChange_shift()
	{
		$data=json_decode(file_get_contents("php://input"));
        $worker_id=$data->worker_id;
        $track=$data->track;
        $workers=$data->track->workers;
        $shift_id = $data->shift->id;
        $shift_name = $data->shift->name;
        $line = $data->line;
        $shift_model = Shift::findOne($shift_id);
        $workerModel = Worker::findOne($worker_id);
        
        $track_model = Track::findOne($track->track->id);
        $hospital_track_model = HospitalTrack::find()->where(['shift'=>$track_model->shift,'date'=>$track_model->track_date,'worker_id'=>$worker_id])->one();
        if($hospital_track_model){
            $hospital_track_model->delete();
        }
        $old_track_for_worker = Track_for_worker::find()->where("worker_id = ".$worker_id." and track_id = ".$track->track->id)->one();
        Track_for_worker::deleteAll(['worker_id'=>$worker_id,'track_id'=>$track->track->id]);
        
        if($workers)
        foreach ($workers as $worker) {
            $connection=Track_for_worker::findOne(['worker_id'=>$worker->id,'track_id'=>$track->track->id]);
            if($connection){
                $connection->track_order=$worker->track_order;
                $connection->save(false);
            }
        }
        
        //$date = date('Y-m-d',strtotime($today));
        $track = new Track();
        $track->line_number = $line->line_number;
        $track->combined_line = $line->line_number;
        $track->description = $line->description;
        $track->meesenger = $track_model->meesenger;
        $track->shift = $shift_name;
        $track->shift_id = $shift_id;
        $track->track_date = $track_model->track_date;
        $track->save(false);
        $new_track_id = $track->id;
        //$worker = Worker::findOne($worker_id);
        $track_for_worker = new Track_for_worker();
        $track_for_worker->track_id = $new_track_id;
        $track_for_worker->worker_id = $worker_id;
        $track_for_worker->address = $old_track_for_worker->address;
        if($shift_model){
            $track_for_worker->hour = $shift_model->hour;
        }
        $track_for_worker->save(false);
        
        $hospital_track = new HospitalTrack();
        $hospital_track->combined_line = $track->combined_line;
        //$hospital_track->region = $track->region;
        $hospital_track->description = $track->description;
        $hospital_track->shift = $track->shift;
        $hospital_track->shift_id = $track->shift_id;
        $hospital_track->date = $track->track_date;
        $hospital_track->worker_id = $worker_id;
        $hospital_track->phone = $workerModel->phone;
        $hospital_track->department = $workerModel->department;
        $hospital_track->worker_name = $workerModel->name;
        $hospital_track->address = $old_track_for_worker->address;
        $hospital_track->save(false);
        
        print_r(json_encode(["success"]));die();      	
	}
	
	//update worker's details for current track
	public function actionUpdateworkerfortrack()
	{
		$data=json_decode(file_get_contents("php://input"));
        date_default_timezone_set("Asia/Jerusalem");
		$updated_worker=$data->worker;
		$track_id=$data->track_id;
		$updated_address=$data->updated_address;
		$hour=$data->hour;
		$travel=$data->travel;
		
		$worker=Worker::findOne(['id'=>$updated_worker->id]);
		$worker->name = $updated_worker->name;
		$worker->regular_instructions = $updated_worker->regular_instructions;
		$worker->combined_line = $updated_worker->combined_line;
		
		//find primary address of current worker
		// if($updated_worker->last||$updated_worker->first){
			// $address=Address::findOne(['worker_id'=>$new_worker->id,'primary_address'=>1]);
			// // if($updated_worker->last)
				// // $address->travel_time=$updated_worker->last;
			// // else if($updated_worker->first)
				// // $address->travel_time=$updated_worker->first;
			// // print_r($updated_worker);
			// $address->travel_time=$updated_worker->travel_time;
			// $address->save(false);
		// }
		
		if($updated_address->original_address){
		$address=Address::findOne(['worker_id'=>$worker->id,'primary_address'=>1]);
		if(!$address){
			$address=new Address();
			$address->worker_id=$worker->id;
		}
		$address->primary_address=1;
		$address->is_current=1;
		$address->original_address=$updated_address->original_address;
		$address->street_number=$updated_address->street_number;
		$address->street=$updated_address->street;
		$address->city=$updated_address->city;
		$address->country=$updated_address->country;
		$address->lat=$updated_address->lat;
		$address->lng=$updated_address->lng;
		$address->map_file=$updated_address->map_file;
		if($travel==1)
			$address->travel_time=$updated_address->travel_time;
		$address->save(false);
	}
		
		$worker->save(false);
		
		$connection=Track_for_worker::findOne(['worker_id'=>$worker->id,'track_id'=>$track_id]);
		// $connection->hour=$tracks_for_worker->hour;
		if($travel==0)
			$connection->duration=$connection->duration;
		
		//copy new details of connection
		// if($updated_worker->hour)
			// $connection->hour=date('H:i:s',strtotime($updated_worker->hour.'+3 hours'));
		// else
			// $connection->hour=$tracks_for_worker->hour;
		// $connection->hour=date('H:i:s',strtotime($hour.' +3 hours'));
		

		$unixTimeStamp = strtotime($hour);
		$connection->hour = date('H:i:s', $unixTimeStamp );
		
		if($updated_worker->duration)
			$connection->duration=$updated_worker->duration;
		else
			$connection->duration=$connection->duration;
		
		//save connection
		$connection->save(false);
		
		die('updated');
	}
	
	//change hours
	public function actionChangehours()
	{
		$data = json_decode(file_get_contents("php://input"));
        date_default_timezone_set("Asia/Jerusalem");
		$workers = $data->workers;
        $track_id = $data->track_id;
		
		$index;
		$length = count($workers);
		// foreach ($workers as $worker) {
			// $updated_worker=Track_for_worker::findOne(['worekr_id'=>$worker->id,'line'=>$line,'shift_name'=>$shift,'shift_date'=>$date]);
			// // $updated_worker->hour=date('H:i:s',strtotime($worker->hour.' +3 hours'));
			// $updated_worker->hour=$worker->hour;
			// die($updated_worker->hour);
			// $updated_worker->save(false);
		// }
		
		
        
    	for($index = 0;$index<$length;$index++){
			$updated_worker = Track_for_worker::findOne(['worker_id'=>$workers[$index]->id,'track_id'=>$track_id]);
			$unixTimeStamp = strtotime($workers[$index]->hour);
			$updated_worker->hour = date('H:i:s', $unixTimeStamp );
			// $updated_worker->track_order = $index;
			$updated_worker->save(false);
		}
	
		$trackModel = Track::findOne($track_id);
		$collecting = (strpos($trackModel->shift, 'איסוף') !== false)?1:0; 
		$orderby = $collecting==1?'hour':'track_order';
		$orderby = 'track_order';
		
		$all_workers = Track_for_worker::find()->where(['track_id'=>$track_id])->orderBy($orderby)->all();	
        
		foreach ($all_workers as $key => $updated_worker) {
			/*----------------------------*/
			if(($collecting==1&&$key==(count($all_workers)-1))||(!$collecting==0&&$key==0)){
				$time = 0;
				$adressModel = Address::find()->where(['worker_id'=>$updated_worker->worker_id,'original_address'=>$updated_worker->address])->one();
				if($adressModel){
					$time = $adressModel->travel_time;
				}
				$updated_worker->duration = $time;
				$updated_worker->save(false);
			}
			if($key==0){
				$prev_track = $updated_worker;
				continue;
			}
			$source = $prev_track->address;
			$destination = $updated_worker->address;
			$distance = Distances::find()->where(['source'=>$source,'destination'=>$destination])->orWhere(['source'=>$destination,'destination'=>$source])->one(); 
			if($key==5){
				//print_r($distance);die();
			}
			if($distance){
				$duration = $distance->duration;
			}else{
				$duration = 0;
			}

			$item = $collecting==1?$prev_track:$updated_worker;
			$item->duration = $duration;
			$item->save(false);
			$prev_track = $updated_worker;
			/*----------------------------*/
		}
	
		print_r(json_encode(['status'=>"ok","msg"=>"changed"]));
	}
	
	public function actionUpdateworkerorder()
	{
		$data = json_decode(file_get_contents("php://input"));
		$workers = $data->workers;
        $track_id = $data->track_id;
		
		
	    
		foreach ($workers as $key=>$worker) {
			$updated_worker = Track_for_worker::findOne(['worker_id'=>$worker->id,'track_id'=>$track_id]);
			$updated_worker->track_order = $worker->track_order;
			$updated_worker->duration = $worker->duration;
			// $updated_worker->hour = date('H:i:s',strtotime($worker->hour.' +3 hours'));
			$updated_worker->save(false);	
			
		}	    

		
		
		die('changed');
	}
	
	 public function actionUploadimage()  
	 {
	 	$upload_base_dir="img/maps/";
	    $upload_dir = $upload_base_dir;
	    if (!file_exists($upload_dir)) {
			mkdir($upload_dir, 0777, true);  //create directory if not exist
	    }
	    $image_name=basename($_FILES['file']['name']);
	    $image=time().'_'.$image_name;
	    move_uploaded_file($_FILES['file']['tmp_name'],$upload_dir.$image); // upload file
	    die($image);
	 }
	
 public function actionUpdateallroutes(){
    	
        $tracks = json_decode(file_get_contents("php://input"));
	    $tracks=$tracks->data;
		if($tracks){
			
			foreach($tracks as $key => $value){
				$track=Track::find()->where(['id'=>$value->id])->one();
				if($track){
					
					$track->track_date=$value->track_date;
					//print_r(json_encode($tracks));die();
														
					$track->time = $value->time;
					$track->distance = $value->distance;
					$track->meesenger=$value->meesenger;
					if($value->order)
					$index=0;
					foreach($value->order as $order_key => $order_value){
						$order=Order::find()->where(['id'=>$order_value->id])->one();
						$order->track_id=$value->id;
						$order->stop_index =$index++;
						$order->save(false);
						
					}
					if($track->save(false)){
						
					}
					else{
						print_r('error in saving');die();
					}
				}
			}
		}
 }
 
 	public function actionOptimizebytime(){
 		ini_set('max_execution_time', 1000); 
		$resultArray = [];
		$unembedded_stops = [];
		$error = (object)['status'=>'','response'=>'','data'=>''];
        $res = json_decode(file_get_contents("php://input"));
		$r = $res->stops;
		$drivers_number = $res->drivers;
		$stopsArr_general = [];
		$longStopArray = [];
		$order_instance = new Order();
		$track_instance = new Track();
		$track = new Track();
		//convert every object in the array from std-class to regular object
		//conver lat/lng to float (from string)
		$total_time = 0;
		for($i = 0; $i < count($r);$i++) {
			$t = json_decode(json_encode($r[$i]),true);
			
			$t['lat'] = (float)$t['lat'];
			$t['lng'] = (float)$t['lng'];
			//print_r($t['lat']."  ".$t['lng']);die();
			if(!$t['lat'] || !$t['lng']){
				$error->status = 'error';
				$error->response='missing latitude or longintude';
				$error->data = $t;
				print_r(json_encode($error));die();
				}
				$stopsArr_general[$i] = $t;
		}
		//$array_dates = $order_instance->splitByDate($stopsArr_general);
		//die();
		//print_r($array_dates);die();
		
		$def = Definition::find()->asArray()->one();
		
		if(!$def || !$def['lat_office'] || !$def['lng_office']){
			$error->status = 'error';
			$error->response = "some definisions are missing, please fill up office address";
			$error->data = null;
			print_r(json_encode($error));die();		
		}
		
		$origin =(object)['lat'=>$def['lat_office'],'lng'=>$def['lng_office']];
		
		$stops_arr_size = count($stopsArr_general);
		$groupsLen = (count($stopsArr_general) / 23);
		if(count($stopsArr_general) % 23){
			$groupsLen++;
		}
		
		/*
		
				if($groupsLen > 10){
					$error->status = 'error';
					$error->response = "can't proccess more than 23,000 stops";
					$error->data = null;
					print_r(json_encode($error));die();
				}
				*/
		
		
		//sort from north to south
		$stopsArr = $order_instance->north_to_south($stopsArr_general,$stops_arr_size);
		$prevLastStop = null;
		//send to google with groups of 23
		for($i = 0; $i < $groupsLen; $i++){
			for($g = 0;$g < $stops_arr_size && $stopsArr[$g]['track_num'] ; $g++);
			
			//if there are no more stops
			if($g == $stops_arr_size){
				
				break;
			}
		
			$lat1 = $stopsArr[$g]['lat'];
			$lng1 = $stopsArr[$g]['lng'];
				
			//calculate distance
			$stopsArr = $track->calculate_distance($stopsArr,$stops_arr_size,$lat1,$lng1);
			
			
			$stopsArr[$g]['track_num'] = $i+1;
			$stopsArr = $track->findTrack($i+1,$stopsArr,0,$stops_arr_size,22,$stopsArr[$g]['lat'],$stopsArr[$g]['lng']);
			$current_route = array();
						
			//exclude current route from stops track
			$current_route = array_filter($stopsArr,function($stop)use($i){
				return ($stop['track_num'] == ($i+1)) ? true : false;
			});
			$current_route =  array_values($current_route);
			$current_route_size = count($current_route);
			if(count($current_route) > 1){
				$lastStop = array_pop($current_route);
			}
			else{
				$lastStop = $current_route[0];
			}
			
			
			$array_size = count($longStopArray);
			//print_r(json_encode($current_route));die();	
			if(count($current_route)>0){
				$track_result = array();
				$track_result[0] = "";
				
				$track_result = $track->prepartArrayForGoogle($current_route,$track_result);
				
				//origin is the previous last stop
				if($prevLastStop){
					$origin = (object)['lat'=>$prevLastStop['stop']['lat'],'lng'=>$prevLastStop['stop']['lng']];
				}
				else{
					$origin = (object)['lat'=>$def['lat_office'],'lng'=>$def['lng_office']];
				}
				
				$destination = (object)['lat'=>$lastStop['lat'],'lng'=>$lastStop['lng']];
				//send to google
				$google_result = $track->getGoogleDirections($origin,$destination,$track_result[0],true);
				//print_r(json_encode($google_result));die();
				if(!$google_result || !$google_result['routes'] || !$google_result[routes][0] || !$google_result[routes][0]['waypoint_order']){
					if($google_result['status'] != 'OK'){
						$checkRoute = $current_route;
					
						if($prevLastStop['stop']){
							array_unshift($checkRoute,$prevLastStop['stop']);
						}
						
						array_push($checkRoute,$lastStop);
						//print_r(json_encode($checkRoute) );die();
						$res = $track->getAllProblematics($checkRoute);
						//print_r(json_encode($res));die();
						if($res->status == 'success'){
							if(count($res->unembedded)){
								$r_ar = [];

								$array_before = $current_route;
								$unembedded_size = count($res->unembedded);
								for($y = 0;$y < $unembedded_size;$y++){
									$stop = $res->unembedded[$y];
									array_push($unembedded_stops,$res->unembedded[$y]);
									$curr_size = count($current_route);
									
									$unembedded[$y]['track_id'] = -1;
									$current_route = array_filter($current_route, function($v)use($stop) { return $v['id'] != $stop['id']; });
									if($stop['id'] == $lastStop['id']){
										
										if(count($current_route) > 1){
											$lastStop = array_pop($current_route);
										}
										else{
											$lastStop = $current_route[0];
										}
									}
								}
								
								$current_route = array_values($current_route);
								//print_r(json_encode($current_route));die();
								
								
							}
							$google_result = $res->data;
						}
							
					else{	
						$error->status = 'error';
						$error->response = "error while proccessing google call";
						$error->data = $track_result;
						print_r(json_encode($error));die();
					}
						//print_r(json_encode($problematicStop));die();
					}	
					else{	
						$error->status = 'error';
						$error->response = "error while proccessing google call";
						$error->data = $track_result;
						print_r(json_encode($error));die();
					}
				}
				
				
					$waypoints_order = $google_result['routes'][0]['waypoint_order'];
				//print_r(json_encode($waypoints_order));die();
				//arrange stops in array according to waypoints order
				for($b = 0; $b < count($waypoints_order); $b++){
					$key = array_search($b, $waypoints_order);
					$longStopArray[$key + $array_size] = [];
					$longStopArray[$key + $array_size]['stop'] = $current_route[$b];
					
				}

				$len_before_last = count($longStopArray);
				//last stop
				$longStopArray[$len_before_last] = [];
				$longStopArray[$len_before_last]['stop'] = $lastStop;
				
				$prevLastStop = $longStopArray[count($longStopArray) - 1];
				//sum duration of stops
				$google_result_size = count($google_result[routes][0][legs]);
				
				$track_duration = 0;
				$track_distance = 0;
				
				$long_size = count($longStopArray);
				//sum up distance and duration to each stop
				for($h = 0; $h  < (count($waypoints_order)+1); $h++){
					$long_index = $h + $array_size;
				
					$longStopArray[$long_index]['duration'] = $google_result[routes][0][legs][$h][duration][value];
					//$prevStopDuration = $h > 0? $longStopArray[$h - 1]['duration'] : 0;
					//$longStopArray[$h]['duration'] += $prevStopDuration;
					
					$longStopArray[$long_index]['duration'] += ($longStopArray[$long_index]['stop']['stop_stay']*60);
					
					$longStopArray[$long_index]['distance'] = $google_result[routes][0][legs][$h][distance][value];
					
					//$prevStopDistance = $h > 0? $longStopArray[$h - 1]['distance'] : 0;
					//$longStopArray[$h]['distance'] += $prevStopDistance;
					$total_time += $longStopArray[$long_index]['duration'];
					
				}
				
				
				
				}
 			}
				
				//print_r(json_encode($longStopArray));die();
				
				$firstTimeArray = $track_instance->devideTime($longStopArray, $drivers_number,$total_time,null,$flag);
			//print_r(json_encode($firstTimeArray));die();
				$middleDistanceArray = [];
				$max_duration = 0;
				
				for($c = 0; $c < count($firstTimeArray); $c++){
					
					//take the middle stop of each array
					$middleDistanceArray[$c] = [];
					$count = count($firstTimeArray[$c]);
					$half_count = $count/2;
					$middleStop = $firstTimeArray[$c]['stops'][$half_count];
					$origin = (object)['lat'=>$def['lat_office'],'lng'=>$def['lng_office']];
					$destination = (object)['lat'=>$middleStop['lat'],'lng'=>$middleStop['lng']];
					//print_r(json_encode($destination));die();
					$google_result = $track->getGoogleResponse($origin,$destination);
					$middleDistanceArray[$c]['duration'] = $google_result['routes'][0]['legs'][0]['duration']['value'];
					$middleDistanceArray[$c]['distance'] = $google_result['routes'][0]['legs'][0]['distance']['value'];
					$durationFromOffice += ($middleDistanceArray[$c]['duration']*2);
					if($durationFromOffice > $max_duration){
						
						$max_duration = $durationFromOffice;
					}
					
				}
				
				$averageDuration = $durationFromOffice / $drivers_number;
				$total_time += $averageDuration;
				$exceeding = $max_duration / $drivers_number;
				$flag = 1;
				//print_r(json_encode($longStopArray));die();
				$resultArray = $track_instance->devideTime($longStopArray, $drivers_number,$total_time,$middleDistanceArray,$flag,$exceeding);
				//print_r(json_encode($resultArray));die();
				$r_size = count($resultArray);
				$c_test =0;
				
				for($a = 0;$a < $r_size;$a++){
					$way_p = $resultArray[$a]->waypoints_order;
					
					//print_r(json_encode($middleDistanceArray));die();
					$track_duration =  $resultArray[$a]['duration'];
					$track_date = $resultArray[$a]['stops'][0]['time_order'];
					$track_distance = $resultArray[$a]['distance'];
					$newTrack = $track->createTrackNew($track_duration,$track_distance,$track_date);
					//print_r(json_encode(count($resultArray[$a]['stops'])));die();
					$c_test += count($resultArray[$a]['stops']);
					$e = $track->attachStopsToTrack($resultArray[$a]['stops'],$newTrack);
					if($e != 'ok'){
						//print_r($e);die();
					}
					
				}
			$res = (object)['status'=>'','data'=>''];
			$res->status = 'successfuly done';
			$res->data = $unembedded_stops;	
			print_r(json_encode($res));
 	}
 
 
 		//new algorithm for arranging routes for a whole day
		public function actionAlgorithm(){
			ini_set('max_execution_time', 1000); 
			$resultArray = [];
			$error = (object)['response'=>'','data'=>''];
          	$r = json_decode(file_get_contents("php://input"));
			$stopsArr_general = [];
			
			//convert every object in the array from std-class to regular object
			//conver lat/lng to float (from string)
			for($i = 0; $i < count($r);$i++) {
				$t = json_decode(json_encode($r[$i]),true);
				$t['lat'] = (float)$t['lat'];
				$t['lng'] = (float)$t['lng'];
				//print_r($t['lat']."  ".$t['lng']);die();
				if(!$t['lat'] || !$t['lng']){
					$error->response='missing latitude or longintude';
					$error->data = $t;
					print_r(json_encode($error));die();
				}
				
				$stopsArr_general[$i] = $t;
			}
			
			//sort array by order time
			usort($stopsArr_general, function($a, $b) {
				  return ($a['time_order'] < $b['time_order']) ? -1 : 1;
			});
			$order_instance = new Order();
			
			//split array to sub arrays by date and time
			$array_dates = $order_instance->split_toSubarrays($stopsArr_general);
			
			
			for($u = 0;$u < count($array_dates) && $array_dates[$u]!=null && $array_dates[$u][0];$u++){
					
				//current array -stops with same date and time
				$stopsArr = $array_dates[$u];
				//determine if join array to last array or not
				$unitingTrack = false;
				$stops_arr_size = count($stopsArr);
				//sort array from north to south
				$stopsArr = $order_instance->north_to_south($stopsArr,$stops_arr_size);
					
					
					
				
				//createMoreRoutes is false when all stops are already embedded in tracks
				$createMoreRoutes = true;
				
				$track = new Track();
				//max stops in one track
				$max_order = Definition::find()->asArray()->one();
				
				
				$max_order =(int)$max_order['max_order'];
			
				//calculate length of maximum number of tracks ( +1 if there is remainder)	
				if(!$max_order || $max_order > 23){
					$max_order = 23;
				}
				//$max_order = 5;
				if(count($stopsArr)>0){
						$result = array();
						for($i = 0;$createMoreRoutes == true ;$i++){
							
						//find first stop that isn't yes embedded (track_num is null)
						for($g = 0;$g < $stops_arr_size && $stopsArr[$g]['track_num'] ; $g++);
						
						//if there are no more stops
						if($g == $stops_arr_size){
							//print_r('checkifmoreroutes');die();
							$createMoreRoutes = false;
							break;
						}
						
						//find lat-lng of the stop in order to find closest locations
						if($createMoreRoutes == false){
							break;
						}
						
						$lat1 = $stopsArr[$g]['lat'];
						$lng1 = $stopsArr[$g]['lng'];
						
						//calculate distance
						$stopsArr = $track->calculate_distance($stopsArr,$stops_arr_size,$lat1,$lng1);
						$stopsArr[$g]['track_num'] = $i+1;
						$stopsArr = $track->findTrack($i+1,$stopsArr,0,$stops_arr_size,$max_order-1,$stopsArr[$g]['lat'],$stopsArr[$g]['lng']);
						
						
						$current_route = null;
						$current_route = array();
						
						//exclude current route from stops track
						$current_route = array_filter($stopsArr,function($stop)use($i){
							return ( $stop['track_num'] == ($i+1)) ? true : false;
						});
						//print_r(json_encode($current_route));die();
						$current_route =  array_values($current_route);
							//	print_r(json_encode($current_route));die();	
						if(count($current_route)>0){
							$track_result = array();
							$track_result[0] = "";
							
							$track_result = $track->prepartArrayForGoogle($current_route,$track_result);
							
							//send to google
							$def = Definition::find()->asArray()->one();
							$origin =(object)['lat'=>$def['lat_office'],'lng'=>$def['lng_office']];
							
							$google_result = $track->getGoogleDirections($origin,$origin,$track_result[0],true);
							$waypoints_order = $google_result[routes][0]['waypoint_order'];
							
							$track_duration = 0;
							$track_distance = 0;
							//sum duration of stops
							$google_result_size = count($google_result[routes][0][legs]);
							//file_put_contents('google_result123', $google_result);
							//print_r(json_encode($google_result));die();
							for($h = 0; $h < ($google_result_size-1); $h++){
								$track_duration += $google_result[routes][0][legs][$h][duration][value];
								$track_distance += $google_result[routes][0][legs][$h][distance][value];
								if($current_route[$h]){
									$track_duration += ($current_route[$h]['stop_stay']*60);	
									//print_r(json_encode($current_route));die();
								}
							}
							
							//check if a new track or joining another track
							if($unitingTrack){
								//print_r($unitingTrack);die();
								//1. request to google to get distance and duration between 
								//		last stop in previous track to first stop in current tracl
								$google_between_tracks = array();
								$google_between_tracks[0] = "";
								$google_between_tracks = $track->prepartArrayForGoogle($current_route,$google_between_tracks);
								$google_result_sec = $track->getGoogleDirections($origin,$origin,$google_between_tracks[0],true);
								$travel_duration_between_tracks = $google_result['routes'][0]['legs'][0]['duration']['value'];
								$travel_distance_between_tracks = $google_result['routes'][0]['legs'][0]['distance']['value'];
								
								//2. calculate duration of first track+ duration between tracks + duration of second track
								$track_duration += $prev_duration + $travel_duration_between_tracks;
								$track_distance += $prev_distance + $travel_distance_between_tracks;
								//3. join two tracks (by changing tracks number in the stops array of the second track)
								for($r = 0;$r < count($current_route); $r++){
									$current_route[$r]['track_num'] = $prev_route_num;
								}
								//4. calculate waypoints order again
								$addToWaypoints = count($prev_waypoints_order);
								for($b = 0; $b < count($waypoints_order);$b++){
									$waypoints_order[$b] += $addToWaypoints;
								}
							}
							$array_stops = $track_result;
							//first place is a string for google
							array_shift($array_stops);
							//if result excludes - remove stops from end
							$time_load = (int) $def['time_destination_load'];
							//print_r(json_encode($google_result));die();							
							$h = count($waypoints_order);
							$p_array_stops = $array_stops;		
							$p_duration = $track_duration;	
							
							$tooLong = false;
							while($time_load && $time_load < ($track_duration/60)&& count($array_stops)>0 && $h > 0){
								$tooLong = true;
								$h--;
																
								$key = $waypoints_order[$h+1];
								if($unitingTrack){
									$key -= $addToWaypoints;	
								}
								if($key >= 0 && $key != null){
									//remove elemenent from array
									$removedStop = $array_stops[$key];
									
									for ( $e = 0;$e < count($stopsArr);$e++) {
										if($stopsArr[$e]['id'] == $removedStop['id']){
											$stopsArr[$e]['track_num']= null;
											break;
										}
									}
									if($e == count($stopsArr)){
										continue;
									}
									unset($array_stops[$key]); // remove item at index 0
									//print_r(json_encode($stopsArr));die();
									$removedStop = array_pop($track_result);
									$track_duration -= $google_result[routes][0][legs][$h+1][duration][value];
									$track_duration -= ($removedStop['stop_stay'] * 60);
									
									}
								else{
									
								}
							}


							
							if(count($array_stops)<=0){
								$array_stops = $p_array_stops;
								$track_duration = $p_duration;
							}
							
							
							//print_r(json_encode($waypoints_order));die();
							//print_r(json_encode($array_stops));die();
							//$y = ($h < ($google_result_size-1));
							$array_stops = array_values($array_stops);
							if($h < ($google_result_size-1)){
								$track_result[0] = "";
								$track_result =  $track->prepartArrayForGoogle($array_stops,$track_result);	
								$google_result = $track->getGoogleDirections($origin,$origin,$track_result[0],true);
								//print_r(json_encode($google_result));die();
							}
							
							
								$result = $track_result;
								array_shift($result);
								$len = count($resultArray);
									
								
								if($unitingTrack && $len){
									$resultArray[$len-1]->duration = $track_duration;
									$resultArray[$len-1]->distance = $track_distance;
						
									//array_push($resultArray[$len-1]['result'],$result);
									
									$resultArray[$len-1]->waypoints_order = array_merge($resultArray[$len-1]->waypoints_order,$waypoints_order);
									
									//$resultObj =(object)['duration' => $track_duration,'distance'=>$track_distance,'stops'=>$result,'waypoints_order'=>$waypoints_order]; 
									$resultArray[$len-1]->stops= array_merge($resultArray[$len-1]->stops,$result);
								}
								
								else{
									$resultObj =(object)['duration' => $track_duration,'distance'=>$track_distance,'stops'=>$result,'waypoints_order'=>$waypoints_order]; 
									$resultArray_len = count($resultArray);
									$resultArray[$resultArray_len] = $resultObj;
									//array_push($resultArray,$resultObj);
								}
								if($def['time_destination'] > (($track_duration/60)+40) && $tooLong == false){
									$unitingTrack = true;
									$prev_waypoints_order = $waypoints_order;
									$prev_distance = $track_distance;
									$prev_duration = $track_duration;
									$prev_route_num = $track_result[1]['track_num'];
								}
							}
					}
				}
			}

																		
			for($a = 0;$a < count($resultArray);$a++){
				$t_date = $resultArray[$a]->stops[0]['time_order'];
				$way_p = $resultArray[$a]->waypoints_order;
				
				
				if($resultArray[$a]->stops[0]['time_set'] == false){
					//print_r($resultArray[$a]->stops[0]['time_set']);die();
					//print_r(resultArray[$a]->stops[0]);die();
					$t_date = null;
				}
				$newTrack = $track->createTrack($t_date,$resultArray[$a]->duration,$resultArray[$a]->distance);
				$track->attachRoutesToTrack($resultArray[$a]->stops,$newTrack,$resultArray[$a]->waypoints_order);
				
			}
			print_r(json_encode('successfuly done'));die();
		} 



          public function actionOptimizedroutes(){
          	
          	$r = json_decode(file_get_contents("php://input"));
			$stopsArr_general = [];
			
			//convert every object in the array from std-class to regular object
			//conver lat/lng to float (from string)
			for($i = 0; $i < count($r);$i++) {
				$t = json_decode(json_encode($r[$i]),true);
				$t['lat'] = (float)$t['lat'];
				$t['lng'] = (float)$t['lng'];
				$stopsArr_general[$i] = $t;
			}
			
			//sort array by order time
			usort($stopsArr_general, function($a, $b) {
				  return ($a['time_order'] < $b['time_order']) ? -1 : 1;
			});
			$order_instance = new Order();
			//split array to sub arrays by date and time
			$array_dates = $order_instance->split_toSubarrays($stopsArr_general);
			
			
			for($u = 0;$u < count($array_dates)&&$array_dates[0]!=null ;$u++){
				//current array -stops with same date and time
				$stopsArr = $array_dates[$u];
				
				//set track date
				$track_date1 = 	new DateTime($array_dates[$u][0]['time_order']);	
				//print_r(json_encode($array_dates[$u][0]['time_order']));die();
				$h = $track_date1->format('H');
				$m = $track_date1->format('i');
				$track_date1->setTime($h,$m,0);
				$track_date1 = $track_date1->format('Y-m-d H:i:s');
				
				$stops_arr_size = count($stopsArr);
				//sort array from north to south
				$stopsArr = $order_instance->north_to_south($stopsArr,$stops_arr_size);
					
				//createMoreRoutes is false when all stops are already embedded in tracks
				$createMoreRoutes = true;
				
				$track = new Track();
				//max stops in one track
				$max_order = Definition::find()->asArray()->one();
				if(!$max_order){
					print_r('no definition');die();
				}
				$max_order = $max_order['max_order'];
			
				//calculate length of maximum number of tracks ( +1 if there is remainder)	
				if(!$max_order || $max_order > 23){
					$max_order = 23;
				}
				$max_order = 5;
				if(count($stopsArr)>0){
						$result = array();
						for($i = 0;$createMoreRoutes == true ;$i++){
						//find first stop that isn't yes embedded (track_num is null)
						for($g = 0;$g < $stops_arr_size && $stopsArr[$g]['track_num'] ; $g++);
						
						//if there are no more stops
						if($g == $stops_arr_size){
							$createMoreRoutes == false;
							break;
						}
						
						//find lat-lng of the stop in order to find closest locations
						if($createMoreRoutes == false){
							print_r('no more routes');
							die();
						}
						$lat1 = $stopsArr[$g]['lat'];
						$lng1 = $stopsArr[$g]['lng'];
						
						//calculate distance
						$stopsArr = $track->calculate_distance($stopsArr,$stops_arr_size,$lat1,$lng1);
						
						$stopsArr[$g]['track_num'] = $i+1;
						$stopsArr = $track->findTrack($i+1,$stopsArr,0,$stops_arr_size,$max_order-1,$stopsArr[$g]['lat'],$stopsArr[$g]['lng']);
						
						
						$current_route = null;
						$current_route = array();
						
						//exclude current route from stops track
						$current_route = array_filter($stopsArr,function($stop)use($i){
							return $stop['track_num'] == ($i+1) ? true : false;
						});
						
						$current_route =  array_values($current_route);
								
						if(count($current_route)>0){
							$track_result = array();
							$track_result[0] = "";
							
							$track_result = $track->prepartArrayForGoogle($current_route,$track_result);
							
							//send to google
							$def = Definition::find()->asArray()->one();
							$origin =(object)['lat'=>$def['lat_office'],'lng'=>$def['lng_office']];
							
							$google_result = $track->getGoogleDirections($origin,$origin,$track_result[0],true);
							$waypoints_order = $google_result[routes][0]['waypoint_order'];
						
							$track_duration = 0;
							$track_distance = 0;
							//sum duration of stops
							$google_result_size = count($google_result[routes][0][legs]);
							//print_r(json_encode($google_result));die();
							for($h = 0; $h < ($google_result_size-1); $h++){
								$track_duration += $google_result[routes][0][legs][$h][duration][value];
								$track_distance += $google_result[routes][0][legs][$h][distance][value];
								if($current_route[$h]){
									$track_duration += $current_route[$h]['stop_stay']*60;	
									//print_r(json_encode($current_route));die();
								}
							}
							//if result excludes - remove stops from end
							while($def['time_destination'] < ($track_duration/60)&& count($track_result)>0){
								$h--;
								$pos = strrpos($track_result[0], "|");
								if($pos){
									//print_r(json_encode($def['time_destination']));die();
									$removedStop = array_pop($track_result);
									$track_result[0] = substr($track_result[0],0,strrpos($track_result[0], "|"));
									//$track_result[0] = substr($track_result[0],0,strrpos($track_result[0], "|"));
									$track_duration -= $google_result[routes][0][legs][$h][duration][value];
									$track_duration -= $removedStop['stop_stay'];
									}
									else{
										break;
									}
								}
								if($h < ($google_result_size-1)){
									$google_result = $track->getGoogleDirections($origin,$origin,$track_result[0],true);
									
								}
								
								$result = $track_result;
								array_shift($result);
								//create track
								if(count($current_route[0])&& count($result[0]['id'])){
									$index = 0;
									$newTrack = $track->createTrack($track_date1,$track_duration,$track_distance);
									
									if($newTrack && $newTrack != 'error track'){
										$track->attachRoutesToTrack($result,$newTrack,$waypoints_order);
									}
									else{
										print_r('error');die();
									}
								}
							}
					}
				}
			}
			print_r(json_encode("ok"));die();
          }



	public function actionFixedroutes()
	{
		//print_r('$expression');die();
       //Create a new component
       
	
	$connection = new \yii\db\Connection([
			'dsn' => "mysql:host=localhost;dbname=routespe_routeSpeeduser",
			'username' => 'routespe_user',
			'password' => 'ahMx-thQOaZ8',
			'charset' => 'utf8'
			]);
		 $connection->open();
	
       
		$sql = "select * from routespe_routeSpeeduser.user";
		$result=$connection->createCommand($sql)->queryAll();
		 $connection->close();
		//print_r($result);die();
		
		//$result = mysql_query($sql);
		$arr = [];
		
			foreach ($result as $key => $value) {
				//array_push($arr,$value['id']);
					
				$connection = new \yii\db\Connection([
					'dsn' => "mysql:host=localhost;dbname=routespe_routeSpeeduser",
					'username' => "routespe_user".$value['id'],
					'password' => 'ahMx-thQOaZ8',
					'charset' => 'utf8'
				]);
				
				 $connection->open();
				 $tracks = Track::find()->where(['fixed '=>1])->asArray()->all();
				 foreach ($tracks as $key => $value) {
					 $orders = Order::find()->where(['track_id'=>$value['id']]);
		    	     //$time = new \DateTime('now');
				     //$today = $time->format('Y-m-d H:i:s');
				     $date = date('Y-m-d', strtotime( '+1 days' ) );
					 $year = $track_date1->format('Y');
					 $month = $track_date1->format('m');
					 $day = $track_date1->format('d');
					 
					 $new_track = new Track();
					 $new_track->track_date = $orders[0]['$orders'];
					 $new_track->status = 1;
					 $new_track->fixed = 0;
					 if($new_track->save){
 	 				 //$track_date1 = $track_date1->format('Y-m-d H:i:s');
						 foreach ($orders as $key => $value) {
							 $new_order = new Order();
							 $new_order->attributes = $value->attributes;
							 $new_order->time_order = $model->time_order;
							 $new_order->time_order->setDate($year,$month,$day);
							 $new_order->status = 0;
							 $new_order->track_id = $new_track['id'];
							 if($new_order->save(false)){
						 	
							 	}
						 	}
						 }
					 }
				 
				 
			}
	   print_r($arr);die();
	   
	    
		//$tracks = Track::find()
	}
		  
	//add worker to track
	public function actionAddworkertoline()
	{
		$data = json_decode(file_get_contents("php://input"));
		$track_id = $data->track_id;
		$worker = $data->worker;
		$worker_id = $worker->id;
		$selected_address = null;
		if(isset($worker->selected_address)){
			$selected_address = $worker->selected_address;
		}
		$order = $data->order;
		
		//check if worker exists in current line
		$connection = Track_for_worker::findOne(['track_id'=>$track_id,'worker_id'=>$worker_id]);
		if($connection)
			die('exists in current track');
		
		//check if worker exists in current shift
		$track = Track::findOne(['id'=>$track_id]);
		if($track){
			$more_tracks = Track::find()->where(['track_date'=>$track->track_date,'shift'=>$track->shift])->all();
			foreach ($more_tracks as $more_track) {
				$connection = Track_for_worker::findOne(['track_id'=>$more_track->id,'worker_id'=>$worker_id]);
				if($connection){
					die('exists in current shift');
				}	
			}
		}
		
		//add worker to current line
		$connection = new Track_for_worker();
		$connection->track_id = $track_id;
		$connection->worker_id = $worker_id;
		// $address = Address::findOne(['worker_id'=>$worker_id,'is_current'=>1]);
		// if($address){
			// $connection->address = $address->original_address;
		// }
		if($selected_address){
			$all_worker_addresses = Address::find()->where(['worker_id'=>$worker_id])->all();
			foreach ($all_worker_addresses as $curr_address) {
				$curr_address->is_current = null;
				$curr_address->save(FALSE);
			}
			$address = Address::findOne($selected_address->id);
			$address->is_current = 1;
			$address->save(FALSE);
			$connection->address = $address->original_address;
		}
		else{
			$connection->address = '';
		}
		$connection->track_order = $order;
		$connection->duration = 0;
		$shift = Shift::findOne(['name'=>$track->shift]);
		if($shift)
			$connection->hour = $shift->hour;
		$connection->save(false);
		$workerModel = Worker::findOne($worker_id);
		
		$hospital_track = new HospitalTrack();
		$hospital_track->combined_line = $workerModel->combined_line;
		$hospital_track->region = $track->region;
		$hospital_track->description = $track->description;
		$hospital_track->shift = $track->shift;
		$hospital_track->shift_id = Shift::findOne(['name'=>$track->shift])->id;
		$hospital_track->date = $track->track_date;
		$hospital_track->worker_id = $worker_id;
		$hospital_track->phone = $workerModel->phone;
		$hospital_track->department = $workerModel->department;
		$hospital_track->worker_name = $workerModel->name;
		$hospital_track->address = $connection->address;
		$hospital_track->save(false);
		
		
		$arr = array();
		$arr['hour'] = $shift->hour;
		//Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
		return json_encode($arr);
	}
	
	//add new line
	public function actionAddnewline()
	{
		date_default_timezone_set("Asia/Jerusalem");
		$data = json_decode(file_get_contents("php://input"));
		$new_line = $data->new_line;
		$today = $data->today;
		$morning_shift = 2; // id of morning shift
		/*if($new_line->shift->id==$morning_shift){
			$today.=' +1 days';
		}*/
		$date = date('Y-m-d',strtotime($today));
		//check if exists same track in same date and shift
		// $old_track = Track::findOne(['combined_line'=>$new_line->combined_line,'track_date'=>$date,'shift'=>$new_line->shift]);
		// $old_track = Track::findOne(['combined_line'=>$new_line->static_line->line_number,'track_date'=>$date,'shift_id'=>$new_line->shift->id]);
		// if($old_track)
			// die('line exists');
		
		//add new line
		$track = new Track();
		$track->line_number = $new_line->static_line->combined_line>0?$new_line->static_line->combined_line:$new_line->static_line->line_number;
		$track->combined_line = $new_line->static_line->line_number;
		$track->description = $new_line->static_line->description;
		$track->meesenger = $new_line->static_line->driver_id;
		$track->shift = $new_line->shift->name;
		$track->shift_id = $new_line->shift->id;
		$track->track_date = $date;
		$track->save(false);
		$new_track_id = $track->id;
		$worker = Worker::findOne(100000000);
		if(!$worker){
			$worker = new Worker();
			$worker->id = 100000000;
			$worker->name = 'עובד לדוגמא';
			$worker->save(false);
		}
		$track_for_worker = new Track_for_worker();
		$track_for_worker->track_id = $track->id;
		$track_for_worker->worker_id = 100000000;
		$shift = Shift::findOne($new_line->shift->id);
		if($shift){
			$track_for_worker->hour = $shift->hour;
		}
		$track_for_worker->save(false);
		if(isset($data->get_model)&&$data->get_model==1){
			$arr = array();
			$track_model = Track::find()->where("id = ".$new_track_id)->asArray()->one();
			$arr['track'] = $track_model;
			$arr['driver'] = Messengers::findOne($track->meesenger);
			$arr['workers'] = array();
			$arr['workers'][0] = Worker::find()->where("id = 100000000")->asArray()->one();
			$arr['workers'][0]['hour'] = $track_for_worker->hour;
			return json_encode($arr);
		}
		return json_encode([$track->id]);
		// die('added');
	}

	public function actionUpdatetrackdetails()
	{
		$data = json_decode(file_get_contents("php://input"));
		$updated_track = $data->data->track;
		// $shift_id = $data->shift_id;
		$reverse_track_id = $data->reverse_track_id;
		$track = Track::findOne($updated_track->id);
		if($track){
			// if($track->combined_line!=$updated_track->combined_line && $reverse_track_id){
				// $reverse_track = Track::findOne($reverse_track_id);
				// if($reverse_track){
					// $reverse_track->combined_line = $updated_track->combined_line;
					// $reverse_track->save(false);
				// }
			// }
			$description = $track->description;
			if($updated_track->combined_line!=$track->combined_line){
				$static_line = Staticlines::findOne(['line_number'=>$updated_track->combined_line]);
				$description = $static_line->description;
				$track->description = $description;
			}
			$track->combined_line = $updated_track->combined_line;
			$track->meesenger = $updated_track->meesenger;
			$track->save(false);
		}
		Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
		return $description;
	}	  
		   
	public function actionGet_reverse_track()
	{
		$data = json_decode(file_get_contents("php://input"));
		$track = $data->track;
		$shift_id = $data->shift_id;
		$reverse_track = array();
		if($shift_id==2)//אם נשלח בקשה לנגדי: בוקר פיזור צריך תאריך יום אחרי - הלילה בו אספו
		{$track->track_date=$stop_date = date('Y-m-d H:i:s', strtotime($track->track_date . ' +1 day'));}		
		if($shift_id==5)//אם נשלח בקשה לנגדי: לילה-איסוף צריך תאריך יום לפני - הבוקר בו מפזרים
		{$track->track_date=$stop_date = date('Y-m-d H:i:s', strtotime($track->track_date . ' -1 day'));}		
		$reverse_track['track'] = Track::findOne(['track_date'=>$track->track_date,'combined_line'=>$track->combined_line,'shift_id'=>$shift_id]);
		if(!$reverse_track['track']){
			return json_encode(["not found"]);
		}
		$reverse_track['driver'] = Messengers::findOne($reverse_track['track']->meesenger);
		$reverse_track['workers'] = array();
		$index = 0;
		$connections = Track_for_worker::find()->where(['track_id'=>$reverse_track['track']->id])->all();
		foreach ($connections as $connection) {
			$reverse_track['workers'][$index] = Worker::find()->where(['id'=>$connection->worker_id])->asArray()->one();
			$reverse_track['workers'][$index]['address'] = $connection->address;
			$reverse_track['workers'][$index]['addresses'] = Address::find()->where(['worker_id'=>$connection->worker_id])->all();
			$reverse_track['workers'][$index]['duration'] = $connection->duration;
			$reverse_track['workers'][$index]['hour'] = $connection->hour;
			$reverse_track['workers'][$index]['track_order'] = $connection->track_order;
			$index++;
		}
		Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
		return $reverse_track;
	}	   

	
		   
   //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//end admin functions
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------  
 
   
          
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//basic functions
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------   
  
    public function actionIndex()
    {
        $searchModel = new TrackSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Track model.
     * @param integer $id
     * @return mixed
     */
    public function actionView($id)
    {
        return $this->render('view', [
            'model' => $this->findModel($id),
        ]);
    }

    /**
     * Creates a new Track model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new Track();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->id]);
        } else {
            return $this->render('create', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing Track model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->id]);
        } else {
            return $this->render('update', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Deletes an existing Track model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
        $this->findModel($id)->delete();

        return $this->redirect(['index']);
    }
	
    /**
     * Finds the Track model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Track the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)   
    {
        if (($model = Track::findOne($id)) !== null) {   
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//end basic functions
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------  

}
