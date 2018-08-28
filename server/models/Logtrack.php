<?php

namespace app\models;

use Yii;


/**
 * This is the model class for table "track".
 *
 * @property integer $id
 * @property string $region
 * @property integer $status
 * @property string $track_date
 * @property integer $meesenger
 */
class Logtrack extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'logtrack';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            
            [['track_id'], 'integer'],
            [['lat','lng'], 'string', 'max' => 256],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID'
            
        ];
    }
    
   
     
}
