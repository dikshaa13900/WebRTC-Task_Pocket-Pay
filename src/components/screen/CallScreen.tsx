import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
} from 'react-native-webrtc';
import { database } from '../../firebase';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

const configuration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

type RootStackParamList = {
  CallScreen: {
    isCreator: boolean;
    roomId?: string;
  };
};

type CallScreenProps = {
  route: RouteProp<RootStackParamList, 'CallScreen'>;
  navigation: StackNavigationProp<RootStackParamList>;
};

const CallScreen: React.FC<CallScreenProps> = ({ route, navigation }) => {
  const { isCreator, roomId: passedRoomId } = route.params || {};

  const [roomId, setRoomId] = useState<string>('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(true);

  const pc = useRef<RTCPeerConnection | null>(null);
  const roomRef = useRef<any>(null); // Firebase ref

  useEffect(() => {
    pc.current = new RTCPeerConnection(configuration);
    startLocalStream();

    return () => {
      pc.current?.close();
      roomRef.current?.off();
    };
  }, []);

  const startLocalStream = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          granted['android.permission.CAMERA'] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.RECORD_AUDIO'] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert('Permission denied', 'Camera and microphone permissions are required.');
          return;
        }
      }

      const stream = await mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      stream.getTracks().forEach((track: MediaStreamTrack) => {
        pc.current?.addTrack(track, stream);
      });

      pc.current!.ontrack = (event: any) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      if (isCreator) {
        await createRoom();
      } else {
        await joinRoom(passedRoomId!);
      }
    } catch (e: any) {
      Alert.alert('Error accessing camera/mic', e.message);
    }
  };

  const createRoom = async () => {
    const newRoomRef = database.ref('rooms').push();
    roomRef.current = newRoomRef;

    const generatedRoomId = newRoomRef.key;
    setRoomId(generatedRoomId);

    pc.current!.onicecandidate = async event => {
      if (event.candidate) {
        await database.ref(`rooms/${generatedRoomId}/callerCandidates`).push(event.candidate.toJSON());
      }
    };

    const offer = await pc.current!.createOffer();
    await pc.current!.setLocalDescription(offer);

    await newRoomRef.set({
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
    });

    newRoomRef.on('value', async snapshot => {
      const data = snapshot.val();
      if (data?.answer && !pc.current?.currentRemoteDescription) {
        const answerDesc = new RTCSessionDescription(data.answer);
        await pc.current!.setRemoteDescription(answerDesc);
      }
    });

    database.ref(`rooms/${generatedRoomId}/calleeCandidates`).on('child_added', async snapshot => {
      const candidate = new RTCIceCandidate(snapshot.val());
      await pc.current!.addIceCandidate(candidate);
    });
  };

  const joinRoom = async (joinRoomId: string) => {
    roomRef.current = database.ref(`rooms/${joinRoomId}`);
    setRoomId(joinRoomId);

    pc.current!.onicecandidate = async event => {
      if (event.candidate) {
        await database.ref(`rooms/${joinRoomId}/calleeCandidates`).push(event.candidate.toJSON());
      }
    };

    const snapshot = await roomRef.current.once('value');
    const roomData = snapshot.val();

    if (!roomData) {
      Alert.alert('Room not found!');
      navigation.goBack();
      return;
    }

    const offerDesc = new RTCSessionDescription(roomData.offer);
    await pc.current!.setRemoteDescription(offerDesc);

    const answer = await pc.current!.createAnswer();
    await pc.current!.setLocalDescription(answer);

    await roomRef.current.update({
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    });

    database.ref(`rooms/${joinRoomId}/callerCandidates`).on('child_added', async snapshot => {
      const candidate = new RTCIceCandidate(snapshot.val());
      await pc.current!.addIceCandidate(candidate);
    });
  };

  const toggleMute = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsMuted(prev => !prev);
  };

  const switchCamera = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(track => {
      if (typeof (track as any)._switchCamera === 'function') {
        (track as any)._switchCamera();
      }
    });
    setIsFrontCamera(prev => !prev);
  };

  const endCall = () => {
    pc.current?.close();
    roomRef.current?.remove();
    localStream?.getTracks().forEach(track => track.stop());

    setLocalStream(null);
    setRemoteStream(null);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.roomText}>
        {roomId ? `Room ID: ${roomId}` : 'Loading...'}
      </Text>

      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.rtcViewLocal}
          objectFit="cover"
          mirror
        />
      )}

      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.rtcViewRemote}
          objectFit="cover"
        />
      )}

      <View style={{ flexDirection: 'row', marginTop: 20 }}>
        <Button title={isMuted ? 'Unmute' : 'Mute'} onPress={toggleMute} />
        <View style={{ width: 10 }} />
        <Button title="Switch Camera" onPress={switchCamera} />
        <View style={{ width: 10 }} />
        <Button title="End Call" onPress={endCall} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  rtcViewLocal: {
    width: '90%',
    height: 150,
    backgroundColor: 'black',
    marginBottom: 20,
  },
  rtcViewRemote: {
    width: '90%',
    height: 300,
    backgroundColor: 'black',
  },
});

export default CallScreen;
