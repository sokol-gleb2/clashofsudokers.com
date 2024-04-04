import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react'; 
import { StyleSheet, Text, View, Image, TextInput, TouchableHighlight, ActivityIndicator, Button } from 'react-native';
import { useFonts } from 'expo-font';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

// https://docs.amplify.aws/react-native/start/getting-started/installation/
// https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
// https://github.com/expo/examples/tree/master/with-aws-storage-upload
// https://docs.expo.dev/versions/latest/sdk/imagepicker/

const SignUpScreen = ({navigation}) => {

    GoogleSignin.configure({
        webClientId: 'YOUR_WEB_CLIENT_ID_FROM_GOOGLE_CONSOLE',
    });

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); 
    const [repeatPassword, setRepeatPassword] = useState(''); 
    const [isError, setIsError] = useState(false);
    const [message, setMessage] = useState('');
    const [emailInputError, setEmailInputError] = useState(false);
    const [nameInputError, setNameInputError] = useState(false);
    const [usernameInputError, setUsernameInputError] = useState(false);
    const [passwordInputError, setPasswordInputError] = useState(false);
    const [repeatPasswordInputError, setRepeatPasswordInputError] = useState(false);
    const [imageInputError, setImageInputError] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [image, setImage] = useState(null);
    const [blob, setBlob] = useState(null);

    const onLogInPressed = () => {
        navigation.navigate("LogIn");
    }

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
        
            if (!result.canceled) {
                // console.log(result);
                const uri = result.assets[0].uri
                const imageType = result.assets[0].type;
                setImage(uri);
                const img = await fetchImageFromUri(uri);
                var fileName;
                if (Platform.OS === 'ios') {
                    fileName = uri.substr(uri.length - 40);
                } else {
                    fileName = result.fileName;
                }

                // setBlob({blob: img, name : fileName});
                setBlob({name : fileName, type: imageType, uri: uri});
                
            }
        } catch (e) {
            alert("Image upload failed. Please try again!");
        }
    };

    const fetchImageFromUri = async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob;
    };


    const onSubmitHandler = () => {
        let allow = true;
        if (username.length == 0) {
            allow = false;
            setUsernameInputError(true);
        } else {
            setUsernameInputError(false);
        }
        if (email.length == 0) {
            allow = false;
            setEmailInputError(true);
        } else {
            setEmailInputError(false);
        }
        if (name.length == 0) {
            allow = false;
            setNameInputError(true);
        } else {
            setNameInputError(false);
        }
        if (password.length == 0) {
            allow = false;
            setPasswordInputError(true);
        } else {
            setPasswordInputError(false);
        }
        if (repeatPassword.length == 0 || repeatPassword != password) {
            allow = false;
            setRepeatPasswordInputError(true);
        } else {
            setRepeatPasswordInputError(false);
        }

        if (!image) {
            allow = false;
            setImageInputError(true);
        } else {
            setImageInputError(false);
        }

        if (allow) {

            setIsProcessing(true);

            const formData = new FormData();
            formData.append("email", email);
            formData.append("username", username);
            formData.append("name", name);
            formData.append("password", password);
            formData.append("profilePicture", blob);
            
            fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            })
            .then(async res => { 
                setIsProcessing(false);
                try {
                    const jsonRes = await res.json();
                    console.log(jsonRes);
                    if (res.status !== 200) {
                        setIsError(true);
                        if (jsonRes.message == "USERNAME_EXISTS") {
                            setMessage("Username already exists...please choose another one.");
                            setUsernameInputError(true)
                        } else if (jsonRes.message == "EMAIL_EXISTS") {
                            setMessage("This email already belongs to an account. Please go to log in.");
                            setEmailInputError(true)
                        }
                    } else {
                        console.log("yep");
                        // const token = await SecureStore.getItemAsync('secure_token');
                        // console.log(token); // output: sahdkfjaskdflas$%^&
                        try {
                            await SecureStore.setItemAsync('secure_token',jsonRes.token);
                            await AsyncStorage.setItem('username',username);
                            await AsyncStorage.setItem('name',name);
                            await AsyncStorage.setItem('email',email);
                            navigation.navigate('Home')
                        } catch (error) {
                            // alert("Sign Up failed. Please try again!");
                            console.log(error.message);
                        }
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
    };


    const googleSignIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            setIsProcessing(true);
            // Send userInfo.idToken to backend
            fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({token: userInfo.idToken}),
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
                        SecureStore.setItemAsync('secure_token', jsonRes.token)
                            .then(() => {
                                navigation.navigate('Home'); // Navigate after the token is successfully saved
                            })
                            .catch((error) => {
                                console.log(error.message); // Handle any errors in saving the token
                            });
                    }
                } catch (err) {
                    console.log(err);
                };
            })
            .catch(err => {
                console.log(err);
            });
        } catch (error) {
          console.error(error);
        }
      };



    const [showPassword, setShowPassword] = useState(false); 
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
            <Text style={styles.logInText}>SIGN UP</Text>

            <View style={styles.logInBoxesContainer}>
                <TextInput
                    style={[styles.emailInput, emailInputError && styles.error]}
                    placeholder="Email"
                    onChangeText={setEmail}
                    
                />
                <TextInput
                    style={[styles.usernameInput, nameInputError && styles.error]}
                    placeholder="Full Name"
                    onChangeText={setName}
                    
                />
                <TextInput
                    style={[styles.usernameInput, usernameInputError && styles.error]}
                    placeholder="Username"
                    onChangeText={setUsername}
                    
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
                        
                    /> 
                    <MaterialCommunityIcons 
                        name={showPassword ? 'eye-off' : 'eye'} 
                        size={24} 
                        color="#aaa"
                        style={styles.icon} 
                        onPress={toggleShowPassword} 
                    /> 
                </View>
                <TextInput 
                    secureTextEntry={true} 
                    onChangeText={setRepeatPassword} 
                    style={[styles.repeatPasswordInput, repeatPasswordInputError && styles.error]}
                    placeholder="Repeat Password"
                    
                /> 


                <TouchableHighlight style={styles.submitDetailsButton} onPress={onSubmitHandler}>
                    <Text style={{fontFamily: 'Nunito-Bold', color: '#FFF', fontSize: 18}}>Submit</Text>
                </TouchableHighlight>
            </View>


            {/* // IMAGE  */}
            <View style={styles.imageContainer}>
                <View style={{width: 90, height: 90}}>
                    {image && 
                        <View style={{ width: 90, height: 90, borderRadius: 45, position: 'absolute', top: 0, left: 0, zIndex: 6 }}>
                            <Image source={{ uri: image }} style={{ width: 90, height: 90, borderRadius: 45, position: 'absolute', top: 0, left: 0, zIndex: 6 }} />
                            <TouchableHighlight onPress={pickImage} style={{width: 90, height: 90, borderRadius: 45, position: 'absolute', top: 0, left: 0, zIndex: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.3)'}}>
                                <MaterialCommunityIcons name={'reload'} color={'#673AB7'} size={35} />
                            </TouchableHighlight>
                        </View>
                    }
                    <TouchableHighlight style={[styles.imageButtonContainer, imageInputError && styles.error]} onPress={pickImage}>
                        <MaterialCommunityIcons name={'account'} color={'#673AB7'} size={70} style={styles.uploadImageButtonIcon} />
                    </TouchableHighlight>
                </View>
                {/* {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, borderRadius: 100 }} />}
                <View style={styles.imageButtonContainer}>
                    <Button title="" onPress={pickImage} style={styles.uploadImageButton} />
                    <MaterialCommunityIcons name={'account'} color={'#673AB7'} size={70} style={styles.uploadImageButtonIcon} />
                </View> */}
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
                <TouchableHighlight style={styles.appleViewHightlight} onPress={googleSignIn}>
                    <View style={styles.appleView}>
                        <Image style={styles.googleIcon} source={require('./images/google-icon.png')}/>
                        <Text style={[{fontSize: 17}]}>Google</Text>
                    </View>
                </TouchableHighlight>
            </View>


            <Text style={[styles.loggedInMessage, {color: 'red'}]}>{message ? getMessage() : null}</Text>

            <View style={styles.signUpWriting}>
                <Text style={[{fontSize: 17}]}>Already have an account?</Text>
                <TouchableHighlight onPress={onLogInPressed} style={[{display: 'flex', alignItems: 'center', marginLeft: 5}]}><Text style={[{textDecorationLine: 'underline', color: '#673AB7', fontSize: 17}]}>Log In</Text></TouchableHighlight>
            </View>
            
            <StatusBar style="auto" />

        </View>
    )

}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F6F6FF',
      height: '100%',
      width: '100%',
      top: 0,
      left: 0,
      position: "relative"
    },
    logInText: {
        position: "absolute",
        top: 170,
        left: 50,
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
        top: 410
    },
    emailInput: {
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
    usernameInput: {
        position: 'relative',
        width: 270,
        height: 50,
        zIndex: 5,
        backgroundColor: '#fff',
        borderWidth: 1,
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
        borderColor: '#979797',
        padding: 5,
        fontSize: 16,
        fontFamily: 'Nunito-Regular',
    },
    repeatPasswordInput: {
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
    imageContainer: {
        position: 'absolute',
        top: 300,
        display: 'flex',
        alignItems: 'center', 
        justifyContent: 'center',
        width: '100%',
        zIndex: 5
    },
    imageButtonContainer: {
        width: 90,
        height: 90,
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#FFF',
        borderRadius: 45,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#673AB7'
    },
    uploadImageButtonIcon: {
        position: 'relative',
        zIndex: 5
    },
    authButtons: {
        width: '100%',
        paddingLeft: 80,
        paddingRight: 80,
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: 60
    },
    appleViewHightlight: {
        width: 110,
        position: 'relative',
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
    orWriting: {
        width: '100%',
        position: 'absolute',
        bottom: 100,
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
        height: 425,
        position: 'absolute',
        top: 295,
        zIndex: 6,
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
    submitDetailsButton: {
        width: 270,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#673AB7',
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15
    },
    flexDisplay: {
        display: 'flex'
    },
});


export default SignUpScreen;