<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "static_lines".
 *
 * @property integer $id
 * @property integer $line_number
 * @property string $description
 * @property integer $driver_id
 * @property boolean $is_active
 * @property integer $line_order
 */
class Staticlines extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'static_lines';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['line_number', 'driver_id', 'line_order'], 'integer'],
            [['is_active'], 'boolean'],
            [['description'], 'string', 'max' => 256],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'line_number' => 'Line Number',
            'description' => 'Description',
            'driver_id' => 'Driver ID',
            'is_active' => 'Is Active',
            'line_order' => 'Line Order',
        ];
    }
}
