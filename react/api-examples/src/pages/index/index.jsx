import { useTranslation } from 'react-i18next';
import { Card, Col, Row, Button, Typography } from 'antd';
import { Link } from "react-router-dom";
import "./index.css";
const {
  Title,
  Text,
  Paragraph
} = Typography;
const basicItems = [{
  title: 'basicVoiceCalling',
  content: 'basicVoiceCallingNote',
  to: "/basic-voice-call"
}, {
  title: 'basicVideoCalling',
  content: 'basicVideoCallingNote',
  to: "/basic-video-call"
}, {
  title: 'basicLiveStreaming',
  content: 'basicLiveStreamingNote',
  to: "/basic-live"
}, {
  title: 'cloudProxy',
  content: 'cloudProxyNote',
  to: "/cloud-proxy"
}, {
  title: 'selfRendering',
  content: 'selfRenderingNote',
  to: "/self-rendering"
}, {
  title: 'selfCapturing',
  content: 'selfCapturingNote',
  to: "/self-capturing"
}, {
  title: 'videoScreenshot',
  content: 'videoScreenshotNote',
  to: "/screenshot"
}, {
  title: 'sharescreen',
  content: 'sharescreenNote',
  to: "/sharescreen"
}];
const advancedItems = [{
  title: 'testdevices',
  content: 'testdevicesNote',
  to: "/recording-device-control"
}, {
  title: 'adjustvideoprofile',
  content: 'adjustvideoprofileNote',
  to: "/adjust-video-profile"
}, {
  title: 'incallstats',
  content: 'incallstatsNote',
  to: "/display-call-stats"
}, {
  title: 'muteaudiovideosetmuted',
  content: 'muteaudiovideosetmutedNote',
  to: "/basic-mute"
}, {
  title: 'muteaudiovideosetenabled',
  content: 'muteaudiovideosetenabledNote',
  to: "/basic-mute-set-enabled"
}, {
  title: 'muteaudiovideomediastreamtrackenabled',
  content: 'muteaudiovideomediastreamtrackenabledNote',
  to: "/basic-mute-mediastream-track-enabled"
}, {
  title: 'audioeffect',
  content: 'audioeffectNote',
  to: "/audio-effect"
}, {
  title: 'cdnstreaming',
  content: 'cdnstreamingNote',
  to: "/push-stream-cdn"
}, {
  title: 'dualstream',
  content: 'dualstreamNote',
  to: "/dual-stream"
}, {
  title: 'geofencing',
  content: 'geofencingNote',
  to: "/geofencing"
}, {
  title: 'multiplechannel',
  content: 'multiplechannelNote',
  to: "/multiple-channel"
}, {
  title: 'customvideosource',
  content: 'customvideosourceNote',
  to: "/custom-video-source"
}, {
  title: 'stt',
  content: 'sttNote',
  to: "/stt"
}];
const pluginItems = [{
  title: 'virtualbackground',
  content: 'virtualbackgroundNote',
  to: "/virtual-background"
}, {
  title: 'aidenoiser',
  content: 'aidenoiserNote',
  to: "/ai-denoiser"
}, {
  title: 'spatialAudioExtention',
  content: 'spatialAudioExtentionNote',
  to: "/spatial-audio"
}, {
  title: 'videoCompositor',
  content: 'videoCompositorNote',
  to: "/video-compositor"
}, {
  title: 'superClarityExtention',
  content: 'superClarityExtentionNote',
  to: "/super-clarity"
}];
const scenarioItems = [{
  title: 'groupvideocalling',
  content: 'groupvideocallingNote',
  pathname: "https://github.com/AgoraIO-Community/AgoraMultiCall-vue"
}, {
  title: 'movietogether',
  content: 'movietogetherNote',
  pathname: "https://github.com/AgoraIO-Community/MovieTogether"
}];
const finalItems = [{
  items: basicItems,
  title: 'basic'
}, {
  items: advancedItems,
  title: 'advanced'
}, {
  items: pluginItems,
  title: 'plugins'
}, {
  items: scenarioItems,
  title: 'scenarios'
}];
const IndexPage = () => {
  const {
    t
  } = useTranslation();
  return <div className='index-page'>
    {finalItems.map(({
      items,
      title
    }, index) => <div key={title} style={{
      marginTop: index !== 0 ? "15px" : 0
    }}>
        <Title>{t(title)}</Title>
        <Row gutter={[16, 16]}>
          {items.map((item, index) => <Col span={8} key={index}>
            <Card title={t(item.title)}>
              <Paragraph className='text' ellipsis={{
              rows: 2
            }}>{t(item.content)}</Paragraph>
              <div className='card-footer'>
                {item.to ? <Link to={item.to} state={{
                title: item.title
              }}>
                    <Button type="primary">{t('tryitnow')}</Button>
                  </Link> : <a href={item.pathname} target="_blank">
                      <Button type="primary">{t('viewthecode')}</Button>
                    </a>}
              </div>
            </Card>
          </Col>)}
        </Row>
      </div>)}

  </div>;
};
export default IndexPage;