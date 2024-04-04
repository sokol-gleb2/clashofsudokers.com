import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const SudokuGrid = ({ grid, onCellPressed, gridStates, notes, mode}) => {
    // const gridSize = 9;
    // const grid = Array(gridSize).fill(Array(gridSize).fill('')); // Replace with your Sudoku grid numbers
    // const [selectedCell, setSelectedCell] = useState({ row: -1, column: -1 });
    // const [selectedCellOpponent, setselectedCellOpponent] = useState({ row: -1, column: -1 });

    const renderCell = (number, rowIndex, columnIndex) => {
        let notesModeOn = false;
        let borderStyles = [styles.cell];
        const borderBottom = rowIndex === 2 || rowIndex === 5;
        const borderRight = columnIndex === 2 || columnIndex === 5;
        let textStyle = styles.cellText;
        if (borderBottom) {
            borderStyles.push(styles.borderBottom)
        }
        if (borderRight) {
            borderStyles.push(styles.borderRight)
        }

        
        if (number == -1) {
            number = ''

            if (notes[rowIndex][columnIndex] != []) {
                notesModeOn = true;
                // borderStyles.push(styles.notesCell)
                var notesNumbers = [];
                
                notes[rowIndex][columnIndex].sort((a, b) => a - b);  // Sort the array
                for (let i = 1; i <= 9; i++) {
                    notesNumbers.push(notes[rowIndex][columnIndex].includes(i) ? i.toString() : ' ');
                }
            }
        }
        if (gridStates[rowIndex][columnIndex] == "F") {
            textStyle = styles.filledCell
        } else if (gridStates[rowIndex][columnIndex] == "FY") {
            borderStyles.push(styles.selectedCell)
        } else if (gridStates[rowIndex][columnIndex] == "LY") {
            borderStyles.push(styles.lockedCellYou)
        } else if (gridStates[rowIndex][columnIndex] == "LOUT") {
            borderStyles.push(styles.lockedOutCell)
        } else if (gridStates[rowIndex][columnIndex] == "NY") {
            borderStyles.push(styles.notesCellBorder)
        } else if (gridStates[rowIndex][columnIndex] == "FO") {
            borderStyles.push(styles.selectedCellOpponent)
        } else if (gridStates[rowIndex][columnIndex] == "LO") {
            borderStyles.push(styles.lockedCellOpponent)
        } else if (gridStates[rowIndex][columnIndex] == "LB") {
            borderStyles.push(styles.lockedCellBoth)
        } else if (gridStates[rowIndex][columnIndex] == "FB") {
            borderStyles.push(styles.selectedCellBoth)
        }

        return (
            <TouchableOpacity
                key={`cell-${rowIndex}-${columnIndex}`}
                style={borderStyles}
                onPress={() => {onCellPressed(rowIndex, columnIndex)}}
            >
                {notesModeOn ?  
                    <View style={styles.notesCell}>
                        {notesNumbers.map((note, index) => (
                            <Text key={`row-${rowIndex}-column-${columnIndex}-note-${index}`} style={styles.noteContainer}>{note}</Text>
                        ))}
                    </View>
                    : <Text style={textStyle}>{number}</Text>}
            </TouchableOpacity>
        );
    };

    // const isCellSelected = (rowIndex, columnIndex) => {
    //     return selectedCell.row === rowIndex && selectedCell.column === columnIndex;
    // };

    // const onCellPressed = (rowIndex, columnIndex) => {
    //     setSelectedCell({ row: rowIndex, column: columnIndex });
    // }

    return (
        <View style={styles.outerContainer}>
            <View style={styles.sudokuContainer}>
                {grid.map((row, rowIndex) => (
                    <View key={`row-${rowIndex}`} style={styles.row}>
                        {row.map((cell, columnIndex) => renderCell(cell, rowIndex, columnIndex))}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        margin: 5,
        position: 'relative',
        marginTop: 30
    },
    sudokuContainer: {
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
    },
    cell: {
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        aspectRatio: 1,
        backgroundColor: 'white'
    },
    cellText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
    },
    borderBottom: {
        borderBottomColor: 'black'
    },
    borderRight: {
        borderRightColor: 'black'
    },
    selectedCell: {
        backgroundColor: '#673AB7',
    },
    selectedCellOpponent: {
        backgroundColor: 'rgba(13, 71, 161, 0.9)',
    },
    filledCell: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
    },
    lockedCellYou: {
        backgroundColor: 'rgba(0, 96, 100, 0.9)'
    },
    lockedOutCell: {
        borderColor: 'rgba(255, 0, 0, 0.4)'
    },
    notesCellBorder: {
        borderBlockColor: '#673AB7',
    },
    notesCell: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'hidden',
        width: '100%',
        height: '100%'
    },
    noteContainer: {
        width: '33%',
        aspectRatio: 1,
        color: 'rgba(0, 0, 0, 0.6)',
        fontSize: 10,
        textAlign: 'center'
    },
    lockedCellOpponent: {
        backgroundColor: 'rgba(255, 0, 0, 1)',
        color: 'white',
        fontFamily: 'HelveticaNeue-Medium'
    },
    selectedCellBoth: {
        backgroundColor: '#D1C4E9',
        color: 'rgba(255, 255, 255, 1)'
    },
    lockedCellBoth: {
        borderColor: 'rgba(13, 71, 161, 0.9)'
    }
});

export default SudokuGrid;
