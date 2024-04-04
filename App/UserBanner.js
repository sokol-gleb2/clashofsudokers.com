import { StyleSheet, Text, View, Image } from 'react-native';
import { useFonts } from 'expo-font';
import { useState, useCallback, useEffect } from 'react'; 

const UserBanner = ({ user }) => {


    return (
        <View style={styles.userDetailsBox}>
            <Image style={styles.profile_image} source={ {uri: user.profilePicture} } />
            <View style={styles.userDetailsContainer}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userRank}>Rating: {user.rating}</Text>
                <Text style={styles.userRank}>W-L-D: <Text style={[{color: '#4CAF50'}]}>{user.wins}</Text>-<Text style={[{color: '#F00'}]}>{user.losses}</Text>-<Text style={[{color: '#00F'}]}>{user.draws}</Text> </Text>
            </View>
        </View>
    )
};


const styles = StyleSheet.create({
    userDetailsBox: {
        width: '90%',
        padding: 10,
        position: 'relative',
        zIndex: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 100,
        marginBottom: 100,
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
});


export default UserBanner;