import { useState } from "react";
import { StyleSheet, View } from "react-native";


const YouAreChallenged = () => {

    const [ws, setWs] = useState(null);
    const [challenged, setChallenged] = useState(false);

    useEffect(() => {
        const webSocket = new WebSocket('ws://<your-server-ip>:3000');

        webSocket.onopen = () => {
            console.log('WebSocket connection opened');
        };

        webSocket.onmessage = (e) => {
            console.log('Message from server ', e.data);
        };

        webSocket.onerror = (e) => {
            console.error(e.message);
        };

        webSocket.onclose = (e) => {
            console.log('WebSocket connection closed');
        };

        setWs(webSocket);

        // Cleanup function
        return () => {
            webSocket.close();
        };
    }, []);

    const sendMessage = (message) => {
        if (ws) {
            ws.send(message);
            console.log(`Message sent: ${message}`);
        } else {
            console.log('WebSocket connection is not open.');
        }
    };

    // Example usage: Send a message with an argument
    const handlePress = () => {
        const message = "Hello server, this is a message!";
        sendMessage(message);
    };


    return (
        <View style={challenged && styles.challengedBanner}>

        </View>
    )

};


const styles = StyleSheet.create({
    challengedBanner: {

    }
});


export default YouAreChallenged;