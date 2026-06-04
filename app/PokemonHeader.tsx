import { View, Text, TextInput, Pressable, StyleSheet } from "react-native"
import { useState } from "react";

const POKEMON_TYPES = ["All", "Grass", "Poison", "Fire", "Water"];

interface PokemonHeaderProps {
  activeType: string;
  onFilterChange: (type: string) => void;
}

export default function PokemonHeader({ activeType, onFilterChange }: PokemonHeaderProps) {

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pokédex</Text>
            <Text style={styles.subtitle}>Discover and train your monster team</Text>
            <TextInput placeholder="Search Pokémon..." style={styles.searchInput} />

            <View style={styles.buttonContainer}>
                {POKEMON_TYPES.map((type) => {
                    const isActive = activeType === type;

                    return (
                        <Pressable
                            key={type}
                            style={({ pressed }) => [
                                styles.button,
                                isActive ? styles.buttonActive : null,
                                pressed ? styles.buttonPressed : null
                            ]}
                            onPress={() => onFilterChange(type)}
                        >
                            <Text style={[
                                styles.buttonText,
                                isActive ? styles.buttonTextActive : null
                            ]}>
                                {type}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 0.4,
        paddingTop: 15,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#303943",
        paddingLeft: 30,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "normal",
        color: "#94A3B8",
        paddingLeft: 30,
    },
    searchInput: {
        backgroundColor: "#F1F5F9",
        padding: 10,
        marginVertical: 20,
        marginHorizontal: 30,
        borderRadius: 15,
        color: "gray",
        borderColor: "#E2E8F0",
        borderWidth: 1,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    button: {
        backgroundColor: "#E9EEF3",
        borderRadius: 15,
        minWidth: 50,
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        marginVertical: 10,
    },
    buttonActive: {
        backgroundColor: "#303943",
    },
    buttonPressed: {
        opacity: 0.7,
    },
    buttonText: {
        fontWeight: "bold",
        color: "gray",
        fontSize: 14,
    },
    buttonTextActive: {
        color: "#E9EEF3",
    },
});