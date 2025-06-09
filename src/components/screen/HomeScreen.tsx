import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Text,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Call: { isCreator: boolean; roomId?: string };
  Home: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [joinRoomId, setJoinRoomId] = useState<string>('');

  const createRoom = () => {
    navigation.navigate('Call', { isCreator: true });
  };

  const joinRoom = () => {
    const trimmedRoomId = joinRoomId.trim();
    if (!trimmedRoomId) {
      Alert.alert('Please enter a valid Room ID');
      return;
    }
    navigation.navigate('Call', { isCreator: false, roomId: trimmedRoomId });
  };

  return (
    <View style={styles.container}>
      <Button title="Create Room" onPress={createRoom} />

      <Text style={styles.orText}>OR</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Room ID to Join"
        value={joinRoomId}
        onChangeText={(text: string) => setJoinRoomId(text)}
        autoCapitalize="none"
      />
      <Button title="Join Room" onPress={joinRoom} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
