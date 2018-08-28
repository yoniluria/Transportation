<?php

namespace app\controllers;

use Yii;
use app\models\Distances;
use app\models\DistancesSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * DistancesController implements the CRUD actions for Distances model.
 */
class DistancesController extends Controller
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
        return parent::beforeAction($action);
    }

    /**
     * Lists all Distances models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new DistancesSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Distances model.
     * @param string $source
     * @param string $destination
     * @return mixed
     */
    public function actionView($source, $destination)
    {
        return $this->render('view', [
            'model' => $this->findModel($source, $destination),
        ]);
    }

    /**
     * Creates a new Distances model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new Distances();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'source' => $model->source, 'destination' => $model->destination]);
        } else {
            return $this->render('create', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing Distances model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param string $source
     * @param string $destination
     * @return mixed
     */
    public function actionUpdate($source, $destination)
    {
        $model = $this->findModel($source, $destination);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'source' => $model->source, 'destination' => $model->destination]);
        } else {
            return $this->render('update', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Deletes an existing Distances model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param string $source
     * @param string $destination
     * @return mixed
     */
    public function actionDelete($source, $destination)
    {
        $this->findModel($source, $destination)->delete();

        return $this->redirect(['index']);
    }
	
	public function actionGet_distances(){
		$data = json_decode(file_get_contents("php://input"));
		$search = $data->search;
		if($search!=''){
			$search = str_replace("'","''",$search);    
			$distances = Distances::find()->where("source like '%$search%' or destination like '%$search%'")->asArray()->all();
		}
		else{
			$distances = [];
		}
		print_r(json_encode($distances));die();
	}
	
	public function actionSet_duration(){
		$data = json_decode(file_get_contents("php://input"));
		$distance = $data->distance;
		$model = Distances::find()->where(['source'=>$distance->source,'destination'=>$distance->destination])->one();
		if($model){
			$model->duration = $distance->duration;
			$model->save();
		}
		echo '1';die();
	}

    /**
     * Finds the Distances model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param string $source
     * @param string $destination
     * @return Distances the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($source, $destination)
    {
        if (($model = Distances::findOne(['source' => $source, 'destination' => $destination])) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
