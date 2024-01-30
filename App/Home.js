import { StatusBar } from 'expo-status-bar';
import { useState, useCallback, useEffect } from 'react'; 
import { StyleSheet, Text, View, Image, TextInput, TouchableHighlight, AsyncStorage } from 'react-native';
// import SvgComponentBottom from './LogInSvgBottom.js';
// import SvgComponentTop from './LogInSvgTop.js';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useFonts } from 'expo-font';
import * as SecureStore from 'expo-secure-store';

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
        if (name == null || email == null || username == null) {
            get_more_details = true;
        }
    } catch (error) {
        // Error retrieving data
        get_more_details = true;
    }

    if (get_more_details) {

        const token = await SecureStore.getItemAsync('secure_token');
        fetch(`${API_URL}/getinfo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({token : token}),
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                return jsonRes;
            } catch (err) {
                console.log(err);
                return null;
            };
        })
        .catch(err => {
            console.log(err);
            return null;
        });

    } 
    
};

const retrieveUserImage = async () => {
    const token = await SecureStore.getItemAsync('secure_token');
    fetch(`${API_URL}/getimage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({token : token}),
    })
    .then(async res => { 
        try {
            const jsonRes = await res.json();
            return jsonRes;
        } catch (err) {
            console.log(err);
            return null;
        };
    })
    .catch(err => {
        console.log(err);
        return null;
    });
}


const retrievePreviousGames = async () => {
    const token = await SecureStore.getItemAsync('secure_token');
    fetch(`${API_URL}/getgames`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({token : token}),
    })
    .then(async res => { 
        try {
            const jsonRes = await res.json();
            return jsonRes;
        } catch (err) {
            console.log(err);
            return null;
        };
    })
    .catch(err => {
        console.log(err);
        return null;
    });
}



const Home = ({navigation}) => {

    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await retrieveUserData();
            if (data) {
                setUserData(data);
            }
        };

        fetchData();

        const previousGames = async () => {
            const data = await retrievePreviousGames();
            if (data) {

            } else {
                // no more games
            }
        }

        previousGames()

        const userImage = async () => {
            const data = await retrieveUserImage();
            if (data) {

            } else {
                // no more games
            }
        }

        userImage()
    }, []);


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

    const onViewAllGamesHandler = () => {

    }

    const onNewGameHandler = () => {

    }

    return (
        <View style={styles.container}>
            
            <View style={styles.bigCircle}></View>
            <View style={styles.smallCircle}></View>
            <Image style={styles.logo} source={require('./images/logo.png')} />

            <View style={styles.userDetailsBox}>
                <Image style={styles.profile_image} source={ {uri: userData.backgroundImageUrl} } />
                <View style={styles.userDetailsContainer}>
                    <Text style={styles.userName}>{userData.name}</Text>
                    <Text style={styles.userRank}>Ranking: {userData.sudokuRank}</Text>
                    <Text style={styles.userRank}>W-L-D: <Text style={[{color: '#4CAF50'}]}>{userData.wins}</Text>-<Text style={[{color: '#F00'}]}>{userData.losses}</Text>-<Text style={[{color: '#00F'}]}>{userData.draws}</Text> </Text>
                </View>
            </View>

            <View style={styles.userHistoryBox}>
                <Text style={styles.boxHeading}>Previous 5 Games</Text>
                <View style={styles.game}>
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
                </View>
                <TouchableHighlight style={styles.viewAllButton} onPress={onViewAllGamesHandler}>
                    <Text style={styles.viewAllButtonText}>View All</Text>
                </TouchableHighlight>
            </View>


            <TouchableHighlight style={styles.newGameButton} onPress={onNewGameHandler}>
                <View style={styles.newGameButtonView}>
                    <MaterialCommunityIcons name={'rocket'} color={'#673AB7'} size={30} style={[{flex: 1}]} />
                    <Text style={styles.newGameButtonText}>NEW GAME</Text>
                </View>
            </TouchableHighlight>
        
            <StatusBar style="auto" />
        </View>
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
    right: 10,
    top: 40
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
  win: {
    color: '#4CAF50',
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    textAlign: 'center'
  },
  loss: {
    color: '#F00',
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    textAlign: 'center'
  },
  draw: {
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
  winScore: {
    color: '#4CAF50',
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    textAlign: 'right'
  },
  lossScore: {
    color: '#F00',
    fontFamily: 'Nunito-Regular',
    fontSize: 18,
    textAlign: 'right'
  },
  drawScore: {
    color: '#00F',
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
  }
});


export default Home;