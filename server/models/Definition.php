<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "definition".
 *
 * @property integer $id
 * @property string $business_name
 * @property integer $user_id
 * @property string $user_name
 * @property string $company_id
 * @property double $time_destination
 * @property double $time_destination_load
 * @property double $remote_destination
 * @property integer $max_order
 * @property string $image_file
 * @property string $workday_start
 * @property string $workday_end
 */
class Definition extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'definition';
    }
    //,,

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['business_name', 'user_name', 'company_id', 'time_destination', 'time_destination_load', 'remote_destination', 'max_order', 'image_file'], 'safe'],
            [[ 'max_order'], 'integer'],
            [['time_destination','stop_time', 'time_destination_load', 'remote_destination','profil_id'], 'number'],
            [['business_name', 'user_name', 'company_id', 'image_file','email','phone','address','passwordd_user','lat_office','lng_office'], 'string', 'max' => 256],
            [['workday_start','workday_end'],'date']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'business_name' => 'Business Name',
            'user_id' => 'User ID',
            'user_name' => 'User Name',
            'company_id' => 'Company ID',
            'time_destination' => 'Time Destination',
            'time_destination_load' => 'Time Destination Load',
            'remote_destination' => 'Remote Destination',
            'max_order' => 'Max Order',
            'image_file' => 'Image File',
        ];
    }
}
