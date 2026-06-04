import { View } from "react-native";
import { useState } from "react";
import PokemonList from "./PokemonList";
import PokemonHeader from "./PokemonHeader";

export default function Index() {
  const [activeType, setActiveType] = useState("All");

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F8FAFC",
      }}
    >
      <PokemonHeader activeType={activeType} onFilterChange={setActiveType} />
      <PokemonList filterType={activeType} />
    </View>
  );
}