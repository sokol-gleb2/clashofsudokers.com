import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react'; 
import { StyleSheet, Text, View, Image, TextInput, TouchableHighlight, ActivityIndicator } from 'react-native';
// import SvgComponentBottom from './LogInSvgBottom.js';
// import SvgComponentTop from './LogInSvgTop.js';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useFonts } from 'expo-font';
import { BlurView } from 'expo-blur';


// const API_URL = Platform.OS === 'ios' ? 'http://localhost:3001' : 'http://10.0.2.2:3001';

const LogInScreen = ({navigation}) => {
    const API_URL = 'http://192.168.68.119:3001';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); 
    const [isError, setIsError] = useState(false);
    const [message, setMessage] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [usernameInputError, setUsernameInputError] = useState(false);
    const [passwordInputError, setPasswordInputError] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const onChangeHandler = () => {
        setIsLogin(!isLogin);
        setMessage('');
    };

    const onLoggedIn = token => {
        fetch(`${API_URL}/private`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, 
            },
        })
        .then(async res => { 
            try {
                const jsonRes = await res.json();
                if (res.status === 200) {
                    setMessage(jsonRes.message);
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    }

    const onSubmitHandler = () => {
        let allow = true;
        if (username.length == 0) {
        allow = false;
        setUsernameInputError(true);
        } else {
        setUsernameInputError(false);
        }
        if (password.length == 0) {
        allow = false;
        setPasswordInputError(true);
        } else {
        setPasswordInputError(false);
        }
        if (allow) {

        setIsProcessing(true);

        const payload = {
            "username" : username,
            "password" : password,
        };
        console.log(payload);
        fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(async res => { 
            setIsProcessing(false);
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                    setIsError(true);
                    if (jsonRes.message == "AUTH_ERROR") {
                        setMessage("Wrong username or password :(");
                    }
                } else {
                    navigation.navigate('Home')
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
        }
    };


    const getMessage = () => {
        const status = isError ? `Error: ` : `Success: `;
        return status + message;
    }
    
    // State variable to track password visibility 
    const [showPassword, setShowPassword] = useState(false); 

    // Function to toggle the password visibility state 
    const toggleShowPassword = () => { 
        setShowPassword(!showPassword); 
    };

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
        <View style={styles.container}>
            <Image style={styles.backgroundImage} source={require('./images/background.png')} />
            <Image style={styles.logo} source={require('./images/logo.png')} />
            <Text style={styles.logInText}>LOG IN</Text>
            <View style={styles.logInBoxesContainer}>
                <TextInput
                    style={[styles.usernameInput, usernameInputError && styles.error]}
                    placeholder="Username"
                    onChangeText={setUsername}
                    keyboardType="text"
                />
                <View style={[styles.passwordContainer, passwordInputError && styles.error]}> 
                    <TextInput 
                        // Set secureTextEntry prop to hide  
                        //password when showPassword is false 
                        secureTextEntry={!showPassword} 
                        value={password} 
                        onChangeText={setPassword} 
                        style={styles.passwordInput}
                        placeholder="Password"
                        keyboardType="text"
                    /> 
                    <MaterialCommunityIcons 
                        name={showPassword ? 'eye-off' : 'eye'} 
                        size={24} 
                        color="#aaa"
                        style={styles.icon} 
                        onPress={toggleShowPassword} 
                    /> 
                </View>
                <TouchableHighlight style={styles.submitDetailsButton} onPress={onSubmitHandler}>
                    <MaterialCommunityIcons name={'arrow-right'} color={'white'} size={28}  />
                </TouchableHighlight>
            </View>

            <View style={[styles.loadingContainer, isProcessing && styles.flexDisplay]}>
                <BlurView
                    style={styles.blurView}
                    intensity={15}
                    tint="light"
                />
                <ActivityIndicator size={30} color="#000" style={styles.loader} />
            </View>
            
            <View style={styles.orWriting}>
                <View style={styles.divider}></View>
                <Text style={[{fontSize: 17, fontFamily: 'Nunito-Bold'}]}>OR</Text>
                <View style={styles.divider}></View>
            </View>
            
            <View style={styles.authButtons}>
                <TouchableHighlight style={styles.appleViewHightlight} onPress={()=>{}}>
                    <View style={styles.appleView}>
                        <MaterialCommunityIcons name={'apple'} size={24}  />
                        <Text style={[{fontSize: 17, marginRight: 4}]}>Apple</Text>
                    </View>
                </TouchableHighlight>
                <TouchableHighlight style={styles.appleViewHightlight} onPress={()=>{}}>
                    <View style={styles.appleView}>
                        <Image style={styles.googleIcon} source={require('./images/google-icon.png')}/>
                        <Text style={[{fontSize: 17}]}>Google</Text>
                    </View>
                </TouchableHighlight>
            </View>

            <Text style={[styles.loggedInMessage, {color: 'red'}]}>{message ? getMessage() : null}</Text>

            <View style={styles.signUpWriting}>
                <Text style={[{fontSize: 17}]}>Don't have an account? <Text style={[{textDecorationLine: 'underline', color: '#673AB7'}]}>Sign Up</Text></Text>
            </View>
            
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
    svgBottom: {
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 1, // Lower zIndex
    },
    svgTop: {
      position: "absolute",
      top: '-100px',
      left: 0,
      zIndex: 2, // Higher zIndex to place it on top
    },
    logInText: {
      position: "absolute",
      top: 170,
      left: 60,
      fontFamily: 'Nunito-ExtraBold',
      fontSize: 60,
      color: 'white'
    },
    backgroundImage: {
      width: 400,
      height: 448,
      resizeMode: 'cover',
      position: 'absolute',
      left: 0,
      top: 0
    },
    logo: {
      width: 200,
      height: 83.87,
      resizeMode: 'cover',
      position: 'absolute',
      right: 10,
      top: 40
    },
    logInBoxesContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      position: 'absolute',
      top: 420
    },
    usernameInput: {
      position: 'relative',
      width: 270,
      height: 50,
      zIndex: 5,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderColor: '#979797',
      padding: 5,
      fontSize: 16,
      fontFamily: 'Nunito-Regular',
    },
    passwordInput: {
      flex: 1, 
      paddingVertical: 10, 
      paddingRight: 10, 
      fontSize: 16, 
    },
    passwordContainer: {
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      width: 270,
      height: 50,
      zIndex: 5,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      borderColor: '#979797',
      padding: 5,
      fontSize: 16,
      fontFamily: 'Nunito-Regular',
    },
    authButtons: {
      width: '100%',
      paddingLeft: 80,
      paddingRight: 80,
      flexDirection: 'row',
      justifyContent: 'space-between',
      position: 'absolute'
    },
    appleViewHightlight: {
      width: 110,
      position: 'relative',
      top: 660,
      backgroundColor: '#fff',
      borderRadius: 10,
      borderWidth: 0.5
    }, 
    appleView: {
      width: '100%',
      padding: 10,
      paddingTop: 5,
      paddingBottom: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    googleIcon: {
      width: 24,
      height: 24
    },
    submitDetailsButton: {
      width: 45,
      height: 45,
      borderRadius: '50%',
      backgroundColor: '#673AB7',
      position: 'relative',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 15
    },
    orWriting: {
      width: '100%',
      position: 'absolute',
      top: 625,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 55,
      paddingRight: 55,
    },
    divider: {
      width: 130,
      height: 1,
      backgroundColor: '#000'
    },
    loggedInMessage: {
      position: 'absolute',
      top: 400,
      width: '100%',
      textAlign: 'center'
    },
    signUpWriting: {
      position: 'absolute',
      bottom: 20,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center'
    },
    error: {
      borderColor: '#F00'
    },
    loadingContainer: {
      display: 'none',
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      width: '100%',
      height: 295,
      position: 'absolute',
      top: 410,
      zIndex: 5,
      borderRadius: 10,
    },
    loader: {
      position: 'absolute',
      zIndex: 6,
      flex: 1
    },
    blurView: {
      overflow: 'hidden',
      position: 'relative',
      width: 350,
      height: '100%',
      zIndex: 5,
      borderRadius: 10,
      shadowColor: 'rgba(0, 0, 0, 0.25)',
      shadowOffset: {width: 0, height: 0},
      shadowRadius: 3,
      borderWidth: 0.5,
    },
    flexDisplay: {
      display: 'flex'
    }
});



export default LogInScreen;