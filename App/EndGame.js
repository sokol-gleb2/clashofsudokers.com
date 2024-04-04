import { StatusBar } from 'expo-status-bar';
import { useState, useCallback, useEffect } from 'react'; 
import { Animated, StyleSheet, Text, View, Image, TextInput, TouchableHighlight, Dimensions, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useFonts } from 'expo-font';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native';
import SudokuGrid from './SudokuGrid';
import GameStats from './GameStats';
import ToggleButtons from './ToggleButtons';
import Buttons from './Buttons';
import { API, API_URL } from './config';
import io from 'socket.io-client';


const EndGame = ({ route, navigation}) => {
    const { user, opponent, puzzle, clash_id, gridStates, youScore, opponentScore, durationMinutes, durationSeconds } = route.params;

    const [result, setResult] = useState("Draw");
    const [token, setToken] = useState(null);

    if (youScore < opponentScore) {
        setResult("Loser");
    } else if (youScore > opponentScore) {
        setResult("Winner");
    }

    const [grid, setGrid] = useState(Array.from({ length: gridSize }, () => Array(gridSize).fill(-1)));
    const playingMode = "play";
    const [notes, setNotes] = useState(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => [])));

    const [minutesDisplay, setMinutesDisplay] = useState(durationMinutes < 10 ? `0${durationMinutes}` : `${durationMinutes}`);
    const [secondsDisplay, setSecondsDisplay] = useState(durationSeconds < 10 ? `0${durationSeconds}` : `${durationSeconds}`);


    const delta = user.rating < opponent.rating ? -1 : 1
    const [newRatingDiff, setNewRatingDiff] = useState(0.94660185 + 0.75045995*puzzle.complexity + 1.10087091*(durationMinutes * 60 + durationSeconds) + 0.89018092*(user.wins + user.losses + user.draws) + 0.80039273*(Math.pow(10, delta*(user.rating - opponent.rating)*(youScore - opponentScore)/6400)) - user.rating)

    const onCellPressed = (rowIndex, columnIndex) => {
        // dummy procedure - doesn't do anything
    }


    useEffect(() => {
        const fetchData = async () => {
            try {
                let token = await SecureStore.getItemAsync('secure_token');
                setToken(token);
            } catch (e) {
                alert("Sorry some error has occured 2");
                navigation.navigate("Home");
            }
        }

        fetchData()

        
    }, []);


    useEffect(() => {
        if (newRatingDiff != null) {
            let youUpload = false;
            if (youScore > opponentScore) {
                youUpload = true;
            } else if (youScore == opponentScore) {
                if (user.username < opponent.username) { // if a draw, then the username that comes first in the alphabet saves
                    youUpload = true;
                }
            }
            
            if (youUpload) {

                // save to db
                // the winner is responsible to save to db!
                let deltaO = user.rating < opponent.rating ? 1 : -1
                const opponentNewRating = 0.94660185 + 0.75045995*puzzle.complexity + 1.10087091*(durationMinutes * 60 + durationSeconds) + 0.89018092*(opponent.wins + opponent.losses + opponent.draws) + 0.80039273*(Math.pow(10, deltaO*(opponent.rating - user.rating)*(opponentScore - youScore)/6400))
                let formData = new FormData();
                formData.append("clash_id", clash_id);
                formData.append("opponent", opponent.username);
                formData.append("user_rating_before", user.rating);
                formData.append("opponent_rating_before", opponent.rating);
                formData.append("duration", durationMinutes*60 + durationSeconds);
                formData.append("winner", user.username);
                formData.append("user_rating_after", user.rating + newRatingDiff);
                formData.append("opponent_rating_after", opponentNewRating);
                formData.append("token", token);
    
                fetch(`${API_URL}/saveclashoutcome`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formData,
                })
                .then(async res => { })
                .catch(err => {
                    alert("Something went wrong. Please try again!");
                    console.log(err);
                });
    
                try {
                    if (youScore > opponentScore) {
                        AsyncStorage.setItem('wins',user.wins+1);
                    } else if (youScore == opponentScore) {
                        AsyncStorage.setItem('draws',user.draws + 1);
                    } else {
                        AsyncStorage.setItem('losses',user.losses+1);
                    }
                } catch (error) {
                    // alert("Sign Up failed. Please try again!");
                    console.log(error.message);
                }

            }


        }
    }, [newRatingDiff])


    const [fontsLoaded] = useFonts({
        'Nunito-ExtraBold': require('../assets/fonts/Nunito-ExtraBold.ttf'),
        'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
        'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
    });

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

            <Text style={styles.resultWriting}>{result}</Text>

            <View style={styles.clockContainer}>
                <View style={styles.clock}>
                    <Text style={styles.clockText}>{minutesDisplay} : {secondsDisplay}</Text>
                </View>
            </View>

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

            {newRatingDiff >= 0 ?
                <Text style={[styles.ratingDiff, styles.gain]}>+{newRatingDiff}</Text>
            : <Text style={[styles.ratingDiff, styles.loss]}>-{newRatingDiff}</Text>}

            <View style={styles.sudokuGrid}>
                <SudokuGrid grid={grid} onCellPressed={onCellPressed} gridStates={gridStates} notes={notes} mode={playingMode} />
            </View>

            <View style={styles.goHomeButtonContainer}>
                <TouchableHighlight style={styles.goHomeButton} onPress={onHomeButtonPressed}>
                    <MaterialCommunityIcons name={'home'} color={'#673AB7'} size={50} />
                </TouchableHighlight>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    outerContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    sudokuGrid: {
        width: '70%',
        aspectRatio: 1,
    },
    resultWriting: {
        fontFamily: 'Nunito-ExtraBold',
        fontSize: 25,
        color: '#673AB7',
    },
    clockContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    clock: {
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
    ratingDiff: {
        fontSize: 20,
        fontFamily: 'Nunito-Bold'
    },
    gain: {
        color: 'rgba(0, 255, 0, 1)'
    },
    loss: {
        color: 'rgba(255, 0, 0, 1)'
    }
})


export default EndGame;