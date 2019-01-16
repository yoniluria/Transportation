<?php
namespace app\controllers;

use Yii;
use app\models\Worker;
use app\models\Shift;
use app\models\Address;
use app\models\Messengers;
use app\models\Track;
use app\models\Track_for_worker;
use app\models\Staticlines;
use app\models\HospitalTrack;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use app\models\OrdersProfiloption;

class SortController extends Controller
{
    /**
     * @inheritdoc
     */
     
     
      public function beforeAction($action)
    {
        $this->enableCsrfValidation = false;
        return parent::beforeAction($action);
    }
    
    //get tracks by date
    public function actionGettracksbydate()
    {
        
        $data = json_decode(file_get_contents("php://input"));
        $date = $data->date;
        $tracks = [];
        $problematic = [];
        $index = 0;
        $morning_shift = 2; // id of morning shift from `shifts` table
        $tomorrow = date('Y-m-d',strtotime($date. '+1 days'));
        //$all_tracks = Track::find()->where(['track_date'=>$date])->andWhere(['<>','shift_id',$morning_shift])->orWhere(['shift_id'=>$morning_shift,'track_date'=>$tomorrow])->all();
        $all_tracks = Track::find()->where(['track_date'=>$date])->all(); 
        foreach ($all_tracks as $track) {
             
                $tracks[$index]['isHospital'] = 2;
                $tracks[$index]['track'] = $track;
                $tracks[$index]['driver'] = Messengers::findOne($track->meesenger);
                $connections = Track_for_worker::find()->where(['track_id'=>$track->id])->all();
                $tracks[$index]['workers'] = array();
                foreach ($connections as $connection) {
                    try{
                        $curr_worker = Worker::findOne($connection->worker_id);
                        $worker = new \stdClass();
                        $worker->regular_instructions = $curr_worker->regular_instructions;
                        $worker->hour = $connection->hour;
                        $worker->name = $curr_worker->name;
                        $worker->phone = $curr_worker->phone;
                        $worker->worker_name = $curr_worker->name;
                        $worker->department = $curr_worker->department;
                        $worker->track_instructions = $connection->instructions;
                        // $address = Address::findOne(['worker_id'=>$connection->worker_id,'is_current'=>1]);
                        $address = Address::findOne(['worker_id'=>$connection->worker_id,'original_address'=>$connection->address]);
                        if($address){
                            // $worker->address = $address->original_address;
                            $worker->img = $address->map_file?$address->id.'/'.$address->map_file:null;
                            $worker->instructions = $address->regular_instructions;
                        }
                        else{
                            $worker->instructions = "";
                        }
                        $worker->address = $connection->address;
                        if($worker->address && strchr($worker->address, ",")){
                            $exploded_address = explode(",", $worker->address);
                            $worker->address = $exploded_address[0];
                            $worker->city = $exploded_address[1];
                        }
                        $worker->track_order = $connection->track_order;
                        $tracks[$index]['workers'][] = $worker;
                    }   
                    catch (ErrorException $e){
                        $problematic [] = $worker;
                    }
                }
                $static_line = Staticlines::findOne(['line_number'=>$track->combined_line]);
                $tracks[$index]['track_order'] = $static_line?$static_line->line_order:null;
                if(count($connections)!=0){
                    $index++;
                }
            
        } 
        //$hospital_tracks = HospitalTrack::find()->select(['*'])->where(['date'=>$date])->andWhere(['<>','shift_id',$morning_shift])->orWhere(['shift_id'=>$morning_shift,'date'=>$tomorrow])->groupBy(['combined_line','shift_id'])->all();
        $hospital_tracks = HospitalTrack::find()->select(['*'])->where(['date'=>$date])->groupBy(['combined_line','shift_id'])->all();
        foreach ($hospital_tracks as $hospital_track) {
           
                $tracks[$index]['isHospital'] = 1;
                $tracks[$index]['track'] = $hospital_track;
                $tracks[$index]['workers'] = array();
                //$workers = HospitalTrack::find()->where(['combined_line'=>$hospital_track['combined_line'],'region'=>$hospital_track['region'],'description'=>$hospital_track['description'],'shift_id'=>$hospital_track['shift_id'],'date'=>$hospital_track['date']])->all();
                $workers = HospitalTrack::find()->where(['combined_line'=>$hospital_track['combined_line'],'shift_id'=>$hospital_track['shift_id'],'date'=>$hospital_track['date']])->all();
                foreach ($workers as $worker) {
                     try{
                        $w = Worker::findOne($worker -> worker_id);
                        $curr_worker = new \stdClass();
                        $curr_worker->hospital_track_id = $worker->id;
                        // $tracks_of_line_number = Track::find()->where(['line_number'=>$worker->combined_line,'shift_id'=>$worker->shift_id,'track_date'=>$worker->date])->all();
                        // for adding track after load xlsx
                        $tracks_of_line_number = Track::find()->where(['shift_id'=>$worker->shift_id,'track_date'=>$worker->date])->all();
                        foreach ($tracks_of_line_number as $track_of_line_number) {
                            $curr_track = Track_for_worker::findOne(['track_id'=>$track_of_line_number->id,'worker_id'=>$worker->worker_id]);
                            if($curr_track){
                                $curr_worker->hour = $curr_track->hour;
                                $curr_worker->track_order = $curr_track->track_order;
                                $curr_worker->track_instructions = $curr_track->instructions;
                                break;
                            }
                        }
                        $curr_worker->worker_name = $worker->worker_name;
                        $curr_worker->worker_id = $worker->worker_id;
                        $curr_worker->address = $worker->address;
                        if($curr_worker->address && strchr($curr_worker->address, ",")){
                            $address = Address::findOne(['worker_id'=>$worker->worker_id,'original_address'=>$curr_worker->address]);
                            if($address){
                                $curr_worker->instructions = $address->regular_instructions;
                            }
                            else{
                                $curr_worker->instructions = "";
                            }
                            $exploded_address = explode(",", $worker->address);
                            $curr_worker->address = $exploded_address[0];
                            $curr_worker->city = $exploded_address[1];
                        }
                        $curr_worker->phone = $w->phone;
                        $curr_worker->department = $worker->department;
                        $curr_worker->is_confirm = $worker->is_confirm;
                        //$w = Worker::findOne($worker -> worker_id);
                        $curr_worker->message_type = isset($w->message_type)?$w->message_type:1;
                        $curr_worker->is_sent_message = $worker->is_sms_sent;
                        $tracks[$index]['workers'][] = $curr_worker;
                    }   
                    catch (ErrorException $e){
                        $problematic [] = $curr_worker;
                    }
                }
                $static_line = Staticlines::findOne(['line_number'=>$hospital_track['combined_line']]);
                $tracks[$index]['track_order'] = $static_line?$static_line->line_order:null;
                $index++;
            
        }

        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        return (object)['tracks'=>$tracks,'problematic'=>$problematic];     
    }
    
}
