<?php

namespace app\models;

use Yii;
require_once 'func.inc';
//include func.inc;
/**
 * This is the model class for table "station".
 *
 * @property integer $id
 * @property integer $fk_order
 * @property string $attr
 * @property string $value

 */
class OrderDetails extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'orders_details';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['attr', 'fk_order'], 'required'],
            [['fk_order'], 'integer'],
            [['value', 'attr'], 'string', 'max' => 256],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'fk_order' => 'Order ID',
            'attr' => 'Attr',
            'value' => 'Value',
        ];
    }
	
}
