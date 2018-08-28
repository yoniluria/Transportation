<?php
namespace app\controllers;

use Yii;
use app\models\Order;
use app\models\OrderDetails;
use app\models\Track;
use app\models\Track_for_worker;
use app\models\Staticlines;
use app\models\Worker;
use app\models\Address;
use app\models\Messengers;
use app\models\OrderSearch;
//use app\models\OrdersProfiloption;
use app\models\Definition;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use app\models\OrdersProfiloption;
use yii\web\UploadedFile;




/**
 * OrderController implements the CRUD actions for Order model.
 */
class WorkerController extends Controller
{
    /**
     * @inheritdoc
     */
     
     
      public function beforeAction($action)
    {
       //file_put_contents('orderher.txt', '$data');
      if ($action->id =='saveworker' || $action->id =='getallworkers'|| $action->id =='deleteworker'|| $action->id =='updateworker'||$action->id=='uploadimage'||$action->id=='getworkers'||$action->id=='get_distance') {
            $this->enableCsrfValidation = false;
        }
	  	header("Access-Control-Allow-Methods: DELETE, POST, GET");
		header("Access-Control-Allow-Origin: *");
		header('Access-Control-Allow-Headers: X-CSRF-Token, Origin, Content-Type, X-Auth-Token, Accept');
        
        return parent::beforeAction($action);
    }
	
	protected function getDistance($addressFrom, $addressTo, $unit)
	{
	    //Change address format
	    $formattedAddrFrom = str_replace(' ','+',$addressFrom);
	    $formattedAddrTo = str_replace(' ','+',$addressTo);
		
	    //Send request and receive json data
	    $geocodeFrom = file_get_contents('http://maps.google.com/maps/api/geocode/json?address='.$formattedAddrFrom.'&sensor=false&key=AIzaSyDQpBq1mbjdOdsuUeTPFLX9Z3llJ4Iuuqs');
	    $outputFrom = json_decode($geocodeFrom);
	    $geocodeTo = file_get_contents('http://maps.google.com/maps/api/geocode/json?address='.$formattedAddrTo.'&sensor=false&key=AIzaSyDQpBq1mbjdOdsuUeTPFLX9Z3llJ4Iuuqs');
	    $outputTo = json_decode($geocodeTo);
	    
	    //Get latitude and longitude from geo data
	    $latitudeFrom = $outputFrom->results[0]->geometry->location->lat;
	    $longitudeFrom = $outputFrom->results[0]->geometry->location->lng;
	    $latitudeTo = $outputTo->results[0]->geometry->location->lat;
	    $longitudeTo = $outputTo->results[0]->geometry->location->lng;
	    
	    //Calculate distance from latitude and longitude
	    $theta = $longitudeFrom - $longitudeTo;
	    $dist = sin(deg2rad($latitudeFrom)) * sin(deg2rad($latitudeTo)) +  cos(deg2rad($latitudeFrom)) * cos(deg2rad($latitudeTo)) * cos(deg2rad($theta));
	    $dist = acos($dist);
	    $dist = rad2deg($dist);
	    $miles = $dist * 60 * 1.1515;
	    $unit = strtoupper($unit);
	    if ($unit == "K") {
	        return ($miles * 1.609344).' km';
	    } else if ($unit == "N") {
	        return ($miles * 0.8684).' nm';
	    } else {
	        return $miles.' mi';
	    }
	}	
	public function actionGet_distance()
	{
		$data = json_decode(file_get_contents("php://input"));
		$address = $data->address;
		$addressFrom = $address;
		$addressTo = 'בית חולים מעייני הישועה בני ברק';
		$distance = $this->getDistance($addressFrom, $addressTo, "K");
		echo $distance;
	}
	
	 public function actionUploadimage()
 {
 	$upload_base_dir="img/maps/";
    //$upload_time_dir=date('Y')."/".date('m')."/".date('d')."/"; // setup directory name
    // $upload_dir = $upload_base_dir.$upload_time_dir;
    $upload_dir = $upload_base_dir;
    if (!file_exists($upload_dir)) {
		mkdir($upload_dir, 0777, true);  //create directory if not exist
    }
    $fileinform=$_FILES;
    if(isset($_FILES["file"]))
    {
	//echo $_FILES["file"]['name'].' - '.basename($_FILES['file']['name']);die();
    $image_name=basename($_FILES['file']['name']);
    $image=time().'_'.$image_name;
	// if(!file_exists($upload_dir.$_FILES['file']['tmp_name']))
    // move_uploaded_file($_FILES['file']['tmp_name'],$upload_dir.$image); // upload file
    // $image=$image_name;
    // if(!file_exists($upload_dir.$_FILES['file']['name']))
    // move_uploaded_file($_FILES['file']['tmp_name'],$upload_dir.$image); // upload file
    move_uploaded_file($_FILES['file']['tmp_name'],$upload_dir.$image); // upload file
    echo json_encode([$image]);die();
    }return;
    //die($image);
 }
 
 
	
	public function actionDeleteworker(){
		$id = $_REQUEST['id'];
		Address::deleteAll(['worker_id'=>$id]);
		Track_for_worker::deleteAll(['worker_id'=>$id]);
		Worker::deleteAll(['id'=>$id]);
		die('ok');
	}
	
   public function actionGetallworkers()
   {
   		$data = json_decode(file_get_contents("php://input"));
		$workers = Worker::find()->asArray()->all();
        $arr=[];
		if($data){
			foreach ($workers as $worker) {
	        	$address = Address::findOne(['worker_id'=>$worker['id'],'is_current'=>1]);
				if($address){
					$worker['address'] = $address->original_address;
				}
	           $worker['addresses'] = Address::find()->where(['worker_id'=>$worker['id']])->orderBy('id')->asArray()->all();
				$track_id = $data->track;
				$track_for_worker = Track_for_worker::find()->where(['worker_id'=>$worker['id'],'track_id'=>$track_id])->one();
				$worker['instructions'] = $track_for_worker?$track_for_worker->instructions:'';			
			   $arr[] = $worker;
	        }
		}
		else{
			foreach ($workers as $worker) {
	        	$address = Address::findOne(['worker_id'=>$worker['id'],'is_current'=>1]);
				if($address){
					$worker['address'] = $address->original_address;
				}
	           $worker['addresses'] = Address::find()->where(['worker_id'=>$worker['id']])->orderBy('id')->asArray()->all();			
			   $arr[] = $worker;
	        }
		}       
		$static_lines = Staticlines::find()->all();
		Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
		return array('workers'=>$arr,'static_lines'=>$static_lines);
   }
   public function actionUpdateworker(){
     $data = json_decode(file_get_contents("php://input")); 	
	 	$old_worker=Worker::find()->where(['id'=>$data->id])->asArray()->all();
		// $old_worker=Worker::find()->where(['id'=>$data->id])->asArray()->one();
		// print_r($old_worker);die();
	$xxx=Worker::findOne($data->id);
	// print_r($xxx);die();
	// die($old_worker[0]->regular_instructions);		
	 $worker=new Worker();
	 $worker->id=$data->id;
	 $worker->name=$data->name;
	 $worker->phone=$data->phone;
	 $worker->department=$data->department;
	 $worker->regular_instructions=$xxx->regular_instructions;
	 
	 			if($old_worker!=null){
				foreach ($old_worker as $yy){
					$yy = Worker::findOne($data->id);
					$yy->delete();
				}
			}
	 $worker->save();
	 ini_set('error_reporting', E_STRICT);
	 
	 $old_addresses=Address::find()->where(['worker_id'=>$data->id,'primary_address'=>1])->asArray()->all();
			// print_r($old_address);die();//""
			// print_r(json_encode($old_address[0]->city));die();//null
	$yyy=Address::findOne(['worker_id'=>$data->id,'primary_address'=>1]);
	$address=new Address();
	// print_r($data->addresses[$data->index]);die;
	//updated details
	$address->original_address = $data->addresses[$data->index]->original_address;
	$address->lat = $data->addresses[$data->index]->lat;
	$address->lng = $data->addresses[$data->index]->lng;
	$address->country = $data->addresses[$data->index]->country;
	$address->city = $data->addresses[$data->index]->city;
	$address->street = $data->addresses[$data->index]->street;
	$address->street_number = $data->addresses[$data->index]->street_number;
	// $address->line_number = $data->addresses[$data->index]->line_number;
	// $address->sub_line = $data->addresses[$data->index]->sub_line;
	
	//old details
	$address->worker_id = $data->id;
	$address->primary_address = $yyy->primary_address;
	$address->is_current = $yyy->is_current;
	$address->escort = $yyy->escort;
	$address->regular_instructions = $yyy->regular_instructions;
	$address->travel_time = $yyy->travel_time;
	$address->map_file = $yyy->map_file;
				if($old_addresses!=null){
				foreach ($old_addresses as $yy){
					$yy = Address::findOne(['worker_id'=>$data->id,'primary_address'=>1]);
					$yy->delete();
				}
			}
	$address->save(false);
	Address::deleteAll(['original_address'=>null]);
	die('updated');
}

    public function actionSaveworker()
    {
            $data = json_decode(file_get_contents("php://input"));  
             // $worker = Worker::find()->where(['id'=>$data->id])->one();
			 // if($worker){
			 	// echo __LINE__;
				 // echo $worker->id;
			 		// print_r("ת.ז. קימת במערכת");
			 	// die();
			 // }
			 // $model = Worker::find()->where(['id'=>$data->id])->one();
			 $model = Worker::findOne($data->id);
			 // $new = 0;
			 if(!$model){
			 	$model= new Worker();
				 $model->id=$data->id;
				 // $new = 1;
			 }
			 else{              
			 	Address::deleteAll(['worker_id'=>$model->id]);
			 }
			 
             // $model= new Worker();
             // $model->id=$data->id;
             if(isset($data->name)){
             	$model->name = $data->name;
             }
			 if(isset($data->phone)){
			 	$model->phone = $data->phone;
			 }
			 if(isset($data->department)){
			 	$model->department = $data->department;
			 }
			 if(isset($data->regular_instructions)){
			 	$model->regular_instructions = $data->regular_instructions;	
			 }
			 if(isset($data->sub_line)){
			 	$model->sub_line = $data->sub_line;	
			 }
			
        if($model->save(false)){
        }
		
        else {echo "error";die();}
              // $arr = [];
			  // array_push($arr,$data->addresses);
			  // &&isset($data->addresses[0]->lng)!=""
			  if($data->addresses){
             foreach ($data->addresses as $value) {
             	$address=new Address();
				 if(isset($value->lng)){
				 	$address->lng=$value->lng;
				 }
               	 if(isset($value->lat)){
				 	$address->lat=$value->lat;
				 }	
               
               $address->worker_id=$model->id;
               if ($value === reset($data->addresses)){
               		$address->primary_address = 1;//$data->adresses->primary_address;
               		$address->is_current = 1;
               		// $model->combined_line=$value->line_number.$value->sub_line;
					// $model->save(false);
					
               }
			   // else{
			   	// $address->is_current=$value->is_current;
			   // }
			   
			   if(isset($value->original_address))
               $address->original_address = trim($value->original_address);
               //$address->address=$value->address;
               
               if(isset($value->street))
            	   $address->street=$value->street;
			   
			   if(isset($value->street_number))
                $address->street_number=$value->street_number;
			   if(isset($value->city))
                $address->city=$value->city;
                // $address->line_number=$value->line_number;
                
                if(isset($value->country))
                $address->country=$value->country;
				
				
				// $address->sub_line=$value->sub_line;
				if(isset($value->regular_instructions))
					$address->regular_instructions=$value->regular_instructions;
				
				if(isset($value->escort))
					$address->escort=$value->escort;
					
				if(isset($value->travel_time))	
				$address->travel_time=$value->travel_time;
				// $address->is_current=$value->is_current;
				
				if(isset($value->combined_line))	
				$address->combined_line=$value->combined_line;
				
				if(isset($value->sub_line))	
				$address->sub_line=$value->sub_line;
				
				if(isset($value->map_file))
					$address->map_file=$value->map_file[0];
                if($address->save(false)){
 					}
                  else {
                  	return json_encode(["error"]);}
                }
                }
         // print_r($model);
         Address::deleteAll(['original_address'=>null]);
         return json_encode(["ok"]);
         }
	
       }
