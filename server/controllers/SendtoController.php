<?php
namespace app\controllers;

use Yii;
use app\models\Worker;
use app\models\Shift;
use app\models\Address;
use app\models\Definitions;
use app\models\Messengers;
use app\models\HospitalTrack;
use app\models\Track;
use app\models\Track_for_worker;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use app\models\OrdersProfiloption;
use PHPMailer\PHPMailer\PHPMailer;


class SendtoController extends Controller {
	/**
	 * @inheritdoc
	 */

	public function beforeAction($action) {
		$this -> enableCsrfValidation = false;
		return parent::beforeAction($action);
	}

	public function actionGet_hospital_email()
	{
		$data = json_decode(file_get_contents("php://input"));
		$name = $data->name;
		$definition = Definitions::findOne(['name'=>$name]);
		$email = '';
		if($definition){
			$email = $definition->value;
		}
		Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
		return $email;
	}

	public function actionSearchtracks()
	{
		$data = json_decode(file_get_contents("php://input"));
		$date = $data->date;
		$shift = $data->shift;
		// $shift = "";
		$tracks = [];
		if($shift!=""){ 
			$all_tracks = Track::find()->where(['track_date'=>$date,'shift'=>$shift])->all();
		}
		else{
			$all_tracks = Track::find()->where(['track_date'=>$date])->all();
		}
		$index = 0;
		foreach ($all_tracks as $track) {
			$tracks[$index]['track'] = $track;
			if($shift){
				$connections = Track_for_worker::find()->where(['track_id'=>$track->id])->all();
			}
			else {
				$connections = Track_for_worker::find()->where(['track_id'=>$track->id])->all();
			}

			$i = 0;
			foreach ($connections as $connection) {
				$tracks[$index]['workers'][$i]['worker'] = Worker::findOne($connection->worker_id);
				$tracks[$index]['workers'][$i]['address'] = Address::findOne(['worker_id'=>$connection->worker_id,'primary_address'=>1]);
				$i++;
			}
			$tracks[$index]['driver'] = Messengers::findOne($track->meesenger);
			$index++;
		}
		Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
		return $tracks;
	}

	public function actionSend_email_to_hospital()
	{
		$dir = '../../tracks/';
		$i = 0;
		if (is_dir($dir)) {
		    if ($dh = opendir($dir)) {
		    	$now = time(); 
		        while (($file = readdir($dh)) !== false) {
		        	if (strpos($file, '.html') !== false) {
						$your_date = str_replace('.html', '', $file);
						$datediff = $now - $your_date;
						$days = round($datediff / (60 * 60 * 24));
						if($days>=7){
							unlink('../../tracks/'.$file);
						}
					}
		        }
		        closedir($dh);
		    }
		}
		$data = json_decode(file_get_contents("php://input"));
		$date = $data->date;
		$tracks_ids = $data->tracks_ids;
		$shiftName = $data->shiftName;
		$ushers = isset($data->ushers)?$data->ushers:'';
		$is_to_usher = $data->is_to_usher;
		$html = $data->data;
		$hospital_email = isset($data->hospital_email)?$data->hospital_email:'';
		$from='<test@hamefits.com>';
		//$to='<'.$hospital_email.'>';
		$to=$hospital_email;
		$headers = "From: $from\r\nReply-to: $to";
		$headers .= "MIME-Version: 1.0\r\n";
		$headers .= "Content-Type: text/html; charset=utf-8\r\n";
		$title = 'מסלולים לתאריך ';
		$title.= $date;
		$file = time().'.html';
		$name_file = '../../tracks/'.$file;
		$link = " ";   
		$html = '<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<link rel="stylesheet" href="http://dev.sayyes.co.il/transportation/client/assets/css/bootstrap.min.css">
					<link rel="stylesheet" href="http://dev.sayyes.co.il/transportation/client/assets/css/bootstrap-rtl.css">
					<link rel="stylesheet" href="http://dev.sayyes.co.il/transportation/client/assets/css/style.css">
				</head>
				<body>'.
				$html.
				'<style>
					body{
						padding-right: 0;
					}
				</style>	
				<script>
					window.onload = function() {
					  	window.print();
					};
				</script>
				<style>
				table#t01{
					 width:100%;
					 display: inline-block;
					 float: right;
					 margin-top: 8px;
				     margin-right: 8px;
				}
				
				 table.t02{
				 	width: 100%;
				 	background-color: #e0e0e0;
				
				 }
				
				table.t03{
					width: 100%;
				}
				.divtitle{
					background-color: #a7a7a7;
					height:100px;
				    width: 100%;
				    margin-top: 8px;
				    margin-right: 8px;
				    padding-right: 8px;
				    font-size: 18px;
				    padding-top: 8px;
				}
					
				.divsortby{
				    margin-right: 8px;
				    margin-top: 8px;
				}
					
				.input{
					margin-right: 10px;
					display: inline;
					width: 200px;
					}
					
				.input_select{
					margin-right: 7px !important;
				    margin-top: 0px !important;
				    width: 30px; 
				    height: 30px;
				    margin-left: 10px !important;
				}	
				
				.input_check{
				    width: 25px; 
				    height: 25px;
				    display: inline-block;
				    float: right;
				}	
					
				.label_sendto{
					margin-right: 20px;
					display: inline;
				}
				
				.label_checkbox{
					font-weight: 500;
				    display: inline-block;
				    padding-right: 5px;
				}
				
				.sort_by_name{
					display: inline;
					width: 250px;
					margin-right: 10px;
				}
				</style>
				</body>
				</html>';
		file_put_contents($name_file,$html);
		
		if($is_to_usher){
			foreach ($ushers as $usher) {
				if(isset($usher->email)&&$usher->email!=''){    
					//$to='<'.$usher->email.'>';
					$to=$usher->email;
					$headers = "From: $from\r\nReply-to: $to";
					$headers .= "MIME-Version: 1.0\r\n";
					$headers .= "Content-Type: text/html; charset=utf-8\r\n";					
					//mail($to, $title, $link, $headers);
					$title = $usher->name.' - '.$shiftName.' - '.$date;
					$this->sendEmail($to,$title,$link,"../../tracks/".$file);
					
				}
			}
		}
		else{
			//mail($to, $title, $link, $headers);
			$title = 'מעיני הישועה'.' - '.$shiftName.' - '.$date;
			$this->sendEmail($to,$title,$link,"../../tracks/".$file);
		}
		
		if($tracks_ids){
			foreach ($tracks_ids as $track_id) {
				$hospital_track = HospitalTrack::findOne($track_id);
				if($hospital_track){
					$hospital_track->isSent = TRUE;
					$hospital_track->save(false);
				}
			}
		}
		
		
		//$folder = 'http://185.70.251.252/transportation/tracks/';
	}
	
	public function actionSend_email()
	{
		$dir = '../../tracks/';
		$i = 0;
		if (is_dir($dir)) {
		    if ($dh = opendir($dir)) {
		    	$now = time(); 
		        while (($file = readdir($dh)) !== false) {
		        	if (strpos($file, '.html') !== false) {
						$your_date = str_replace('.html', '', $file);
						$datediff = $now - $your_date;
						$days = round($datediff / (60 * 60 * 24));
						if($days>=7){
							unlink('../../tracks/'.$file);
						}
					}
		        }
		        closedir($dh);
		    }
		}
		$data = json_decode(file_get_contents("php://input"));
		$date = $data->date;
		$is_to_usher = $data->is_to_usher;
		$ushers = $data->ushers;
		$driver_id = $data->driver_id;
		$tracks_ids = $data->tracks_ids;
		$shiftName = $data->shiftName;
		$html = $data->data;
		$from='<test@hamefits.com>';
		$title = 'מסלולים לתאריך ';
		$title.= $date;
		
		$file = time().'.html';
		$name_file = '../../tracks/'.$file;
		$link = " ";   
		$html = '<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<link rel="stylesheet" href="http://dev.sayyes.co.il/transportation/client/assets/css/bootstrap.min.css">
					<link rel="stylesheet" href="http://dev.sayyes.co.il/transportation/client/assets/css/bootstrap-rtl.css">
					<link rel="stylesheet" href="http://dev.sayyes.co.il/transportation/client/assets/css/style.css">
				</head>
				<body>'.
				$html.
				'<style>
					body{
						padding-right: 0;
					}
				</style>	
				<script>
					window.onload = function() {
					  	window.print();
					};
				</script>
				<style>
				table#t01{
					 width:100%;
					 display: inline-block;
					 float: right;
					 margin-top: 8px;
				     margin-right: 8px;
				}
				
				 table.t02{
				 	width: 100%;
				 	background-color: #e0e0e0;
				
				 }
				
				table.t03{
					width: 100%;
				}
				.divtitle{
					background-color: #a7a7a7;
					height:100px;
				    width: 100%;
				    margin-top: 8px;
				    margin-right: 8px;
				    padding-right: 8px;
				    font-size: 18px;
				    padding-top: 8px;
				}
					
				.divsortby{
				    margin-right: 8px;
				    margin-top: 8px;
				}
					
				.input{
					margin-right: 10px;
					display: inline;
					width: 200px;
					}
					
				.input_select{
					margin-right: 7px !important;
				    margin-top: 0px !important;
				    width: 30px; 
				    height: 30px;
				    margin-left: 10px !important;
				}	
				
				.input_check{
				    width: 25px; 
				    height: 25px;
				    display: inline-block;
				    float: right;
				}	
					
				.label_sendto{
					margin-right: 20px;
					display: inline;
				}
				
				.label_checkbox{
					font-weight: 500;
				    display: inline-block;
				    padding-right: 5px;
				}
				
				.sort_by_name{
					display: inline;
					width: 250px;
					margin-right: 10px;
				}
				</style>
				</body>
				</html>';
		file_put_contents($name_file,$html);
		
		
		if($is_to_usher){
			foreach ($ushers as $usher) {
				if(isset($usher->email)&&$usher->email!=''){
					//$to='<'.$usher->email.'>';
					$to=$usher->email;
					$headers = "From: $from\r\nReply-to: $to";
					$headers .= "MIME-Version: 1.0\r\n";
					$headers .= "Content-Type: text/html; charset=utf-8\r\n";	
					$title = $usher->name.' - '.$shiftName.' - '.$date;				
					//mail($to, $title, $link, $headers);
					$this->sendEmail($to,$title,$link,"../../tracks/".$file);
				}
			}
		}
		else{
			$driver = Messengers::findOne($driver_id);
			if(isset($driver->email)&&$driver->email!=''){
				//$to='<'.$driver->email.'>';
				$to=$driver->email;
				$headers = "From: $from\r\nReply-to: $to";
				$headers .= "MIME-Version: 1.0\r\n";
				$headers .= "Content-Type: text/html; charset=utf-8\r\n";
				$title = $driver->name.' - '.$shiftName.' - '.$date;
				//mail($to, $title, $link, $headers);
				$this->sendEmail($to,$title,$link,"../../tracks/".$file);
			}
		}
		if(count($ushers) || $driver_id!=null){
			foreach ($tracks_ids as $track_id) {
				$track = Track::findOne($track_id);
				if($track){
					$track->isSent = TRUE;
					$track->save(false);
				}
			}			
		}
		echo $file;		
	}

	 function sendEmail($email='',$subject='',$body='',$file=''){
		
				$mail = new PHPMailer();
	
				$mail->IsSMTP();
	
				$mail->setFrom('hasaot11@gmail.com','מערכת ניהול');
	
				$mail->addReplyTo('hasaot11@gmail.com');
	
				$mail->addAddress($email);
	
				$mail->Subject =  $subject; 
	
				$mail->isHTML(true);
				
				$mail->addAttachment($file);
	
				$mail->Body = $body;
	
				$mail->Host = "smtp.gmail.com";   
	
				$mail->Port = 587;
	
				$mail->Protocol="mail";
	
				//$mail->SMTPDebug = 4;
	
				$mail->SMTPAuth = true;
	
				$mail->SMTPSecure = "tls";
	
				$mail->Username = 'hasaot11@gmail.com';
	
				$mail->Password = '0527628585';
	
				$mail->CharSet = 'UTF-8';
	
				//$mail->AddAttachment($path,$file->file_name);
	
				//$mail->SMTPDebug = 2;
	
				$mail_sent=$mail->send();
	      
	}	

}
