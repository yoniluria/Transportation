<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "track_for_worker".
 *
 * @property integer $id
 * @property string $line
 * @property string $shift_name
 * @property string $shift_date
 * @property integer $track_id
 * @property integer $worker_id
 * @property string $address
 * @property integer $track_order
 * @property string $hour
 * @property integer $duration
 * @property string $next_address
 *
 * @property Track $track
 * @property Worker $worker
 */
class Track_for_worker extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'track_for_worker';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['shift_date', 'hour'], 'safe'],
            [['track_id'], 'required'],
            [['track_id', 'worker_id', 'track_order', 'duration','updated'], 'integer'],
            [['line'], 'string', 'max' => 5],
            [['shift_name'], 'string', 'max' => 256],
            [['address', 'next_address','instructions'], 'string', 'max' => 255],
            [['track_id'], 'exist', 'skipOnError' => true, 'targetClass' => Track::className(), 'targetAttribute' => ['track_id' => 'id']],
            [['worker_id'], 'exist', 'skipOnError' => true, 'targetClass' => Worker::className(), 'targetAttribute' => ['worker_id' => 'id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'line' => 'Line',
            'shift_name' => 'Shift Name',
            'shift_date' => 'Shift Date',
            'track_id' => 'Track ID',
            'worker_id' => 'Worker ID',
            'address' => 'Address',
            'track_order' => 'Track Order',
            'hour' => 'Hour',
            'duration' => 'Duration',
            'next_address' => 'Next Address',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTrack()
    {
        return $this->hasOne(Track::className(), ['id' => 'track_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getWorker()
    {
        return $this->hasOne(Worker::className(), ['id' => 'worker_id']);
    }
}
