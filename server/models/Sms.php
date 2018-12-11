<?php

namespace app\models;

use Yii;

class Sms extends \yii\db\ActiveRecord {

    static function sendSms($msg,$to) {
        file_put_contents('sms_cnfirm.txt', $msg);//return;
        $uid = "3520";
        $un = "luria2";
        $charset = "utf-8";
        $from = "0559663051";
        sleep(1);
        /*
        $recipient = "michale@sayyes.co.il";
        
                // Set the email subject.
                $subject = "testtttt";
        
                // Build the email content.
                $email_content = $msg;
        
                // Build the email headers.
                $email_headers = "From: test <test@gmail.com>";
        
                // Send the email.
                if (mail($recipient, $subject, $email_content, $email_headers)) {
                }*/
        
        $result = self::mpSendSMS($uid, $un, $msg, $charset, $to, $from);
        return $result;
    }

    function mpSendSMS($uid, $un, $msg, $charset, $to, $from) {
        
        if (strlen($to) < 10){
            $result = (object)['status'=>'error','msg'=>'not a valid phone number'];
            return $result;
        }
            
        if (self::kasher($to)){
            $result = (object)['status'=>'error','msg'=>'you can not send sms to a kosher phone'];
            return $result;
        }
            

        $msg = urlencode($msg);

        $request = "http://www.micropay.co.il/ExtApi/ScheduleSms.php?get=1&charset=" . $charset . "&uid=" . $uid . "&un=" . $un . "&msglong=" . $msg . "&from=" . $from;

        $request .= "&list=" . $to;
        

        $curlSend = curl_init();

        curl_setopt($curlSend, CURLOPT_URL, $request);
        curl_setopt($curlSend, CURLOPT_RETURNTRANSFER, 1);

        $curlResult = curl_exec($curlSend);

        $curlStatus = curl_getinfo($curlSend, CURLINFO_HTTP_CODE);
        curl_close($curlSend);

        if ($curlStatus === 200) {
            $result = (object)['status'=>'ok','msg'=>'message succsessfully send.'];
            return $result;
        } else {
            $result = (object)['status'=>'error','msg'=>'message not send succsessfully'];
            return $result;
        }
    }

    function kasher($value) {
        $kash = substr($value, 0, 5);
        switch ($kash) {
            case '05041' :
            case '05271' :
            case '05276' :
            case '05484' :
            case '05485' :
            case '05331' :
            case '05832' :
            case '05567' :
                return true;
                break;
            default :
                break;
        }
        return false;
    }

}
