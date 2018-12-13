<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "track".
 *
 * @property integer $id
 * @property string $region
 * @property string $track_date
 * @property integer $meesenger
 * @property integer $line_number
 * @property string $combined_line
 * @property string $description
 * @property string $shift
 * @property integer $shift_id
 * @property boolean $is_sent
 *
 * @property Shift $shift0
 * @property TrackForWorker[] $trackForWorkers
 */
class Track extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'track';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['track_date'], 'safe'],
            [['meesenger', 'line_number', 'shift_id'], 'integer'],
            [['is_sent'], 'boolean'],
            [['region', 'description', 'shift'], 'string', 'max' => 256],
            [['combined_line'], 'string', 'max' => 5],
            [['shift_id'], 'exist', 'skipOnError' => true, 'targetClass' => Shift::className(), 'targetAttribute' => ['shift_id' => 'id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'region' => 'Region',
            'track_date' => 'Track Date',
            'meesenger' => 'Meesenger',
            'line_number' => 'Line Number',
            'combined_line' => 'Combined Line',
            'description' => 'Description',
            'shift' => 'Shift',
            'shift_id' => 'Shift ID',
            'is_sent' => 'Is Sent',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getShift0()
    {
        return $this->hasOne(Shift::className(), ['id' => 'shift_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTrackForWorkers()
    {
        return $this->hasMany(TrackForWorker::className(), ['track_id' => 'id']);
    }
}
