import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { useState, useEffect } from "react";
import { getCache, setCache } from "../utils/cache";

const TYPES_CACHE_KEY = "cache:pokeapi:types";

interface PokemonHeaderProps {
  activeType: string;
  onFilterChange: (type: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function PokemonHeader({ 
  activeType, 
  onFilterChange,
  searchTerm,
  onSearchChange
}: PokemonHeaderProps) {
  const [types, setTypes] = useState<string[]>(["All"]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        // Types never change — serve from cache when available
        const cached = await getCache<string[]>(TYPES_CACHE_KEY);
        if (cached) {
          setTypes(cached);
          return;
        }

        const response = await fetch("https://pokeapi.co/api/v2/type");
        const data = await response.json();
        const filtered = (data.results as { name: string }[])
          .map((t) => t.name.charAt(0).toUpperCase() + t.name.slice(1))
          .filter((name) => name !== "Unknown" && name !== "Shadow");
        const withAll = ["All", ...filtered];

        setTypes(withAll);
        setCache(TYPES_CACHE_KEY, withAll); // persist for 24 h
      } catch (error) {
        console.error("Error fetching types:", error);
      } finally {
        setIsLoadingTypes(false);
      }
    };
    fetchTypes();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokédex</Text>
      <Text style={styles.subtitle}>Discover and train your monster team</Text>
      <TextInput 
        placeholder="Search Pokémon..." 
        placeholderTextColor="#94A3B8"
        style={styles.searchInput}
        value={searchTerm}
        onChangeText={onSearchChange}
      />

      {isLoadingTypes ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#303943" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {types.map((type) => {
            const isActive = activeType === type;
            return (
              <Pressable
                key={type}
                style={({ pressed }) => [
                  styles.button,
                  isActive ? styles.buttonActive : null,
                  pressed ? styles.buttonPressed : null,
                ]}
                onPress={() => onFilterChange(type)}
              >
                <Text style={[
                  styles.buttonText,
                  isActive ? styles.buttonTextActive : null,
                ]}>
                  {type}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
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
  loadingContainer: {
    height: 44,
    justifyContent: "center",
    paddingLeft: 30,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: "#E9EEF3",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
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