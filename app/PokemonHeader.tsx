import { View, Text, TextInput, Pressable } from "react-native"

export default function PokemonHeader() {
    return (
        <View
            style={{
                flex: 0.4,
                borderWidth: 1,
                paddingTop: 15,
            }}
        >
            <Text style={{ fontSize: 32, fontWeight: "bold", color: "#303943", paddingLeft: 30 }}>Pokédex</Text>
            <Text style={{ fontSize: 14, fontWeight: "normal", color: "#94A3B8", paddingLeft: 30 }}>Discover and train your monster team</Text>
            <TextInput placeholder="Search Pokémon..." style={{ backgroundColor: "#F1F5F9", padding: 10, marginVertical: 20, marginHorizontal: 30, borderRadius: 15, color: "gray", borderColor: "#E2E8F0", borderWidth: 1 }} />

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                }}>
                <Pressable style={{ backgroundColor: "#E9EEF3", borderRadius: 15, minWidth: 50, alignItems: "center", justifyContent: "center", padding: 10, marginVertical: 10 }}>
                    <Text style={{ fontWeight: "bold", color: "gray", fontSize: 14 }}>All</Text>
                </Pressable>
                <Pressable style={{ backgroundColor: "#E9EEF3", borderRadius: 15, minWidth: 50, alignItems: "center", justifyContent: "center", padding: 10, marginVertical: 10 }}>
                    <Text style={{ fontWeight: "bold", color: "gray", fontSize: 14 }}>Grass</Text>
                </Pressable>
                <Pressable style={{ backgroundColor: "#E9EEF3", borderRadius: 15, minWidth: 50, alignItems: "center", justifyContent: "center", padding: 10, marginVertical: 10 }}>
                    <Text style={{ fontWeight: "bold", color: "gray", fontSize: 14 }}>Poison</Text>
                </Pressable>
                <Pressable style={{ backgroundColor: "#E9EEF3", borderRadius: 15, minWidth: 50, alignItems: "center", justifyContent: "center", padding: 10, marginVertical: 10 }}>
                    <Text style={{ fontWeight: "bold", color: "gray", fontSize: 14 }}>Fire</Text>
                </Pressable>
                <Pressable style={{ backgroundColor: "#E9EEF3", borderRadius: 15, minWidth: 50, alignItems: "center", justifyContent: "center", padding: 10, marginVertical: 10 }}>
                    <Text style={{ fontWeight: "bold", color: "gray", fontSize: 14 }}>Water</Text>
                </Pressable>
            </View>
        </View>
    )
}