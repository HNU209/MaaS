import React, { useState, useEffect } from 'react';
import { Map } from 'react-map-gl';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import { TripsLayer } from '@deck.gl/geo-layers';
import { PathLayer, ScatterplotLayer, IconLayer, PolygonLayer } from '@deck.gl/layers';
import DeckGL from '@deck.gl/react';
import '../css/trip.css';
import BusStopPNG from '../image/bus-stop.png';
import legend from '../image/legend.png';

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});
  
const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight});

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70]
};

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect]
};

const INITIAL_VIEW_STATE = {
  longitude: 127.4,
  latitude: 36.45,
  zoom: 10,
  minZoom: 5,
  maxZoom: 14,
  pitch: 0,
  bearing: 0
};

const mapStyle = 'mapbox://styles/spear5306/ckzcz5m8w002814o2coz02sjc';
const MAPBOX_TOKEN = `pk.eyJ1Ijoic3BlYXI1MzA2IiwiYSI6ImNremN5Z2FrOTI0ZGgycm45Mzh3dDV6OWQifQ.kXGWHPRjnVAEHgVgLzXn2g`; // eslint-disable-line

const currData = (data, time) => {
  const arr = [];
  data.forEach(v => {
    const [start, end] = v.timestamp;
    if ((start <= time) & (time <= end)) {
      arr.push(v.trip);
    };
  });
  return arr;
}

const getColor = (data, type) => {
  if (type === 'B1') {
    return [255, 0, 0];
  } else if (type === 'TAXI') {
    if (data.vendor === 0) {
      return [253, 128, 93];
    } else if (data.vendor === 1) {
      return [23, 184, 190];
    }
  } else if (type === 'BIKE') {
    return [255, 255, 0]; // 노란색
  } else if (type === 'WALK') {
    return [0, 102, 255]; // 파란색
  }
};

const getBusStopWaiting = (bus_stop, data, time) => {
  const res = {};
  bus_stop.forEach(v => {
    const [x, y] = v.pos;
    res[`${x}_${y}`] = 0
  });

  data.forEach(v => {
    const [x, y] = v.trip
    const [start, end] = v.timestamp;

    if ((time >= start) && (time <= end)) {
      res[`${x}_${y}`] += 1
    }
  });

  const total = [];
  Object.entries(res).forEach(([k, v]) => {
    const arr = k.split('_').map(v => parseFloat(v));
    arr.push(v);
    total.push(arr);
  })
  return total;
}

const ICON_MAPPING = {
  marker1: {x: 0, y: 0, width: 512, height: 512, mask: true},
  marker2: {x: 0, y: 0, width: 512, height: 512, mask: false}
};

const Trip = (props) => {
  const animationSpeed = 2;
  const time = props.time;
  const minTime = props.minTime;
  const maxTime = props.maxTime;

  const polygons = props.data.polygons;
  const BRT = props.data.BRT;
  const BusStop = props.data.BusStop;
  const B1Trip = props.data.B1Trip;
  const BusWaitingPoint = props.data.BusWaitingPoint;
  const BikePoint = currData(props.data.BikePoint, time);
  const BikeTrip = props.data.BikeTrip;
  const FootTrip = props.data.FootTrip;
  const TaxiPoint = currData(props.data.TaxiPoint, time);
  const TaxiTrip = props.data.TaxiTrip;

  const BusStopTotal = getBusStopWaiting(BusStop, BusWaitingPoint, time);
  
  const [animationFrame, setAnimationFrame] = useState('');

  const animate = () => {
    props.setTime(time => {
      if (time > maxTime) {
        return minTime;
      } else {
        return time + (0.01) * animationSpeed;
      };
    });
    const af = window.requestAnimationFrame(animate);
    setAnimationFrame(af);
  };

  useEffect(() => {
    animate();
    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const layers = [
    new PolygonLayer({
      id: 'polygon',
      data: polygons,
      pickable: false,
      filled: true,
      lineWidthMinPixels: 2,
      getPolygon: d => d.geometry,
      getFillColor: d => d.geometry ? [255, 255, 255, 1] : [255, 255, 255, 0],
      getLineColor: [192, 192, 192],
      getLineWidth: 1
    }),
    new PathLayer({
      id: 'brt',
      data: BRT,
      pickable: true,
      widthScale: 1,
      widthMinPixels: 2,
      getPath: d => d.path,
      getColor: d => [255, 255, 255], // 흰색
      getWidth: d => 1
    }),
    new TripsLayer({
      id: 'B1-trip',
      data: B1Trip,
      getPath: d => d.trip,
      getTimestamps: d => d.timestamp,
      getColor: d => getColor(d, 'B1'),
      opacity: 1,
      widthMinPixels: 5,
      trailLength: 1,
      rounded: true,
      currentTime: time,
      shadowEnabled: false,
    }),
    new TripsLayer({
      id: 'bike-trip',
      data: BikeTrip,
      getPath: d => d.trip,
      getTimestamps: d => d.timestamp,
      getColor: d => getColor(d, 'BIKE'),
      opacity: 1,
      widthMinPixels: 5,
      trailLength: 1.5,
      rounded: true,
      currentTime: time,
      shadowEnabled: false,
    }),
    new TripsLayer({
      id: 'foot-trip',
      data: FootTrip,
      getPath: d => d.trip,
      getTimestamps: d => d.timestamp,
      getColor: d => getColor(d, 'WALK'),
      opacity: 1,
      widthMinPixels: 5,
      trailLength: 7,
      rounded: true,
      currentTime: time,
      shadowEnabled: false,
    }),
    new TripsLayer({
      id: 'taxi-trip',
      data: TaxiTrip,
      getPath: d => d.trip,
      getTimestamps: d => d.timestamp,
      getColor: d => getColor(d, 'TAXI'),
      opacity: 1,
      widthMinPixels: 5,
      trailLength: 1,
      rounded: true,
      currentTime: time,
      shadowEnabled: false,
    }),
    new IconLayer({
      id: 'bus-stop',
      data: BusStopTotal,
      pickable: false,
      iconAtlas: BusStopPNG,
      iconMapping: ICON_MAPPING,
      sizeMinPixels: 20,
      sizeMaxPixels: 20,
      sizeScale: 5,
      getIcon: d => d[2] > 0 ? 'marker1' : 'marker2',
      getPosition: d => [d[0], d[1]],
      getSize: d => 10,
      getColor: d => [255, 255, 0]
    }),
    new ScatterplotLayer({
      id: 'taxi-location',
      data: TaxiPoint,
      getPosition: d => d,
      getFillColor: d => [255, 153, 51],
      getRadius: d => 3,
      opacity: 0.1,
      pickable: false,
      radiusScale: 6,
      radiusMinPixels: 1,
      radiusMaxPixels: 10,
    }),
    new ScatterplotLayer({
      id: 'bike-location',
      data: BikePoint,
      getPosition: d => d,
      getFillColor: d => [56, 253, 57],
      getRadius: d => 3,
      opacity: 0.1,
      pickable: false,
      radiusScale: 6,
      radiusMinPixels: 1,
      radiusMaxPixels: 10,
    })
  ];

  return (
    <div className='trip-container' style={{position: 'relative'}}>
      <DeckGL
        effects={DEFAULT_THEME.effects}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        <Map
          mapStyle={mapStyle}
          mapboxAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>
      <h1 className='time'>
        TIME : {(String(parseInt(Math.round(time) / 60) % 24).length === 2) ? parseInt(Math.round(time) / 60) % 24 : '0'+String(parseInt(Math.round(time) / 60) % 24)} : {(String(Math.round(time) % 60).length === 2) ? Math.round(time) % 60 : '0'+String(Math.round(time) % 60)}
      </h1>
      <img className='legend' src={legend}></img>
    </div>
  );
}

export default Trip;