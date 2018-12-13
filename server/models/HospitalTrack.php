<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "hospital_track".
 *
 * @property integer $id
 * @property integer $combined_line
 * @property string $region
 * @property string $description
 * @property string $shift
 * @property integer $shift_id
 * @property string $date
 * @property string $phone
 * @property string $department
 * @property string $address
 * @property integer $worker_id
 * @property string $worker_name
 * @property boolean $is_sent
 *
 * @property Shift $shift0
 */
class HospitalTrack extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'hospital_track';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['combined_line', 'shift_id', 'worker_id'], 'integer'],
            [['date'], 'safe'],
            [['is_sent','is_sms_sent','is_confirm'], 'boolean'],
            [['region', 'shift', 'phone'], 'string', 'max' => 50],
            [['description', 'address', 'worker_name'], 'string', 'max' => 256],
            [['department'], 'string', 'max' => 100],
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
            'combined_line' => 'Combined Line',
            'region' => 'Region',
            'description' => 'Description',
            'shift' => 'Shift',
            'shift_id' => 'Shift ID',
            'date' => 'Date',
            'phone' => 'Phone',
            'department' => 'Department',
            'address' => 'Address',
            'worker_id' => 'Worker ID',
            'worker_name' => 'Worker Name',
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
}
