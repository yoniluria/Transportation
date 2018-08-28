<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "ordersProfiloption".
 *
 * @property integer $id
 * @property integer $order_id
 * @property integer $option_id
 * @property integer $value_id
 */
class OrdersProfiloption extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'ordersProfiloption';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['order_id', 'option_id', 'value_id'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'order_id' => 'Order ID',
            'option_id' => 'Option ID',
            'value_id' => 'Value ID',
        ];
    }
}
