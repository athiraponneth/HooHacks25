import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 

export default function Profile() {
  const [selectedMode, setSelectedMode] = useState("casual"); // default value
  
  return (
    <>
    <View style={styles.container}>
      <Text style={styles.label}>Select your mode:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedMode}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedMode(itemValue)}
          itemStyle={styles.pickerItem} // Style applied to items in the picker
        >
          <Picker.Item label="Casual" value="casual" />
          <Picker.Item label="Professional" value="professional" />
          <Picker.Item label="Sporty" value="sporty" />
          <Picker.Item label="Formal" value="formal" />
          <Picker.Item label="Relaxed" value="relaxed" />
        </Picker>
      </View>
      
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Save Profile</Text>
      </TouchableOpacity>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between', // This pushes the button to the bottom
    alignItems: 'center',
    backgroundColor: '#F7E6D4',
    padding: 20,
    flexDirection: 'column',
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    color: '#5C6B73',
    marginTop: 150,
  },
  pickerContainer: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderColor: '#E76F51', // Orange border
    borderWidth: 1,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#E76F51', // Text color of the selected item
  },
  pickerItem: {
    color: '#E76F51', // Orange color for the text inside the dropdown
  },
  button: {
    backgroundColor: '#E76F51',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 20,
    marginBottom: 30, // Adds space at the bottom of the screen
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  spacer: {
    flex: 0.05, // This takes up space between the picker and button
  },
});