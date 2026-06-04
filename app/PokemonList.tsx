import { FlatList, StyleSheet, View } from "react-native";
import PokemonCard from "./PokemonCard"; 
import { useEffect, useState } from "react";

interface Pokemon {
  id: string;
  name: string;
  types: string[];
  imageUrl: string;
}

export default function PokemonList() {
  const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
  
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");
        const data = await response.json();

        const pokemonList: Pokemon[] = await Promise.all(
          data.results.map(async (item: { name: string; url: string }, index: number) => {
            const detailResponse = await fetch(item.url);
            const detailData = await detailResponse.json();
            const types = detailData.types.map((t: any) => t.type.name);
            const imageUrl = detailData.sprites.other["official-artwork"].front_default;

            return {
              id: String(index + 1).padStart(3, "0"),
              name: item.name,
              types: types,
              imageUrl: imageUrl,
            };
          })
        );
        setPokemonData(pokemonList);
      } catch (error) {
        console.error("Error fetching Pokémon data:", error);
      }
    })();
  }, []);

  return (
    <FlatList
      style={styles.flatList}
      data={pokemonData}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <PokemonCard pokemon={item} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  flatList: {
    flex: 0.6,
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    flex: 1,
    justifyContent: "space-around",
  }
});