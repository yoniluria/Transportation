<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "expenses".
 *
 * @property integer $id
 * @property integer $expenses
 * @property integer $income
 * @property integer $daily
 * @property integer $messeger
 * @property string $datetime
 * @property integer $order_id
 */
class Expenses extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'expenses';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['expensess', 'messeger'], 'required'],
            [['income', 'daily', 'messeger', 'order_id','track_id'], 'integer'],
            [['datetime', 'order_id', 'income', 'daily','track_id'], 'safe'],
            [['expensess'],'number'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'expenses' => 'Expenses',
            'income' => 'Income',
            'daily' => 'Daily',
            'messeger' => 'Messeger',
            'datetime' => 'Datetime',
            'order_id' => 'Order ID',
        ];
    }
}
