<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "shift".
 *
 * @property integer $id
 * @property string $name
 * @property string $hour
 * @property string $regular_instructions
 *
 * @property Track[] $tracks
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
            [['name', 'hour'], 'required'],
            [['hour'], 'safe'],
            [['name', 'regular_instructions'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
            'hour' => 'Hour',
            'regular_instructions' => 'Regular Instructions',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTracks()
    {
        return $this->hasMany(Track::className(), ['shift_id' => 'id']);
    }
}
