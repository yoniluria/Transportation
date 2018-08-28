<?php

namespace app\controllers;

use Yii;
use app\models\Shift;
use app\models\ShiftSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * ShiftController implements the CRUD actions for Shift model.
 */
class ShiftController extends Controller
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
       //file_put_contents('orderher.txt', '$data');
      if ($action->id =='saveshift' || $action->id =='getallshifts'|| $action->id =='deleteshift'|| $action->id =='updateshift') {
            $this->enableCsrfValidation = false;
        }
        return parent::beforeAction($action);
    }
    /**
     * Lists all Shift models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new ShiftSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Shift model.
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
     * Creates a new Shift model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new Shift();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->id]);
        } else {
            return $this->render('create', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing Shift model.
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
     * Deletes an existing Shift model.
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
     * Finds the Shift model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Shift the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Shift::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }

	 public function actionGetallshifts()
	{
		$shifts = Shift::find()->select(['id','name' ,'TIME_FORMAT(hour, "%H:%i") as hour' ,'regular_instructions'])->all();
		$shifts_names = [];
		foreach ($shifts as $shift) {
			$shifts_names[] = $shift->name;
		}
		Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
		return array('shifts'=>$shifts,'shifts_names'=>$shifts_names);		
		// return $shifts;
	}
	
	    public function actionSaveshift(){
            $data = json_decode(file_get_contents("php://input")); 
			$data = get_object_vars($data);
			if(isset($data['id'])&&$data['id'])
            $shift = $this->findModel($data['id']);  
			else    
             $shift =  new Shift();
             $shift->name=$data['name'];
             $shift->hour=$data['hour'];
             $shift->regular_instructions=$data['regular_instructions'];

        if($shift->save(false)){
         echo "ok";die();   
        }
        else {echo "error";die();}
           
       }
		
	public function actionDeleteshift()
    {
    	$data = json_decode(file_get_contents("php://input")); 
		$data = get_object_vars($data);
		$id=$data['id'];
    	$connection = Yii::$app->db;
		$sql="DELETE FROM shift WHERE `id`=".$id;
		$transaction = $connection->beginTransaction();
		try {
		    $connection->createCommand($sql)->execute();
		    // ... executing other SQL statements ...
		    $transaction->commit();
			echo "ok";die();
		} 
		catch (Exception $e) {
		    $transaction->rollBack();
			echo "error 1";die();
		}
		catch (yii\db\Exception $e) {
		    $transaction->rollBack();
			echo "error 2";die();
		}
		catch (yii\db\IntegrityException $e) {
				    $transaction->rollBack();
					echo "error 3";die();
				}
    }
    
}
