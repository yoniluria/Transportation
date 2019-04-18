<?php

namespace app\controllers;

use Yii;
use app\models\Staticlines;
use app\models\Track;
use app\models\Messengers;
use yii\data\ActiveDataProvider;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * StaticlinesController implements the CRUD actions for Staticlines model.
 */
class StaticlinesController extends Controller
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
     * Lists all Staticlines models.
     * @return mixed
     */
    public function actionIndex()
    {
        $dataProvider = new ActiveDataProvider([
            'query' => Staticlines::find(),
        ]);

        return $this->render('index', [
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Staticlines model.
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
     * Creates a new Staticlines model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new Staticlines();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->id]);
        } else {
            return $this->render('create', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing Staticlines model.
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
     * Deletes an existing Staticlines model.
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
     * Finds the Staticlines model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Staticlines the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Staticlines::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
	
	public function actionGet_all_static_lines()
	{
		$all_static_lines = array();
		$index = 0;
		$static_lines = Staticlines::find()->all();
		foreach ($static_lines as $static_line) {
			$all_static_lines[$index]['id'] = $static_line->id;
			$all_static_lines[$index]['line_number'] = $static_line->line_number;
			$all_static_lines[$index]['combined_line'] = $static_line->combined_line;
			$all_static_lines[$index]['description'] = $static_line->description;
			$all_static_lines[$index]['driver_id'] = $static_line->driver_id;
			$all_static_lines[$index]['driver'] = Messengers::findOne($static_line->driver_id);
			$all_static_lines[$index]['line_order'] = $static_line->line_order;
			$all_static_lines[$index]['is_active'] = $static_line->is_active;
			$all_static_lines[$index]['price'] = $static_line->price;
			$index++;
		}
		Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
		return $all_static_lines;
	}
	
	public function actionSave_static_line()
	{
		$data = json_decode(file_get_contents("php://input"));
		$data = $data->data;
		if(isset($data->id)){
			$model = Staticlines::findOne($data->id);
		}
		else{
			$model = new Staticlines();
		}
		if(isset($data->line_number)){
			$model->line_number = $data->line_number;
		}
		if(isset($data->combined_line)){
			$model->combined_line = $data->combined_line;
		}
		if(isset($data->description)){
			if($model->description!=$data->description){
				$tracks = Track::find()->where(['line_number'=>$model->line_number])->orWhere(['combined_line'=>$model->line_number])->all();
				if($tracks){
					foreach ($tracks as $track) {
						$track->description = $data->description;
						$track->save(FALSE);
					}
				}
			}
			$model->description = $data->description;
		}
		if(isset($data->driver_id)){
			$model->driver_id = $data->driver_id;
		}
		if(isset($data->line_order)){
			$model->line_order = $data->line_order;
		}
		$model->price = $data->price;
		if(isset($data->is_active)){
			$model->is_active = $data->is_active;
		}
		$model->save(false);
	}
	
	public function actionDelete_static_line()
	{
		$data = json_decode(file_get_contents("php://input"));
		$id = $data->line_id;
		Staticlines::deleteAll(['id'=>$id]);
	}	
	
}
