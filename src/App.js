import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useState } from 'react';
import Slider from '@mui/material/Slider';

// Bus
import BRT from './data/brt.json'; // BRT route => Line
import BusStop from './data/bus_stop.json'; // B1 bus stop => ICON
import B1Trip from './data/B1_trip.json'; // B1 bus route => Trip
import BusWaitingPoint from './data/bus_waiting_point.json'; // Bus Waiting person point => ICON

// Bike
import BikePoint from './data/bike_point.json'; // Bike location => ICON
import BikeTrip from './data/bike_trip.json'; // Bike route => Trip

// Foot
import FootTrip from './data/foot_trip.json'; // Foot route => Trip


// Taxi
import TaxiPoint from './data/taxi_point.json'; // Taxi location => ICON
import TaxiTrip from './data/taxi_trip.json'; // Taxi route => Trip

import Trip from './components/Trip';
import './css/app.css';

const App = () => {
  const minTime = 420;
  const maxTime = 540;

  const [time, setTime] = useState(minTime);
  const data = {
    'BRT': BRT,
    'BusStop': BusStop,
    'B1Trip': B1Trip,
    'BusWaitingPoint': BusWaitingPoint,
    'BikePoint': BikePoint,
    'BikeTrip': BikeTrip,
    'FootTrip': FootTrip,
    'TaxiPoint': TaxiPoint,
    'TaxiTrip': TaxiTrip,
  }

  const SliderChange = value => {
    const time = value.target.value;
    setTime(time);
  };

  return (
    <div className='container'>
      <Trip
        data={data}
        minTime={minTime}
        maxTime={maxTime}
        time={time}
        setTime={setTime}
      >
      </Trip>
      <Slider id="slider" value={time} min={minTime} max={maxTime} onChange={SliderChange} track="inverted"/>
    </div>
  );
};

export default App;