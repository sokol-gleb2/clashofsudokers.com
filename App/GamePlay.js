import { useState, useCallback, useEffect, useMemo } from 'react'; 
import { StyleSheet, Text, View, TouchableHighlight } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { SafeAreaView } from 'react-native';
import SudokuGrid from './SudokuGrid';
import GameStats from './GameStats';
import ToggleButtons from './ToggleButtons';
import Buttons from './Buttons';
import { API, API_URL } from './config';
import io from 'socket.io-client';


// const getPuzzle = async () => {
//     try {
//         return fetch(`${API_URL}/getpuzzle`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: {},
//         })
//         .then(res => res.json())
//         .then(jsonRes => {
//             return jsonRes;
//         })
//         .catch(err => {
//             console.log(err);
//             return null;
//         });
//     } catch (error) {
//         console.log(error.message);
//     }
// }


const GamePlay = ({route, navigation}) => {
    const { user, opponent, puzzle, clash_id } = route.params;

    const gridSize = 9;
    // const [grid, setGrid] = useState(Array.from({ length: gridSize }, () => Array(gridSize).fill(-1)));
    const [grid, setGrid] = useState([[5, 8, 6, 1, 4, 7, 3, 9, 2], [4, 7, 9, 5, 2, 3, 1, 6, 8], [2, 3, 1, 9, 6, 8, 5, 4, 7], [6, 9, 4, 8, 3, 1, 7, 2, 5], [1, 5, 3, 7, 9, 2, 6, 8, 4], [7, 2, 8, 6, 5, 4, 9, 3, 1], [8, 6, 2, 3, 7, 5, 4, 1, 9], [3, 1, 5, 4, 8, 9, 2, 7, 6], [9, 4, 7, 2, 1, 6, 8, 5, -1]]);
    // const [solution, setSolution] = useState(Array.from({ length: gridSize }, () => Array(gridSize).fill(-1)));
    const [solution, setSolution] = useState([[5, 8, 6, 1, 4, 7, 3, 9, 2], [4, 7, 9, 5, 2, 3, 1, 6, 8], [2, 3, 1, 9, 6, 8, 5, 4, 7], [6, 9, 4, 8, 3, 1, 7, 2, 5], [1, 5, 3, 7, 9, 2, 6, 8, 4], [7, 2, 8, 6, 5, 4, 9, 3, 1], [8, 6, 2, 3, 7, 5, 4, 1, 9], [3, 1, 5, 4, 8, 9, 2, 7, 6], [9, 4, 7, 2, 1, 6, 8, 5, 3]]);
    const [gridStates, setGridStates] = useState(Array.from({ length: gridSize }, () => Array(gridSize).fill('E'))); // Empty <- other options: 'F' filled, 'FY' filled you, 'FO' filled opponent, 'LY' locked you, 'LO' locked opponent, 'LOUT' you are locked out (for 5 secs), 'NY' you are in notes mode

    const [youScore, setYouScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    
    useEffect(() => {
        if (user.username == "benjiii") {
            setGridStates([['F', 'FO', 'FO', 'FY', 'FY', 'FO', 'FO', 'F', 'FO'],
            ['FO', 'FO', 'F', 'FY', 'F', 'F', 'FO', 'F', 'FY'],
            ['FO', 'F', 'FO', 'F', 'FO', 'FY', 'FY', 'FO', 'F'],
            ['F', 'FY', 'FO', 'F', 'FY', 'FO', 'FY', 'F', 'FY'],
            ['F', 'F', 'FY', 'F', 'FO', 'FO', 'FY', 'FY', 'FY'],
            ['FY', 'F', 'F', 'FY', 'F', 'FY', 'F', 'FY', 'FY'],
            ['FY', 'FY', 'F', 'FY', 'FY', 'FO', 'F', 'FY', 'FO'],
            ['FY', 'FO', 'FO', 'F', 'FO', 'FY', 'FY', 'FO', 'FY'],
            ['F', 'FY', 'F', 'FO', 'FY', 'F', 'FY', 'FB', 'E']]);

            setYouScore(31);
            setOpponentScore(25);
        } else {
            setGridStates([['F', 'FY', 'FY', 'FO', 'FO', 'FY', 'FY', 'F', 'FY'],
            ['FY', 'FY', 'F', 'FO', 'F', 'F', 'FY', 'F', 'FO'],
            ['FY', 'F', 'FY', 'F', 'FY', 'FO', 'FO', 'FY', 'F'],
            ['F', 'FO', 'FY', 'F', 'FO', 'FY', 'FO', 'F', 'FO'],
            ['F', 'F', 'FO', 'F', 'FY', 'FY', 'FO', 'FO', 'FO'],
            ['FO', 'F', 'F', 'FO', 'F', 'FO', 'F', 'FO', 'FO'],
            ['FO', 'FO', 'F', 'FO', 'FO', 'FY', 'F', 'FO', 'FY'],
            ['FO', 'FY', 'FY', 'F', 'FY', 'FO', 'FO', 'FY', 'FO'],
            ['F', 'FO', 'F', 'FY', 'FO', 'F', 'FO', 'FB', 'E']])
            
            setYouScore(25);
            setOpponentScore(31);
        }
    }, [user])

    // useEffect(() => {
    //     if (puzzle) {
    //         let newGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(-1));
    //         let newSolution = Array.from({ length: gridSize }, () => Array(gridSize).fill(-1));
    //         let newGridStates = Array.from({ length: gridSize }, () => Array(gridSize).fill('E'));
    //         Array.from(puzzle.puzzle).forEach((char, index) => {
    //             if (char !== '-') {
    //                 let num = parseInt(char, 10);
    //                 newGrid[Math.floor(index / 9)][index % 9] = num;
    //                 newGridStates[Math.floor(index / 9)][index % 9] = 'F';
    //             }
    //         });
    //         Array.from(puzzle.solution).forEach((char, index) => {
    //             if (char !== '-') {
    //                 let num = parseInt(char, 10);
    //                 newSolution[Math.floor(index / 9)][index % 9] = num;
    //             }
    //         });
    //         setGrid(newGrid);
    //         setSolution(newSolution);
    //         setGridStates(newGridStates);
    //     } else {
    //         alert("Sorry something went wrong. Please try again!");
    //         navigation.navigate('Home');
    //         return null;
    //     }
    // }, [puzzle]); // Only re-run the effect if `puzzle` changes    

    const [notes, setNotes] = useState(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null).map(() => [])));
    const [selectedCell, setSelectedCell] = useState({ row: -1, column: -1 });
    const [selectedCellOpponent, setselectedCellOpponent] = useState({ row: -1, column: -1 });
    const [dataLoaded, setDataLoaded] = useState(false); // New state for tracking data loading
    // const [startLockOutTimer, setLockOutTimer] = useState(false);
    const [lockTimer, setLockTimer] = useState(-1); // for display the how long user has left on the locked cell
    const [opponentLockTimer, setOpponentLockTimer] = useState(-1); // for display the how long user has left on the locked cell
    const [lockTimerDisplayBool, setLockTimerDisplayBool] = useState(false);
    const [lockedOutTimers, setLockedOutTimers] = useState({}); // for display the how long user has left on the locked out cell
    const [webSocket, setWebSocket] = useState(null);

    const [opponentName, setOpponentName] = useState('Opponent');

    const [durationMinutes, setDurationMinutes] = useState(0);
    const [durationSeconds, setDurationSeconds] = useState(0);

    const [endOfGame, setEndOfGame] = useState(false);
    const [time, setTime] = useState(null);

    const [playingMode, setPlayingMode] = useState("play");


    const [displaySolutions, setDisplaySOlutions] = useState(false);

    const onToggleClicked = (mode) => {
        setPlayingMode(mode);
    }

    // useEffect(() => {
    //     if (solution) {
    //         console.log(solution);
    //     }
    // }, [solution])


    // useEffect(() => {
    //     if (displaySolutions) {
    //         let row = -1;
    //         let column = -1;
    //         for (let i = 0; i < 9; i++) {
    //             for (let j = 0; j < 9; j++) {
    //                 if (grid[i][j] == -1) {
    //                     row = i;
    //                     column = j;
    //                     break;
    //                 }
    //             }
    //             if (row != -1 && column != -1) {
    //                 break;
    //             }
    //         }
    //         let newGrid = [...solution];
    //         newGrid[row][column] = -1;
    //         setGrid(newGrid);
    //         console.log("grid", grid);

    //         let ys = 0;
    //         let os = 0;
    //         let newStates;
    //         if (user.username == "glebby") {
    //             newStates = [['F', 'F', 'FY', 'FY', 'F', 'FO', 'FO', 'F', 'FY'],
    //             ['F', 'F', 'FY', 'FY', 'FO', 'F', 'F', 'F', 'FO'],
    //             ['F', 'FY', 'FY', 'FY', 'FO', 'F', 'F', 'FO', 'FY'],
    //             ['FO', 'F', 'F', 'FY', 'FO', 'F', 'FY', 'FY', 'F'],
    //             ['F', 'F', 'FY', 'F', 'FY', 'FO', 'F', 'FY', 'FY'],
    //             ['F', 'F', 'FO', 'F', 'FO', 'F', 'FY', 'FO', 'FY'],
    //             ['F', 'F', 'F', 'F', 'FY', 'FY', 'FY', 'F', 'F'],
    //             ['LB', 'FO', 'FY', 'FO', 'F', 'FY', 'F', 'F', 'FY'],
    //             ['F', 'F', 'F', 'FO', 'FY', 'FO', 'FY', 'FO', 'E']];

    //         } else {
    //             [['F', 'F', 'FO', 'FO', 'F', 'FY', 'FY', 'F', 'FO'],
    //             ['F', 'F', 'FO', 'FO', 'FY', 'F', 'F', 'F', 'FY'],
    //             ['F', 'FO', 'FO', 'FO', 'FY', 'F', 'F', 'FY', 'FO'],
    //             ['FY', 'F', 'F', 'FO', 'FY', 'F', 'FO', 'FO', 'F'],
    //             ['F', 'F', 'FO', 'F', 'FO', 'FY', 'F', 'FO', 'FO'],
    //             ['F', 'F', 'FY', 'F', 'FY', 'F', 'FO', 'FY', 'FO'],
    //             ['F', 'F', 'F', 'F', 'FO', 'FO', 'FO', 'F', 'F'],
    //             ['LB', 'FY', 'FO', 'FY', 'F', 'FO', 'F', 'F', 'FO'],
    //             ['F', 'F', 'F', 'FY', 'FO', 'FY', 'FO', 'FY', 'E']]
    //         }
    //         setGridStates(newStates);

    //         for (let i = 0; i < 9; i++) {
    //             for (let j = 0; j < 9; j++) {
    //                 if (newStates[i][j] == "FY") {
    //                     ys++;
    //                 } else if (newStates[i][j] == "FO") {
    //                     os++;
    //                 } else if (newStates[i][j] == "FB") {
    //                     ys++;
    //                     os++;
    //                 }
    //             }
    //         }

    //         setYouScore(ys);
    //         setOpponentScore(os);


    //         // set scores

    //     }
    // }, [displaySolutions, solution, grid, user])

    useEffect(() => {

        const socket = io(`http://${API}:3001`);

        setWebSocket(socket);
    
        return () => {
            socket.disconnect();
        };

    }, []);



    useEffect(() => {

        if (webSocket != null) {
            
            webSocket.on('message', (message) => {
                let data;
                try {
                    data = JSON.parse(message);
                } catch (e) {
                    console.error("Error parsing message:", message);
                    return;
                }
    
                console.log(data);
    
                if (data.clash_id && data.clash_id == clash_id && data.to == user.username) {
                    if (data.type == "MOVE") {
                        if (data.moveType == "LOCK") {
    
                            // TODO: if cell is locked by user, then set it to LB - Locked by Both
    
                            const [row, column] = data.coor
                            var newGridStates = [...gridStates];
    
                            if (gridStates[row][column] == "LY") {
                                // you've clicked it at the same time - HANDLE SSE
    
                                newGridStates[row][column] = "LB";
                            } else {
                                newGridStates[row][column] = "LO";
                            }
    
                            setGridStates(newGridStates);
    
                            setselectedCellOpponent({ row: row, column: column});
                            setOpponentLockTimer(5);
    
    
                        } else if (data.moveType == "FILLED") {
    
                            // setOpponentLockTimer(0)
                            // setselectedCellOpponent({ row: -1, column: -1});
    
                            // TODO: if cell is filled by user, then set it to FB - Filled by Both
    
                            const [row, column] = data.coor
                            var newGridStates = [...gridStates];


    
                            if (gridStates[row][column] == "FY") {
                                // you've clicked it at the same time - HANDLE SSE
    
                                newGridStates[row][column] = "FB";
                                setOpponentScore(score => score + 1);
                                setYouScore(score => score + 1);
                            } else {
                                newGridStates[row][column] = "FO";
                                setOpponentScore(score => score + 1);
                            }
    
    
                            setGridStates(newGridStates);

                            const answer = data.answer
    
                            let newGrid = [...grid];
                            newGrid[row][column] = answer;
                            setGrid(newGrid);

                            setOpponentLockTimer(0);
    
    
    
                            let end = true;
                            for (let i = 0; i < 9; i++) {
                                for (let j = 0; j < 9; j++) {
                                    if (grid[i][j] == -1) {
                                        end = false;
                                        break;
                                    }
                                }
                            }
                
                            if (end) {
                                setEndOfGame(true);
                                if (youScore > opponentScore) {
                                    sendMessage({ clash_id: clash_id, to: opponent.username, type: "DURATION", durationMinutes: durationMinutes, durationSeconds: durationSeconds });
                                    goToEndScreen()
                                } 
                            }
    
                        }
                    } else if (data.type == "DURATION") {
                        const minutes = data.durationMinutes;
                        const seconds = data.durationSeconds;
                        setDurationMinutes(minutes);
                        setDurationSeconds(seconds);
                        goToEndScreen()
    
                    }
                }
                
            });

        }
    }, [grid, gridStates, webSocket]);

    const sendMessage = (message) => {
        webSocket.emit('message', JSON.stringify(message));
    };



    // Effect to handle opponent locking a cell
    useEffect(() => {
        if (puzzle != null && selectedCellOpponent.row != -1 && selectedCellOpponent.column != -1) {
            let interval;
            if (opponentLockTimer > 0) {
                interval = setInterval(() => {
                    setOpponentLockTimer(lockTimer => lockTimer - 1);
                    // let newGrid = [...grid];
                    // newGrid[selectedCellOpponent.row][selectedCellOpponent.column] = opponentLockTimer;
                    // setGrid(newGrid);
                }, 1000);
                // && gridStates[selectedCellOpponent.row][selectedCellOpponent.column] != "FO"
            } else if (opponentLockTimer === 0 && gridStates[selectedCellOpponent.row][selectedCellOpponent.column] != "FO") {
                // When lockTimer reaches 0, empty the cell
                // let newGrid = [...grid];
                // newGrid[selectedCellOpponent.row][selectedCellOpponent.column] = -1;
                // setGrid(newGrid);
    
                setGridStates(prevGridStates => {
                    const newGridStates = [...prevGridStates];
                    newGridStates[selectedCellOpponent.row][selectedCellOpponent.column] = 'E';
                    return newGridStates;
                });
    
                setselectedCellOpponent({ row: -1, column: -1});
            }
            return () => clearInterval(interval);
        }
    }, [opponentLockTimer, selectedCellOpponent, puzzle]);




    // Function to start the lockTimer
    const startLockTimer = () => {
        setLockTimer(5); // Start with 5 seconds
        setLockTimerDisplayBool(true);
    };

    // Effect to handle lockTimer countdown
    useEffect(() => {
        let interval;
        if (lockTimer > 0) {
            interval = setInterval(() => {
                setLockTimer(lockTimer => lockTimer - 1);
            }, 1000);
        } else if (lockTimer === 0) {
            // When lockTimer reaches 0, start the lockedOutTimer
            stopLockTimer();
            startLockedOutTimer(selectedCell.row, selectedCell.column);

            setGridStates(prevGridStates => {
                const newGridStates = [...prevGridStates];
                newGridStates[selectedCell.row][selectedCell.column] = 'LOUT';
                return newGridStates;
            });
        }
        return () => clearInterval(interval);
    }, [lockTimer]);

    // Function to start the lockedOutTimer for a specific cell
    const startLockedOutTimer = (r, c) => {
        let newTimers = {...lockedOutTimers};
        newTimers[`${r},${c}`] = 5;
        setLockedOutTimers(newTimers);
    };

    // Centralized timer to handle countdown for all lockedOutTimers
    useEffect(() => {
        const interval = setInterval(() => {
            let updatedTimers = {};
            let anyActive = false; // Track if any timers are still active

            Object.keys(lockedOutTimers).forEach(key => {
                let time = lockedOutTimers[key];
                if (time > 1) {
                    updatedTimers[key] = time - 1;
                    anyActive = true;
                } else if (time === 1) {
                    // Handle expiration of timer
                    const [r, c] = key.split(',').map(Number);
                    stopTimer([r,c]);
                    setGridStates(prevGridStates => {
                        const newGridStates = [...prevGridStates];
                        newGridStates[r][c] = 'E';
                        return newGridStates;
                    });
                }
            });

            if (anyActive) {
                setLockedOutTimers(updatedTimers);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [lockedOutTimers]);

    const findIndex = (arr, target) => {
        return arr.findIndex(a => a.length === target.length && a.every((val, index) => val === target[index]));
    }


    const stopTimer = (coor) => {
        // Call this function to stop the timer before it completes

        let timers = {...lockedOutTimers}
        delete timers[`${coor[0]},${coor[1]}`]
        setLockedOutTimers(timers);
    };

    const stopLockTimer = () => {
        // Call this function to stop the timer before it completes
        setLockTimer(-1);
        setLockTimerDisplayBool(false);
    };

    const onCellPressed = useCallback((rowIndex, columnIndex) => {
        let allow = true;
        var newGridStates = [...gridStates];
        var oldSelectedCoor = [];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (gridStates[j][i] == "LY") {
                    allow = false;
                    break;
                } else if (newGridStates[j][i] == "NY") {
                    oldSelectedCoor = [j, i];
                }
            }
        }
        if (allow && (gridStates[rowIndex][columnIndex] == "E" || gridStates[rowIndex][columnIndex] == "NY") && playingMode == "play") {
            const message = {
                clash_id: clash_id,
                type: "MOVE",
                coor: [rowIndex, columnIndex],
                moveType: "LOCK",
                to: opponent.username
            };
            sendMessage(message);
    
            if (oldSelectedCoor.length != 0) {
                newGridStates[oldSelectedCoor[0]][oldSelectedCoor[1]] = "E";
            }
            newGridStates[rowIndex][columnIndex] = 'LY';
    
            setSelectedCell({ row: rowIndex, column: columnIndex });
    
            startLockTimer();
        } else if (allow && (gridStates[rowIndex][columnIndex] == "E" || gridStates[rowIndex][columnIndex] == "NY") && playingMode == "notes") {
            if (oldSelectedCoor.length != 0) {
                newGridStates[oldSelectedCoor[0]][oldSelectedCoor[1]] = "E";
            }
            newGridStates[rowIndex][columnIndex] = 'NY';
            setSelectedCell({ row: rowIndex, column: columnIndex });
        }
    
        setGridStates(newGridStates);
    }, [gridStates, playingMode, clash_id, sendMessage, setSelectedCell, startLockTimer]);
    

    const updateCell = (number) => {
        if (selectedCell.row !== -1 && selectedCell.column !== -1) {
            if (playingMode == "play") {
                stopLockTimer();
                if (number == solution[selectedCell.row][selectedCell.column]) {
                    // you have answered correctly
                    const message = {
                        clash_id: clash_id,
                        to: opponent.username,
                        type: "MOVE",
                        coor: [selectedCell.row, selectedCell.column],
                        moveType: "FILLED",
                        answer: number
                    };
                    sendMessage(message);

                    let newGrid = [...grid];
                    newGrid[selectedCell.row][selectedCell.column] = number;
                    setGrid(newGrid);
                    let newGridStates = [...gridStates];
                    newGridStates[selectedCell.row][selectedCell.column] = 'FY';
                    setGridStates(newGridStates);
                    setYouScore(youScore + 1);
                } else {

                    // if replied incorrectly, opponent doesn't see anything so not sending anything

                    // set lockout timer to true
                    startLockedOutTimer(selectedCell.row, selectedCell.column);
    
                    setGridStates(prevGridStates => {
                        const newGridStates = [...prevGridStates];
                        newGridStates[selectedCell.row][selectedCell.column] = 'LOUT';
                        return newGridStates;
                    });
                }
    
                let end = true;
                for (let i = 0; i < 9; i++) {
                    for (let j = 0; j < 9; j++) {
                        if (grid[i][j] == -1) {
                            end = false;
                            break;
                        }
                    }
                }
    
                if (end) {
                    if (youScore > opponentScore) {
                        sendMessage({ clash_id: clash_id, to: opponent.username, type: "DURATION", durationMinutes: durationMinutes, durationSeconds: durationSeconds });
                        goToEndScreen()
                    }
                }
            } else { // notes mode
                let notesCopy = [...notes];
                let ind = notes[selectedCell.row][selectedCell.column].indexOf(number);
                if (ind > -1) { // if the number that's already a note clicked again, it will be erased
                    notesCopy[selectedCell.row][selectedCell.column].splice(ind, 1);
                } else {
                    notesCopy[selectedCell.row][selectedCell.column].push(number);
                }
                setNotes(notesCopy)
            }
        }
    };

    const goToEndScreen = () => {
        navigation.navigate('EndGame', { user: user, opponent: opponent, puzzle: puzzle, clash_id: clash_id, gridStates: gridStates, youScore: youScore, opponentScore: opponentScore, durationMinutes: durationMinutes, durationSeconds: durationSeconds });
    }


    const onQuitButtonPressed = () => {
        // are you sure? banner
        navigation.navigate('Home');
    }

    return (
        <View style={styles.container}>
            <SafeAreaView>
                <GameStats lockTimer={lockTimer.toString()} lockedOutTimers={lockedOutTimers} lockTimerDisplayBool={lockTimerDisplayBool}  youScore={youScore} opponentScore={opponentScore} opponentName={opponentName} setOuterTimer={setTime} endBool={endOfGame} />
                <SudokuGrid grid={grid} onCellPressed={onCellPressed} gridStates={gridStates} notes={notes} mode={playingMode} />
                <ToggleButtons mode={playingMode} onToggleClicked={onToggleClicked} />
                <Buttons updateCell={updateCell} />
            </SafeAreaView>
            <View style={styles.quitButtonView}>
                <TouchableHighlight onPress={onQuitButtonPressed} style={styles.quitButton}>
                    <View style={styles.quitButtonContainer}>
                        <MaterialCommunityIcons name={'logout'} color={'white'} size={25} style={styles.quitButtonIcon}></MaterialCommunityIcons>
                        <Text style={styles.quitButtonText}>Quit</Text>
                    </View>
                </TouchableHighlight>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    
    container: {
        backgroundColor: '#F6F6FF',
        height: '100%',
        width: '100%',
        top: 0,
        left: 0,
        position: "relative"
    },
    quitButtonView: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 30
    },  
    quitButton: {
        backgroundColor: 'red',
        width: 90,
        borderRadius: 10,
        padding: 2,
        position: 'relative'
    },
    quitButtonContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center'
    },
    quitButtonIcon: {
        flex: 1,
        marginTop: 2,
        marginLeft: 5
    },
    quitButtonText: {
        flex: 2,
        color: 'white',
        fontFamily: 'Nunito-Bold',
        fontSize: 20,
        textAlign: 'center'
    }


})

export default GamePlay;