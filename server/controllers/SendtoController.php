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
use app\models\Sms;
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
    //כדי לאפשר שליחת הודעת עובד למספרים  של הניהול(אמנון והמפתחים)
    //שומרים בקובץ 'testVoiceMessage.txt'
    //את המספר טלפון של העובד שרוצים למוע את ההודעה שלו
    //וכשמתקשרים מהמספרי ניהול  שולפים את הטלפון של העובד וכך ניתן לשמוע את  ההודעה שהעובד שומע 
    public function actionTest_message_to_worker()
    {
        $data = json_decode(file_get_contents("php://input"));
        file_put_contents('testVoiceMessage.txt', json_encode($data));
        return json_encode((object)['status'=>'ok','data'=>'הודעת טסט תושמע כעת בטלפון המנהל.']);
        //$voice_messages_result = $this -> send_voice_messages(['0527628585']);
        //$voice_messages_result = $this -> send_voice_messages(['0556790966']);
        // print_r(json_encode($voice_messages_result));die();
        
    }
    public function actionSend_message_to_worker($phone)
    {
        $voice_messages_result = $this -> send_voice_messages([$phone]);
        if($phone == '0527628585' || $phone == '0556790966'){
           file_put_contents('testVoiceMessage.txt', null); 
        }
        return json_encode($voice_messages_result);
    }

    
    public function actionSend_message_to_drivers()
    {
        date_default_timezone_set('Asia/jerusalem');
        $data = json_decode(file_get_contents("php://input"),true);//print_r($data);die();
        $tracks = $data['data'];
        $failed_sms = [];
        $phone_numbers = [];
        $ids = [];
        $warnings = '';
		$tracks = (array)$tracks;
        foreach ($tracks as $key => $track) {
            $shift_arr = explode("-", $track['track']['shift']);
            $shift = $shift_arr[0];
            $shift_type = $shift_arr[1];  
            /*$days = [
                'רִאשוֹן',
                'שֵנִי',
                'שְלִישִי',
                'רְבִיעִי',
                'חַמִישִי',
                'שִישִי',
                'שַבַּת',
            ];
            $day_in_week = $days[date('w', strtotime($track->track->track_date))];
            if(strpos($shift,'לילה') !== false && $day_in_week == 'שבת')
                $day_in_week = 'מוצאי שבת';
            $msg = $track->driver->name . " שלום רב,\r\n".
            $shift_type." למשמרת "
            .$shift." ביום ".$day_in_week." ב-".date("d.m.Y", strtotime($track->track->track_date))."\r\n";*/  
            $time = '';
			if($shift_type==' פיזור'){
				$shift_id = $track['track']['shift_id'];
				$shift_model = Shift::findOne($shift_id);
				$time = date('H:i',strtotime($shift_model->hour));
			}
            $msg = $shift_type.' '.$shift.' '.date("d.m", strtotime($track['track']['track_date'])).' '.$time;
			/*if(count($track->workers)<5){
				foreach ($track->workers as $key => $worker) {
	               $number = $key+1;
	               $msg.="\r\n".$number.".".$worker -> worker_name." ".$worker -> address."\r\n".$worker -> city." בשעה ". date('H:i',strtotime($worker->hour));
	            }
			}
			else{*/
				//$msg.=" ".date('H:i',strtotime($track->workers[0]->hour));
				$city = null;
				foreach ($track['workers'] as $key => $worker) {
	               $msg .= "\r\n".($key+1).".";
				   if($shift_type==' פיזור')
				   	   $msg.=$worker['worker_name']." ";
				   $msg.=$worker['address'];
	               if(isset($worker['city'])&&$city != $worker['city'])
	                   $msg.=" ".$worker['city'];
				   if($time=='')
                   	   $msg.=" ".date('H:i',strtotime($worker['hour']));
                   $city = isset($worker['city'])?$worker['city']:"";
	            }
			/*}*/
            $msg .= "\n"."לאישור השב 22.";
            
            $result = Sms::sendSms($msg,$track['driver']['phone']);
             if($result->status != 'ok'){
               array_push($failed_sms,(object)['worker'=>$worker,'msg'=>$result->msg]);
             }else{
                 $track = Track::findOne($track['track']['id']);
                 if($track){
                     $track -> is_sent = true;
                     $track -> message_datetime = date("Y-m-d H:i:s", time());
                     $track ->save(false);
                 }
             }
             
            
        }

        print_r(json_encode((object)['status'=>'ok','failed_sms'=>$failed_sms,'warnings'=>[]]));die(); 
        
    }

    public function actionDriver_sms_confirm()
    {
        //print_r($_GET);die();
        
        file_put_contents('sms_cnfirm.txt', json_encode(['phone'=>$_GET['phone'],'code'=>$_GET['code']]));
        // אם הנוסע השיב 11 יש לסמן אישור הגעה לנוסע הנ"ל(ע"פ מספר טלפון)"
        if($_GET['code']==22){
            $phone = $_GET['phone'];
            $driver = Messengers::find()->where(['phone'=>$phone])->one();
            if($driver){
                $track = Track::find()->where(['meesenger'=>$driver->id,'is_sent'=>1])->orderBy('message_datetime desc')->one();
                $track -> is_confirm = 1;
                if($track ->save(FALSE)){
                    $shift_arr = explode("-", $track->shift);
                    $shift = $shift_arr[0];
                    $shift_type = $shift_arr[1];
                    $msg = "אישורך ל"
                    .$shift_type." משמרת "
                    .$shift." ב-".date("d.m.Y", strtotime($track->track_date))
                    ." התקבל בהצלחה.";
                    //$result = Sms::sendSms($msg,$phone);
                        //מה שמדפיסים חוזר כתשובה ל-SMS
                        print_r($msg);die();
                }
                
            }
        }else{
            
        }
    }


    public function actionSend_message_to_workers()
    {
        $data = json_decode(file_get_contents("php://input"),true);   //print_r($data);die();
        $workers = $data['data'];
        $failed_sms = [];
        $phone_numbers = [];
        $ids = [];
        $warnings = '';
		$workers = (array)$workers;
        foreach ($workers as $key => $worker) {
            if(!preg_match("/^0\d([\d]{0,1})([-]{0,1})\d{7}$/", $worker['phone'])) {
                $warnings .= " מספר טלפון לא חוקי לעובד ".$worker['worker_name']." ".$worker['phone']; 
            }else{
                $hospital_track = HospitalTrack::find()->where(['id'=>$worker['hospital_track_id']])->one();
                if(!$hospital_track -> is_confirm){
                    
                    //message_type 1- voice message message_type 2- sms message
                    if(($worker['message_type'] == 1||$worker['message_type'] == "1")&&($worker['line_number'] !=90 || $worker['line_number'] != "90")){
                        //שליחה רגילה למספרי הניהול
                        if($worker['phone'] == '0527628585' || $worker['phone'] == '0556790966'){
                           file_put_contents('testVoiceMessage.txt', null); 
                        }
                        array_push($phone_numbers,$worker['phone']);
                        array_push($ids,$worker['hospital_track_id']);
                    }else if($worker['message_type'] == 2||$worker['message_type'] == "2"){
                        $result = $this -> send_sms_message($worker);
                        if($result->status != 'ok'){
                            array_push($failed_sms,(object)['worker'=>$worker,'msg'=>$result->msg]);
                        }
                    } 
                }
            }               
        }
        if(count($phone_numbers)){
            $voice_messages_result = $this -> send_voice_messages($phone_numbers);
             //print_r(json_encode($voice_messages_result));die();
            if($voice_messages_result -> status != "ok"){
                print_r(json_encode($voice_messages_result));die();
            }else{
               foreach ($ids as $key => $id) {
                   $this -> track_sent_update($id);  
               }
            }
        }
        
        print_r(json_encode((object)['status'=>'ok','failed_sms'=>$failed_sms,'failed_messages'=>'','warnings'=>$warnings]));die();
    }
    public function send_voice_messages($phone_numbers)
    {
        
        $phones_string = implode(':', $phone_numbers);//print_r($phones_string);die();
        $data = (object)['phones'=>$phones_string];
        $url = "http://dev.sayyes.co.il/transportation/server/api.php?ApiModule=runCampaign";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        //curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS,$data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response  = curl_exec($ch);
        curl_close($ch);
        //$data = file_get_contents("http://dev.sayyes.co.il/transportation_test/server/api.php?ApiModule=runCampaign&phones=".$phones_string);
        //print_r($response);die();
        return json_decode($response);
    }
    public function send_sms_message($worker)
    {
        $shift_arr = explode("-", $worker['shift']);
        $shift = $shift_arr[0];
        $shift_type = $shift_arr[1];
        $days = [
            'ראשון',
            'שני',
            'שלישי',
            'רביעי',
            'חמישי',
            'שישי',
            'שבת',
        ];
        $day_in_week = $days[date('w', strtotime($worker['date']))];
        if(strpos($shift,'לילה') !== false && $day_in_week == 'שבת')
            $day_in_week = 'מוצאי שבת';
        $msg = $worker['worker_name'] . " שלום רב,\r\n".
        (($worker['line_number'] ==90 || $worker['line_number'] == "90")?("נא אשר/י הגעתך למשמרת "): ($shift_type." למשמרת "))
        .$shift." ביום ".$day_in_week." ב-".date("d.m.Y", strtotime($worker['date'])).
        (($worker['line_number'] ==90 || $worker['line_number'] == "90")?'': (" נקבע לשעה ". date('H:i',strtotime($worker['hour']))))
        . ".\r\n לאישור השיב/י 11 ,לנציג המרכז הרפואי 035771149‏.";
        
        $result = Sms::sendSms($msg,$worker['phone']);
        if($result->status == 'ok'){
            $this -> track_sent_update($worker['hospital_track_id']); 
        }
        return $result;
    }
    public function track_sent_update($id)
    {
        $hospital_track = HospitalTrack::find()->where(['id'=>$id])->one();
        if($hospital_track){
            $hospital_track -> is_sms_sent = 1;
            $hospital_track -> message_datetime = date("Y-m-d H:i:s", time());
            $hospital_track ->save(FALSE);
        }
    }
    
    
    public function actionSms_confirm()
    {
        //print_r($_GET);die();
        
        file_put_contents('sms_cnfirm.txt', json_encode(['phone'=>$_GET['phone'],'code'=>$_GET['code']]));
        // אם הנוסע השיב 11 יש לסמן אישור הגעה לנוסע הנ"ל(ע"פ מספר טלפון)"
        if($_GET['code']==11){
            $phone = $_GET['phone'];
            $worker = Worker::find()->where(['phone'=>$phone])->one();
            if($worker){
                $hospital_track = HospitalTrack::find()->where(['worker_id'=>$worker->id,'is_sms_sent'=>1])->orderBy('message_datetime desc')->one();
                $hospital_track -> is_confirm = 1;
                if($hospital_track ->save(FALSE)){
                    $shift_arr = explode("-", $hospital_track->shift);
                    $shift = $shift_arr[0];
                    $shift_type = $shift_arr[1];
                    $msg = $hospital_track->worker_name . " שלום,\r\n"."אישורך ל"
                    .$shift_type." משמרת "
                    .$shift." ב-".date("d.m.Y", strtotime($hospital_track->date))
                    ." התקבל בהצלחה.";
                    //$result = Sms::sendSms($msg,$phone);
                        //מה שמדפיסים חוזר כתשובה ל-SMS
                        print_r($msg);die();
                }
                
            }
        }else{
            
        }
    }

    public function actionPhone_message()
    {
        $result = (object)['status'=>'','data'=>''];
        $hospital_track_id = null;
        $is_katvanit = false;
        $phone = $_GET['phone'];
        //כשמתקשרים מהמספרי ניהול  שולפים את הטלפון של העובד (באם קיים - אם לא תושמע ההודעה של הטלפון הנ"ל) וכך ניתן לשמוע את  ההודעה שהעובד שומע 
        if($phone == '0527628585' || $phone == '0556790966'){
            if($data = json_decode(file_get_contents('testVoiceMessage.txt'))){
                //print_r(file_get_contents('testVoiceMessage.txt'));die("jj!!!");
                $phone = $data -> phone;
                $hospital_track_id = $data -> hospital_track_id;
            }
            
        }
       
        $worker = Worker::find()->where(['phone'=>$phone])->one();
        if(!$worker){
            return json_encode((object)['status'=>'error','data'=>' שגיאה , עובד לא קיים במערכת. מספר טלפון.n-'.$phone]);//die();
        }
        if($hospital_track_id){
            $hospital_track = HospitalTrack::find()->where(['id'=>$hospital_track_id])->one();//print_r($hospital_track);die();
        }else{
            $hospital_track = HospitalTrack::find()->where(['worker_id'=>$worker->id,'is_sms_sent'=>1])->orderBy('message_datetime desc')->one();//print_r($hospital_track);die();
        }
        
        if(!$hospital_track){
            return json_encode((object)['status'=>'error','data'=>'שגיאה , לא נמצאו הודעות לטלפון זה.']);
            //print_r("read=t-hospital_trackשגיאה");die();
        }
        $tracks = Track::find()->where(['shift_id'=>$hospital_track->shift_id,'track_date'=>$hospital_track->date/*,'line_number'=>$hospital_track->combined_line*/])->all();
        //print_r($tracks);die();
        foreach ($tracks as $track) {
            $track_for_worker = Track_for_worker::find()->where(['track_id'=>$track->id,'worker_id'=>$worker->id])->one();
            if($track_for_worker){
                $hour = $track_for_worker->hour;
                $is_katvanit = $track->line_number == 90 || $track->line_number == "90"?true:false;
                break;
            }
        }
        if(!isset($hour)){
            return json_encode((object)['status'=>'error','data'=>'שגיאה , לא נמצא מסלול לטלפון זה.']);
           //print_r("read=t-שגיאהhour");die(); 
        }
        $days = [
            'רִאשוֹן',
            'שֵנִי',
            'שְלִישִי',
            'רְבִיעִי',
            'חָמִישִי',
            'שִישִי',
            'שַבַּתּ',
        ];
        $days_in_month = [
            'רִאשוֹן',
            'שֵנִי',
            'שְלִישִי',
            'רְבִיעִי',
            'חַמִישִי',
            'שִישִי',
            'שביעי',
            'שמיני',
            'תשיעי',
            'עשירי',
        ];
        $months = [
            'יָנוּאָר',
            'פֶבְּרוּאָר',
            'מֶרְץ',
            'אַפְּרִיל',
            'מַאי',
            'יוּנִי',
            'יוּלִי',
            'אוֹגוּסְט',
            'סֶפְּטֶמְבֶּר',
            'אוֹקְטוֹבֶּר',
            'נוֹבֶמְבֶּר',
            'דֵּצֶמְבֶּר'
        ];
        $day_in_week = $days[date('w', strtotime($hospital_track->date))];
        $day_date = date('d', strtotime($hospital_track->date));
        $day = $day_date>10?".n-".$day_date:".t-".$days_in_month[$day_date-1];
        $month = $months[date('n', strtotime($hospital_track->date))-1];
        $year = date('Y', strtotime($hospital_track->date));
        $hour = date('H', strtotime($track_for_worker->hour));
        $minutes = date('i', strtotime($track_for_worker->hour));
        $shift_arr = explode("-", $hospital_track->shift);
        $shift = $shift_arr[0];
        $shift_type = $shift_arr[1];

        if(strpos($shift,'לילה') !== false && $day_in_week == 'שַבַּתּ')
            $day_in_week = 'מוצאי שַבַּתּ';

        $data =(object)["name"=>$worker->name,"shift_type"=>$shift_type,"shift"=>$shift,"day_in_week"=>$day_in_week,"day"=>$day,"month" => $month,"year"=>$year,"hour"=>$hour,"minutes"=>$minutes,'is_katvanit'=>$is_katvanit];
        return json_encode((object)['status'=>'ok','data'=>$data]);
        //return json_encode($data);         
    }


    public function actionPhone_confirm()
    {
        file_put_contents('phone_cnfirm.txt', json_encode(['phone'=>$_GET['phone']]));
        $phone = $_GET['phone'];
        $worker = Worker::find()->where(['phone'=>$phone])->one();
        if(!$worker){
           print_r("שגיאה. לא נמצאו נתונים מתאימים למספר הטלפון!");die();
        }
        $hospital_track = HospitalTrack::find()->where(['worker_id'=>$worker->id,'is_sms_sent'=>1])->orderBy('id desc')->one();
        if(!$hospital_track){
           print_r("שגיאה. לא נמצאו נתונים מתאימים למספר הטלפון!");die();
        }
        $hospital_track -> is_confirm = 1;
        if($hospital_track ->save(FALSE)){
            $shift_arr = explode("-", $hospital_track->shift);
            $shift = $shift_arr[0];
            $shift_type = $shift_arr[1];
            $msg = "אישורך ל"
            .$shift_type." משמרת "
            .$shift//." ב-".date("d.m.Y", strtotime($hospital_track->date))
            ." התקבל בהצלחה";
            print_r($msg);die();
        }else{
           print_r("שגיאה. האישור נכשל,נסה שוב.");die();
        }
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
                    $hospital_track->is_sent = TRUE;
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
                    $track->is_sent = TRUE;
                    $track->save(false);
                }
            }           
        }
        echo $file;     
    }

     function sendEmail($email='',$subject='',$body='',$file=''){
        
                $mail = new PHPMailer();
    
                $mail->IsSMTP();
    
                $mail->setFrom('hasaot11@gmail.com','אמנון אהרון הסעות בע"מ');   
    
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

	public function getColumn($shift,$column,$day)
	{
		switch (true) {
				
				case ($shift=="בוקר - איסוף"||$shift=="בוקר - פיזור"):
					if($column!=""&&strpos($column, 'בוקר')===false){
						$col = $column==$day?"לילה":$column;
						$column = "בוקר-".$col;
						//$column = "בוקר-".$column;
					}		
					else if($column=="")
						$column = "בוקר";
					break;
					
				case ($shift=="צהריים - איסוף"||$shift=="צהריים - פיזור"):
					if($column!=""&&strpos($column, 'צהריים')===false){
						if(strpos($column, 'בוקר')&&strpos($column, 'לילה'))
							$column = "בוקר-צהריים-לילה";
						else if(strpos($column, 'בוקר'))
							$column = "בוקר-צהריים";
						else
							$column = "צהריים-לילה";
					}
						
					else if($column=="")
						$column = "צהריים";
					/*if($column!=""&&strpos($column, 'צהריים')===false){
						$column = "צהריים-".$column;
					}		
					else if($column=="")
						$column = "צהריים";*/
					break;
					
				case ($shift=="לילה - איסוף"||$shift=="לילה - פיזור"):
					if($column!=""&&strpos($column, 'לילה')===false&&(strpos($column, 'בוקר')!==false||strpos($column, 'צהריים')!==false))
						$column = $column."-לילה";
					else if($column=="")
						$column = $day;
					/*if($column!=""&&strpos($column, 'לילה')===false){
						$column = "לילה-".$column;
					}		
					else if($column=="")
						$column = "לילה";*/
					break;
					
				default:
					if($column!=""&&strpos($column, 'לילה')===false&&(strpos($column, 'בוקר')!==false||strpos($column, 'צהריים')!==false))
						$column = $column."-לילה";
					else if($column=="")
						$column = $day;
					/*if($column!=""&&strpos($column, 'לילה')===false){
						$column = "לילה-".$column;
					}		
					else if($column=="")
						$column = "לילה";*/
					break;
			}
			return $column;
	} 

	public function actionReport_one()
	{
		$data = json_decode(file_get_contents("php://input"));
        $date = $data->date;
		$shifts = $data->shifts;
		$driver = $data->driver;
		$date = date('Y-m-d H:i:s', strtotime($date)); 
		$daysArr = ['0'=>'א','1'=>'ב','2'=>'ג','3'=>'ד','4'=>'ה','5'=>'ו','6'=>'ז'];
		$numDays = date('t', strtotime($date));
		$columns = intval($numDays)+intval(6);
		$cur_month = date("m", strtotime(date("Y-m-d")));
		$con_date = "";
		$con_shift = "";
		$con_driver = "";
		if($cur_month==date("m", strtotime($date))){
			$con_date = " and track_date <= '".date("Y-m-d")."' ";
		}
		if(count($shifts)!=0&&!(count($shifts)==1&&$shifts[0]==0)){
			$con_shift = " and shift_id in (".implode(",",$shifts).") ";
		}
		if($driver!=""&&$driver==-1){
			$sql = "select id from messengers where name like '%דקר%'";
			$messengers=Yii::$app->db->createCommand($sql)->queryAll();
			$str = "";  
			foreach ($messengers as $key => $value) {
				$str.=$str==""?$value['id']:",".$value['id'];
			}
			$con_driver = " and meesenger in (".$str.") ";
		}
		else if($driver!=""&&$driver>0){
			$con_driver = " and meesenger = ".$driver." ";
		}
		$tableArr = [];   
		$countArr = [];   
		$sql="SELECT t.id , track_date as date , t.line_number , t.combined_line , region , count(tw.id) as cnt , shift
		from track t
		inner join track_for_worker tw on t.id=tw.track_id
		where MONTH(track_date) = '".date("m", strtotime($date))."' and YEAR(track_date) = '".date("Y", strtotime($date))."' ".$con_date." ".$con_shift." ".$con_driver."
		group by `combined_line` , track_date , shift_id
		order by line_number , track_date , shift_id";
		$allDates=Yii::$app->db->createCommand($sql)->queryAll();  
		foreach ($allDates as $key => $value) { // שורה בטבלה של ימים בחודש
			$day = date('j', strtotime($value["date"]));
			$index = intval($day)-intval(1);
			$tableArr[$index] = $this->getColumn($value["shift"],isset($tableArr[$index])&&$tableArr[$index]?$tableArr[$index]:"",$day);
		} 
		$tableTd1 = [];
		$tableNumCols = [];
		$daysLine = "";
		$newDate = date('Y-m-01 H:i:s', strtotime($date));
		for ($i=1; $i <= $numDays; $i++) {
			$col = isset($tableArr[intval($i)-intval(1)])?$tableArr[intval($i)-intval(1)]:"";
			$text = $col!=""?$col:$i;
			$n = explode('-', $text);
			$span = "";
			if(count($n)==3){
				$span = "colspan='3'";
			}
			else if(count($n)==2){
				$span = "colspan='2'";
			}
			array_push($tableTd1,"<td $span >".$text."</td>");
			$day =  date("w", strtotime($newDate));
			$daysLine.="<td $span >".$daysArr[$day]."</td>";
			$newDate = date('Y-m-d H:i:s', strtotime($newDate. ' + 1 days'));
			array_push($tableNumCols,$col!=""?count(explode("-", $col)):1); 
		}
		
		
		$table1="<table id='yourHtmTable' border='2px'>". // כותרת ושורה של תאריכים בטבלה
				"<tr>".
				"<td colspan='2' >בס''ד</td>".
				"</tr><tr>".
				'<td colspan="'.$columns.'" style="text-align: center;font-weight: bold;text-decoration: underline;font-size:20px;" >
				<img width="66" height="51" src="http://185.70.251.252/transportation/client/assets/img/logo.png">
				אמנון אהרון הסעות בע"מ'.'<br>
דו"ח מרוכז מספר 1 - מסלולי איסוף בימי החול בתאריכים:  28/2/19 - 1/2/19</td>'.
				"</tr><tr>";
		$table1.="<td rowspan='2' >מס' מסלול</td><td>תאריך ◄</td>";
		$newDate = date('Y-m-01 H:i:s', strtotime($date)); 
		/*for ($i=1; $i <= $numDays; $i++) {
			$day =  date("w", strtotime($newDate));
			$table1.="<td>".$daysArr[$day]."</td>";
			$newDate = date('Y-m-d H:i:s', strtotime($newDate. ' + 1 days'));
		}*/
		$table1.=$daysLine;
		//echo $table1;die();
		$table1.="<td rowspan='2' >תוספת</td><td rowspan='2' >כמות</td><td rowspan='2' >מחיר לא כולל מע''מ</td><td rowspan='2' >סה''כ מחיר לא כולל מע''מ</td></tr><tr><td>שם מסלול ▼</td>";
		
		$table2 = ""; // התוכן הפנימי של הטבלה
		$table2.="</tr>";
		$prevLine = 0;
		$prevDate = "";  
		$prevShift = "";
		for ($i=0; $i < count($allDates); $i++) {
			/*if($allDates[$i]["line_number"]==12)     
			break;*/
			$day =  date("d", strtotime($allDates[$i]["date"]));
			$numCols = $tableNumCols[intval($day)-intval(1)]; 
			if($allDates[$i]["line_number"]!=$prevLine){ // קו חדש
				
				
				if($prevLine!=0){ // קו חדש וקודם היה קו אחר
					/*----------------------------- מחוץ לאיפיון - בדיקה אם יש משמרות ריקות בתאריך אחרון שהיה -----------------------------*/
					if(strpos($prevShift, 'איסוף') !== false){
						$p_shift = str_replace(" - איסוף", "", $prevShift);
					}
					else {
						$p_shift = str_replace(" - פיזור", "", $prevShift);
					}
					$e = date('j', strtotime($prevDate));  
					$shiftText = $tableArr[intval($e)-intval(1)];
					$shiftArray = explode("-",$shiftText);					
					$num = $tableNumCols[intval($e)-intval(1)];
					if($num==3&&($prevShift=="בוקר - איסוף"||$prevShift=="בוקר - פיזור")){
						$table2.="<td></td><td></td>";
					}
					else if(($num==3&&($prevShift=="צהריים - איסוף"||$prevShift=="צהריים - פיזור"))||($num==2&&$p_shift!=$shiftArray[intval(count($shiftArray))-intval(1)])){
						$table2.="<td></td>";
					}
					/*----------------------------------------------------------*/
					if($numDays!=date('d', strtotime($prevDate))){ // השלמת עמודות לתאריכים בקו קודם
						$dif = intval($numDays) - intval(date('d', strtotime($prevDate)));
						if($dif>0){
							for ($a=date('d', strtotime($prevDate. ' + 1 days')); $a <= $numDays; $a++) {
								$num = $tableNumCols[intval($a)-intval(1)];
								for ($l=0; $l < $num; $l++) { 
									$table2.="<td></td>";
								}	 
							}
						}
					}
					$table2.="<td></td><td></td><td></td><td></td>";
					$table2.="</tr>";
				} 
				$prevShift = "";
				$prevAllShift = $allDates[$i]["shift"];
				$table2.="<tr><td>".$allDates[$i]["line_number"]."</td><td>".$allDates[$i]["region"]."</td><td>";
				/*----------------------------------------------------------*/
				if(date('d', strtotime($allDates[$i]["date"]))!='01'){ // השלמת עמודות לתאריכים בקו קודם
					$cur_day = date('j', strtotime($allDates[$i]["date"]));
					$dif = intval($cur_day) - intval(1);
					if($dif>0){
						for ($a=1; $a < $cur_day; $a++) {
							$num = $tableNumCols[intval($a)-intval(1)];
							for ($l=0; $l < $num; $l++) { 
								$table2.="<td></td>";
							}	 
						}
					}
				}
				/*----------------------------- מחוץ לאיפיון - בדיקה אם יש משמרות ריקות בתאריך נוכחי -----------------------------*/
				if(strpos($allDates[$i]["shift"], 'איסוף') !== false){
					$shift = str_replace(" - איסוף", "", $allDates[$i]["shift"]);  
				}
				else{
					$shift = str_replace(" - פיזור", "", $allDates[$i]["shift"]);  
				}
				$shiftText = $tableArr[intval($day)-intval(1)];
				$shiftArray = explode("-",$shiftText);
				
				
				if($shift==$shiftArray[0]){ // אם משמרת ראשונה שמוגדרת שווה למשמרת נוכחית
					//$table2.="<td>";
				}
				else if($prevShift==""&&($shift=="צהריים"||($shift=="לילה"&&($shiftText=="בוקר-לילה"||$shiftText=="צהריים-לילה")))){
					$table2.="</td><td>";
				}
				else if($shift=="לילה"&&$shiftText=="בוקר-צהריים-לילה"){
					$table2.="</td><td></td><td>";
				}
				/*----------------------------------------------------------*/
				$prevDate = "";
			}
			else{ // אם לא קו חדש
				if($allDates[$i]["date"]!=$prevDate){ // אם תאריך חדש
					/*----------------------------- מחוץ לאיפיון - בדיקה אם יש משמרות ריקות בתאריך אחרון שהיה -----------------------------*/
					if(strpos($prevShift, 'איסוף') !== false){
						$p_shift = str_replace(" - איסוף", "", $prevShift);
					}
					else{
						$p_shift = str_replace(" - פיזור", "", $prevShift);
					}
					$e = date('j', strtotime($prevDate));  
					$shiftText = $tableArr[intval($e)-intval(1)];
					$shiftArray = explode("-",$shiftText);					
					$num = $tableNumCols[intval($e)-intval(1)];
					if($num==3&&($prevShift=="בוקר - איסוף"||$prevShift=="בוקר - פיזור")){
						$table2.="<td></td><td></td>";
					}
					else if(($num==3&&($prevShift=="צהריים - איסוף"||$prevShift=="צהריים - פיזור"))||($num==2&&$p_shift!=$shiftArray[intval(count($shiftArray))-intval(1)])){
						$table2.="<td></td>";
					}
					/*----------------------------------------------------------*/
					if(intval($day)-intval(1)!=date('d', strtotime($prevDate))){ // אם ההפרש בין תאריך נוכחי לתאריך קודם הוא יותר מ-1
						$diff = intval($day) - intval(date('d', strtotime($prevDate)));
						$diff = intval($diff) - intval(1);
						if($diff>0){
							for ($j=date('d', strtotime($prevDate. ' + 1 days')); $j < $day; $j++) {
								$num = $tableNumCols[intval($j)-intval(1)];
								for ($l=0; $l < $num; $l++) { 
									$table2.="<td></td>";
								}					 
							}
						}
					}
				}
				if($allDates[$i]["date"]!=$prevDate) // אם תאריך חדש
				{
					$prevShift = "";
					if($prevDate!=""){ // אם היה תאריך קודם
						$table2.="</td>";
					} 
					
					/*------------------------------------------------------------------------------*/
					/*$l = intval($i) - intval(1); // הוספת משמרות קודמות כאשר לדוגמא בתאריך זה יש בוקר צהררים לילה אך בקו נוכחי יש רק לילה איסוף
					$day =  date("d", strtotime($allDates[$l]["date"]));
					$numCols = $tableNumCols[intval($day)-intval(1)];
					$shift = str_replace(" - איסוף", "", $allDates[$l]["shift"]);  
					$shiftText = $tableArr[intval($day)-intval(1)];
					$shiftArray = explode("-",$shiftText);
					if($shift=="לילה"){
						if($numCols==2)
							$table2.="<td></td>";
						else if($numCols==3)
							$table2.="<td></td><td></td>";
					}
					if($shift=="צהריים"&&($numCols==3||($numCols==2&&strpos($prevAllShift, 'בוקר') === false))){
						$table2.="<td></td>";
					}
					$prevAllShift = "";*/
					/*------------------------------------------------------------------------------*/	
							
					//$table2.="<td>";
					if($numCols==1){ // אם מספר משמרות בתאריך שווה ל-1
						$table2.="<td>";
					}
					else{
						if(strpos($allDates[$i]["shift"], 'איסוף') !== false){
							$shift = str_replace(" - איסוף", "", $allDates[$i]["shift"]);  
						}
						else{
							$shift = str_replace(" - פיזור", "", $allDates[$i]["shift"]);  
						}
						$shiftText = $tableArr[intval($day)-intval(1)];
						$shiftArray = explode("-",$shiftText);
						if($shift==$shiftArray[0]){ // אם משמרת ראשונה שמוגדרת שווה למשמרת נוכחית
							$table2.="<td>";
						}
						else if($prevShift==""&&($shift=="צהריים"||($shift=="לילה"&&($shiftText=="בוקר-לילה"||$shiftText=="צהריים-לילה")))){
							$table2.="<td></td><td>";
						}
						else {
							$table2.="<td></td><td></td><td>";
						}
					}
					
				}
				else if($allDates[$i]["shift"]!=$prevShift)
				{
					$table2.="</td>"; 
					$prevAllShift.=$allDates[$i]["shift"];
					if((($allDates[$i]["shift"]=='לילה - איסוף'&&$prevShift=="בוקר - איסוף")||($allDates[$i]["shift"]=='לילה - פיזור'&&$prevShift=="בוקר - פיזור"))&&$tableArr[intval($day)-intval(1)]=="בוקר-צהריים-לילה"){
						$table2.="<td></td>";
					}
					$table2.="<td>";
				}
			}

			/* בדיקה אם יש משמרות ריקות */
			/*$num = $tableNumCols[intval($day)-intval(1)];
			if($num==2&&$prevShift==""&&$prevShift!=$allDates[$i]["shift"]){
				$table2.="<td></td>";
			}
			else if($num==3&&(($prevShift=="בוקר - איסוף"&&$shift=="לילה")||($prevShift==""&&$shift=="צהריים"))){
				$table2.="<td></td>";
			}
			else if($num==3&&$prevShift==""&&$shift=="לילה"){
				$table2.="<td></td><td></td>";
			}
			if(!($allDates[$i]["shift"]==$prevShift&&$allDates[$i]["date"]==$prevDate))
				$table2.="<td>";*/
			$cnt = $allDates[$i]["cnt"]>4?'ג':'ק';
			//$table2.=$allDates[$i]["date"]!=$prevDate?"<td>":" ";
			$table2.=$cnt;	
			$prevLine = $allDates[$i]['line_number'];
			$prevDate = $allDates[$i]['date'];
			$prevShift =  $allDates[$i]['shift'];
			/*if($allDates[$i]['date']=='2019-03-03'){
				echo $table2; die();
			}*/
		}
		if($numDays!=date('d', strtotime($prevDate))){ // השלמת עמודות לתאריכים בקו קודם
			$dif = intval($numDays) - intval(date('d', strtotime($prevDate)));
			if($dif>0){
				for ($a=date('d', strtotime($prevDate)); $a < $numDays; $a++) {
					$num = $tableNumCols[intval($a)-intval(1)];
					for ($l=0; $l < $num; $l++) { 
						$table2.="<td></td>";
					}	 
				}
			}
		}
		$table2.="<td></td><td></td><td></td><td></td>";
		$table2.="</tr></table>";
		$table = implode("", $tableTd1);
		echo $table1.$table.$table2;   
		die();
	} 
    

}
