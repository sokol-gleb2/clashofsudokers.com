import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';

import LogInScreen from './LogIn';
import SignUpScreen from './SignUp';
import HomeScreen from './Home';
import GamePlay from './GamePlay';
import LookingForOpponent from './LookingForOpponent';
import Settings from './Settings';
import ProfileSettings from './ProfileSettings';
import EndGame from './EndGame';

const Stack = createNativeStackNavigator();

export default function App() {

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={"Home"}
                screenOptions={{
                headerShown: false
            }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen
                    name="LogIn"
                    component={LogInScreen}
                    options={{ title: 'Log In' }}
                />
                <Stack.Screen name="LookingForOpponent" component={LookingForOpponent} />
                <Stack.Screen name="GamePlay" component={GamePlay} />
                <Stack.Screen name="EndGame" component={EndGame} />
                <Stack.Screen
                    name="SignUp"
                    component={SignUpScreen}
                    options={{ title: 'Sign Up' }}
                />
                <Stack.Screen name="Settings" component={Settings} />
                <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
