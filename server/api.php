<?php 
error_reporting(E_ALL);
ini_set('display_errors', 1);

switch ($_REQUEST['ApiModule']) {

    case 'runCampaign' :
       runCampaign();
        break;
    case 'getMessage' :
       getMessage2();
        break;        
}
function isLoginSessionExpired() {
    $login_session_duration = 10; 
    $current_time = time(); 
    if(isset($_SESSION['loggedin_time']) and isset($_SESSION["token"])){  
            if(((time() - $_SESSION['loggedin_time']) > $login_session_duration)){ 
                return true; 
            }
        }else{
           return true;  
        } 
    return false;
}

function login(){
     $login=CallAPI('GET',"https://www.call2all.co.il/ym/api/Login?username=0772220126&password=8585");//48gfsJHLIKJ54utgrjpw48243p");
        if($login->responseStatus=='OK'){
            $_SESSION['loggedin_time'] = time();
           return $login->token;
        }else{
         return ;   
        } 
}

function getToken(){
  session_start();
    if(isLoginSessionExpired()){    
      $_SESSION['token']=login();
       
    }
     return $_SESSION['token'];  
}


function CallAPI($method, $url, $data = false)
{
    
    $url.="&remoteip=".$_SERVER['REMOTE_ADDR'];
        //print_r($url);die();
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response);
}
 function runCampaign(){
     //print_r(json_encode((object)['status'=>'error','msg'=>'שגיאה!']));die(); 
    $phones = $_REQUEST['phones'];
    //$phones="0556790966:0527114280";
    //print_r($phones);die();
    //print_r(json_encode((object)['status'=>'ok','msg'=>$phones]));die(); 
    $templateId="1";

    $token=login();   
    $templates=CallAPI('GET', "https://www.call2all.co.il/ym/api/GetTemplates?token=".$token);
  
   if($templates->responseStatus=='OK'){
        $templateId=$templates->templates[((int)$templateId)-1]->templateId;
       $respone=CallAPI('GET', "https://www.call2all.co.il/ym/api/RunCampaign?token=".$token."&templateId=".$templateId."&phones=".$phones);
       
       if($respone->responseStatus == "OK"){
            //return true; 
            print_r(json_encode((object)['status'=>'ok','msg'=>'messages successfully sent']));die(); 
       }else{
           if($respone->messageCode == 103)
           {
               //emptyUnits();
              //echo "אין מספיק יחידות לקמפיין " ;
              print_r(json_encode((object)['status'=>'error','msg'=>'אין מספיק יחידות לקמפיין']));die(); 
           }
          
           //return false;
           print_r(json_encode((object)['status'=>'error','msg'=>'שגיאה!']));die(); 
       }
      // file_put_contents('api.log', serialize($upload_phone_lists));
   }
}


function getMessage(){
    $approve=isset($_REQUEST['approve'])?$_REQUEST['approve']:"";
    $number=$_REQUEST['ApiPhone'];
    $name="שרה";
    $day="ששה עסר";
    $month="לדֶצֶמבֶר";
    $year=2018;
    $hour=16;
    $minutes=54;
    //echo 'id_list_message=f-001';
    
    switch ($approve) {
        case 1:
           approve($number);
            break; 
        case 2:
            print_r('read=t-'.$name.'.t-שלום רב , להלן הודעה מהמרכז רפואי מעיני הישועה בני ברק, איסוף למשמרת בוקר ב '.$day.$month.'.n-'.$year.'.t-נקבע לשעה.n-'.$hour.'.n-'.$minutes.'.t-  לאישור הַקֶש 1, לשמיעה חוזרת של ההודעה הַקֶש 2, לנציג המרכז הרפואי הַקֶש 3=approve,,1,1,7,No,yes,no');
         break;
        case 3:
            print_r('routing=035771149‏');die();
            break;
         default:
            print_r('read=t-'.$name.'.t-שלום רב , להלן הודעה מהמרכז רפואי מעיני הישועה בני ברק, איסוף למשמרת בוקר ב '.$day.$month.'.n-'.$year.'.t-נקבע לשעה.n-'.$hour.'.n-'.$minutes.'.t-  לאישור הַקֶש 1, לשמיעה חוזרת של ההודעה הַקֶש 2, לנציג המרכז הרפואי הַקֶש 3=approve,,1,1,7,No,yes,no');
            die();   
         break;  
    }   
}
function getMessage2(){
    $approve = isset($_REQUEST['approve'])?$_REQUEST['approve']:"";
    $phone = $_REQUEST['ApiPhone'];


    $data = file_get_contents('http://dev.sayyes.co.il/transportation/server/web/index.php?r=sendto/phone_message&phone='.$phone);
    $data = json_decode($data);//print_r($data);die();
    if($data -> status != 'ok'){
        
        $msg ='id_list_message=t-'.$data -> data.'&go_to_folder=hangup';//echo $msg;die();
    }else{
       $data = $data -> data;
       $msg ='read=t-'.$data->name.'.t-'.'שלום רב'.'.t-'.'  להלן הודעה מהמרכז רפואי מעיני הישועה בני ברק'.'.t-'
        .$data->shift_type." למשמרת ".$data->shift." ביום ".$data->day_in_week.' '
        .$data->day.".t- ל".$data->month.'.n-'.$data->year.'.t-נקבע לשעה.n-'.$data->hour.($data->minutes!='00'?('.t-וְ.n-'.$data->minutes.'.t- דקות '):'').'.t-  לאישור הַקֶש 1, לשמיעה חוזרת של ההודעה הַקֶש 2, לנציג המרכז הרפואי הַקֶש 3=approve,,1,1,7,No,yes,no';
       
       /*$msg ='read=t-'.$data->name.'.t-שלום רב, להלן הודעה מהמרכז רפואי מעיני הישועה בני ברק, '
        .$data->shift_type." למשמרת ".$data->shift." ביום ".$data->day_in_week
        .$data->day.".t- ל".$data->month.'.n-'.$data->year.'.t-נקבע לשעה.n-'.$data->hour.'.n-'.$data->minutes.'.t-  לאישור הַקֶש 1, לשמיעה חוזרת של ההודעה הַקֶש 2, לנציג המרכז הרפואי הַקֶש 3=approve,,1,1,7,No,yes,no';
        */
    }
    
    switch ($approve) {
        case 1:
           approve($phone);
            break; 
        case 2:
            print_r($msg);
         break;
        case 3:
            print_r('routing=035771149‏');die();
            break;
         default:
            print_r($msg);   
         break;  
    }
    
}
function approve($phone){
    $data = file_get_contents('http://dev.sayyes.co.il/transportation/server/web/index.php?r=sendto/phone_confirm&phone='.$phone);
    echo 'id_list_message=t-האִישׁור התקבל בהצלחה&go_to_folder=hangup';//.$data; 
    return; 
}
?>