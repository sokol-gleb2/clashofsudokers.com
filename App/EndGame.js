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
    const { user, opponent } = route.params;

    const gridSize = 9;
    const [result, setResult] = useState("Draw");
    const [token, setToken] = useState(null);
    const [gridStates, setGridStates] = useState(Array.from({ length: gridSize }, () => Array(gridSize).fill('E'))); // Empty <- other options: 'F' filled, 'FY' filled you, 'FO' filled opponent, 'LY' locked you, 'LO' locked opponent, 'LOUT' you are locked out (for 5 secs), 'NY' you are in notes mode
    const [youScore, setYouScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [time, setTime] = useState(853);

    const formatTime = () => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (user.username == "benjiii") {
            setGridStates([['F', 'FO', 'FO', 'FY', 'FY', 'FO', 'FO', 'F', 'FO'],
            ['FO', 'FO', 'F', 'FY', 'F', 'F', 'FO', 'F', 'FY'],
            ['FO', 'F', 'FO', 'F', 'FO', 'FY', 'FY', 'FO', 'F'],
            ['F', 'FY', 'FO', 'F', 'FY', 'FO', 'FY', 'F', 'FY'],
            ['F', 'F', 'FY', 'F', 'FO', 'FO', 'FY', 'FY', 'FY'],
            ['FY', 'F', 'F', 'FY', 'F', 'FY', 'F', 'FY', 'FY'],
            ['FY', 'FY', 'F', 'FY', 'FY', 'FO', 'F', 'FY', 'FO'],
            ['FY', 'FO', 'FO', 'F', 'FO', 'FY', 'FY', 'FO', 'FY'],
            ['F', 'FY', 'F', 'FO', 'FY', 'F', 'FY', 'FB', 'FO']]);

            setYouScore(31);
            setOpponentScore(26);
            setResult("Winner");
        } else {
            setGridStates([['F', 'FY', 'FY', 'FO', 'FO', 'FY', 'FY', 'F', 'FY'],
            ['FY', 'FY', 'F', 'FO', 'F', 'F', 'FY', 'F', 'FO'],
            ['FY', 'F', 'FY', 'F', 'FY', 'FO', 'FO', 'FY', 'F'],
            ['F', 'FO', 'FY', 'F', 'FO', 'FY', 'FO', 'F', 'FO'],
            ['F', 'F', 'FO', 'F', 'FY', 'FY', 'FO', 'FO', 'FO'],
            ['FO', 'F', 'F', 'FO', 'F', 'FO', 'F', 'FO', 'FO'],
            ['FO', 'FO', 'F', 'FO', 'FO', 'FY', 'F', 'FO', 'FY'],
            ['FO', 'FY', 'FY', 'F', 'FY', 'FO', 'FO', 'FY', 'FO'],
            ['F', 'FO', 'F', 'FY', 'FO', 'F', 'FO', 'FB', 'FY']])
            
            setYouScore(26);
            setOpponentScore(31);
            setResult("Loser");
        }
    }, [user])

    const [grid, setGrid] = useState(Array.from({ length: gridSize }, () => Array(gridSize).fill(-1)));
    const playingMode = "play";
    const [notes, setNotes] = useState(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => [])));


    const delta = user.rating < opponent.rating ? -1 : 1
    const [newRatingDiff, setNewRatingDiff] = useState(0)

    useEffect(() => {
        if (user.username == "benjiii") {
            setNewRatingDiff(141)
        } else {
            setNewRatingDiff(-39)
        }
    }, [user])

    const onCellPressed = (rowIndex, columnIndex) => {
        // dummy procedure - doesn't do anything
    }

    const onHomeButtonPressed = () => {
        navigation.navigate("Home")
    }


    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             let token = await SecureStore.getItemAsync('secure_token');
    //             setToken(token);
    //         } catch (e) {
    //             alert("Sorry some error has occured 2");
    //             navigation.navigate("Home");
    //         }
    //     }

    //     fetchData()

        
    // }, []);


    // useEffect(() => {
    //     if (newRatingDiff != null) {
    //         let youUpload = false;
    //         if (youScore > opponentScore) {
    //             youUpload = true;
    //         } else if (youScore == opponentScore) {
    //             if (user.username < opponent.username) { // if a draw, then the username that comes first in the alphabet saves
    //                 youUpload = true;
    //             }
    //         }
            
    //         if (youUpload) {

    //             // save to db
    //             // the winner is responsible to save to db!
    //             let deltaO = user.rating < opponent.rating ? 1 : -1
    //             const opponentNewRating = 0.94660185 + 0.75045995*puzzle.complexity + 1.10087091*(durationMinutes * 60 + durationSeconds) + 0.89018092*(opponent.wins + opponent.losses + opponent.draws) + 0.80039273*(Math.pow(10, deltaO*(opponent.rating - user.rating)*(opponentScore - youScore)/6400))
    //             let formData = new FormData();
    //             formData.append("clash_id", clash_id);
    //             formData.append("opponent", opponent.username);
    //             formData.append("user_rating_before", user.rating);
    //             formData.append("opponent_rating_before", opponent.rating);
    //             formData.append("duration", durationMinutes*60 + durationSeconds);
    //             formData.append("winner", user.username);
    //             formData.append("user_rating_after", user.rating + newRatingDiff);
    //             formData.append("opponent_rating_after", opponentNewRating);
    //             formData.append("token", token);
    
    //             fetch(`${API_URL}/saveclashoutcome`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'multipart/form-data',
    //                 },
    //                 body: formData,
    //             })
    //             .then(async res => { })
    //             .catch(err => {
    //                 alert("Something went wrong. Please try again!");
    //                 console.log(err);
    //             });
    
    //             try {
    //                 if (youScore > opponentScore) {
    //                     AsyncStorage.setItem('wins',user.wins+1);
    //                 } else if (youScore == opponentScore) {
    //                     AsyncStorage.setItem('draws',user.draws + 1);
    //                 } else {
    //                     AsyncStorage.setItem('losses',user.losses+1);
    //                 }
    //             } catch (error) {
    //                 // alert("Sign Up failed. Please try again!");
    //                 console.log(error.message);
    //             }

    //         }


    //     }
    // }, [newRatingDiff])


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

            <Image style={styles.logo} source={require('./images/logo.png')} />

            <Text style={styles.resultWriting}>{result}</Text>

            <View style={styles.clockContainer}>
                <View style={styles.clock}>
                    <Text style={styles.clockText}>{formatTime()}</Text>
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
                    <Text style={styles.scorePlayerName}>{opponent.name}</Text>
                    <Text style={styles.scorePlayerScore}>{opponentScore}</Text>
                </View>
            </View>

            {newRatingDiff >= 0 ?
                <Text style={[styles.ratingDiff, styles.gain]}>+{newRatingDiff}</Text>
            : <Text style={[styles.ratingDiff, styles.loss]}>{newRatingDiff}</Text>}

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
        height: '100%'
    },
    sudokuGrid: {
        width: '70%',
        aspectRatio: 1,
    },
    resultWriting: {
        fontFamily: 'Nunito-ExtraBold',
        fontSize: 50,
        color: '#673AB7',
        position: 'relative',
        marginTop: 200
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
        width: '70%',
        height: 120,
        marginLeft: 10,
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
        fontSize: 25,
        fontFamily: 'Nunito-Bold'
    },
    gain: {
        color: 'rgba(0, 255, 0, 1)'
    },
    loss: {
        color: 'rgba(255, 0, 0, 1)'
    },
    logo: {
        width: 200,
        height: 83.87,
        resizeMode: 'cover',
        position: 'absolute',
        right: '5%',
        top: 50
    }
})


export default EndGame;