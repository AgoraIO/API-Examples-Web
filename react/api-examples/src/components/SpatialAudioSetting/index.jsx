import { Switch, Typography, Space, Card, Slider, Row, Col } from 'antd';
import { useState, useEffect, useMemo, forwardRef } from 'react';
import "./index.css";
const {
  Title,
  Paragraph,
  Text
} = Typography;
const SLIDER_WIDTH = "600px";
const BLUE_COLOR = "#1677ff";
const SpatialAudioSetting = forwardRef((props, ref) => {
  const {
    style = {},
    onChange = () => {},
    disabled = false
  } = props;
  const [azimuth, setAzimuth] = useState(0);
  const [elevation, setElevation] = useState(0);
  const [distance, setDistance] = useState(1);
  const [orientation, setOrientation] = useState(180);
  const [attenuation, setAttenuation] = useState(0.50);
  const [blur, setBlur] = useState(false);
  const [airAbsorb, setAirAbsorb] = useState(true);
  useEffect(() => {
    onChange({
      azimuth,
      elevation,
      distance,
      orientation,
      attenuation,
      blur,
      airAbsorb
    });
  }, [azimuth, elevation, distance, orientation, attenuation, blur, airAbsorb]);
  const blurLabel = useMemo(() => blur ? "Blur Enable" : "Blur Disable", [blur]);
  const airAbsorbLabel = useMemo(() => airAbsorb ? "Air Absorb Enable" : "Air Absorb Disable", [airAbsorb]);
  return <Card style={{
    width: 800,
    ...style
  }}>
    <Paragraph>
      {/* azimuth */}
      <section>
        <div>
          <Text>azimuth: </Text>
          <Text style={{
            color: BLUE_COLOR
          }}>([0-360] speaker azimuth in a spherical coordinate system centered on the listener)</Text>
        </div>
        <div className='setting-item'>
          <Slider style={{
            width: SLIDER_WIDTH,
            marginRight: "15px"
          }} min={0} max={360} onChange={val => setAzimuth(val)} step={1} value={azimuth} />
          <Text>{azimuth}</Text>
        </div>
      </section>
      {/* elevation */}
      <section>
        <div>
          <Text>elevation: </Text>
          <Text style={{
            color: BLUE_COLOR
          }}>([-90-90]: speaker elevation in a spherical coordinate system centered on the listener)</Text>
        </div>
        <div className='setting-item'>
          <Slider style={{
            width: SLIDER_WIDTH,
            marginRight: "15px"
          }} min={-90} max={90} onChange={val => setElevation(val)} step={1} value={elevation} />
          <Text>{elevation}</Text>
        </div>
      </section>
      {/* distance */}
      <section>
        <div>
          <Text>distance: </Text>
          <Text style={{
            color: BLUE_COLOR
          }}>([1-50]: distance between speaker and listener)</Text>
        </div>
        <div className='setting-item'>
          <Slider style={{
            width: SLIDER_WIDTH,
            marginRight: "15px"
          }} min={1} max={50} onChange={val => setDistance(val)} step={1} value={distance} />
          <Text>{distance}</Text>
        </div>
      </section>
      {/* orientation */}
      <section>
        <div>
          <Text>orientation: </Text>
          <Text style={{
            color: BLUE_COLOR
          }}>([0-180]: 0 degree is the same with listener orientation)</Text>
        </div>
        <div className='setting-item'>
          <Slider style={{
            width: SLIDER_WIDTH,
            marginRight: "15px"
          }} min={0} max={180} onChange={val => setOrientation(val)} step={1} value={orientation} />
          <Text>{orientation}</Text>
        </div>
      </section>
      {/* attenuation */}
      <section>
        <div>
          <Text>attenuation: </Text>
          <Text style={{
            color: BLUE_COLOR
          }}>([0-1]: 1 maximum attenuation, 0 no attenuation)</Text>
        </div>
        <div className='setting-item'>
          <Slider style={{
            width: SLIDER_WIDTH,
            marginRight: "15px"
          }} min={0} max={1} onChange={val => setAttenuation(val)} step={0.01} value={attenuation} />
          <Text>{attenuation}</Text>
        </div>
      </section>
      <section>
        <Space>
          <Text>{blurLabel}</Text><Switch disabled={disabled} checked={blur} onChange={val => setBlur(val)}></Switch>
          <Text>{airAbsorbLabel}</Text><Switch disabled={disabled} checked={airAbsorb} onChange={val => setAirAbsorb(val)}></Switch>
        </Space>
      </section>
    </Paragraph>
  </Card>;
});
export default SpatialAudioSetting;