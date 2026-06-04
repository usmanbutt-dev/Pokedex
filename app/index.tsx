import { View } from "react-native";
import PokemonList from "./PokemonList";
import PokemonHeader from "./PokemonHeader";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
      }}
    >
      <PokemonHeader />
      <PokemonList />
    </View>
  );
}