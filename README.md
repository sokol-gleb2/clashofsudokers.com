# Clash of Sudokers

Welcome to Clash Of Sudokers, a multiplayer Sudoku game. Follow these instructions to set up and run the game locally on your machine.

## Prerequisites

- Node.js installed on your machine
- Expo CLI installed globally (`npm install -g expo-cli`)
- Expo Go app installed on your mobile device (available on Google Play Store or Apple App Store)
- Ensure your mobile device and laptop are connected to the same Wi-Fi network

## Setting Up

### Backend Setup

1. Clone the repository to your local machine.
2. Navigate to the backend directory (where the server's `package.json` is located).
3. Run `npm install` to install all the necessary backend dependencies.
4. Start the backend server by running `npm start`. This will use `nodemon` to start `server.js`.

### Frontend Setup

1. Open a new terminal window or tab.
2. Navigate to the frontend directory (where the React Native's `package.json` is located).
3. Run `npm install` to install all the necessary frontend dependencies.
4. Start the Expo development server by running `npm start`.

### Database Setup

1. Go to https://www.oracle.com/database/technologies/appdev/quickstartnodeonprem.html
2. Choose the right operating system.
3. Follow the instructions carefully to get the database running.
4. Run the db.sql script inside the CLI to set up the right database schema.

### AWS Setup

1. Go to https://aws.amazon.com/
2. Create an account.
3. Create two new buckets - one main one and one back up.
4. Make sure to set the buckets to public access.
5. Retrieve the public and secret keys for each bucket and insert them into `/server/config.js`

### Google Authentication Setup

1. Go to https://console.cloud.google.com/
2. Create a new project.
3. Create OAuth client ID credentials.
4. Insert the client ID into `/server/config.js`

## Running the App

1. Once the Expo development server is running, a QR code will appear in your terminal.
2. Open the Expo Go app on your mobile device.
3. Scan the QR code using the Expo Go app. This will load your application on the device.
4. Ensure your device is on the same network as your laptop to enable communication with the backend server.

## Troubleshooting

- If you encounter any issues with dependencies, ensure that you have the correct versions installed as specified in the `package.json` files.
- For any connectivity issues, verify that your mobile device and laptop are on the same Wi-Fi network.

Enjoy playing Clash of Sudokers!


## Sudoku Player Rating Algorithm
You can find the Python code I used to run Reinforcement Learning to get the weights for the Sudoku Player Rating Algorithm in the `SudokuPlayerRatingAlgorithm` folder. Make sure you have all the libraries installed before attempting to run the code.
