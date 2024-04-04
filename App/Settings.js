import { StatusBar } from 'expo-status-bar';
import { useState, useCallback, useEffect } from 'react'; 
import { Animated, StyleSheet, Text, View, Image, TextInput, TouchableHighlight, Dimensions, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useFonts } from 'expo-font';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native';
import { API_URL } from './config';


const Settings = ({navigation}) => {

    const [showPopUp, setShowPopUp] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [fontsLoaded] = useFonts({
        'Nunito-ExtraBold': require('../assets/fonts/Nunito-ExtraBold.ttf'),
        'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
        'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded && dataLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);
    
    if (!fontsLoaded) {
        return null;
    }

    const onProfileSettingsClicked = () => {
        navigation.navigate("ProfileSettings");
    }

    const onDeleteAccountClicked = () => {
        // are you sure?
        setShowPopUp(true);
    }

    const onHomeButtonPressed = () => {
        navigation.navigate("Home");
    }

    const closePopUp = () => {
        setShowPopUp(false);
    }

    const deleteAccount = () => {
        setIsProcessing(true);

        fetch(`${API_URL}/deleteaccount`, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(async res => { 
            setIsProcessing(false);
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                    alert("Something went wrong. Please try again!");
                } else {
                    alert("Account deleted :(. Hope to see you again soon!");
                    navigation.navigate("Home");
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            setIsProcessing(false);
            alert("Something went wrong. Please try again!");
            console.log(err);
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.bigCircle}></View>
            <View style={styles.smallCircle}></View>

            <Text style={styles.title}>Your Settings</Text>
            <TouchableHighlight style={styles.settingsButton} onPress={onProfileSettingsClicked}>
                <View style={styles.settingsButtonView}>
                    <MaterialCommunityIcons name={'account-cog'} color={'#673AB7'} size={50} style={[{flex: 1}]} />
                    <Text style={styles.settingsButtonText}>ACCOUNT SETTINGS</Text>
                </View>
            </TouchableHighlight>
            <TouchableHighlight style={styles.settingsButton} onPress={onDeleteAccountClicked}>
                <View style={styles.settingsButtonView}>
                    <MaterialCommunityIcons name={'delete'} color={'red'} size={50} style={[{flex: 1}]} />
                    <Text style={[styles.settingsButtonText, styles.redText]}>DELETE ACCOUNT</Text>
                </View>
            </TouchableHighlight>
            <View style={styles.goHomeButtonContainer}>
                <TouchableHighlight style={styles.goHomeButton} onPress={onHomeButtonPressed}>
                    <MaterialCommunityIcons name={'home'} color={'#673AB7'} size={50} />
                </TouchableHighlight>
            </View>

            {showPopUp ? <View style={styles.popUpContainer}>
                <View style={styles.popUp}>
                    <Text style={styles.popUpText}>Are you sure?</Text>
                    <View style={styles.buttons}>
                        <TouchableHighlight style={styles.noButton} onPress={closePopUp}>
                            <Text style={[{color: 'black', fontSize: 22, fontFamily: 'Nunito-Bold'}]}>No</Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={styles.yesButton} onPress={deleteAccount}>
                            <Text style={[{color: 'white', fontSize: 22, fontFamily: 'Nunito-Bold'}]}>Yes</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </View> : null}

            {isProcessing ? 
                <BlurView
                    style={styles.blurView}
                    intensity={15}
                    tint="light"
                />
            : null}
            {isProcessing ? 
                <View style={[styles.loadingContainer]}> 
                    <ActivityIndicator size={30} color="#000" style={styles.loader} />
                </View> 
            : null}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        alignItems: 'center',
        width: '100%',
        height: '100%',
        paddingTop: 50,
        overflow: 'hidden'
    },
    bigCircle: {
        zIndex: 1,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#D1C4E9',
        position: 'absolute',
        bottom: 100,
        left: -120
    },
    smallCircle: {
        zIndex: 1,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#D1C4E9',
        position: 'absolute',
        bottom: 20,
        right: 50
    },
    title: {
        fontSize: 50,
        fontFamily: 'Nunito-Bold',
        width: '100%',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 10,
        color: '#673AB7'
    },
    settingsButton: {
        width: '98%',
        margin: '1%',
        padding: 20,
        position: 'relative',
        zIndex: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: 'rgba(0, 0, 0, 0.7)',
    },
    settingsButtonView: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center'
    },
    settingsButtonText: {
        flex: 2,
        fontFamily: 'Nunito-Bold',
        textAlign: 'left',
        fontSize: 20,
        color: '#673AB7'
    },
    redText: {
        color: 'red'
    },
    goHomeButtonContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 50,
        zIndex: 10
    },
    goHomeButton: {
        flex: 1,
        width: 80,
        height: 80,
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '50%',
        shadowColor: 'rgba(0,0,0,0.25)',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 5,
    },
    popUpContainer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 99,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    popUp: {
        width: 220,
        height: 150,
        borderRadius: 20,
        backgroundColor: 'white',
        shadowColor: 'rgba(0,0,0,0.25)',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 10,
        display: 'flex',
        alignItems: 'center'
    },
    popUpText: {
        fontSize: 30,
        color: '#673AB7',
        fontFamily: 'Nunito-Bold',
        marginTop: 20,
        marginBottom: 20
    },
    buttons: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        width: '100%',
        justifyContent: 'space-around'
    },
    yesButton: {
        backgroundColor: 'red',
        borderRadius: 10,
        width: 60,
        height: 35,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent'
    },
    noButton: {
        backgroundColor: 'transparent',
        borderRadius: 10,
        width: 60,
        height: 35,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'black'
    }
});

export default Settings;