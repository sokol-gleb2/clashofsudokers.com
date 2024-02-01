import { StatusBar } from 'expo-status-bar';
import { useState, useCallback, useEffect } from 'react'; 
import { Animated, StyleSheet, Text, View, Image, TextInput, TouchableHighlight, Dimensions, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useFonts } from 'expo-font';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native';
import SudokuGrid from './SudokuGrid';


const API_URL = 'http://192.168.0.47:3001';


const GamePlay = ({navigation}) => {

    return (
        <SafeAreaView>
            <SudokuGrid />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    

})

export default GamePlay;