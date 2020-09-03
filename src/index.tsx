import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { BleManager, Device, LogLevel } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

type AppProps = {
  modalVisible: boolean;
  setModalVisible: (b: boolean) => void;
  lockName: string;
};

var bleManager = new BleManager();
bleManager.setLogLevel(LogLevel.Verbose);

const LyricAccessModal = ({
  modalVisible,
  setModalVisible,
  lockName,
}: AppProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | undefined>(
    undefined
  );

  function cleanup() {
    // if (connectedDevice !== undefined)
    //   bleManager.cancelDeviceConnection(connectedDevice.id);
    console.log('Cleaning up BLE stack...');
    bleManager.destroy();
    bleManager = new BleManager();
    setConnectedDevice(undefined);
    setIsConnected(false);
  }

  function sendUnlockPayload(device: Device) {
    let payload = Buffer.from('000501010503FFFF', 'hex').toString('base64');
    console.log('Sending: ' + payload);
    bleManager.writeCharacteristicWithoutResponseForDevice(
      device.id,
      '4c797269-635f-4c6f-636b-5f5f5f5f5f5f', // lyric service uuid
      '4c797269-635f-4c6f-636b-5f5f5f303031', // 'lock' characteristic uuid
      payload
    );
  }

  function scanAndConnect() {
    console.log(`Looking for ${lockName}`);
    bleManager.startDeviceScan(
      ['4c797269-635f-4c6f-636b-5f5f5f5f5f5f'],
      null,
      (error, device) => {
        if (error || !device) {
          console.warn('Device not found.');
          console.warn(error);
          return;
        }

        if (device.name == 'Zain’s MacBook Pro') return;

        console.log(`Found device: ${device.name} (${device.id})...`);
        console.log(` \\_ localName: ${device.localName}`);
        console.log(` \\_ serviceUUIDs: ${device.serviceUUIDs}`);

        // if (device.name == lockName) {
        if (
          device.serviceUUIDs &&
          device.serviceUUIDs.includes('4c797269-635f-4c6f-636b-5f5f5f5f5f5f')
        ) {
          bleManager.stopDeviceScan();
          setIsConnected(true);

          device
            .connect()
            .then((device) => {
              return device.discoverAllServicesAndCharacteristics();
            })
            .then((device) => {
              console.log(`Connected to device: ${device.name}`);
              setConnectedDevice(device);
            });
        }
      }
    );
  }

  if (!isConnected && modalVisible) {
    scanAndConnect();
  }

  return (
    <Modal animationType="slide" transparent={false} visible={modalVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {isConnected && connectedDevice !== undefined ? (
            <TouchableHighlight
              style={{ ...styles.openButton, backgroundColor: '#283245' }}
              onPress={() => {
                if (connectedDevice === undefined) {
                  scanAndConnect();
                  // todo: send unlock payload
                } else {
                  bleManager
                    .isDeviceConnected(connectedDevice.id)
                    .then((isStillConnected) => {
                      if (isStillConnected) {
                        sendUnlockPayload(connectedDevice);
                      } else {
                        scanAndConnect();
                        // todo: send unlock payload
                      }
                    });
                }
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
              cleanup();
              setModalVisible(false);
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
