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
    public function actionSend_message_to_workers()
    {
        $data = json_decode(file_get_contents("php://input"));//print_r($data);die();
        $workers = $data->data;
        $failed_sms = [];
        $phone_numbers = [];
        $ids = [];
        $warnings = '';
        foreach ($workers as $key => $worker) {
            if(!preg_match("/^0\d([\d]{0,1})([-]{0,1})\d{7}$/", $worker->phone)) {
                $warnings .= " מספר טלפון לא חוקי לעובד ".$worker->worker_name." ".$worker->phone;
            }else{
                $hospital_track = HospitalTrack::find()->where(['id'=>$worker->hospital_track_id])->one();
                if(!$hospital_track -> is_confirm){
                    if($worker->message_type == 1||$worker->message_type == "1"){
                        //שליחה רגילה למספרי הניהול
                        if($worker -> phone == '0527628585' || $worker -> phone == '0556790966'){
                           file_put_contents('testVoiceMessage.txt', null); 
                        }
                        array_push($phone_numbers,$worker -> phone);
                        array_push($ids,$worker->hospital_track_id);
                    }else if($worker->message_type == 2||$worker->message_type == "2"){
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
        $url = "http://dev.sayyes.co.il/transportation_test/server/api.php?ApiModule=runCampaign";
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
        $shift_arr = explode("-", $worker->shift);
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
        $day_in_week = $days[date('w', strtotime($worker->date))];
        if(strpos($shift,'לילה') !== false && $day_in_week == 'שבת')
            $day_in_week = 'מוצאי שבת';
        $msg = $worker->worker_name . "  שלום רב,\r\n"
        .$shift_type." למשמרת "
        .$shift." ביום ".$day_in_week." ב-".date("d.m.Y", strtotime($worker->date))
        ." נקבע לשעה ". date('H:i',strtotime($worker->hour))
        . ".\r\n לאישור השיב/י 11 ,לנציג המרכז הרפואי 035771149‏.";
        
        $result = Sms::sendSms($msg,$worker->phone);
        if($result->status == 'ok'){
            $this -> track_sent_update($worker->hospital_track_id); 
        }
        return $result;
    }
    public function track_sent_update($id)
    {
        $hospital_track = HospitalTrack::find()->where(['id'=>$id])->one();
        if($hospital_track){
            $hospital_track -> is_sms_sent = 1;
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
                $hospital_track = HospitalTrack::find()->where(['worker_id'=>$worker->id,'is_sms_sent'=>1])->orderBy('id desc')->one();
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
            $hospital_track = HospitalTrack::find()->where(['worker_id'=>$worker->id,'is_sms_sent'=>1])->orderBy('id desc')->one();//print_r($hospital_track);die();
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
            'ראשון',
            'שני',
            'שלישי',
            'רביעי',
            'חמישי',
            'שישי',
            'שֵבָּת',
        ];
        $days_in_month = [
            'ראשון',
            'שני',
            'שלישי',
            'רביעי',
            'חמישי',
            'שישי',
            'שביעי',
            'שמיני',
            'תשיעי',
            'עשירי',
        ];
        $months = [
            'יָנוּאָר',
            'פֶבְּרוּאָר',
            'מַרְץ',
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
        if(strpos($shift,'לילה') !== false && $day_in_week == 'שבת')
            $day_in_week = 'מוצאי שבת';
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
    

}
