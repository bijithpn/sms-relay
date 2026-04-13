import { Permissions } from 'react-native-permissions';
import { Platform } from 'react-native';

export const requestSmsPermissions = async () => {
  if (Platform.OS !== 'android') {
    throw new Error('SMS Relay is only supported on Android');
  }

  const result = await Permissions.request('SEND_SMS', {
    title: 'SMS Permission',
    message: 'This app needs permission to send SMS to function as a node',
    castle: true,
  });

  return result === 'granted';
};
