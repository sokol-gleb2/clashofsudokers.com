import { useState, useCallback, useEffect } from 'react'; 
import { StyleSheet, View, Text, TouchableHighlight } from 'react-native';
import { useFonts } from 'expo-font';


const Buttons = ({ updateCell }) => {

    const buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9]

    const [fontsLoaded] = useFonts({
        'Nunito-ExtraBold': require('../assets/fonts/Nunito-ExtraBold.ttf'),
        'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
        'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
    });

    // Handle layout after fonts are loaded
    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }


    return (
        <View style={styles.outerContainer}>
            {buttons.map((number) => (
                <TouchableHighlight key={`number-${number}`} style={styles.numberButton} onPress={() => {updateCell(number)}}>
                    <Text style={styles.numberButtonText}>{number}</Text>
                </TouchableHighlight>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        margin: 5,
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: 100,
        marginTop: 0
    },
    numberButton: {
        aspectRatio: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        shadowColor: 'rgba(0,0,0,0.25)',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 3,
        borderRadius: 5,
        flex: 1,
        margin: 2
    },
    numberButtonText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 17,
        color: '#673AB7'
    }
    
});

export default Buttons;
