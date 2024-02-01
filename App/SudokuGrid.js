import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const SudokuGrid = () => {
    const gridSize = 3;
    const grid = Array(gridSize).fill(Array(gridSize).fill('')); // Replace with your Sudoku grid numbers

    const renderCell = (number, rowIndex, cellIndex) => {
        const isHighlighted = rowIndex === 3 || cellIndex === 3; // Modify this as per your logic to highlight cells
        // const cellStyle = isHighlighted ? styles.highlightedCell : styles.cell;
        const cellStyle = styles.cell;

        return (
            <TouchableOpacity key={`cell-${rowIndex}-${cellIndex}`} style={cellStyle}>
                <Text style={styles.cellText}>{number}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {grid.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.row}>
                    {row.map((cell, cellIndex) => renderCell(cell, rowIndex, cellIndex))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        margin: 20,
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: 35,
        height: 35,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
    },
    highlightedCell: {
        width: 35,
        height: 35,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: 'lightblue', // Change this color to match your design
        alignItems: 'center',
        justifyContent: 'center',
    },
    cellText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SudokuGrid;
