<?php
namespace app\controllers;

use Yii;
use app\models\Worker;
use app\models\Address;
use app\models\Shift;
use app\models\Definition;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use app\models\OrdersProfiloption;






class ShiftController extends Controller
{
    /**
     * @inheritdoc
     */
     
     
      public function beforeAction($action)
    {
       //file_put_contents('orderher.txt', '$data');
      if ($action->id =='saveshift' || $action->id =='getallshifts'|| $action->id =='deleteshift'|| $action->id =='updateshift') {
            $this->enableCsrfValidation = false;
        }
        return parent::beforeAction($action);
    }
    
    public function actionGetallshifts()
	{
		$shifts = Shift::find()->all();
		Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
		return $shifts;
	}
	
    public function actionDeleteshift(){
         $worker = Worker::findOne($_REQUEST['id']);
        if($worker){
            $worker->delete();
            echo "ok";
            die();
        }
        else {
            echo "error";die();
        }
    }
    
   // public function actionGetallshifts(){
        // $workers = Worker::find()->asArray()->all();
        // $arr=[];
        // foreach ($workers as $worker) {
           // $worker['addresses']=Address::find()->where(['worker_id'=>$worker[id]])->asArray()->all();
         // // print_r(json_encode($worker[addresses]));die(); 
         // array_push($arr,$worker);
        // }
        // print_r(json_encode($arr));die();   
   // }
   public function actionUpdateshift(){
     $data = json_decode(file_get_contents("php://input")); 
$worker = Worker::find()->where(['id'=>$data->id])->asArray()->one();
$worker->name=$data->name;
$worker->name=$data->phone;
$worker->name=$data->department;
$Worker->save();
}

    public function actionSaveshift(){
            $data = json_decode(file_get_contents("php://input"));    
                  
             $shift =  new Shift();
             $shift->name=$data->name;
             $shift->hour=$data->hour;
             $shift->fixed_guidelines=$data->fixed_guidelines;

        if($shift->save(false)){
         print_r($model);die();   
        }
        else {echo "error";die();}
           
       }
    
    
    
    
       }
