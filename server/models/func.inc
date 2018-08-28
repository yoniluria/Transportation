<?php
/*----MAKRO----
	$s = "select * from XXX where XXX = $XXX";
	$x = mysql_query($s);
	while ($r = mysql_fetch_array($x)){
		$XXX = $r["XXX"];
	}
----MAKRO----*/



//-------------------------------------------------------------------
	function compare_date($exp_date,$todays_date){
		$exp_date = "2006-01-16";
		$todays_date = date("Y-m-d");
		$today = strtotime($todays_date);
		$exp = strtotime($exp_date);
		if ($exp > $today) {
			 $valid = "yes";
		} else {
			 $valid = "no";
		}
		return $valid;
	}

//-------------------------------------------------------------------
function getImg($path, $maxWidth, $maxHeight){

	if (file_exists($path)){

		//קבלת מידות
		list($width, $height, $type, $attr) = getimagesize($path);
		//פורפורציות
		$ratio = $height / $width;
		if ($height > $maxHeight) {
			$height = $maxHeight;
			$width = round($height / $ratio);
		}
		else if($width > $maxWidth) {
			$width = $maxWidth;
			$height = round($width * $ratio);
		}
		$picSize = " height=$height width=$width ";

		return " src='$path' width='$width' height='$height' ";
	}
}




//-------------------------------------------------------------------
function getDugStat($dug){
	return getVal('select dugmanit_status from dugmanit where dugmanitID = ' . $dug ,"dugmanit_status");
}

//-------------------------------------------------------------------
function getUserStat($user){
	return getVal('select user_status from user where userID = ' . $user ,"user_status");
}


//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
	function getVal($select,$fldName){
		//echo($select);
		$x = mysql_query($select);
		if($x){
			$row=mysql_fetch_array($x);
			//echo $row[$fldName];
			return $row[$fldName];
		}
		return null;
}



function setDugStat($dug,$stat){
	$s = " update dugmanit set dugmanit_status = $stat where dugmanitID = $dug ";
	//echo $s;
	$x = mysql_query($s) or die("ERROR: ".mysql_error());
}

function setUserStat($user,$stat){
	$s = " update user set user_status = $stat where userID = $user ";
	$x = mysql_query($s);
}



//-------------------------------------------------------------------
function cookLogon($id, $email, $shem, $harshaa){
	setcookie("goSokMS[id]", $id);
	setcookie("goSokMS[doal]", $email);
	setcookie("goSokMS[shem]", $shem);
	setcookie("goSokMS[harshaa]", $harshaa);

}

//-------------------------------------------------------------------
function cookLogout(){

	//סימון דוגמנית - עוזבת את האתר
	$dug_id = $_COOKIE['goSokMS']['id'];

	//if($_COOKIE['goSokMS']['harshaa'] == 2){ //דוגמנית
	//	$s = " update dugmanit set dugmanit_status = 0 where dugmanitID = $dug_id ";
	//	$x = mysql_query($s);
	//}

	//אם דוגמנית להוציא סטטוס
	$dug = getUser("D");
	if ($dug > 0) //מדובר בדוגמנית
		setDugStat($dug,10);

	setcookie("goSokMS[id]","");
	setcookie("goSokMS[shem]","");
	setcookie("goSokMS[doal]","");
	setcookie("goSokMS[harshaa]","");
	setcookie("goSokMS[aff]","");
	setcookie("goSokMS[bdk]","");
	unset($_COOKIE['goSokMS']['id']);
	unset($_COOKIE['goSokMS']['shem']);
	unset($_COOKIE['goSokMS']['doal']);
	unset($_COOKIE['goSokMS']['harshaa']);
	unset($_COOKIE['goSokMS']['aff']);
	unset($_COOKIE['goSokMS']['bdk']);
	unset($_COOKIE['goSokMS()']);
}


//-------------------------------------------------------------------------
function getPost($name){
	return $_POST[$name];
}



//-------------------------------------------------------------------------
function getGet($name){
	return $_GET[$name];
}



//-------------------------------------------------------------------------
function getCurrentFile(){
	$currentFile = $_SERVER["PHP_SELF"];
	$parts = Explode('/', $currentFile);
	$currPageName = $parts[count($parts) - 1];
	return $currPageName;
}



//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
	function bb($b){
		echo "<p>SSS $b EEE</p>";
	}
//-------------------------------------------------------------------------



//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
	function mysqlRows(){
		$result2 = mysql_query("SELECT FOUND_ROWS()");
		$total = mysql_fetch_row($result2);
		return $total[0];
	}
//-------------------------------------------------------------------------


//-------------------------------------------------------------------------



//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
	function getName($idVal,$idName,$name,$table){
		$s = "select * from $table where $idName=$idVal";
		//echo ($s);
		$x = mysql_query($s);
		if($x){
			$row=mysql_fetch_array($x);
			return $row[$name];
		}
		return null;
}

//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
// תחזיר הרשאה ליוזר לפרוייקט או FALSE
	function mursheProj($user_id,$proj_id){
		$s = "select max(perm_id) as perm from  proj2user where user_id = $user_id AND proj_id = $proj_id ";
		$x = mysql_query($s);
		if($x){
			$row=mysql_fetch_array($x);
			return $row["perm"];
		}
		return false;
	}
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
// תחזיר הרשאה ליוזר לפרוייקט או FALSE
	function mursheShlav($user_id,$proj_id,$mode){
		$s = "select perm_id from  proj2user where user_id = $user_id AND proj_id = $proj_id  AND perm_id = $mode ";
		$x = mysql_query($s);
		$num_rows = mysql_num_rows($x);
		if($num_rows){
			return true;
		}
		return false;
	}
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
	function isAdmin($harshaa){
		//echo "@@".$harshaa;
		if ($harshaa=="מנהל") return true;
		return false;
	}
//-------------------------------------------------------------------------


//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
// mysql_DATE_to_ddmmyy
function ddmmyy($dt){
	list($yy1, $mm1, $dd1) = explode('-', $dt);
	$yy1 = substr($yy1,-2);
	$date  = $dd1.".".$mm1.".".$yy1;
	return $date;
}



//--------------------------------------------------------------------
// מחזירה ערך לצקבוקס
function statusAppr($val){
	if ($val == 1) return "<font color=red><b>ממתין!</b> לאישור:</font>";
	if ($val == 2) return "<font color=blue>מאושר.</font>";
	return "<font color=black>שליחה לאישור:</font>";
}

//--------------------------------------------------------------------
// מחזירה ערך לצקבוקס
function statusApprNum($val){
	if ($val == 1) {
		return "1";
	}else if ($val == 2) {
		return "2";
	}else {
		return "0";
	}
}

//--------------------------------------------------------------------
// מחזירה ערך לצקבוקס
function isChecked($val){
	//return ($val > 0 ? "checked='yes' disabled='disabled'" : "");
}


//--------------------------------------------------------------------
// מאפשרת או מסתירה הערות בדיקה באתר
function bdika($tstOk, $s){
	if(1==1 && $tstOk>0){
		echo ("<p class=bdika>$s</p>");
	}
}



//--------------------------------------------------------------------
// מוסיף רווחים
function spc($i){
	for ($j = 0; $j < $i; $j++) {
		echo ("&nbsp;");
	}
}

function spc_get($i){
	$s = "";
	for ($j = 0; $j < $i; $j++) {
		 $s = $s ."&nbsp;";
	}
	return $s;
}
//--------------------------------------------------------------------




//--------------------------------------------------------------------
// כמה שורות יש בטבלה
function get_rows ($table_and_query) {
        $total = mysql_query("SELECT COUNT(*) FROM $table_and_query");
        $total = mysql_fetch_array($total);
        return $total[0];
}
//--------------------------------------------------------------------




//------ EMAIL FUNCTION --------------------------------------------------
//------ EMAIL FUNCTION --------------------------------------------------
//------ EMAIL FUNCTION --------------------------------------------------
//------ EMAIL FUNCTION --------------------------------------------------




//--------------------------------------------------------------------
function sendEmailAdmin($subject,$body){
	//return sendEmail(getName(1,"set_id","email_admin","settings"),$subject,$body);

	return sendEmail(getName(1,"set_id","email_admin","settings"),$subject,$body);
}


//--------------------------------------------------------------------
function getEmailTitle($kod){
switch ($kod){
		case 1001:
			return "ANAT. חדשה פעילות!";
	}
	return "";
}


//--------------------------------------------------------------------
function setEmailBody($body){
	$sBody = "
		<html dir=rtl>
		<head>
			<meta http-equiv='content-type' content='text/html; charset=utf-8;'>
		</head>
		<body style='font-family: arial;'>
		  <p>$body</p>
		</body>
		</html>
	";
	return $sBody;
}




//--------------------------------------------------------------------
// שליחת מיילים
function sendEmail($to,$subject,$body){
	return PHPSendEmail("anat@anat.com",$to,$subject,$body,$read);
}



//--------------------------------------------------------------------
// שליחת מיילים
function sendEmailBody($to,$subject,$body){
	return PHPSendEmail("anat@anat.com",$to,$subject,setEmailBody($body),$read);
}



function PHPSendEmail($from,$to,$subject,$body,$read)
{
	$headers  = "";

	$headers  = 'MIME-Version: 1.0' . "\r\n";
	$headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";

	if ($from!="") {$headers .= 'From: ANAT. <'.$from.'>'. "\r\n";}
	if ($read!="") {$headers .= 'Disposition-Notification-To: <'.$read.'>'."\r\n";}

	$result = mail($to,$subject,$body,$headers);
	return ($result)? "Sent O.K." : " ERROR : the Email was not sent";
}



//--------------------------------------------------------------------
function testEmail($subject,$body){
	return sendEmail(getName(1,"set_id","email_admin","settings"),"אם לסבתא גלגלים",$body);
}




//--------------------------------------------------------------------
function var_name (&$iVar, &$aDefinedVars)
    {
    foreach ($aDefinedVars as $k=>$v)
        $aDefinedVars_0[$k] = $v;

    $iVarSave = $iVar;
    $iVar     =!$iVar;

    $aDiffKeys = array_keys (array_diff_assoc ($aDefinedVars_0, $aDefinedVars));
    $iVar      = $iVarSave;

    return $aDiffKeys[0];
}


//--------------------------------------------------------------------
//-- function promo2 --
function promo2(
			$type,
			$width,
			$height,
			$promoUrl="",			//http://ec2-50-19-181-120.compute-1.amazonaws.com/vod/_definst_/[XXX].flv
			$backgroundUrl="", 		//http://ec2-50-19-181-120.compute-1.amazonaws.com/vod/_definst_/[XXX].jpg
			$images="", 			// images=http://www.google.com/image.png|10|10,http://www.google.com/image.png|15|15...
			$promoTime=10,
			$forwardUrl="",			// אם רלוונטי
			$message="",
			$playButtonUrl="", 		// אם רלוונטי
			$darken=0,
			$aaa=""){


	$prm = "";
	$prm .= (strlen($promoUrl)>3 ? "&promoUrl=$promoUrl" : "");



	//אם יש תמונה דיפולטית ולא קיבלנו תמונה מיוחדת
	if ($backgroundUrl == ""){
		if (strlen($promoUrl)>3){
			$backgroundUrl = "http://ec2-50-19-181-120.compute-1.amazonaws.com/vod/_definst_/$promoUrl.jpg";
		}
		else{
			$backgroundUrl = "http://gogolive.co.il/images/VideoGalleryBigImageEmpty.jpg";
		}
	}

	$prm .= (strlen($backgroundUrl)>0 ? "&backgroundUrl=$backgroundUrl" : "");

	$prm .= (strlen($images)>0 ? "&images=$images" : "");
	$prm .= (strlen($promoTime)>0 ? "&promoTime=$promoTime" : "");
	$prm .= (strlen($forwardUrl)>0 ? "&forwardUrl=$forwardUrl" : "");
	$prm .= (strlen($message)>0 ? "&message=$message" : "");
	$prm .= (strlen($playButtonUrl)>0 ? "&playButtonUrl=http://gogolive.co.il/images/play.png" : "");
	$prm .= (strlen($darken)>0 ? "&darken=$darken" : "");
	$prm = substr($prm,1);

	$swfFile = ($type==1 ? "MainPageVideoPlayerGG.swf" : "GalleryVideoPlayerGG.swf");

	$rt = '
		<!-- gadi flash -->
			 <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"
								width="'.$width.'" height="'.$height.'" id="myFlashMovie" align="middle">
				<param name="movie" value="swf/'.$swfFile.'" />
				<param name= "flashvars"  value="'.$prm.'" />
				<param name="wmode" value="opaque" />
			<!--[if !IE]>-->
				<object type="application/x-shockwave-flash" data="swf/'.$swfFile.'" width="'.$width.'" height="'.$height.'">
					<param name="movie" value="swf/'.$swfFile.'" />
					<param name="flashvars" value="'.$prm.'" />
					<param name="wmode" value="opaque" />
			<!--<![endif]-->

			<a href="http://www.adobe.com/go/getflash">
				<img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash player" />
			</a>

			<!--[if !IE]>-->
				</object>
			<!--<![endif]-->
			</object>
		<!-- gadi flash -->
	';
	return $rt;
}
//-- function promo2 --


//------------------------------------------------------------------------------------------
// הדוגמה של גדי  מ - 02.03.2013
// http://ec2-50-19-181-120.compute-1.amazonaws.com/vod/_definst_/model_xxx_xxxxxxx
//------------------------------------------------------------------------------------------

//-- function player --
function player(
			$width,
			$height,
			$promoUrl="",			//http://ec2-50-19-181-120.compute-1.amazonaws.com/vod/_definst_/[XXX].flv
			$backgroundUrl="", 		//http://ec2-50-19-181-120.compute-1.amazonaws.com/vod/_definst_/[XXX].jpg
			$aaa="",
			$media_sug="vid"){

	if($media_sug == "up_vid"){
		$promoUrl = "http://gogolive.co.il/uploads/vid/".$promoUrl;
	}
	else{
		$promoUrl = (strlen($promoUrl)>0 ? "http://ec2-50-19-181-120.compute-1.amazonaws.com/vod/_definst_/$promoUrl.flv" : "");
		//אם יש תמונה דיפולטית ולא קיבלנו תמונה מיוחדת
		if ($promoUrl!="" && $backgroundUrl=""){
			$backgroundUrl = "http://ec2-50-19-181-120.compute-1.amazonaws.com/vod/_definst_/$promoUrl.jpg";
		}
		else{
			$backgroundUrl = "http://gogolive.co.il/images/VideoGalleryBigImageEmpty.jpg";
		}
	}


	$rt = "
		<script type='text/javascript' src='js/jwplayer.js'></script>
		<div id='mediaspace'></div>
		<script type='text/javascript'>
		  jwplayer('mediaspace').setup({
			'flashplayer': 'swf/player.swf',
			'file': '$promoUrl',
			'controlbar': 'over',

			'allowscriptaccess': 'always',
			'allowfullscreen': 'true',

			'width': '$width',
			'height': '$height'
		  });
		</script>

	";
	//'autostart': true,
	//'repeat': 'always',
	//'image': '$backgroundUrl',
	//'duration': '34',
    //'controlbar': 'none',
	return $rt;
}
//-- function player --




//----------------------------------------------
function getNumRow($query){
//	echo "<p>***$query***</p>";
	$result = mysql_query($query);
	$nump = mysql_num_rows($result);
//	$nump = mysqlRows();
//	echo "<p>***$nump***</p>";
	return $nump;
}
//----------------------------------------------


//----------------------------------------------
//--- USE:
//--- $sPage = "select * from dugmanit $w order by dugmanit_status DESC ";
//--- $page = ( isset($_GET["page"]) ? $_GET["page"] : 1 );
//--- prePage($perpage=20, $page=1, $query);
//----------------------------------------------
function prePage($perpage=20, $page=1, $query){
//	$nump = getNumRow($query);
//	$num_row = $nump;
//	$nump = $nump / $perpage;
//	if(intval($nump) != $nump) $nump = intval($nump) + 1;        // האם יש שבר // אם כן, הוסף אחד והפוך למספר שלם
	$lim1 = ($page - 1) * $perpage;
	$query .= " LIMIT $lim1, $perpage";
//	echo($query);
	$x = mysql_query($query);
	return $x;
}
//----------------------------------------------



//----------------------------------------------
//--- postPage(20, $page, getNumRow($sPage));
//----------------------------------------------
function postPage($perpage=20, $page, $num_row,$morePrm=""){
	$nump = $num_row / $perpage;
	if(intval($nump) != $nump) $nump = intval($nump) + 1;        // האם יש שבר // אם כן, הוסף אחד והפוך למספר שלם
	echo "<div><center><b>$num_row תוצאות:</b> ";
	for($I = 1; $I<= $nump; $I++){

		$prn=1;

		if ($nump > 35 ){
			$prn=0;
			if($I<4)			$prn=1;
			if($I>($nump-4))	$prn=1;
			if ( $I > ( $page - 10 ) && $I < ( $page + 10 ) ) $prn=1;

		}

		if ($prn==0 && ($I==4 || $I==($nump-4) || $I==($page-10) || $I==($page+10) )){
			echo "...";
		}

		if ($prn==1){
			if($page != $I) {
				echo "&nbsp;<span><u><A HREF=" . $_SERVER['PHP_SELF'] . "?page=$I$morePrm>$I</A></u></span>&nbsp;";
			}
			else {
				echo "&nbsp;<span style='color:red;font-weight:bold;font-size:18px;'>". $I . "</span>&nbsp;";
			}
			//if($I != $perpage) echo " - ";
		}
	}

	echo ".</b></center></div>";
}
//----------------------------------------------


//-------------------------------------------------------------------------
	function getValName($table, $fldName, $fldVal, $fldReturn){
		$s = "select * from $table where $fldName=$fldVal";
		//echo ($s);
		$x = mysql_query($s);
		if($x){
			$row=mysql_fetch_array($x);
			return $row[$fldReturn];
		}
		return null;
}


	function buildSelect($tbl,$fld_id,$fld_name,$select_name,$select_tag="", $selected_id=-1, $where="",$select_tag2="",$onChange=""){
	/*
		$tbl,				:	שם הטבלה
		$fld_id,			:	שם השדה המזהה
		$fld_name,			:	שם השדה הטקסטי
		$select_name,		:	שם הסלקט שצריך להיות בFORM NAME
		$select_tag,		:	תוספת כמו STYLE
		$selected_id=-1,	:	הערך של השדה המסויים שהוא יבחר SELECTED
		$where="",		:	משפט הWHERE המלא כדי להציג רק חלק מהטבלה
	*/
		if (strlen($onChange)>0){
			$tag3 = <<<EOT
onchange="document.location.href='?id_city=' + this.value "
EOT;
		}

		$s = "select * from $tbl $where ";
		//echo $s;
		$x = mysql_query($s);
		echo "<select $tag3 $select_tag $select_tag2 name='$select_name'>";

		//if ($selected_id < 1){
		echo "<option value=-1>הכל</option>";
		//}


		while ($r = mysql_fetch_array($x)){
			$id = $r[$fld_id];

			$names = explode(",",$fld_name);
            foreach ( $names as $key_value ){
            	$name .= $r[$key_value] . ",  ";
            }

			//$name = $r[$fld_name];

			$sel = "";
			if ($selected_id == $id)
				$sel=' selected="selected" ';
			echo "<option $sel value='$id'>$name</option>";
			$name = "";
		}
		echo "</select>";
	}


//----------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------

function mpSendSMS($uid, $un, $msg, $charset, $to, $from, $date = "", $msgsm = "", $link = "")
{
	
	if (strlen($to)<10)return "NO NUMBER";
	if (kasher($to))return "KASHER";
	
    $msg = urlencode($msg);

    $request = "http://www.micropay.co.il/ExtApi/ScheduleSms.php?get=1&charset=".$charset."&uid=".$uid."&un=".$un."&msglong=".$msg."&from=".$from;

    /*if (strlen($to) > 8) */$request .= "&list=".$to;
    //else $request .= "&pid=".$to;

    if ($msgsm && $link) return "ERROR";
    else if ($msgsm)
    {
        $msgsm = urlencode($msgsm);
        $request .= "&msgsm=".$msgsm;
    }
    else if ($link)
    {
        $link = urlencode($link);
        $request .= "&link=".$link;
    }

    if ($date != "")
    {
        $DateValue = strtotime($date);
        $DateParts = getdate($DateValue);

        $request .= "&dy=".$DateParts["year"];
        $request .= "&dm=".$DateParts["mon"];
        $request .= "&dd=".$DateParts["mday"];
        $request .= "&dh=".$DateParts["hours"];
        $request .= "&di=".$DateParts["minutes"];
    }

    $curlSend = curl_init();

    curl_setopt($curlSend, CURLOPT_URL, $request);
    curl_setopt($curlSend, CURLOPT_RETURNTRANSFER, 1);

    $curlResult = curl_exec($curlSend);
	
    $curlStatus = curl_getinfo($curlSend, CURLINFO_HTTP_CODE);
    curl_close($curlSend);

    if ($curlStatus === 200) {
		//mysql_query("insert into smslog (fromtel,totel,msg,stat) values ('$from','$to','$msg','$curlStatus') ");
		file_put_contents('sms_ans5.txt', $curlResult);
		return $curlResult;
    }
    else {
    	//add funtion send to email
//		mysql_query("insert into smslog (fromtel,totel,msg,stat) values ('$from','$to','$msg','ERROR !!!') ");
    	return "ERROR";
	}


/*
	echo($request);
	$curlResult = file_get_contents($request);
    return $curlResult;
*/
}


function kasher($value){
	$kash = substr($value, 0, 5);
	switch ($kash) {
		case '05041':
		case '05271':
		case '05276':
		case '05484':
		case '05485':
		case '05331':
		case '05832':
		case '05567':	
			return true;			
			break;
		default:
			break;
	}
	return false;			
}


//-----------------------------------------------------------------------------
function sendSms($msg, $to, $msgsm = "", $link = ""){
	
	//echo "sendSms($msg,$to)";
	
	$uid = "3520";
	$un = "luria2";
	$charset = "utf-8";
	$date = date("Y-m-d H:i:s");
	//$from = "0557000982";
	$from = "0557000229";
	sleep(1);
	//echo "sms ok";
	
	$res = mpSendSMS($uid, $un, $msg, $charset, $to, $from, $date, $msgsm, $link);
	
	
}


//-----------------------------------------------------------------------------
/*function doEmail($from, $to, $subject, $body, $fromName = "PMN") {// שליחת מיילים
	//echo "<br>$to";

	$headers = 'MIME-Version: 1.0' . "\r\n";

	$headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";
	//$headers .= 'http-equiv="content-type" content="text/html; charset=UTF-8"';

	//$headers .= 'Content-type: text/html; charset=windows-1255' . "\r\n";
	//$headers .= 'From: ' . $from . "\r\n" .
	$headers .= 'From: ' . $fromName . ' <' . $from . '>' . "\r\n" . 'X-Mailer: PHP/' . phpversion();

	//'Reply-To: ' . "noReply@sayyes.co.il" . "\r\n" .
	//$headers  = "From: ".$from."\nContent-Type: text/html; charset=UTF-8";

	$mail_ok = mail($to, $subject, $body, $headers);
	return $mail_ok;
}*/


?>