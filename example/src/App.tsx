import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import LyricAccessModal from 'lyric-access';

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [lockName, setLockName] = useState('');
  const [keypadCode, setKeypadCode] = useState('');

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('lockName', lockName);
      await AsyncStorage.setItem('keypadCode', keypadCode);
    } catch (e) {
      console.log('Error setting AsyncStorage');
    }
  };

  const readData = async () => {
    try {
      const retrievedLockName = await AsyncStorage.getItem('lockName');
      const retrievedKeypadCode = await AsyncStorage.getItem('keypadCode');

      if (retrievedLockName !== null) {
        setLockName(retrievedLockName);
      }

      if (retrievedKeypadCode !== null) {
        setKeypadCode(retrievedKeypadCode);
      }
    } catch (e) {
      console.log('Error reading AsyncStorage');
    }
  };

  useEffect(() => {
    readData();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Lock Name</Text>
      <TextInput
        style={styles.textInput}
        placeholder={'Ly000...'}
        onChangeText={setLockName}
        value={lockName}
      ></TextInput>
      <Text>Keypad Code</Text>
      <TextInput
        style={styles.textInput}
        placeholder={'31337'}
        onChangeText={setKeypadCode}
        value={keypadCode}
      ></TextInput>
      <TouchableOpacity
        onPress={() => {
          setModalVisible(true);
          saveData();
        }}
        style={styles.appButtonContainer}
      >
        <Text style={styles.appButtonText}>Connect</Text>
      </TouchableOpacity>
      <LyricAccessModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        lockName={lockName}
        keypadCode={keypadCode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appButtonContainer: {
    elevation: 8,
    backgroundColor: '#283245',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  appButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  textInput: {
    borderColor: '#CCCCCC',
    color: '#333',
    borderWidth: 1,
    height: 50,
    fontSize: 25,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 20,
    width: 250,
  },
});
