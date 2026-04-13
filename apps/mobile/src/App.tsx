import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SMSNodeService } from './services/SmsNodeService';
import { requestSmsPermissions } from './hooks/usePermissions';

const App = () => {
  useEffect(() => {
    const initNode = async () => {
      const granted = await requestSmsPermissions();
      if (granted) {
        const node = new SMSNodeService();
        await node.initialize('mock-device-id-123');
      }
    };
    initNode();
  }, []);

  return (
    <<ViewView style={styles.container}>
      <<TextText style={styles.title}>SMS Relay Node</Text>
      <<TextText>Status: Monitoring for tasks...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 }
});

export default App;
