import React from 'react';
import { RTCView } from 'react-native-webrtc';
import { StyleSheet } from 'react-native';
import { MediaStream } from 'react-native-webrtc';

type LocalVideoProps = {
  stream: MediaStream;
};

const LocalVideo: React.FC<LocalVideoProps> = ({ stream }) => {
  return (
    <RTCView
      streamURL={stream.toURL()}
      style={styles.local}
      objectFit="cover"
      mirror={true}
    />
  );
};

const styles = StyleSheet.create({
  local: {
    width: '100%',
    height: '40%',
    backgroundColor: 'black',
  },
});

export default LocalVideo;
