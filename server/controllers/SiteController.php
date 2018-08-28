<?php

namespace app\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;
use yii\filters\VerbFilter;
use app\models\LoginForm;
use app\models\ContactForm;

class SiteController extends Controller
{
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['logout'],
                'rules' => [
                    [
                        'actions' => ['logout'],
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
            ],
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'logout' => ['post'],
                    
                ],
            ],
        ];
    }

    public function actions()
    {
        return [
            'error' => [
                'class' => 'yii\web\ErrorAction',
            ],
            'captcha' => [
                'class' => 'yii\captcha\CaptchaAction',
                'fixedVerifyCode' => YII_ENV_TEST ? 'testme' : null,
            ],
        ];
    }
	public function beforeAction($action)
	{
		     
	      	if ($action->id == 'login' ||$action->id == 'about'||$action->id =='makeaouthkey') {
	            $this->enableCsrfValidation = false;
	        }
	    
	        return parent::beforeAction($action);
	}
    public function actionIndex()
    {
        return $this->render('index');
    }
    
    
      public function actionMakeaouthkey()
    {
     $model = new LoginForm(); 
     $sql="select * from routespe_routeSpeeduser.user ";
     $user=Yii::$app->db->createCommand($sql)->queryAll();
     foreach ($user as $key => $value) {
              $model->getAuthKey($value[id]);
     }
   
     
    }
   

    public function actionLogin()
    {
                   $data = json_decode(file_get_contents("php://input"))->data;
			       $pass=$data->password;
      			   $name=$data->username;
				 
	             // $sql="select * from routespe_routeSpeeduser.user where username='".$name."' and password='".$pass."'";
	         // $usern=defination::find()->where(user_name)->one();
             // $userp=defination::find()->where(passwordd_user)->one();
				   $sql="SELECT * FROM defination WHERE user_name =  '".$name."' AND passwordd_user =  '".$pass."'";
				   $model=Yii::$app->db->createCommand($sql)->queryOne();
                    
				   
			       if($model!=null){
			       	if(!$model['authKey']){
			       	  $login=new LoginForm(); 
					  $login->getAuthKey($model[id]);
					  $model=Yii::$app->db->createCommand($sql)->queryOne();
			       	}
					 print_r($model['authKey']);die();
                      
				   }
				   else{
				   	header("HTTP/1.1 401 Unauthorized");
				    //echo "error";
   					 exit;
				   }
               
       
    }
    public function actionLogindata()
    {
       print_r($_COOKIE[data]);die();
    }
   
     

    public function actionLogout()
    {
        Yii::$app->user->logout();

        return $this->goHome();
    }

    public function actionContact()
    {
        $model = new ContactForm();
        if ($model->load(Yii::$app->request->post()) && $model->contact(Yii::$app->params['adminEmail'])) {
            Yii::$app->session->setFlash('contactFormSubmitted');

            return $this->refresh();
        }
        return $this->render('contact', [
            'model' => $model,
        ]);
    }

    public function actionAbout()
    {
        print_r($_COOKIE[data]);die();
    }
}
