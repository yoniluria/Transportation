<?php

namespace app\models;

use Yii;
//require_once 'func.inc';
//include func.inc;
/**
 * This is the model class for table "worker".
 *
 * @property integer $id

 */
class Shift extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'shift';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [ 
        [['id'], 'required'],
        [['id'],'integer'],
        [['name','regular_instructions'],'string'],
        [['hour'], 'safe']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name'=>'Name',
            'hour'=>'Hour',
            'regular_instructions'=>'Regular Instructions'
        ];
    }
}
