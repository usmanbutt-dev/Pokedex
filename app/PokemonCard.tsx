import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text } from "react-native";

interface Pokemon {
  id: string;
  name: string;
  types: string[];
  imageUrl: string;
}

interface PokemonCardProps {
  pokemon: Pokemon;
}

const TYPE_COLORS: { [key: string]: string } = {
  grass: "#48D0B0",
  fire: "#F7786B",
  water: "#58ABF6",
  electric: "#FFCE4B",
  poison: "#9F5BBA",
  normal: "#B1B1B1",
  flying: "#A891EC",
  bug: "#A8B820",
  rock: "#B8A038",
  ground: "#E0C068",
  psychic: "#F85888",
  ghost: "#705898",
  ice: "#98D8D8",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
  fighting: "#C03028",
};

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  const primaryType = pokemon.types[0].toLowerCase();
  const backgroundColor = TYPE_COLORS[primaryType] || "#E2E8F0";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor },
        pressed && styles.pressed,
      ]}
      onPress={() => router.push({ pathname: "/pokemon/[id]", params: { id: pokemon.name } })}
    >
      <Text style={styles.ID}>#{pokemon.id}</Text>
      <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
        {pokemon.name}
      </Text>
      {pokemon.types.map((type) => (
        <Text key={type} style={styles.type}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Text>
      ))}
      <Image source={{ uri: pokemon.imageUrl }} style={styles.image} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    borderRadius: 15,
    margin: 5,
    paddingLeft: 15,
    paddingTop: 15,
    gap: 5,
    alignSelf: "flex-start",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  ID: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#E9EEF3",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  type: {
    fontSize: 12,
    color: "#FFFFFF",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 70,
    textAlign: "center",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontWeight: "bold",
  },
  image: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 85,
    height: 85,
  },
});