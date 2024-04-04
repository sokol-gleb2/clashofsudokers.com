import { useEffect, useState, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View, Image, TextInput, TouchableHighlight, ActivityIndicator, Button } from 'react-native';
import { useFonts } from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { BlurView } from 'expo-blur';
import { API_URL } from './config';



const ProfileSettings = ({navigation}) => {

    const [imageUrl, setImageUrl] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [changes, setChanges] = useState({name: null, email: null});
    const [dataLoaded, setDataLoaded] = useState(false);
    const [blob, setBlob] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isNameProblem, setIsNameProblem] = useState(false);
    const [isEmailProblem, setIsEmailProblem] = useState(false);
    const [nameEnteredValue, setNameEnteredValue] = useState("");
    const [emailEnteredValue, setEmailEnteredValue] = useState("");
    const [token, setToken] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let token = await SecureStore.getItemAsync('secure_token');
                setToken(token);
                let name = await AsyncStorage.getItem('name');
                let email = await AsyncStorage.getItem('email');
                let imageUrl = await AsyncStorage.getItem('imageUrl');
                let imageTTL = await AsyncStorage.getItem('imageTTL');
                const imageTTLDate = new Date(imageTTL); // Directly create a Date object from the ISO string
                const now = new Date();
                if (name == null || email == null || imageUrl == null || now > imageTTLDate || token == null) {
                    alert("Sorry some error has occured 1");
                    navigation.navigate("Home");
                } else {
                    // all good
                    setImageUrl(imageUrl);
                    setName(name);
                    setEmail(email);
                    setDataLoaded(true);
                    setNameEnteredValue(name);
                    setEmailEnteredValue(email);
                }
            } catch (e) {
                alert("Sorry some error has occured 2");
                navigation.navigate("Home");
            }
        }

        fetchData()

        
    }, []);
    
    
    const [fontsLoaded] = useFonts({
        'Nunito-ExtraBold': require('../assets/fonts/Nunito-ExtraBold.ttf'),
        'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
        'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
    });
    
    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded && dataLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, dataLoaded]);
    
    if (!fontsLoaded || !dataLoaded) {
        return null;
    }


    const onChangeName = (name_entered) => {
        setNameEnteredValue(name_entered);
        if (name_entered !== name) {
            setChanges({name: name_entered, email: changes.email});
        } else {
            setChanges({name: null, email: changes.email});
        }
    }

    const onChangeEmail = (email_entered) => {
        setEmailEnteredValue(email_entered);
        if (email_entered !== email) {
            setChanges({name: changes.name, email: email_entered});
        } else {
            setChanges({name: changes.name, email: null});
        }
    }

    const pickImage = async () => {
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
                setImageUrl(uri);
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
    }

    const fetchImageFromUri = async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob;
    };

    const onBackButtonPressed = () => {
        navigation.navigate("Settings");
    }

    const onSaveButtonPressed = () => {
        setIsProcessing(true);

        let allow = true;
        if (nameEnteredValue.length == 0) {
            allow = false;
            setIsNameProblem(true);
        } else {
            setIsNameProblem(false);
        }
        if (emailEnteredValue.length == 0) {
            allow = false;
            setIsEmailProblem(true);
        } else {
            setIsEmailProblem(false);
        }

        if (changes.name == null && changes.email == null && blob == null) {
            allow = false;
        }

        if (allow) {

            const formData = new FormData();
            if (changes.email != null) {
                formData.append("email", changes.email);
            } else {
                formData.append("email", email);
            }
            if (changes.name != null) {
                formData.append("name", changes.name);
            } else {
                formData.append("name", name);
            }
            if (blob != null) {
                formData.append("profilePicture", blob);
            }
            formData.append("token", token);

            fetch(`${API_URL}/changedetails`, {
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
                    if (res.status !== 200) {
                        alert("Something went wrong. Please try again!");
                        navigation.navigate("Settings");
                    } else {
                        try {
                            if (changes.email != null) {
                                setEmail(changes.email);
                                await AsyncStorage.setItem('email', email);
                            }
                            if (changes.name != null) {
                                setName(changes.name);
                                await AsyncStorage.setItem('name', name);
                            }
                            if (blob != null) {
                                const url = jsonRes.url;
                                setImageUrl(url);
                                setBlob(null);
                                const now = new Date();
                                const imageTTL =  new Date(now.getTime() + 23 * 60 * 60 * 1000 + 50 * 60 * 1000); // Adds 23h 50 min hours
                                await AsyncStorage.setItem('imageUrl', url);
                                await AsyncStorage.setItem('imageTTL', imageTTL.toISOString());
                            }
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

        } else {
            setIsProcessing(false);
        }
    }

    
    return (
        <View style={styles.outerContainer}>
            <View style={styles.smallCircle}></View>
            <View style={[styles.smallCircle, styles.smallCircle2]}></View>
            <View style={styles.imageContainer}>
                <View style={styles.imageView}>
                    <Image source={{ uri: imageUrl }} style={styles.image} />
                    <TouchableHighlight onPress={pickImage} style={styles.pickImageButton}>
                        <MaterialCommunityIcons name={'reload'} color={'#673AB7'} size={60} />
                    </TouchableHighlight>
                </View>
            </View>
            <TextInput
                style={[styles.input, isNameProblem && styles.problem]}
                onChangeText={(text) => {onChangeName(text)}}
                value={nameEnteredValue}
                placeholder="Full Name"
            />
            <TextInput
                style={[styles.input, isEmailProblem && styles.problem]}
                onChangeText={(text) => {onChangeEmail(text)}}
                value={emailEnteredValue}
                placeholder="Email"
            />

            <View style={styles.goBackButtonContainer}>
                <TouchableHighlight style={styles.goBackButton} onPress={onBackButtonPressed}>
                    <MaterialCommunityIcons name={'arrow-left-thin'} color={'#673AB7'} size={50} />
                </TouchableHighlight>
                <TouchableHighlight style={styles.goBackButton} onPress={onSaveButtonPressed}>
                    <MaterialCommunityIcons name={'content-save'} color={'#673AB7'} size={50} />
                </TouchableHighlight>
            </View>

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
    outerContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F6F6FF',
        overflow: 'hidden'
    },
    input: {
        padding: 7,
        fontSize: 20,
        fontFamily: 'Nunito-Bold',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10,
        margin: 15,
        marginBottom: 10,
        marginTop: 10,
    },
    pickImageButton: {
        width: 200, 
        height: 200, 
        borderRadius: 100, 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        zIndex: 7, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'rgba(255, 255, 255, 0.3)'
    },
    imageContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center', 
        justifyContent: 'center',
        width: '100%',
        zIndex: 5,
        marginTop: 70,
        marginBottom: 20
    },
    imageView: {
        width: 200, 
        height: 200, 
        borderRadius: 45, 
        position: 'relative', 
        zIndex: 6
    },
    image: {
        width: 200, 
        height: 200, 
        borderRadius: 100, 
        position: 'relative', 
        zIndex: 6
    },
    smallCircle: {
        zIndex: 1,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#D1C4E9',
        position: 'absolute',
        bottom: 200,
        right: 20
    },
    smallCircle2: {
        width: 180,
        height: 180,
        borderRadius: 90,
        bottom: 250,
        left: -10
    },
    goBackButtonContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 50,
        zIndex: 10
    },
    goBackButton: {
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
        margin: 10
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 99,
        borderRadius: 10,
    },
    loader: {
        position: 'relative',
        zIndex: 99,
        flex: 1
    },
    blurView: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 99,
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: {width: 0, height: 0},
        shadowRadius: 3,
        borderWidth: 0.5,
    },
    flexDisplay: {
        display: 'flex'
    },
    problem: {
        borderColor: 'red'
    }

})

export default ProfileSettings;