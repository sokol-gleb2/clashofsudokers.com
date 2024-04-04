import { StyleSheet, View, Text } from "react-native";


const Timer = ({ timeTillStart }) => {
    return (
        <View style={styles.outContainer}>
            <Text style={styles.text}>Starts in: {timeTillStart}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    outContainer: {
        width: '100%',
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: 'rgba(0, 96, 100, 0.9)',
        fontSize: 25
    }
});


export default Timer;