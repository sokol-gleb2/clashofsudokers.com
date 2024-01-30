import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LogInScreen from './LogIn';
import SignUpScreen from './SignUp';
import HomeScreen from './Home';


// const API_URL = Platform.OS === 'ios' ? 'http://localhost:3001' : 'http://10.0.2.2:3001';
const API_URL = 'http://192.168.68.119:3001';

const Stack = createNativeStackNavigator();


export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}>
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{title: 'Sign Up'}}
        />
        <Stack.Screen
          name="LogIn"
          component={LogInScreen}
          options={{title: 'Log In'}}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
