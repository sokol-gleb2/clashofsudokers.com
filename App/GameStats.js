import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';

const GameStats = React.memo(({lockTimer, lockedOutTimers, lockTimerDisplayBool, youScore, opponentScore, opponentName, setOuterTime, endBool}) => {

    const [localTime, setLocalTime] = useState(823);

    const [fontsLoaded] = useFonts({
        'Nunito-ExtraBold': require('../assets/fonts/Nunito-ExtraBold.ttf'),
        'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
        'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
    });

    useEffect(() => {
        if (endBool) {
            setOuterTime(localTime);
        }
    }, [endBool])


    useEffect(() => {
        let intervalId;
        intervalId = setInterval(() => {
            setLocalTime(seconds => seconds + 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const formatTime = () => {
        const minutes = Math.floor(localTime / 60);
        const seconds = localTime % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };


    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={[styles.flex, styles.column, styles.mainContainer, styles.alignItemsCenter]}>
            <View style={styles.outerContainer}>
                <View style={styles.scoresContainer}>
                    <View style={styles.scoreBoxContainer}>
                        <View style={[styles.scoreSquare, styles.youSquare]}></View>
                        <Text style={styles.scorePlayerName}>You</Text>
                        <Text style={styles.scorePlayerScore}>{youScore}</Text>
                    </View>
                    <View style={styles.scoreBoxContainer}>
                        <View style={[styles.scoreSquare, styles.opponentSquare]}></View>
                        <Text style={styles.scorePlayerName}>{opponentName}</Text>
                        <Text style={styles.scorePlayerScore}>{opponentScore}</Text>
                    </View>
                </View>
                <View style={styles.clockContainer}>
                    <View style={styles.clock}>
                        <Text style={styles.clockText}>{formatTime()}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.timers}>
                {lockTimerDisplayBool ? <Text style={styles.lockTimer}>{lockTimer.toString()}</Text> : null}
                {Object.keys(lockedOutTimers).map((key) => (
                    <Text key={key} style={styles.lockedOutTimer}>
                        {lockedOutTimers[key].toString()}
                    </Text>
                ))}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    flex: {
        display: 'flex'
    },
    column: {
        flexDirection: 'column'
    },
    alignItemsCenter: {
        alignItems: 'center'
    },
    mainContainer: {
        margin: 5,
    },
    outerContainer: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: 120,
        marginTop: 10
    },
    scoresContainer: {
        flex: 2,
        display: 'flex',
        flexDirection: 'column'
    }, 
    scoreBoxContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    scoreSquare: {
        flex: 1,
        maxWidth: 30,
        height: 30,
        borderRadius: 5,
        margin: 5
    },
    youSquare: {
        backgroundColor: '#673AB7'
    },
    opponentSquare: {
        backgroundColor: '#0D47A1'
    },
    scorePlayerName: {
        flex: 3,
        textAlign: 'left',
        fontSize: 20,
        fontFamily: 'Nunito-Bold'
    },
    scorePlayerScore: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontFamily: 'Nunito-Bold'
    },
    clockContainer: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    clock: {
        // height: 20,
        width: 110,
        borderRadius: 10,
        borderWidth: 4,
        borderColor: '#00BCD4',
        padding: 5,
        overflow: 'hidden'
    },
    clockText: {
        color: '#00BCD4',
        fontSize: 25,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    timers: {
        width: '100%',
        height: 30,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    lockTimer: {
        position: 'relative',
        width: 30,
        height: '100%',
        borderColor: 'rgba(0, 96, 100, 0.9)',
        color: 'rgba(0, 96, 100, 0.9)',
        borderWidth: 1,
        borderRadius: 5,
        fontSize: 25,
        textAlign: 'center'
    },
    lockedOutTimer: {
        position: 'relative',
        textAlign: 'center',
        width: 30,
        height: '100%',
        borderColor: '#FF0000',
        borderRadius: 5,
        color: '#FF0000',
        borderWidth: 1,
        fontSize: 25
    }
});

export default GameStats;
