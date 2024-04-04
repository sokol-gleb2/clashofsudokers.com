import { StyleSheet, View, Image, TouchableHighlight } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ToggleButtons = ({mode, onToggleClicked}) => {

    const isSelected = (buttonMode) => mode === buttonMode;

    return (
        <View style={styles.container}>
            <TouchableHighlight 
                style={[styles.toggleButton, isSelected('play') ? styles.selected : null]}
                onPress={() => {onToggleClicked("play")}}>
                <Image
                    source={require('./images/play-mode.png')}
                    style={{ width: 30, height: 30 }}
                />
            </TouchableHighlight>
            <TouchableHighlight 
                style={[styles.toggleButton, isSelected('notes') ? styles.selected : null]}
                onPress={() => {onToggleClicked("notes")}}>
                <Image
                    source={require('./images/notes-mode.png')}
                    style={{ width: 30, height: 30 }}
                />
            </TouchableHighlight>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 50,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    },
    toggleButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        opacity: 0.6,
        backgroundColor: 'white',
        borderRadius: 7,
        marginLeft: 1,
        marginRight: 1
    },
    selected: {
        width: 50,
        height: 50,
        opacity: 1,
        shadowColor: 'rgba(0,0,0,0.25)',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 1,
        shadowRadius: 3,
    },
});


export default ToggleButtons;