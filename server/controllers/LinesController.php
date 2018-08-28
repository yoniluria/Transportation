<?php
namespace app\controllers;

use Yii;
use app\models\Worker;
use app\models\Address;
use app\models\Messengers;
use app\models\Track;
use app\models\Track_for_worker;
use app\models\Staticlines;
use app\models\Distances;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use app\models\OrdersProfiloption;

class LinesController extends Controller
{
    /**
     * @inheritdoc
     */
     
     
      public function beforeAction($action)
    {
        $this->enableCsrfValidation = false;
        return parent::beforeAction($action);
    }
    
	//get all tracks
	public function actionGetalltracks()
	{
		$data = json_decode(file_get_contents("php://input"));
		$date = $data->date;
		$morning_shift = 2; // id of morning shift from `shifts` table
		$morning_shift_string = 'בוקר - פיזור';
		$tomorrow = date('Y-m-d',strtotime($date. '+1 days'));
		if(property_exists($data, "shift"))
			$shift = $data->shift;
		$tracks = [];
		$index = 0;
		// if(!property_exists($data, "shift"))
		if(!property_exists($data, "shift")||$data->shift==""){
			$all_tracks = Track::find()->where(['track_date'=>$date])->andWhere(['<>','shift_id',$morning_shift])->orWhere(['shift_id'=>$morning_shift,'track_date'=>$tomorrow])->all();
		}
		else{
			if($shift==$morning_shift_string){
				$all_tracks = Track::find()->where(['track_date'=>$tomorrow,'shift'=>$shift])->all();
			}
			else{
				$all_tracks = Track::find()->where(['track_date'=>$date,'shift'=>$shift])->all();
			}
		}
		foreach ($all_tracks as $value) {
			$tracks[$index]['track'] = $value;
			// $tracks[$index]['track']['meesenger'] = (int)$tracks[$index]['track']['meesenger'];
			$tracks[$index]['driver']=Messengers::findOne($value['meesenger']);
			// $tracks[$index]=$value;
			// $tracks[$index]['meesenger']=(int)$tracks[$index]['meesenger'];
			$static_lines = Staticlines::findOne(['line_number'=>$value->line_number]);
			$tracks[$index]['track_order'] = $static_lines->line_order;		
			$index++;
		}
		
		$drivers=Messengers::find()->all();
		Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
		return array('tracks'=>$tracks,'drivers'=>$drivers);
	}
	
	//get workers of specific track
	public function actionGetworkers()
	{
		$data=json_decode(file_get_contents("php://input"));
		$track_id=$data->track_id;
		
		//find all connections
		$connections=Track_for_worker::find()->where(['track_id'=>$track_id])->all();
		$workers=[];
		$index=0;
		foreach ($connections as $connection) {
			$workers[$index]['worker'] = Worker::findOne($connection['worker_id']);
			$workers[$index]['connection'] = $connection;
			if($workers[$index]['connection']->duration==0){
				$workers[$index]['connection']->duration = '';
			}
			$workers[$index]['address'] = Address::findOne(['worker_id'=>$connection['worker_id'],'is_current'=>1]);
			if($workers[$index]['address'] && $workers[$index]['address']->travel_time==0){
				$workers[$index]['address']->travel_time = '';
			}
			$index++;
		}
		Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
		return $workers;
	}
	
	public function actionUpdateworkerfortrack()
	{
		date_default_timezone_set("Asia/Jerusalem");
		$data = json_decode(file_get_contents("php://input"));
		$connection = $data->connection;
		$address = $data->address;
		
		$updated_connection = Track_for_worker::findOne(['track_id'=>$connection->track_id,'worker_id'=>$connection->worker_id]);
		
		//save details of connection
		$updated_connection->duration = $connection->duration;
		if(isset($connection->hour)){
			$updated_connection->hour = date('H:i:s',strtotime($connection->hour));
		}
		$updated_connection->save(false);
		
		$updated_address = Address::findOne(['worker_id'=>$connection->worker_id,'is_current'=>1]);
		if($updated_address){
			$updated_address->travel_time = $address->travel_time;
			$updated_address->save(false);
		}
		
		die('updated');
	}
	
	public function actionUpdate_worekrs()
	{
		date_default_timezone_set("Asia/Jerusalem");
		$data = json_decode(file_get_contents("php://input"));
		$track_id = $data->data->track->id;
		$workers = $data->data->workers;
		$trackModel = Track::findOne($track_id);
		$collecting = (strpos($trackModel->shift, 'איסוף') !== false)?1:0; 
		$orderby = $collecting==1?'hour':'track_order';
		//$all_workers = Track_for_worker::find()->where(['track_id'=>$track_id])->orderBy($orderby)->all();
		
		foreach ($workers as $key=>$worker) {
		//foreach ($all_workers as $connection) {
			$connection = Track_for_worker::findOne(['track_id'=>$track_id,'worker_id'=>$worker->worker->id]);
			$connection->duration = $worker->connection->duration;
			if(isset($worker->connection->hour)){
				$connection->hour = date('H:i:s',strtotime($worker->connection->hour));
			}
			$connection->save(FALSE);
			$address = Address::findOne(['worker_id'=>$worker->worker->id,'is_current'=>1]);
			if($address){
				$address->travel_time = $worker->address->travel_time;
				$address->save(FALSE);
			}
			
			/*----------------------------*/
			if((!$collecting==0&&$key==0)){
				$prev_track = $connection;
				continue;
			}
			if($key==0){
				$prev_track = $connection;
				continue;
			}
			$newDuration = $collecting?$prev_track->duration:$connection->duration;
			if($newDuration>0){
				$source = $prev_track->address;
				$destination = $connection->address;
				$distance = Distances::find()->where(['source'=>$source,'destination'=>$destination])->orWhere(['source'=>$destination,'destination'=>$source])->one();
				if($distance){
					$distance->duration = $newDuration;
					$distance->save(false);
				}
				else{
					$distance = new Distances();
					$distance->source = $source;
					$distance->destination = $destination;
					$distance->duration = $newDuration;
					$distance->save(false);
				}
			}
			$prev_track = $connection;
			/*----------------------------*/
		}
	}
	
	public function actionSavetrack()
	{
		$data = json_decode(file_get_contents("php://input"));
		$track_details=$data->track;
		
		$track=Track::findOne($track_details->id);
		$last_line=$track->combined_line;
		
		//save details of track
		$track->combined_line=$track_details->combined_line;
		$track->description=$track_details->description;
		$track->track_order=$track_details->track_order;
		$track->meesenger=$track_details->meesenger;
		$track->save(false);
		
		die('updated');		
	}
	
}
