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
  keypadCode: string;
};

var bleManager = new BleManager();
bleManager.setLogLevel(LogLevel.Verbose);

const LyricAccessModal = ({
  modalVisible,
  setModalVisible,
  lockName,
  keypadCode,
}: AppProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
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
    setTimedOut(false);
  }

  function sendUnlockPayload(device: Device, keypadCode: string) {
    // convert code from 051153 -> '000501010503FFFF'
    let bufferizedCode = '';
    for (let n of keypadCode) {
      bufferizedCode += '0' + n;
    }

    while (bufferizedCode.length < 16) {
      bufferizedCode += 'F';
    }

    let payload = Buffer.from(bufferizedCode, 'hex').toString('base64');
    console.log('Sending: ' + payload);
    bleManager.writeCharacteristicWithoutResponseForDevice(
      device.id,
      '4c797269-635f-4c6f-636b-5f5f5f5f5f5f', // lyric service uuid
      '4c797269-635f-4c6f-636b-5f5f5f303031', // 'lock' characteristic uuid
      payload
    );
  }

  function scanAndConnect() {
    console.log(`Looking for: ${lockName}`);
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

        if (device.localName == lockName) {
          // if (
          //   device.serviceUUIDs &&
          //   device.serviceUUIDs.includes('4c797269-635f-4c6f-636b-5f5f5f5f5f5f')
          // ) {
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

    // show keypad code after 5s if not connected
    setInterval(() => {
      if (!isConnected) {
        cleanup();
        setTimedOut(true);
      }
    }, 5000);
  }

  let spinner = <ActivityIndicator size="large" />;
  let unlockButton = (
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
                sendUnlockPayload(connectedDevice, keypadCode);
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
  );

  let closeButton = (
    <TouchableHighlight
      style={{ ...styles.openButton, backgroundColor: '#283245' }}
      onPress={() => {
        cleanup();
        setModalVisible(false);
      }}
    >
      <Text style={styles.textStyle}>Close</Text>
    </TouchableHighlight>
  );

  let unlockContent;
  if (!timedOut) {
    if (isConnected && connectedDevice !== undefined) {
      unlockContent = unlockButton;
    } else {
      unlockContent = spinner;
    }
  } else {
    unlockContent = (
      <>
        <Text>Lock code</Text>
        <Text style={styles.keypadCode}>{keypadCode}</Text>
      </>
    );
  }

  return (
    <Modal animationType="slide" transparent={false} visible={modalVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {unlockContent}
          {closeButton}
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
  keypadCode: {
    color: '#000',
    fontSize: 30,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default LyricAccessModal;
