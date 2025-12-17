import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { API_URL } from '../config';

// Check if running on web
const isWeb = Platform.OS === 'web';

// Custom Dropdown Component
const CustomDropdown = ({ label, options, selectedValue, onSelect, placeholder }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLabel = options.find(opt => opt.value === selectedValue)?.label || placeholder;

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dropdownText, !selectedValue && styles.placeholderText]}>
          {selectedLabel}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label.replace(/[0-9️⃣]/g, '').replace(':', '').trim()}</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {options.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No templates available</Text>
                </View>
              ) : (
                options.map((option, index) => (
                  <TouchableOpacity
                    key={option.value || `option-${index}`}
                    style={[
                      styles.dropdownOption,
                      selectedValue === option.value && styles.dropdownOptionSelected
                    ]}
                    onPress={() => {
                      onSelect(option.value);
                      setModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dropdownOptionText,
                      selectedValue === option.value && styles.dropdownOptionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function PreviewScreen() {
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Fetch Templates on Load
  useEffect(() => {
    console.log("Fetching templates from:", API_URL);
    axios.get(`${API_URL}/templates`)
         .then(res => {
           console.log("Templates fetched:", res.data);
           console.log("Number of templates:", res.data?.length || 0);
           if (res.data && res.data.length > 0) {
             setTemplates(res.data);
           } else {
             console.warn("No templates found in response");
             setTemplates([]);
           }
         })
         .catch(err => {
           console.error("Error fetching templates:", err);
           console.error("Error details:", err.response?.data || err.message);
           Alert.alert("Connection Error", `Cannot connect to backend. Please check:\n1. Backend server is running on port 5000\n2. API URL is correct: ${API_URL}\n\nError: ${err.message}`);
         });
  }, []);

  // 2. Conditional Logic: Fetch Users if a template suggesting user input is selected
  useEffect(() => {
    // Simple heuristic: If the template name includes 'Salary' or 'Slip', assume user input is required
    if (selectedTemplate && selectedTemplate.toLowerCase().includes('salary')) {
        axios.get(`${API_URL}/users`)
            .then(res => setUsers(res.data))
            .catch(err => console.error("Error fetching users:", err));
    } else {
        setUsers([]);
        setSelectedUser('');
    }
  }, [selectedTemplate]);

  const generatePDF = async () => {
    if (!selectedTemplate) {
        Alert.alert("Selection Required", "Please select a template.");
        return;
    }

    const requiresUser = selectedTemplate.toLowerCase().includes('salary');
    if (requiresUser && !selectedUser) {
        Alert.alert("Selection Required", "Please select a user for the Salary Template.");
        return;
    }

    setLoading(true);

    try {
        // Prepare the payload
        const payload = {
            template_name: selectedTemplate,
            user_id: selectedUser || undefined // Pass user ID only if selected
        };

        // Generate the PDF and receive it as binary data (ReportLab output)
        // Use axios to fetch the file content as a blob/arraybuffer
        const response = await axios.post(`${API_URL}/generate_pdf`, payload, {
            responseType: 'arraybuffer'
        });

        if (isWeb) {
            // Web browser handling: Create blob and download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selectedTemplate.replace(/\s/g, '_')}_${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            Alert.alert('Success', 'PDF generated and downloaded successfully!');
        } else {
            // React Native handling: Save to file system and share
            // Convert ArrayBuffer to Base64 (React Native compatible)
            const uint8Array = new Uint8Array(response.data);
            let binaryString = '';
            for (let i = 0; i < uint8Array.length; i++) {
                binaryString += String.fromCharCode(uint8Array[i]);
            }
            
            // Base64 encoding function for React Native
            const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            let base64Data = '';
            let i = 0;
            while (i < binaryString.length) {
                const a = binaryString.charCodeAt(i++);
                const b = i < binaryString.length ? binaryString.charCodeAt(i++) : 0;
                const c = i < binaryString.length ? binaryString.charCodeAt(i++) : 0;
                const bitmap = (a << 16) | (b << 8) | c;
                base64Data += base64Chars.charAt((bitmap >> 18) & 63);
                base64Data += base64Chars.charAt((bitmap >> 12) & 63);
                base64Data += i - 2 < binaryString.length ? base64Chars.charAt((bitmap >> 6) & 63) : '=';
                base64Data += i - 1 < binaryString.length ? base64Chars.charAt(bitmap & 63) : '=';
            }
            
            const fileUri = FileSystem.documentDirectory + `${selectedTemplate.replace(/\s/g, '_')}_${Date.now()}.pdf`;

            // Write the Base64 data to a local file
            await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Share/Preview the PDF
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, { mimeType: 'application/pdf' });
            } else {
                Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.');
            }
        }
    } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Failed to generate PDF. Check the backend server console for details.');
    } finally {
        setLoading(false);
    }
  };

  const templateOptions = [
    { label: '--- Select a template ---', value: '' },
    ...templates.map(t => ({ 
      label: t.name || 'Unnamed Template', 
      value: t.name || '' 
    }))
  ];

  // Debug: Log template options
  useEffect(() => {
    console.log("Templates state:", templates);
    console.log("Template options:", templateOptions);
  }, [templates]);

  const userOptions = [
    { label: '--- Select a user to fetch data ---', value: '' },
    ...users.map(u => ({ label: u.name, value: u._id }))
  ];

  const requiresUser = selectedTemplate && selectedTemplate.toLowerCase().includes('salary');

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleIcon}>✨</Text>
          <Text style={styles.title}>PDF Preview & Generation</Text>
        </View>
        <Text style={styles.subtitle}>Select a template and generate your PDF</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>📋</Text>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Template Selection</Text>
            {templates.length > 0 && (
              <Text style={styles.templateCount}>({templates.length} available)</Text>
            )}
          </View>
        </View>
        {templates.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading templates...</Text>
          </View>
        ) : (
          <CustomDropdown
            label="1️⃣ Select Template"
            options={templateOptions}
            selectedValue={selectedTemplate}
            onSelect={setSelectedTemplate}
            placeholder="--- Select a template ---"
          />
        )}

        {/* Conditional User Dropdown */}
        {requiresUser && users.length > 0 && (
          <View style={styles.userDropdownContainer}>
            <CustomDropdown
              label="2️⃣ Select User"
              options={userOptions}
              selectedValue={selectedUser}
              onSelect={setSelectedUser}
              placeholder="--- Select a user to fetch data ---"
            />
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.generateButton, loading && styles.generateButtonDisabled]} 
        onPress={generatePDF} 
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#ffffff" style={styles.loadingSpinner} />
            <Text style={styles.generateButtonText}>Generating PDF...</Text>
          </View>
        ) : (
          <View style={styles.generateButtonContent}>
            <Text style={styles.generateButtonIcon}>🚀</Text>
            <Text style={styles.generateButtonText}>GENERATE PDF</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 20
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center'
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  titleIcon: {
    fontSize: 36,
    marginRight: 12
  },
  title: { 
    fontSize: 34, 
    fontWeight: '800', 
    textAlign: 'center',
    color: '#0f172a',
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500'
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    marginTop: 16
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 10
  },
  cardTitleContainer: {
    flex: 1
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.3
  },
  templateCount: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500'
  },
  userDropdownContainer: {
    marginTop: 20
  },
  label: { 
    fontSize: 15, 
    marginBottom: 10, 
    marginTop: 5, 
    fontWeight: '600',
    color: '#334155'
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  dropdownText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
    fontWeight: '500'
  },
  placeholderText: {
    color: '#94a3b8',
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b'
  },
  modalClose: {
    fontSize: 28,
    color: '#64748b',
    fontWeight: '300'
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: '#f1f5f9'
  },
  modalScrollView: {
    maxHeight: 400
  },
  dropdownOption: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownOptionSelected: {
    backgroundColor: '#eef2ff',
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1'
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#334155',
  },
  dropdownOptionTextSelected: {
    fontWeight: '700',
    color: '#6366f1',
  },
  generateButton: {
    backgroundColor: '#3b82f6',
    padding: 20,
    borderRadius: 14,
    marginTop: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8
  },
  generateButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0.1
  },
  generateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  generateButtonIcon: {
    fontSize: 22,
    marginRight: 10
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500'
  },
  loadingSpinner: {
    marginRight: 10
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center'
  }
});