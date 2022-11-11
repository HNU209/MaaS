import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useState } from 'react';
import Slider from '@mui/material/Slider';
import axios, * as others from 'axios';
import Trip from './components/Trip';
import Splash from './components/Splash';
import './css/app.css';

const getData = dataName => {
  const res = axios.get(`https://raw.githubusercontent.com/HNU209/MaaS/main/src/data/${dataName}.json`);
  const result = res.then(r => r.data);
  return result;
}

const App = () => {
  const minTime = 420;
  const maxTime = 540;

  const [time, setTime] = useState(minTime);
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    async function getFetchData() {
      const resData = {
        'BRT': await getData('brt'),
        'UpBRT': await getData('up_b1_brt'),
        'DownBRT': await getData('down_b1_brt'),
        'BusStop': await getData('bus_stop'),
        'B1Trip': await getData('B1_trip'),
        'BusWaitingPoint': await getData('bus_waiting_point'),
        'BikePoint': await getData('bike_point'),
        'BikeTrip': await getData('bike_trip'),
        'FootTrip': await getData('foot_trip'),
        'TaxiPoint': await getData('taxi_point'),
        'TaxiTrip': await getData('taxi_trip'),
        'polygons': await getData('polygon'),
      };

      if (resData) {
        setData(resData);
        setLoaded(true);
      };
    };

    getFetchData();
  }, []);

  const SliderChange = value => {
    const time = value.target.value;
    setTime(time);
  };

  return (
    <div className='container'>
      {
        loaded ?
        <>
          <Trip
            data={data}
            minTime={minTime}
            maxTime={maxTime}
            time={time}
            setTime={setTime}
          >
          </Trip>
          <Slider id="slider" value={time} min={minTime} max={maxTime} onChange={SliderChange} track="inverted"/>
        </>
        :
        <Splash />
      }
    </div>
  );
};

export default App;