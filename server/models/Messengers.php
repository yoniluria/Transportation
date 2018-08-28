<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "messengers".
 *
 * @property integer $id
 * @property string $name
 * @property string $email
 * @property string $address
 * @property string $phone
 * @property string $lat
 * @property string $lng
 * @property string $license_number
 * @property string $car_type
 * @property integer $places_number
 * @property double $customer_price
 * @property double $driver_price
 * @property string $driving_license_expire
 * @property string $car_license_expire
 * @property string $insurance_expire
 * @property string $activation_license_expire
 * @property string $safety_expire
 * @property string $winter_test_expire
 * @property string $more_expire
 * @property boolean $is_usher
 */
class Messengers extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'messengers';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['places_number'], 'integer'],
            [['customer_price', 'driver_price'], 'number'],
            [['driving_license_expire', 'car_license_expire', 'insurance_expire', 'activation_license_expire', 'safety_expire', 'winter_test_expire', 'more_expire'], 'safe'],
            [['is_usher'], 'boolean'],
            [['name', 'email', 'address', 'phone', 'lat', 'lng'], 'string', 'max' => 256],
            [['license_number', 'car_type'], 'string', 'max' => 50],
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
            'email' => 'Email',
            'address' => 'Address',
            'phone' => 'Phone',
            'lat' => 'Lat',
            'lng' => 'Lng',
            'license_number' => 'License Number',
            'car_type' => 'Car Type',
            'places_number' => 'Places Number',
            'customer_price' => 'Customer Price',
            'driver_price' => 'Driver Price',
            'driving_license_expire' => 'Driving License Expire',
            'car_license_expire' => 'Car License Expire',
            'insurance_expire' => 'Insurance Expire',
            'activation_license_expire' => 'Activation License Expire',
            'safety_expire' => 'Safety Expire',
            'winter_test_expire' => 'Winter Test Expire',
            'more_expire' => 'More Expire',
            'is_usher' => 'Is Usher',
        ];
    }
}
