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
 * @property integer $sub_line
 * @property string $regular_instructions
 * @property tinyint $escort
 * @property timestamp $travel_time
 */
class Address extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'address';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['id','lat','lng','country', 'city', 'street', 'street_number','address','original_address','sub_line','regular_instructions','map_file'], 'string', 'max' => 256],
            [['worker_id','line_number','is_current','escort','primary_address','travel_time'],'integer'],
            [['combined_line'],'safe']
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
            'travel_time' => 'Travel Time'
        ];
    }
	
}
