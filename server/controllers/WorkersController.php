<?php
namespace app\controllers;

use Yii;
use app\models\Order;
use app\models\OrderDetails;
use app\models\Track;
//use app\models\Worker;
use app\models\Address;
use app\models\Messengers;
use app\models\OrderSearch;
//use app\models\OrdersProfiloption;
use app\models\Definition;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use app\models\OrdersProfiloption;





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
      if ($action->id =='saveworker') {
        
            $this->enableCsrfValidation = false;
        }
    
        return parent::beforeAction($action);
    }
  
    public function actionSaveworker(){
        echo "yees";            $data = json_decode(file_get_contents("php://input"));
             die('here');
             $model= new Worker();
			 $model->save(false);
			 print_r(json_encode(($model->id)));die();
             $model->phone=$data->phone;
             $model->name=$data->name;
             $model->department=$data->department;
             die();

             foreach ($data->adresses as $key => $value) {
             $address=new Adsress();
               $address->lng=$data->adresses->lng;
               $adress->lat=$data->adresses->lat;
               $adress->worker_id=1;///ytiyt
               $adress->primary_address=1;///$data->adresses->primary_address;
               $adress->original_address=$data->adresses->original_address;
               $adress->address=$data->adresses->address;
               $adress->street=$data->adresses->street;
                $adress->street_number=$data->adresses->street_number;
                $adress->city=$data->adresses->city;
                $adress->country=$data->adresses->country;
               $address->save(false);
              }

         
            
             // $model->lat=$data->lat;
             // $model->lng=$data->lng;
             // $model->number=$data->address->components->streetNumber;
             // $model->street=$data->address->components->street;
             // $model->city=$data->address->components->city;
             // $model->address=$data->address->name;
             // $model->price=$data->price;
             // $model->stop_stay = $data->stop_stay;
             // $model->num_order=$data->num_order;
             // $model->amount=$data->amount;
             // $model->messenger=$meesenger->id;
             // $model->date=$data->date;
             // $model->time_set=$data->time_set;
             // date_default_timezone_set('Asia/Jerusalem');
            //echo  $model->date;die();
             //$model->time_order=date("Y-m-d H:i:s", strtotime($data->time_order));/**/
             
          
        if($model->save(false)){echo "yees";die();
            // $categories = json_decode(json_encode($data->categories));//print_r($categories);die();
            //foreach ($categories as $key => $value) {
           //  $value=json_decode(json_encode($value),JSON_NUMERIC_CHECK );//echo $model->id;die();//$r=intval($value['id']);print_r($r);die();
           //  $orders= new OrdersProfiloption();
            // $orders->order_id=$model->id;
             // $orders->option_id=$value['optionid'];
              //    $orders->value_id=$value['id'];
                //  $orders->save();
                
            //}
       
             /*$data=json_encode($model);*/
         print_r($model);die();   
        }
        else echo "error";die();
           
       }
       }