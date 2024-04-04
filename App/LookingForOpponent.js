import { useState, useCallback, useEffect } from 'react'; 
import { StyleSheet, View, Text } from "react-native";
import { API_URL, API } from './config';
import UserBanner from './UserBanner'
import Timer from './Timer'
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';



const fetchDataForClash = async () => {

    try {
        const name = await AsyncStorage.getItem('name');
        const username = await AsyncStorage.getItem('username');
        const rank = await AsyncStorage.getItem('rank');
        const wins = await AsyncStorage.getItem('wins');
        const losses = await AsyncStorage.getItem('losses');
        const draws = await AsyncStorage.getItem('draws');
        const imageUrl = await AsyncStorage.getItem('imageUrl');

        return {name: name, username: username, rating: rank, wins: wins, losses: losses, draws: draws, profilePicture: imageUrl};
    } catch (error) {
        // Error retrieving data
        console.error(error.message);
        return null;
    }
}


const LookingForOpponent = ({navigation}) => {

    const [opponentFound, setOpponentFound] = useState(false);
    const [user, setUser] = useState({});
    const [opponent, setOpponent] = useState({});
    const [showTimer, setShowTimer] = useState(false);
    const [timeTillStart, setTimeTillStart] = useState(null);
    const [puzzle, setPuzzle] = useState(null);
    const [webSocket, setWebSocket] = useState(null);
    const [clash_id, setClashId] = useState(null);

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

    useEffect(() => {
        const socket = io(`http://${API}:3001`);

        const fetchData = async () => {
            const data = await fetchDataForClash();
            if (data) {
                setUser(data);
                setWebSocket(socket);
            } else {
                alert("Something went wrong. Please try again.");
                navigation.navigate("Home");
            }
        };

        socket.on('connect', () => {
            fetchData();
        })

        return () => {
            socket.disconnect();
        };
    }, []);
    

    const sendMessage = (message) => {
        webSocket.emit('message', JSON.stringify(message));
    };


    useEffect(() => {
        if (webSocket && Object.keys(user).length > 0) {
            webSocket.on('message', (message) => {
                const data = JSON.parse(message);
                console.log(data.to);
                console.log(user);
                if (data.to === user.username) {
                    const info = data;
                    const message = info.message;
                    if (message == "OPPONENT_RETURN" && !opponentFound) {
                        setOpponent({
                            username: info.fromUsername,
                            name: info.fromName,
                            rating: info.fromRating,
                            wins: info.fromWins,
                            losses: info.fromLosses,
                            draws: info.fromDraws,
                            profilePicture: info.fromProfilePicture
                        });
                        setOpponentFound(true);
                        console.log(opponent);
    
                        // echo back that we are ready on this end
                        sendMessage({
                            type: "reply",
                            to: opponent.username,
                            from: user.username
                        });
                    } else if (message == "BEGIN") {
                        // start 10s timer
                        // get the puzzle
                        setPuzzle(info.attachment.puzzle);
                        setClashId(info.attachment.clash_id);
                        setTimeTillStart(10);
                        setShowTimer(true);
    
                    } else if ((message == "SYSTEM_ERROR" || message == "CANCEL") && data.fromUsername == opponent.username) {
                        // something has gone wrong, restart the whole process
                        setOpponentFound(false);
                        setShowTimer(false);
                        alert("Something went wrong starting the clash. Please try again!");
                        navigation.navigate("Home");
                    }
                }
            });
            // Only send the message once the user is set and the WebSocket is connected
            const message = {
                type: "joinQueueReq",
                user: user
            };
            webSocket.emit('message', JSON.stringify(message));
        }
    }, [webSocket, user]);

    useEffect(() => {
        // Stop the timer when it reaches 0
        if (timeTillStart === 0) {
            navigation.navigate('GamePlay', { user: user, opponent: opponent, puzzle: puzzle, clash_id: clash_id });
        }
    
        // Decrease the timer by 1 every second
        const interval = setInterval(() => {
            setTimeTillStart(timeTillStart => timeTillStart - 1);
        }, 1000);
    
        // Clear the interval when the component is unmounted or the timer reaches 0
        return () => clearInterval(interval);
    }, [timeTillStart]);


    if (!fontsLoaded) {
        return null;
    }


    return (
        <View style={styles.outerContainer}>
            {
                !opponentFound ? <Text style={styles.text}>Looking For Opponent...</Text> :
                <View style={styles.innerContainer}>
                    <UserBanner user={user} />
                    <Text style={styles.text}>VS</Text>
                    <UserBanner user={opponent} />
                    {showTimer ? <Timer style={styles.timer} time={timeTillStart} /> : null}
                </View>

            }
        </View>
    )
}


const styles = StyleSheet.create({
    outerContainer: {
        margin: 2,
        height: '100%',
        display:  'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerContainer: {
        height: '100%',
        width: '100%',
        margin: 0,
        display:  'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 40,
        fontFamily: 'Nunito-ExtraBold',
        color: '#673AB7',
        position: 'relative',
    },
    timer: {
        position: 'absolute',
        bottom: 20
    }
})


export default LookingForOpponent;