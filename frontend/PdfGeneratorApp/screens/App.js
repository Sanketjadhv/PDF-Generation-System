import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import CreateTemplateScreen from './CreateTemplateScreen';
import PreviewScreen from './PreviewScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Create');

  const renderScreen = () => {
    if (currentScreen === 'Create') {
      return <CreateTemplateScreen />;
    }
    return <PreviewScreen />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={[styles.navButton, currentScreen === 'Create' && styles.navButtonActive]}
          onPress={() => setCurrentScreen('Create')}
        >
          <Text style={[styles.navButtonText, currentScreen === 'Create' && styles.navButtonTextActive]}>
            📝 Template Creation
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, currentScreen === 'Preview' && styles.navButtonActive]}
          onPress={() => setCurrentScreen('Preview')}
        >
          <Text style={[styles.navButtonText, currentScreen === 'Preview' && styles.navButtonTextActive]}>
            📄 PDF Preview
          </Text>
        </TouchableOpacity>
      </View>
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#f1f5f9'
  },
  navButtonActive: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b'
  },
  navButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  }
});