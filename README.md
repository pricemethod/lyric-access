# lyric-access

A package to integrate the access solution from Lyric into a React Native application.

## Installation

```sh
npm install lyric-access
```

## Usage

This package provides a modal component that handles connecting to a particular lock and sending a code to it. Here's how to use it:

```js
import LyricAccess from 'lyric-access';

const [modalVisible, setModalVisible] = useState(false);
return (
  // ...
  <LyricAccessModal
    modalVisible={modalVisible}
    setModalVisible={setModalVisible}
    lockName={'Lyric-B10AF'} // get this from a custom field in your PMS
    keypadCode={'1234'} // get this from a custom field in your PMS
  />
);
```

When this modal becomes visible, the app will connect to the lock via Bluetooth LE. Upon a successful connection, the spinner will turn into an "Unlock" button. When the user taps the unlock button, the associated keypad code will be sent to the lock.
