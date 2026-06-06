import { FlatList, StyleSheet, View, ActivityIndicator, Text } from "react-native";
import PokemonCard from "./PokemonCard";
import { useEffect, useState, useRef, useMemo } from "react";
import { getCache, setCache } from "../utils/cache";

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

const LIMIT = 20;
// Minimum results before auto-fetching more (enough to fill ~3 rows)
const MIN_RESULTS_THRESHOLD = 6;

export default function PokemonList({ filterType, searchTerm }: PokemonListProps) {
  const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [directResult, setDirectResult] = useState<Pokemon | null>(null);
  const [isDirectSearching, setIsDirectSearching] = useState(false);

  // Refs for synchronous access inside async functions and effects
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const offsetRef = useRef(0);

  const fetchPokemon = async (currentOffset: number) => {
    if (isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    try {
      const pageKey = `cache:pokeapi:list:offset:${currentOffset}`;

      // Serve the whole processed page from cache if available
      const cachedPage = await getCache<Pokemon[]>(pageKey);
      if (cachedPage) {
        setPokemonData((prev) => [...prev, ...cachedPage]);
        offsetRef.current = currentOffset + LIMIT;
        // Optimistically assume more pages exist; the next fetch will correct it
        return;
      }

      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=${LIMIT}`
      );
      const data = await response.json();

      if (data.results.length < LIMIT) {
        hasMoreRef.current = false;
        setHasMore(false);
      }

      const pokemonList: Pokemon[] = await Promise.all(
        data.results.map(async (item: { name: string; url: string }, index: number) => {
          // Cache individual pokemon detail responses by their URL
          const detailKey = `cache:pokeapi:detail-url:${item.url}`;
          const cachedDetail = await getCache<{ types: string[]; imageUrl: string }>(detailKey);

          if (cachedDetail) {
            return {
              id: String(currentOffset + index + 1).padStart(3, "0"),
              name: item.name,
              types: cachedDetail.types,
              imageUrl: cachedDetail.imageUrl,
            };
          }

          const detailResponse = await fetch(item.url);
          const detailData = await detailResponse.json();
          const types = detailData.types.map((t: any) => t.type.name);
          const imageUrl = detailData.sprites.other["official-artwork"].front_default;

          setCache(detailKey, { types, imageUrl });

          return {
            id: String(currentOffset + index + 1).padStart(3, "0"),
            name: item.name,
            types,
            imageUrl,
          };
        })
      );

      setPokemonData((prev) => [...prev, ...pokemonList]);
      offsetRef.current = currentOffset + LIMIT;
      setCache(pageKey, pokemonList); // persist the whole processed page
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

  // Memoized filtered list — recomputes only when data, filter, or search changes
  const filteredPokemon = useMemo(
    () =>
      pokemonData.filter((pokemon) => {
        const matchesSearch = pokemon.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesType =
          filterType === "All" ||
          pokemon.types.some(
            (type) => type.toLowerCase() === filterType.toLowerCase()
          );
        return matchesSearch && matchesType;
      }),
    [pokemonData, filterType, searchTerm]
  );

  // Fix 1 & 2 (part A): Auto-fetch more pages when an active filter/search
  // yields too few results to scroll — preventing onEndReached from never firing.
  useEffect(() => {
    const hasActiveFilter = filterType !== "All" || searchTerm.trim() !== "";
    if (!hasActiveFilter) return;
    if (!hasMoreRef.current || isFetchingRef.current) return;
    if (filteredPokemon.length < MIN_RESULTS_THRESHOLD) {
      fetchPokemon(offsetRef.current);
    }
  }, [filteredPokemon, filterType, searchTerm]);

  // Fix 2 (part B): Direct API lookup by name, fires immediately after debounce.
  // Does NOT wait for all local pages to load — that would make the user wait forever.
  useEffect(() => {
    const trimmed = searchTerm.trim().toLowerCase();

    if (!trimmed) {
      setDirectResult(null);
      return;
    }

    // Local data already has a match — direct search not needed
    if (filteredPokemon.length > 0) {
      setDirectResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsDirectSearching(true);
      try {
        const searchKey = `cache:pokeapi:search:${trimmed}`;
        const cachedResult = await getCache<Pokemon>(searchKey);
        if (cachedResult) {
          setDirectResult(cachedResult);
          return;
        }

        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${trimmed}`
        );
        if (!response.ok) {
          setDirectResult(null);
          return;
        }
        const data = await response.json();
        const types = data.types.map((t: any) => t.type.name);
        const imageUrl = data.sprites.other["official-artwork"].front_default;
        const result: Pokemon = {
          id: String(data.id).padStart(3, "0"),
          name: data.name,
          types,
          imageUrl,
        };
        setDirectResult(result);
        setCache(searchKey, result); // cache by name for future lookups
      } catch {
        setDirectResult(null);
      } finally {
        setIsDirectSearching(false);
      }
    }, 500); // 500 ms debounce so we don't fire on every keystroke

    return () => clearTimeout(timer);
  }, [searchTerm, filteredPokemon.length]);

  const handleLoadMore = () => {
    if (!isFetchingRef.current && hasMoreRef.current) {
      fetchPokemon(offsetRef.current);
    }
  };

  const renderFooter = () => {
    if (!isLoading && !isDirectSearching) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#303943" />
        <Text style={styles.loadingText}>
          {isDirectSearching ? "Searching Pokémon..." : "Loading more Pokémon..."}
        </Text>
      </View>
    );
  };

  // Show direct API result only when local filtering returns nothing
  const displayData = directResult ? [directResult] : filteredPokemon;

  return (
    <FlatList
      style={styles.flatList}
      data={displayData}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => <PokemonCard pokemon={item} />}
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
  },
});