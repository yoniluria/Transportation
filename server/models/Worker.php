<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "worker".
 *
 * @property integer $id
 * @property string $name
 * @property string $phone
 * @property string $department
 * @property string $regular_instructions
 * @property string $combined_line
 * @property integer $sub_line
 *
 * @property TrackForWorker[] $trackForWorkers
 */
class Worker extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'worker';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['sub_line','message_type'], 'integer'],
            [['name', 'phone', 'department'], 'string', 'max' => 255],
            [['regular_instructions'], 'string', 'max' => 256],
            [['combined_line'], 'string', 'max' => 5],
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
            'phone' => 'Phone',
            'department' => 'Department',
            'regular_instructions' => 'Regular Instructions',
            'combined_line' => 'Combined Line',
            'sub_line' => 'Sub Line',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTrackForWorkers()
    {
        return $this->hasMany(TrackForWorker::className(), ['worker_id' => 'id']);
    }
}
