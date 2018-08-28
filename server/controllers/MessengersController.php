<?php

namespace app\controllers;

use Yii;
use app\models\Messengers;
use app\models\Track;
use yii\data\ActiveDataProvider;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * MessengersController implements the CRUD actions for Messengers model.
 */
class MessengersController extends Controller
{
    /**
     * @inheritdoc
     */
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

  public function beforeAction($action)
  {     
        $this->enableCsrfValidation = false;
		header("Access-Control-Allow-Origin: *");
		header("Access-Control-Allow-Methods: DELETE, POST, GET");
		header('Access-Control-Allow-Headers: X-CSRF-Token');
        return parent::beforeAction($action);
  }
  
    //רשימת נהגים
    public function actionGetallmessengers()
    {
         $drivers=Messengers::find()->all();
		 Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
		 return $drivers;
    }  
	
   // save new driver
   public function actionSavemessenger()
   {
   		date_default_timezone_set("Asia/Jerusalem");
   		$data = json_decode(file_get_contents("php://input"));
		if(isset($data->id)){
			$driver = Messengers::findOne($data->id);
		}
		else {
			$driver = new Messengers();
		}
		if(isset($data->name)){
			$driver->name = $data->name;
		}
		if(isset($data->email)){
			$driver->email = $data->email;
		}
		if(isset($data->phone)){
			$driver->phone = $data->phone;
		}
		if(isset($data->address)){
			$driver->address = $data->address;
		}
		if(isset($data->lat)){
			$driver->lat = $data->lat;
		}
		if(isset($data->lng)){
			$driver->lng = $data->lng;
		}
		if(isset($data->license_number)){
			$driver->license_number = $data->license_number;
		}
		if(isset($data->car_type)){
			$driver->car_type = $data->car_type;
		}
		if(isset($data->places_number)){
			$driver->places_number = $data->places_number;
		}
		if(isset($data->customer_price)){
			$driver->customer_price = $data->customer_price;
		}
		if(isset($data->driver_price)){
			$driver->driver_price = $data->driver_price;
		}
		if(isset($data->driving_license_expire)){
			$driver->driving_license_expire = date('Y-m-d',strtotime($data->driving_license_expire));
		}
		if(isset($data->car_license_expire)){
			$driver->car_license_expire = date('Y-m-d',strtotime($data->car_license_expire));
		}
		if(isset($data->insurance_expire)){
			$driver->insurance_expire = date('Y-m-d',strtotime($data->insurance_expire));
		}
		if(isset($data->activation_license_expire)){
			$driver->activation_license_expire = date('Y-m-d',strtotime($data->activation_license_expire));
		}
		if(isset($data->safety_expire)){
			$driver->safety_expire = date('Y-m-d',strtotime($data->safety_expire));
		}
		if(isset($data->winter_test_expire)){
			$driver->winter_test_expire = date('Y-m-d',strtotime($data->winter_test_expire));
		}
		if(isset($data->more_expire)){
			$driver->more_expire = date('Y-m-d',strtotime($data->more_expire));
		}
		if(isset($data->is_usher)){
			$driver->is_usher = $data->is_usher;
		}
		if($driver->save(false))
	   		die('saved');
		die('error');
   }	
   
   //מחיקת נהג
    public function actionDeletemessenger()
    {
    	$data = json_decode(file_get_contents("php://input"));
		$id=$data->data;
    	$messenger=Messengers::find()->where(['id'=>$id])->one();
		$tracks=Track::find()->where(['meesenger'=>$id])->all();
		foreach ($tracks as $track) {
			$track->meesenger=null;
			$track->save(false);
		}
		$messenger->delete();
		die('deleted');
    }   

    /**
     * Lists all Messengers models.
     * @return mixed
     */
    public function actionIndex()
    {
        $dataProvider = new ActiveDataProvider([
            'query' => Messengers::find(),
        ]);

        return $this->render('index', [
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Messengers model.
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
     * Creates a new Messengers model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new Messengers();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->id]);
        } else {
            return $this->render('create', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing Messengers model.
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
     * Deletes an existing Messengers model.
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
     * Finds the Messengers model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Messengers the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Messengers::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
