import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
type AppProps = {
  modalVisible: boolean;
  setModalVisible: (b: boolean) => void;
};

var bleManager = new BleManager();

const LyricAccessModal = ({ modalVisible, setModalVisible }: AppProps) => {
  const [isConnected, setIsConnected] = useState(false);

  if (!isConnected && modalVisible) {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error || !device) {
        console.warn('Device not found.');
        console.warn(error);
        return;
      }

      bleManager.stopDeviceScan();

      console.log(`Found device: ${device.name} (${device.id})...`);
    });
  }

  return (
    <Modal animationType="slide" transparent={false} visible={modalVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {isConnected ? (
            <TouchableHighlight
              style={{ ...styles.openButton, backgroundColor: '#283245' }}
              onPress={() => {
                setIsConnected(false);
              }}
            >
              <Text style={styles.textStyle}>Unlock</Text>
            </TouchableHighlight>
          ) : (
            <TouchableHighlight onPress={() => setIsConnected(true)}>
              <ActivityIndicator size="large" />
            </TouchableHighlight>
          )}

          <TouchableHighlight
            style={{ ...styles.openButton, backgroundColor: '#283245' }}
            onPress={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <Text style={styles.textStyle}>Close</Text>
          </TouchableHighlight>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LyricAccessModal;
