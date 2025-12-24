import { useRef } from 'react';  
import VisNetwork from 'react-native-vis-network';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import * as React from 'react';
import { Animated, ImageBackground, ScrollView, StatusBar, Switch, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import haydockImage from './assets/haydock.jpg';
import JOHN from './assets/JOHN.json';
import LUKE from './assets/LUKE.json';
import MARK from './assets/MARK.json';
import MATTHEW from './assets/MATTHEW.json';


const ThemeContext = React.createContext();
const BOOKS = { JOHN, MARK, LUKE, MATTHEW };
const Tab = createBottomTabNavigator();

function CustomHeader({ title, colors }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{
      backgroundColor: colors.background,
      paddingTop: insets.top + 12,
      paddingBottom: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.text + '55',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Text style={{ fontSize: 22, fontWeight: '600', color: colors.text }}>{title}</Text>
    </View>
  );
}

function ReaderScreen({ route }) {
  const { colors } = React.useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const { book, chapter } = route.params || {};
  const chapterData = book && chapter ? BOOKS[book]?.[chapter] : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{
        paddingTop: 12,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 16,
        flexGrow: 1
      }}>
        {(!chapterData) ? (
          <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center', marginTop: 40 }}>
            Please select a passage.
          </Text>
        ) : (
          <>
            <Text style={{ fontSize: 28, fontWeight: '600', color: colors.text, marginBottom: 10 }}>
              {book} {chapter}
            </Text>
            {chapterData.map((line, index) => (
              <Text key={index} style={{ color: colors.text, fontSize: 18, marginBottom: 8 }}>
                {index + 1}. {line}
              </Text>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function GraphScreen({ navigation }) {
  const { colors } = React.useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const visRef = useRef(null);

  // Generate graph data dynamically from JSONs
  const gospels = ['MATTHEW', 'MARK', 'LUKE', 'JOHN'];
  const booksData = { MATTHEW, MARK, LUKE, JOHN };  // Reference imported JSONs

  const gospelNodes = gospels.map((gospel) => ({
    id: gospel,
    label: gospel,
    level: 0,  // Top level for Gospels
    color: { background: colors.background, border: colors.text },
    font: { color: colors.text },
    shape: 'box',  // Rectangular for main nodes
  }));

  const chapterNodes = [];
  const edges = [];

  gospels.forEach((gospel, gIndex) => {
    const book = booksData[gospel];
    const numChapters = Object.keys(book).length;

    for (let ch = 1; ch <= numChapters; ch++) {
      const nodeId = `${gospel}_${ch}`;
      chapterNodes.push({
        id: nodeId,
        label: `Ch ${ch}`,
        level: 1,  // Second level for chapters
        color: { background: colors.background, border: colors.text },
        font: { color: colors.text },
        shape: 'ellipse',  // Circular for chapters
      });
      edges.push({ from: gospel, to: nodeId });
    }

    // Connect Gospels in sequence: Matthew -> Mark -> Luke -> John
    if (gIndex < gospels.length - 1) {
      edges.push({ from: gospel, to: gospels[gIndex + 1], arrows: 'to' });
    }
  });

  const data = {
    nodes: [...gospelNodes, ...chapterNodes],
    edges,
  };

  // Graph options for Obsidian-like hierarchical layout
  const options = {
    layout: {
      hierarchical: {
        direction: 'UD',  // Up-Down: Gospels on top, chapters below
        sortMethod: 'directed',  // Follow edge directions for ordering
        nodeSpacing: 100,
        levelSeparation: 150,
      },
    },
    physics: false,  // Disable physics for stable hierarchical view (enable if you want interactive dragging)
    edges: {
      color: colors.text + '88',  // Semi-transparent edges matching theme
      smooth: false,  // Straight edges for simplicity
    },
    nodes: {
      borderWidth: 1,
      size: 25,
    },
    interaction: {
      zoomView: true,
      dragView: true,
      dragNodes: true,
    },
    height: '100%',  // Full height
    width: '100%',
  };

  // Handle node clicks to navigate to Reader
  React.useEffect(() => {
    if (visRef.current && visRef.current.network) {
      visRef.current.network.on('click', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          if (nodeId.includes('_')) {  // Chapter nodes have '_' (e.g., 'MATTHEW_5')
            const [book, chapter] = nodeId.split('_');
            navigation.navigate('Reader', { book, chapter });
          }
          // Optional: Handle Gospel clicks if needed (e.g., navigate to chapter 1)
        }
      });
    }
  }, [visRef.current]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, paddingBottom: insets.bottom }}>
      <VisNetwork ref={visRef} data={data} options={options} style={{ flex: 1 }} />
    </SafeAreaView>
  );
}

function SettingsScreen() {
  const { darkMode, toggleDarkMode, colors } = React.useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, paddingTop: 12, paddingBottom: insets.bottom, paddingHorizontal: 16 }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.text + '33'
      }}>
        <Text style={{ fontSize: 18, color: colors.text }}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
          thumbColor={darkMode ? '#fff' : '#fff'}
          trackColor={{ false: '#999', true: '#4a90e2' }}
        />
      </View>
    </SafeAreaView>
  );
}

function SplashScreen({ onFinish }) {
  const fadeCross = React.useRef(new Animated.Value(0)).current;
  const fadeWelcome = React.useRef(new Animated.Value(0)).current;
  const fadeButton = React.useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    Animated.stagger(400, [
      Animated.timing(fadeCross, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeWelcome, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeButton, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleStartPress = () => {
    Animated.parallel([
      Animated.timing(fadeCross, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeWelcome, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeButton, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(() => onFinish());
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={haydockImage}
        style={{ flex: 1, width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <View style={{ flex: 8, justifyContent: 'center', alignItems: 'center' }}>
            <Animated.View style={{ opacity: fadeCross, alignItems: 'center' }}>
              <Text style={{ fontSize: 100, color: '#fff', marginBottom: 20 }}>✠</Text>
            </Animated.View>
            <Animated.View style={{ opacity: fadeWelcome, alignItems: 'center' }}>
              <Text style={{ fontSize: 25, color: '#fff', textAlign: 'center', marginBottom: 20 }}>
                Welcome to the Logos App!
              </Text>
            </Animated.View>
          </View>
          <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
            <Animated.View style={{ opacity: fadeButton }}>
              <Text
                style={{
                  fontSize: 20,
                  color: '#fff',
                  paddingVertical: 14,
                  paddingHorizontal: 50,
                  backgroundColor: '#03032E',
                  borderRadius: 30,
                  overflow: 'hidden',
                  textAlign: 'center',
                }}
                onPress={handleStartPress}
              >
                Start ➔
              </Text>
            </Animated.View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

// --- Dynamic Tab Navigator ---
function AppTabs() {
  const insets = useSafeAreaInsets();
  const { darkMode, colors } = React.useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          height: 40 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom / 2 : 8,
        },
        tabBarActiveTintColor: darkMode ? '#9bbcff' : '#004aad',
        tabBarInactiveTintColor: darkMode ? '#aaa' : '#777',
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen name="Reader" component={ReaderScreen} options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>📖</Text> }} />
      <Tab.Screen name="Graph" component={GraphScreen} options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🕸️</Text> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [darkMode, setDarkMode] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(true);

  const theme = {
    darkMode,
    toggleDarkMode: () => setDarkMode(prev => !prev),
    colors: darkMode
      ? { background: '#03032E', text: '#ffffff' }
      : { background: '#F5EAD6', text: '#2B1D0E' },
  };

  const [currentTitle, setCurrentTitle] = React.useState('Reader');

  React.useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      const routeName = navigationRef.getCurrentRoute()?.name;
      if (routeName) setCurrentTitle(routeName);
    });
    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <ThemeContext.Provider value={theme}>
          <NavigationContainer ref={navigationRef}>
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
              <CustomHeader title={currentTitle} colors={theme.colors} />
              <AppTabs />
            </View>
          </NavigationContainer>
        </ThemeContext.Provider>
      )}
    </SafeAreaProvider>
  );
}

