import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getCache, setCache } from "../../utils/cache";

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

const STAT_LABELS: { [key: string]: string } = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

/**
 * Semantic stat colours based on RPG / UX psychology:
 *   HP           → mint green  (universal health/vitality colour)
 *   Attack       → coral red   (offense, power, aggression)
 *   Defense      → amber       (caution, stability, a protective wall)
 *   Sp. Atk      → coral red   (damage metric — same warm palette as Attack)
 *   Sp. Def      → mint green  (survival/tanking metric — same palette as HP)
 *   Speed        → sky blue    (motion, wind, quickness)
 */
const STAT_COLORS: { [key: string]: string } = {
  hp: "#6DC183",
  attack: "#F7786B",
  defense: "#F5AC78",
  "special-attack": "#F7786B",
  "special-defense": "#6DC183",
  speed: "#58ABF6",
};

interface PokemonDetail {
  id: number;
  name: string;
  types: string[];
  imageUrl: string;
  height: number; // decimetres
  weight: number; // hectograms
  abilities: string[];
  stats: { name: string; value: number }[];
}

function formatHeight(dm: number): string {
  const totalInches = Math.round(dm * 3.937);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${String(inches).padStart(2, "0")}"`;
}

function formatWeight(hg: number): string {
  return `${(hg / 4.536).toFixed(1)} lbs`;
}

const TABS = ["about", "stats"] as const;
type Tab = (typeof TABS)[number];

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [species, setSpecies] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("about");
  // [{x, width}] for each tab label — measured via onLayout
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);

  const pagerRef = useRef<ScrollView>(null);
  // Tracks raw horizontal scroll offset of the pager in real-time
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Both pokemon + species are fetched together and cached as one entry,
        // so revisiting the same pokemon costs zero network requests.
        const cacheKey = `cache:pokeapi:detail:${id}`;
        interface CachedDetail {
          pokemon: PokemonDetail;
          species: string;
        }
        const cached = await getCache<CachedDetail>(cacheKey);
        if (cached) {
          setPokemon(cached.pokemon);
          setSpecies(cached.species);
          return;
        }

        const [pokemonRes, speciesRes] = await Promise.all([
          fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
          fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
        ]);
        const pokemonData = await pokemonRes.json();
        const speciesData = await speciesRes.json();

        const types: string[] = pokemonData.types.map((t: any) => t.type.name);
        const imageUrl: string =
          pokemonData.sprites.other["official-artwork"].front_default;
        const abilities: string[] = pokemonData.abilities.map((a: any) =>
          (a.ability.name as string)
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        );
        const stats: { name: string; value: number }[] =
          pokemonData.stats.map((s: any) => ({
            name: s.stat.name,
            value: s.base_stat,
          }));

        const genusEntry = speciesData.genera?.find(
          (g: any) => g.language.name === "en"
        );
        const genus = genusEntry?.genus ?? "";

        const detail: PokemonDetail = {
          id: pokemonData.id,
          name: pokemonData.name,
          types,
          imageUrl,
          height: pokemonData.height,
          weight: pokemonData.weight,
          abilities,
          stats,
        };

        setPokemon(detail);
        setSpecies(genus);
        setCache(cacheKey, { pokemon: detail, species: genus });
      } catch (error) {
        console.error("Error fetching Pokémon detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const recordTabLayout = (index: number, x: number, w: number) => {
    setTabLayouts((prev) => {
      const next = [...prev];
      next[index] = { x, width: w };
      return next;
    });
  };

  /** Pressing a tab label scrolls the pager to that page */
  const handleTabPress = (tab: Tab) => {
    setActiveTab(tab);
    pagerRef.current?.scrollTo({
      x: tab === "about" ? 0 : width,
      animated: true,
    });
  };

  /** Swiping the pager updates the active tab indicator */
  const handleSwipeEnd = (event: any) => {
    const pageIndex = Math.round(
      event.nativeEvent.contentOffset.x / width
    );
    setActiveTab(pageIndex === 0 ? "about" : "stats");
  };

  if (isLoading || !pokemon) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#303943" />
      </View>
    );
  }

  const primaryType = pokemon.types[0];
  const headerColor = TYPE_COLORS[primaryType] || "#E2E8F0";
  const formattedId = `#${String(pokemon.id).padStart(3, "0")}`;
  const displayName =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* ── Coloured header ── */}
      <View
        style={[
          styles.header,
          { backgroundColor: headerColor, paddingTop: insets.top + 8 },
        ]}
      >
        {/* Back button only */}
        <View style={styles.headerButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && { opacity: 0.6 },
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
        </View>

        {/* Name + ID */}
        <View style={styles.nameRow}>
          <Text style={styles.pokemonName}>{displayName}</Text>
          <Text style={styles.pokemonId}>{formattedId}</Text>
        </View>

        {/* Type pills */}
        <View style={styles.typePills}>
          {pokemon.types.map((type) => (
            <View key={type} style={styles.typePill}>
              <Text style={styles.typePillText}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </View>
          ))}
        </View>

        {/* Artwork — overlaps the white card below */}
        <Image source={{ uri: pokemon.imageUrl }} style={styles.artwork} />
      </View>

      {/* ── White content card ── */}
      <View style={styles.card}>
        {/* Tab labels + animated underline */}
        <View style={styles.tabs}>
          {TABS.map((tab, index) => (
            <Pressable
              key={tab}
              style={styles.tab}
              onPress={() => handleTabPress(tab)}
              onLayout={(e) => {
                const { x, width: w } = e.nativeEvent.layout;
                recordTabLayout(index, x, w);
              }}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab && styles.tabLabelActive,
                ]}
              >
                {tab === "about" ? "About" : "Base Stats"}
              </Text>
            </Pressable>
          ))}

          {/* Single underline that glides between tabs as the user swipes */}
          {tabLayouts.length === 2 && (
            <Animated.View
              style={[
                styles.tabUnderline,
                {
                  left: tabLayouts[0].x,
                  width: scrollX.interpolate({
                    inputRange: [0, width],
                    outputRange: [tabLayouts[0].width, tabLayouts[1].width],
                    extrapolate: "clamp",
                  }),
                  transform: [{
                    translateX: scrollX.interpolate({
                      inputRange: [0, width],
                      outputRange: [0, tabLayouts[1].x - tabLayouts[0].x],
                      extrapolate: "clamp",
                    }),
                  }],
                },
              ]}
            />
          )}
        </View>

        {/* Swipeable pager — two side-by-side pages */}
        <Animated.ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleSwipeEnd}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          style={styles.pager}
        >
          {/* ── Page 1: About ── */}
          <ScrollView
            style={[styles.page, { width }]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 24,
              paddingTop: 20,
              paddingHorizontal: 24,
            }}
          >
            <View style={styles.aboutSection}>
              {[
                { label: "Species", value: species },
                { label: "Height", value: formatHeight(pokemon.height) },
                { label: "Weight", value: formatWeight(pokemon.weight) },
                { label: "Abilities", value: pokemon.abilities.join(", ") },
              ].map(({ label, value }) => (
                <View key={label} style={styles.aboutRow}>
                  <Text style={styles.aboutLabel}>{label}</Text>
                  <Text style={styles.aboutValue}>{value}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* ── Page 2: Base Stats ── */}
          <ScrollView
            style={[styles.page, { width }]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 24,
              paddingTop: 20,
              paddingHorizontal: 24,
            }}
          >
            <View style={styles.statsSection}>
              {pokemon.stats.map((stat) => {
                const barColor = STAT_COLORS[stat.name] ?? headerColor;
                return (
                  <View key={stat.name} style={styles.statRow}>
                    <Text style={styles.statLabel}>
                      {STAT_LABELS[stat.name] ?? stat.name}
                    </Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <View style={styles.statBarBg}>
                      <View
                        style={[
                          styles.statBarFill,
                          {
                            width: `${Math.min(
                              (stat.value / 255) * 100,
                              100
                            )}%`,
                            backgroundColor: barColor,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </Animated.ScrollView>
      </View>
    </View>
  );
}

const ARTWORK_SIZE = 180;
const ARTWORK_OVERLAP = 90;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  /* Header */
  header: {
    paddingHorizontal: 24,
    paddingBottom: ARTWORK_OVERLAP + 12,
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    lineHeight: 30,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pokemonName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  pokemonId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.85)",
  },
  typePills: {
    flexDirection: "row",
    gap: 8,
  },
  typePill: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  typePillText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  artwork: {
    position: "absolute",
    bottom: -(ARTWORK_SIZE - ARTWORK_OVERLAP),
    right: 20,
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    zIndex: 1,
  },

  /* White card */
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    overflow: "hidden",
  },

  /* Tabs */
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginTop: ARTWORK_SIZE - ARTWORK_OVERLAP + 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 28,
  },
  tab: {
    paddingBottom: 10,
    position: "relative",
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#94A3B8",
  },
  tabLabelActive: {
    color: "#303943",
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    height: 2,
    backgroundColor: "#303943",
    borderRadius: 2,
  },

  /* Pager */
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },

  /* About */
  aboutSection: {
    gap: 18,
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  aboutLabel: {
    width: 90,
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
  aboutValue: {
    flex: 1,
    fontSize: 14,
    color: "#303943",
    fontWeight: "600",
  },

  /* Stats */
  statsSection: {
    gap: 16,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statLabel: {
    width: 72,
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },
  statValue: {
    width: 32,
    fontSize: 14,
    color: "#303943",
    fontWeight: "700",
    textAlign: "right",
  },
  statBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  statBarFill: {
    height: "100%",
    borderRadius: 3,
  },
});
