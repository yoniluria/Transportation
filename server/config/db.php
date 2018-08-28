<?php


namespace app\models;

use Yii;
header("Access-Control-Allow-Origin: *");
			  header('Access-Control-Allow-Headers: X-CSRF-Token');	


// This is the database connection configuration.
return [
    'class' => 'yii\db\Connection',
    'dsn' => "mysql:host=localhost;dbname=routespe_transportation",
    'username' => 'dbdevadmin',
    'password' => 'c%G?4BAQqP',
    'charset' => 'utf8',
];
