<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "distances".
 *
 * @property string $source
 * @property string $destination
 * @property integer $duration
 */
class Distances extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'distances';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['source', 'destination'], 'required'],
            [['duration'], 'integer'],
            [['source', 'destination'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'source' => 'Source',
            'destination' => 'Destination',
            'duration' => 'Duration',
        ];
    }
}
