import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config'; 

const initialField = { key: '', mapping_field: '', default_value: '', alignment: 'Left' };

export default function CreateTemplateScreen() {
  const [templateName, setTemplateName] = useState('');
  const [sections, setSections] = useState({
    Header: [ { ...initialField, key: "Template Title", alignment: 'Center' } ],
    Body: [ { ...initialField, key: "Field 1" } ],
    Footer: []
  });

  const updateSection = (sectionKey, newFields) => {
    setSections(prev => ({ ...prev, [sectionKey]: newFields }));
  };

  const addField = (sectionKey) => {
    updateSection(sectionKey, [...sections[sectionKey], { ...initialField }]);
  };

  const removeField = (sectionKey, index) => {
    const newFields = sections[sectionKey].filter((_, i) => i !== index);
    updateSection(sectionKey, newFields);
  };

  const updateField = (sectionKey, index, field, value) => {
    const newFields = [...sections[sectionKey]];
    newFields[index][field] = value;
    updateSection(sectionKey, newFields);
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
        Alert.alert("Error", "Please enter a Template Name.");
        return;
    }

    const payload = {
      name: templateName,
      Header: sections.Header,
      Body: sections.Body,
      Footer: sections.Footer
    };

    try {
      await axios.post(`${API_URL}/templates`, payload);
      Alert.alert('Success', `Template "${templateName}" saved successfully!`);
      // Reset form after successful save (optional)
      setTemplateName('');
      setSections({ Header: [ { ...initialField, key: "Template Title", alignment: 'Center' } ], Body: [ { ...initialField, key: "Field 1" } ], Footer: [] });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save template. Check your API URL and server status.');
    }
  };

    const getSectionIcon = (sectionKey) => {
      const icons = { Header: '🎯', Body: '📝', Footer: '📍' };
      return icons[sectionKey] || '📄';
    };

    const getSectionColor = (sectionKey) => {
      const colors = { Header: '#6366f1', Body: '#8b5cf6', Footer: '#ec4899' };
      return colors[sectionKey] || '#6b7280';
    };

    const getSectionGradient = (sectionKey) => {
      const gradients = { 
        Header: ['#6366f1', '#818cf8'], 
        Body: ['#8b5cf6', '#a78bfa'], 
        Footer: ['#ec4899', '#f472b6'] 
      };
      return gradients[sectionKey] || ['#6b7280', '#9ca3af'];
    };

  const renderSectionFields = (sectionKey) => (
    <View key={sectionKey} style={styles.sectionContainer}>
      <View style={[styles.sectionHeader, { 
        borderLeftColor: getSectionColor(sectionKey),
        backgroundColor: `${getSectionColor(sectionKey)}15`
      }]}>
        <View style={styles.sectionIconContainer}>
          <Text style={styles.sectionIcon}>{getSectionIcon(sectionKey)}</Text>
        </View>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{sectionKey} Section</Text>
          <Text style={styles.sectionSubtitle}>Configure fields for {sectionKey.toLowerCase()}</Text>
        </View>
      </View>
      {sections[sectionKey].map((field, index) => (
        <View key={index} style={styles.fieldBox}>
            <View style={styles.fieldRow}>
                <Text style={styles.label}>🏷️ Key (Label)</Text>
                <TextInput 
                    value={field.key} 
                    onChangeText={(text) => updateField(sectionKey, index, 'key', text)} 
                    style={styles.input}
                    placeholder="Enter field label"
                    placeholderTextColor="#bbb"
                />
            </View>

            <View style={styles.fieldRow}>
                <Text style={styles.label}>🔗 Mapping Field (JSON Path)</Text>
                <TextInput 
                    value={field.mapping_field} 
                    onChangeText={(text) => updateField(sectionKey, index, 'mapping_field', text)} 
                    style={styles.input}
                    placeholder="e.g., payDetail.total_salary_amount"
                    placeholderTextColor="#bbb"
                />
            </View>

            <View style={styles.fieldRow}>
                <Text style={styles.label}>⚙️ Default Value</Text>
                <TextInput 
                    value={field.default_value} 
                    onChangeText={(text) => updateField(sectionKey, index, 'default_value', text)} 
                    style={styles.input}
                    placeholder="Value if mapping fails"
                    placeholderTextColor="#bbb"
                />
            </View>

          {/* Alignment Selector */}
          <View style={styles.alignmentContainer}>
            <Text style={styles.label}>📐 Alignment:</Text>
            <View style={styles.alignmentButtons}>
              {['Left', 'Center', 'Right'].map((align) => (
                <TouchableOpacity 
                  key={align} 
                  style={[
                    styles.alignButton, 
                    field.alignment === align && styles.alignButtonActive
                  ]}
                  onPress={() => updateField(sectionKey, index, 'alignment', align)} 
                >
                  <Text style={[
                    styles.alignText, 
                    field.alignment === align && styles.alignTextActive
                  ]}>
                    {align === 'Left' ? '⬅️' : align === 'Center' ? '↔️' : '➡️'} {align}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.removeButton} 
            onPress={() => removeField(sectionKey, index)}
          >
            <Text style={styles.removeButtonText}>🗑️ Remove Field</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => addField(sectionKey)}
      >
        <Text style={styles.addButtonText}>➕ Add Field to {sectionKey}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleIcon}>✨</Text>
          <Text style={styles.title}>Template Creation</Text>
        </View>
        <Text style={styles.subtitle}>Create custom PDF templates with dynamic fields</Text>
        <View style={styles.divider} />
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>📋</Text>
          <Text style={styles.cardTitle}>Template Information</Text>
        </View>
        <TextInput 
          placeholder="Enter template name (e.g., Salary Slip, Invoice, Bill)" 
          value={templateName} 
          onChangeText={setTemplateName} 
          style={styles.templateNameInput}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {renderSectionFields('Header')}
      {renderSectionFields('Body')}
      {renderSectionFields('Footer')}

      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={saveTemplate}
        activeOpacity={0.8}
      >
        <View style={styles.saveButtonContent}>
          <Text style={styles.saveButtonIcon}>💾</Text>
          <Text style={styles.saveButtonText}>SAVE TEMPLATE</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: '#f8fafc'
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40
    },
    headerContainer: {
        marginBottom: 30,
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
        backgroundColor: '#6366f1',
        borderRadius: 2,
        marginTop: 16
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#6366f1',
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
        marginBottom: 16
    },
    cardIcon: {
        fontSize: 24,
        marginRight: 10
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        letterSpacing: -0.3
    },
    templateNameInput: {
        borderWidth: 2, 
        borderColor: '#e2e8f0', 
        borderRadius: 12, 
        padding: 16, 
        fontSize: 16,
        backgroundColor: '#ffffff',
        color: '#1e293b',
        fontWeight: '500'
    },
    sectionContainer: { 
        marginTop: 24, 
        padding: 24, 
        backgroundColor: '#ffffff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 5
    },
    sectionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    sectionIcon: {
        fontSize: 28
    },
    sectionTitleContainer: {
        flex: 1
    },
    sectionTitle: { 
        fontSize: 22, 
        fontWeight: '800', 
        color: '#0f172a',
        marginBottom: 4,
        letterSpacing: -0.5
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500'
    },
    fieldBox: { 
        borderWidth: 1.5, 
        borderColor: '#e2e8f0', 
        padding: 20, 
        marginBottom: 18, 
        borderRadius: 14, 
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2
    },
    fieldRow: { 
        marginBottom: 16 
    },
    label: { 
        fontSize: 14, 
        color: '#475569',
        fontWeight: '700',
        marginBottom: 10,
        letterSpacing: 0.2
    },
    input: { 
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: 14, 
        fontSize: 15,
        backgroundColor: '#f8fafc',
        color: '#1e293b',
        fontWeight: '500'
    },
    alignmentContainer: {
        marginTop: 12,
        marginBottom: 12
    },
    alignmentButtons: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 8
    },
    alignButton: {
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1
    },
    alignButtonActive: {
        backgroundColor: '#6366f1',
        borderColor: '#4f46e5',
        shadowColor: '#6366f1',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3
    },
    alignText: {
        color: '#475569',
        fontSize: 13,
        fontWeight: '600'
    },
    alignTextActive: {
        color: '#ffffff',
        fontWeight: '700'
    },
    removeButton: {
        backgroundColor: '#fef2f2',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 1.5,
        borderColor: '#fecaca'
    },
    removeButtonText: {
        color: '#dc2626',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.3
    },
    addButton: {
        backgroundColor: '#eff6ff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 2,
        borderColor: '#bfdbfe',
        borderStyle: 'dashed'
    },
    addButtonText: {
        color: '#2563eb',
        fontWeight: '700',
        fontSize: 15,
        letterSpacing: 0.3
    },
    saveButton: {
        backgroundColor: '#10b981',
        padding: 20,
        borderRadius: 14,
        marginTop: 32,
        marginBottom: 20,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8
    },
    saveButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    saveButtonIcon: {
        fontSize: 22,
        marginRight: 10
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 1
    }
});