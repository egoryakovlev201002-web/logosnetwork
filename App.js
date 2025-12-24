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

function buildGraphData() {
  const gospelOrder = ['JOHN', 'MARK', 'LUKE', 'MATTHEW'];
  const nodes = [];
  const edges = [];

  gospelOrder.forEach((book, i) => {
    nodes.push({
      id: book,
      label: book,
      shape: 'box',
      color: '#004aad',
      font: { color: '#fff' },
      clickable: false,
    });

    const chapters = Object.keys(BOOKS[book] || {}); // <- safe fallback
    chapters.forEach(chapter => {
      const nodeId = `${book}_${chapter}`;
      nodes.push({
        id: nodeId,
        label: chapter,
        shape: 'ellipse',
        color: '#9bbcff',
        font: { color: '#000' },
        book,
        chapter
      });
      edges.push({ from: book, to: nodeId });
    });

    if (i < gospelOrder.length - 1) {
      edges.push({ from: book, to: gospelOrder[i + 1] });
    }
  });

  return { nodes, edges };
}


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
  const networkRef = useRef(null);

  const graphData = buildGraphData() || { nodes: [], edges: [] };
  const { nodes, edges } = graphData;

  const options = {
    nodes: {
      shape: 'dot',
      size: 16,
      font: { size: 16 },
    },
    edges: {
      smooth: true,
      arrows: { to: { enabled: true } },
    },
    layout: {
      hierarchical: false,
    },
    physics: {
      stabilization: false,
    },
  };

  const handleClick = params => {
    if (params.nodes.length) {
      const clickedId = params.nodes[0];
      const clickedNode = nodes.find(n => n.id === clickedId);
      if (clickedNode?.book && clickedNode?.chapter) {
        navigation.navigate('Reader', {
          book: clickedNode.book,
          chapter: clickedNode.chapter
        });
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, paddingTop: 12, paddingHorizontal: 16, paddingBottom: insets.bottom + 20 }}>
      <VisNetwork
        ref={networkRef}
        nodes={nodes}
        edges={edges}
        options={options}
        events={{ select: handleClick }}
        style={{ flex: 1 }}
      />
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

