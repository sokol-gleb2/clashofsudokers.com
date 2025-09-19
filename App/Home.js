import { StatusBar } from 'expo-status-bar';
import { useState, useCallback, useEffect } from 'react'; 
import { Animated, StyleSheet, Text, View, Image, TextInput, TouchableHighlight, Dimensions, TouchableWithoutFeedback } from 'react-native';
// import SvgComponentBottom from './LogInSvgBottom.js';
// import SvgComponentTop from './LogInSvgTop.js';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

// const saveUserData = async (userData) => {
//     try {
//         const jsonValue = JSON.stringify(userData);
//         await AsyncStorage.setItem('USER_DATA', jsonValue);
//     } catch (error) {
//         console.error("Error saving user data", error);
//     }
// };
  
const retrieveUserData = async () => {
    // first get name and stuff from async storage:
    let get_more_details = false;
    try {
        const name = await AsyncStorage.getItem('name');
        const email = await AsyncStorage.getItem('email');
        const username = await AsyncStorage.getItem('username');
        const rank = await AsyncStorage.getItem('rank');
        const wins = await AsyncStorage.getItem('wins');
        const losses = await AsyncStorage.getItem('losses');
        const draws = await AsyncStorage.getItem('draws');
        if (name == null || email == null || username == null || rank == null || wins == null || losses == null || draws == null) {
            get_more_details = true;
        } else {
            return [{name: name, email: email, username: username, rank: rank, wins: wins, losses: losses, draws: draws}, false];
        }
    } catch (error) {
        // Error retrieving data
        get_more_details = true;
        console.error(error.message);
    }

    if (get_more_details) {

        try {

            const token = await SecureStore.getItemAsync('secure_token');
            return fetch(`${API_URL}/getinfo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({token : token}),
            })
            .then(res => res.json())
            .then(jsonRes => {
                return [jsonRes, true];
            })
            .catch(err => {
                console.log(err);
                return null;
            });
        } catch (error) {
            console.log(error.message);
        }

    }
    
};

const retrieveUserImage = async () => {
    let get_more_details = true;
    // try {
    //     const imageUrl = await AsyncStorage.getItem('imageUrl');
    //     const imageTTL = await AsyncStorage.getItem('imageTTL');
    //     const imageTTLDate = new Date(imageTTL); // Directly create a Date object from the ISO string
    //     const now = new Date();
    //     console.log(imageUrl);
    //     console.log(imageTTL);
    //     console.log(now);
    //     if (imageUrl == null || now < imageTTLDate) {
    //         get_more_details = true;
    //     } else {
    //         return {url: imageUrl, save: false};
    //     }
    // } catch (error) {
    //     // Error retrieving data
    //     get_more_details = true;
    //     console.error(error.message);
    // }

    if (get_more_details) {

        try {
            const token = await SecureStore.getItemAsync('secure_token');
            return fetch(`${API_URL}/getimage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({token : token}),
            })
            .then(res => res.json())
            .then(jsonRes => {
                return {url: jsonRes.url, save: true};
            })
            .catch(err => {
                console.log(err);
                return null;
            });
        } catch (error) {
            console.log(error.message);
        }

    }
}


const retrievePreviousGames = async () => {
    try {
        const token = await SecureStore.getItemAsync('secure_token');
        return fetch(`${API_URL}/getgames`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({token : token}),
        })
        .then(res => res.json())
        .then(jsonRes => {
            return jsonRes;
        })
        .catch(err => {
            console.log(err);
            return null;
        });

    } catch (error) {
        console.log(error.message);
    }
}



const Home = ({navigation}) => {

    const [userData, setUserData] = useState({});
    const [dataLoaded, setDataLoaded] = useState(false); // New state for tracking data loading
    const [games, setGames] = useState([]);
    const [imageUrl, setImageUrl] = useState(null);
    const [noGamesYetBanner, setNoGamesYetBanner] = useState(true);
    const [moreGames, setMoreGames] = useState(false);
    const screenWidth = Dimensions.get('window').width;
    const initialPosition = -0.6 * screenWidth; // -60% of screen width
    const [menuAnimation] = useState(new Animated.Value(initialPosition));
    

    const [fontsLoaded] = useFonts({
        'Nunito-ExtraBold': require('../assets/fonts/Nunito-ExtraBold.ttf'),
        'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
        'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
    });
    
    useEffect(() => {
        const fetchData = async () => {
            const token = await SecureStore.getItemAsync('secure_token');
            if (token == null) {
                navigation.navigate('LogIn')
            } else {
                try {
                    const userDataFetched = await retrieveUserData();
                    if (userDataFetched != null) {
                        let userDataF = userDataFetched[0];
                        setUserData(userDataF);
                        if (userDataFetched[1] == true) {
                            console.log("saving");
                            // save it to async storage:
                            try {
                                console.log(userDataF);
                                await AsyncStorage.setItem('name', userDataF.name);
                                await AsyncStorage.setItem('username', userDataF.username);
                                await AsyncStorage.setItem('email', userDataF.email);
                                await AsyncStorage.setItem('rank', userDataF.rank.toString());
                                await AsyncStorage.setItem('wins', userDataF.wins.toString());
                                await AsyncStorage.setItem('losses', userDataF.losses.toString());
                                await AsyncStorage.setItem('draws', userDataF.draws.toString());
                            } catch (error) {
                                // Error retrieving data
                                console.log(error);
                                alert("We couldn't fetch your details. Please try logging in again!");
                                navigation.navigate('LogIn');
                                return null;
                            }
                        }
                    } else {
                        alert("We couldn't fetch your details. Please try logging in again!");
                        navigation.navigate('LogIn');
                        return null;
                    }
                } catch (error) {
                    console.log("UserDataError: " + error.message);
                }
        
                try {
    
                    const previousGamesData = await retrievePreviousGames();
                    if (previousGamesData != null) {
                        console.log(previousGamesData);
                        let new_arr = [];
                        if (userData.username == "glebby") {
                            new_arr.push({
                                "game_id": "test1", "opponent": {"rank": 800, "username": "benjiii"}, "rank_diff": -39, "result": "L"
                            })
                        } else {
                            new_arr.push({
                                "game_id": "test1", "opponent": {"rank": 800, "username": "glebby"}, "rank_diff": 141, "result": "W"
                            })
                        }
                        new_arr.push(previousGamesData[0])
                        setGames(new_arr);
                        if (games.length > 0) {
                            setNoGamesYetBanner(false);
                        } else if (games.length > 5) {
                            setMoreGames(true);
                        }
                        console.log(noGamesYetBanner);
                    } else {
                        alert("We couldn't fetch your details. Please try logging in again!");
                        navigation.navigate('LogIn');
                        return null;
                    }
                } catch (error) {
                    console.log("GamesError: " + error.message);
                }
        
                try {
                    const userImageData = await retrieveUserImage();
                    if (userImageData  != null) {
                        console.log(userImageData);
                        setImageUrl(userImageData.url);
                        // set image uri to async storage
                        // set TTL = 23h 50min (it's 24h when fetching <= making sure there is no error)
                        if (userImageData.save) {
                            const now = new Date();
                            const imageTTL =  new Date(now.getTime() + 23 * 60 * 60 * 1000 + 50 * 60 * 1000); // Adds 23h 50 min hours
                            try {
                                await AsyncStorage.setItem('imageUrl', userImageData.url);
                                await AsyncStorage.setItem('imageTTL', imageTTL.toISOString()); // Directly use ISO string
                            } catch (error) {
                                console.log(error.message);
                            }
                        }
                    } else {
                        alert("We couldn't fetch your details. Please try logging in again!");
                        navigation.navigate('LogIn');
                        return null;
                    }
                } catch (error) {
                    console.log("ImageError: " + error.message);
                }


                setDataLoaded(true);
                // Handle userImageData here
        
                // Once all data is fetched, update dataLoaded state
                // if (errorFetching) {
                //     alert("We couldn't fetch your details. Please try logging in again!");
                //     navigation.navigate('LogIn');
                // } else {
                //     setDataLoaded(true);
                // }

            }
            
        };
    
        fetchData();
    }, []);
    
    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded && dataLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, dataLoaded]);
    
    if (!fontsLoaded || !dataLoaded) {
        return null;
    }
    

    const onViewAllGamesHandler = () => {

    }

    const onNewGameHandler = () => {
        // navigation.navigate("LookingForOpponent")
        let opponent;
        if (userData.username == "glebby") {
            opponent = {username: "benjiii", name: "Benjamin Fletcher", rating: 800, wins: 0, losses: 1, draws: 0};
        } else {
            opponent = {username: "glebby", name: "Gleb Sokolovski", rating: 800, wins: 1, losses: 0, draws: 0}
        }
        navigation.navigate("EndGame", {user: userData, opponent: opponent})
    }

    const onMenuPressed = () => {
        Animated.timing(menuAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false
        }).start();
    }

    const menuSlideOut = () => {
        Animated.timing(menuAnimation, {
            toValue: initialPosition,
            duration: 300,
            useNativeDriver: false
        }).start();
    }

    const onProfileClicked = () => {

    }

    const onSettingsClicked = () => {
        navigation.navigate("Settings");
    }

    const onLogOutClicked = async () => {
        try {
            // Remove everything from async storage
            await SecureStore.deleteItemAsync('secure_token');
            await AsyncStorage.removeItem('name');
            await AsyncStorage.removeItem('email');
            await AsyncStorage.removeItem('username');
            await AsyncStorage.removeItem('rank');
            await AsyncStorage.removeItem('wins');
            await AsyncStorage.removeItem('losses');
            await AsyncStorage.removeItem('draws');
            await AsyncStorage.removeItem('imageUrl');
            await AsyncStorage.removeItem('imageTTL');
            navigation.navigate('LogIn');
        } catch (error) {
            console.error('Error deleting the token:', error);
        }
    }

    return (
        <TouchableWithoutFeedback onPress={menuSlideOut}>
            <View style={styles.container}>
                
                <View style={styles.bigCircle}></View>
                <View style={styles.smallCircle}></View>
                <Image style={styles.logo} source={require('./images/logo.png')} />

                <TouchableHighlight onPress={onMenuPressed} style={styles.menu}>
                    <MaterialCommunityIcons name={'menu'} color={'#673AB7'} size={30} style={[{flex: 1}]} />
                </TouchableHighlight>

                <Animated.View style={[styles.menuBanner, {left: menuAnimation}]}>
                    <TouchableHighlight onPress={onProfileClicked} style={[{width: '100%'}]}>
                        <View style={styles.menuOption}>
                            {imageUrl ? <Image style={styles.menuIcon} source={ {uri: imageUrl} } /> : null}
                            <Text style={styles.menuText}>Profile</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={onSettingsClicked} style={[{width: '100%', marginTop: 70}]}>
                        <View style={styles.menuOption}>
                            <MaterialCommunityIcons style={[styles.menuIcon, {marginTop: 12.5, marginLeft: 7.5}]} name={'cog'} color={'white'} size={45} />
                            <Text style={[styles.menuText, {marginLeft: -7.5}]}>Settings</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={onLogOutClicked} style={[{width: '100%', marginTop: 5}]}>
                        <View style={styles.menuOption}>
                            <MaterialCommunityIcons style={[styles.menuIcon, {marginTop: 12.5, marginLeft: 7.5}]} name={'logout'} color={'red'} size={45} />
                            <Text style={[styles.menuText, {color: 'red', fontFamily: 'Nunito-Bold', marginLeft: -7.5}]}>Log Out</Text>
                        </View>
                    </TouchableHighlight>
                </Animated.View>

                <View style={styles.userDetailsBox}>
                    {imageUrl ? <Image style={styles.profile_image} source={ {uri: imageUrl} } /> : null}
                    <View style={styles.userDetailsContainer}>
                        <Text style={styles.userName}>{userData.name}</Text>
                        <Text style={styles.userRank}>Ranking: {userData.rank}</Text>
                        <Text style={styles.userRank}>W-L-D: <Text style={[{color: '#4CAF50'}]}>{userData.wins}</Text>-<Text style={[{color: '#F00'}]}>{userData.losses}</Text>-<Text style={[{color: '#00F'}]}>{userData.draws}</Text> </Text>
                    </View>
                </View>

                <View style={styles.userHistoryBox}>
                    <Text style={styles.boxHeading}>Previous 5 Games</Text>
                    {games.map((game, index) => (
                        <View key={index} style={styles.game}>
                            <Text style={[styles.result, game.result === 'W' ? styles.W : game.result === 'L' ? styles.L : styles.D]}>{game.result}</Text>
                            <Text style={styles.player}>@{game.opponent.username} ({game.opponent.rank})</Text>
                            <Text style={[styles.score, game.result === 'W' ? styles.W : game.result === 'L' ? styles.L : styles.D]}>{game.rank_diff}</Text>
                        </View>
                    ))}
                    {noGamesYetBanner ? 
                        <View style={styles.game}>
                            {/* <Text style={styles.noGamesYet}>No Games Yet</Text> */}
                        </View> 
                    : null}
                    {/* <View style={styles.game}>
                        <Text style={styles.win}>W</Text>
                        <Text style={styles.player}>Julia Metryka (2111)</Text>
                        <Text style={styles.winScore}>+31</Text>
                    </View>
                    <View style={styles.game}>
                        <Text style={styles.loss}>L</Text>
                        <Text style={styles.player}>Julia Metryka (2111)</Text>
                        <Text style={styles.lossScore}>-31</Text>
                    </View>
                    <View style={styles.game}>
                        <Text style={styles.draw}>D</Text>
                        <Text style={styles.player}>Julia Metryka (2111)</Text>
                        <Text style={styles.drawScore}>+5</Text>
                    </View> */}
                    {moreGames ? 
                        <TouchableHighlight style={styles.viewAllButton} onPress={onViewAllGamesHandler}>
                            <Text style={styles.viewAllButtonText}>View All</Text>
                        </TouchableHighlight>
                    : null}
                </View>


                <TouchableHighlight style={styles.newGameButton} onPress={onNewGameHandler}>
                    <View style={styles.newGameButtonView}>
                        <MaterialCommunityIcons name={'rocket'} color={'#673AB7'} size={30} style={[{flex: 1}]} />
                        <Text style={styles.newGameButtonText}>NEW GAME</Text>
                    </View>
                </TouchableHighlight>
            
                <StatusBar style="auto" />
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6FF',
    // alignItems: 'center',
    // justifyContent: 'flex-start',
    height: '100%',
    width: '100%',
    top: 0,
    left: 0,
    position: "relative"
  },
  bigCircle: {
    zIndex: 1,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#D1C4E9',
    position: 'absolute',
    top: 250,
    right: -200
  },
  smallCircle: {
    zIndex: 1,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#D1C4E9',
    position: 'absolute',
    top: 700,
    left: -30
  },
  logo: {
    width: 200,
    height: 83.87,
    resizeMode: 'cover',
    position: 'absolute',
    right: '5%',
    top: 50
  },
  userDetailsBox: {
    width: '90%',
    padding: 10,
    position: 'absolute',
    top: 190,
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.7)',
    marginLeft: '5%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  profile_image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userDetailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 15
  },
  userName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 22,
  },
  userRank: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
  },
  userHistoryBox: {
    width: '90%',
    padding: 10,
    position: 'absolute',
    top: 310,
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.7)',
    marginLeft: '5%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  boxHeading: {
    width: '100%',
    textAlign: 'left',
    fontFamily: 'Nunito-Bold',
    fontSize: 22,
  },
  game: {
    width: '100%',
    padding: 5,
    backgroundColor: 'rgba(209, 196, 233, 0.3)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 5,
    marginTop: 3,
    marginBottom: 3
  },
  result: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    textAlign: 'center'
  },
  W: {
    color: '#4CAF50',
  },
  L: {
    color: '#F00',
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    textAlign: 'center'
  },
  D: {
    color: '#00F',
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    textAlign: 'center'
  },
  player: {
    width: '80%',
    color: '#000',
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    textAlign: 'left'
  },
  score: {
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    textAlign: 'right'
  },
  viewAllButton: {
    width: '40%',
    backgroundColor: 'rgba(209, 196, 233, 0.3)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginTop: 25,
    padding: 5
  },
  viewAllButtonText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 17,

  },
  newGameButton: {
    width: '90%',
    padding: 10,
    position: 'absolute',
    bottom: 100,
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.7)',
    marginLeft: '5%',
  },
  newGameButtonView: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%'
  },
  newGameButtonText: {
    flex: 2,
    fontFamily: 'Nunito-Bold',
    textAlign: 'left',
    fontSize: 20,
    color: '#673AB7'
  },
  noGamesYet: {
    width: '100%',
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#673AB7'
  },
  menu: {
    borderRadius: '50%',
    position: 'absolute',
    top: 50,
    left: '5%',
  },
  menuBanner: {
    width: '60%',
    position: 'absolute',
    top: 35,
    height: 300,
    backgroundColor: 'rgba(103, 58, 183, 0.9)',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    zIndex: 99,
    paddingTop: 15
  },
  menuOption: {
    width: '100%',
    padding: 5,
    paddingTop: 0,
    paddingBottom: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  menuIcon: {
    maxWidth: 60,
    width: 60,
    height: 60,
    minHeight: 60,
    borderRadius: 30,
    marginRight: 10,
    flex: 1,
  },
  menuText: {
    flex: 3,
    color: 'white',
    textAlign: 'left',
    fontFamily: 'Nunito-Regular',
    fontSize: 22,
  }
});


export default Home;