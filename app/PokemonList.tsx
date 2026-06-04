import { FlatList, StyleSheet, View, ActivityIndicator, Text } from "react-native";
import PokemonCard from "./PokemonCard"; 
import { useEffect, useState, useRef } from "react";

interface Pokemon {
  id: string;
  name: string;
  types: string[];
  imageUrl: string;
}

interface PokemonListProps {
  filterType: string;
  searchTerm: string;
}

export default function PokemonList({ filterType, searchTerm }: PokemonListProps) {
  const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false);
  const LIMIT = 20;

  const fetchPokemon = async (currentOffset: number) => {
    if (isFetchingRef.current || !hasMore) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=${LIMIT}`
      );
      const data = await response.json();

      if (data.results.length < LIMIT) {
        setHasMore(false);
      }

      const pokemonList: Pokemon[] = await Promise.all(
        data.results.map(async (item: { name: string; url: string }, index: number) => {
          const detailResponse = await fetch(item.url);
          const detailData = await detailResponse.json();
          const types = detailData.types.map((t: any) => t.type.name);
          const imageUrl = detailData.sprites.other["official-artwork"].front_default;

          return {
            id: String(currentOffset + index + 1).padStart(3, "0"),
            name: item.name,
            types: types,
            imageUrl: imageUrl,
          };
        })
      );

      setPokemonData(prev => [...prev, ...pokemonList]);
      setOffset(currentOffset + LIMIT);
    } catch (error) {
      console.error("Error fetching Pokémon data:", error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchPokemon(0);
  }, []);

  const handleLoadMore = () => {
    if (!isFetchingRef.current && hasMore) {
      fetchPokemon(offset);
    }
  };

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#303943" />
        <Text style={styles.loadingText}>Loading more Pokémon...</Text>
      </View>
    );
  };

  const filteredPokemon = pokemonData.filter((pokemon) => {
    const matchesSearch = pokemon.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === "All" || 
      pokemon.types.some(type => type.toLowerCase() === filterType.toLowerCase());

    return matchesSearch && matchesType;
  });

  return (
    <FlatList
      style={styles.flatList}
      data={filteredPokemon}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <PokemonCard pokemon={item} />
      )}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
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
    justifyContent: "flex-start",
    marginHorizontal: 10,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
  }
});