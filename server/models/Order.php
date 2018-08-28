<?php

namespace app\models;

use Yii;
require_once 'func.inc';
//include func.inc;
/**
 * This is the model class for table "station".
 *
 * @property integer $id
 * @property integer $track_id
 * @property integer $order_id
 * @property string $number
 * @property string $street
 * @property string $city
 * @property string $lat
 * @property string $lng
 */
class Order extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'order';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['track_id',  'number', 'street', 'city', 'lat', 'lng','status','num_order'], 'safe'],
            [['track_id','messenger'], 'integer'],
            [['number', 'street', 'city', 'lat', 'lng','customer_name','customer_id','phone','message','address','original_address'], 'string', 'max' => 256],
            [['price','stop_index','stop_stay','amount'],'number'],
            [['num_order'],'double'],
            [['remarks'],'string'],
            [['date','time_order','time'],'date'],
            [['time_set'],'boolean']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'track_id' => 'Track ID',
            'order_id' => 'Order ID',
            'number' => 'Number',
            'street' => 'Street',
            'city' => 'City',
            'lat' => 'Lat',
            'lng' => 'Lng',
        ];
    }
	public function send_sms($customer_phone,$customer_name,$link,$business_name)
	{
		 $begining = "שלום ".$customer_name.", \r\n";
		 $middle = "נציג של חברת ".$business_name." בדרך אליך. \r\n";
		 $end = "תוכל לצפות בזמן הגעה משוער בקישור: \r\n".$link;
		 $msg = $begining.''.$middle.''.$end;
		 //sendSms($msg, $customer_phone);
	  }
	
	public function splitByDate($stopsArr_general){
		$array_dates = [];
		$array_index = 0;
		$size = 0;
		for($array_index = 0;$size < count($stopsArr_general);$array_index++) {
			$datetime = new \DateTime($stopsArr_general[0]['time_order']);
			$date = $datetime->format('Y-m-d');
			$array_dates[$array_index] = [];
			for($i = 0; $i < count($stopsArr_general);$i++){
				if(!$stopsArr_general[$i]){
					continue;
				}
				
				$cur_datetime  = new \DateTime($stopsArr_general[$i]['time_order']);
				$cur_date = $cur_datetime->format('Y-m-d');
				
				if($date == $cur_date){
					$size++;
					array_push($array_dates[$array_index],$stopsArr_general[$i]);
					$stopsArr_general[$i] = null;
					
				}
				
			}
			
			$stopsArr_general = array_values($stopsArr_general); 
			
		}
	//print_r(json_encode($array_dates));die();
		return $array_dates;
		
	}
	
	public function split_toSubarrays($stopsArr_general)
	{
			$array_dates = [];
						$array_date_index = 0;
						$stopArr_index = 0;
						$index_unSet = 0;
			//exclude current route from stops track
			$timeNotSet = array_filter($stopsArr_general,function($stop){
				if($stop['time_set'] === false ){
					
					return true;
				}
				$index_unSet++;
				return false;
			});
			for($c = 0;$c < count($stopsArr_general);$c++){
				
				if($stopsArr_general[$c]['time_set']== false){
					
					unset($stopsArr_general[$c]);
				}
			}	
			
			$stopsArr_general = array_values($stopsArr_general);
			//print_r(json_encode($stopsArr_general));die();
			if(count($timeNotSet)){
				$array_dates[0] = $timeNotSet;
				$array_date_index++;
			}
			foreach ($stopsArr_general as $key => $value) {
				$inner_index = 0;
				$array_dates[$array_date_index][$inner_index] = $stopsArr_general[$stopArr_index];
				$inner_index++;
				$stopArr_index++;
				$datetime_1 = new \DateTime($stopsArr_general[$stopArr_index-1]['time_order']);
				$date_1 = $datetime_1->format('Y-m-d');
				$time_1 = $datetime_1->format('H');
				$m_1 = $datetime_1->format('i');
				if($stopArr_index < count($stopsArr_general)){
					$datetime_2 = new \DateTime($stopsArr_general[$stopArr_index]['time_order']);
					$date_2 = $datetime_2->format('Y-m-d');
					$time_2 = $datetime_2->format('H');
					$m_2 = $datetime_2->format('i');
				}
				else{
					break;
				}
				/*
				$next_datetime = $stopsArr_general[$stopArr_index]['time_order'];
								$current_datetime = $stopsArr_general[$stopArr_index]['time_order'];*/
				
				//print_r($stopsArr_general[$stopArr_index]);die();
				while($date_1 == $date_2 && $time_1 == $time_2&& $m_1==$m_2){
					$array_dates[$array_date_index][$inner_index] = $stopsArr_general[$stopArr_index];
					$inner_index++;
					$stopArr_index++;
					
					$datetime_1 = new \DateTime($stopsArr_general[$stopArr_index-1]['time_order']);
					$date_1 = $datetime_1->format('Y-m-d');
					$time_1 = $datetime_1->format('H');
					$m_1 = $datetime_1->format('m');
				
				if($stopArr_index+1 <= count($stopsArr_general)){
					$datetime_2 = new \DateTime($stopsArr_general[$stopArr_index]['time_order']);
					$date_2 = $datetime_2->format('Y-m-d');
					$time_2 = $datetime_2->format('H');
					$m_2 = $datetime_2->format('m');
					}
					else{
						break;
					}
				}
				$array_date_index++;
			}
		return $array_dates;
	}

	public function north_to_south($stopsArr,$stops_arr_size){
		for ($i = 0; $i <= $stops_arr_size; $i++) 
		{
			for($j = 0; $j <= ($stops_arr_size - $i);$j++){
			    if($j < ($stops_arr_size - 1)&& $stopsArr[$j]['lat'] > $stopsArr[$j+1]['lat']){
				  	$temp = $stopsArr[$j];
					$stopsArr[$j] = $stopsArr[$j+1];
					$stopsArr[$j+1] = $temp;
		   		 }
			}
		}
		return $stopsArr;
		
	}
}
