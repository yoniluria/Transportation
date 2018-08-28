<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Logtrack;


/**
 * TrackSearch represents the model behind the search form about `app\models\Track`.
 */
class LogtrackSearch extends Logtrack
{
	
    /**
     * @inheritdoc
     */
    public function rules()
    {
    	 return [
            [['id'], 'required'],
            [['track_id'], 'integer'],
            [['lat','lng'], 'string', 'max' => 256],
        ];
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        // bypass scenarios() implementation in the parent class
        return Model::scenarios();
    }

    /**
     * Creates data provider instance with search query applied
     *
     * @param array $params
     *
     * @return ActiveDataProvider
     */
    public function search($params)
    {
        $query = Logtrack::find();

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
        ]);

        $this->load($params);

        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        // grid filtering conditions
        $query->andFilterWhere([
            'id' => $this->id,
            'track_id' => $this->track_id,
            'lat' => $this->lat,
            'lng' => $this->lng,
        ]);

        
        return $dataProvider;
    }
}
