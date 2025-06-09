import React from 'react';
import { RTCView } from 'react-native-webrtc';
import { StyleSheet } from 'react-native';
import { MediaStream } from 'react-native-webrtc';

type RemoteVideoProps = {
  stream: MediaStream;
};

const RemoteVideo: React.FC<RemoteVideoProps> = ({ stream }) => {
  return (
    <RTCView
      streamURL={stream.toURL()}
      style={styles.remote}
      objectFit="cover"
    />
  );
};

const styles = StyleSheet.create({
  remote: {
    width: '100%',
    height: '60%',
    backgroundColor: 'black',
  },
});

export default RemoteVideo;
