import React, { useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { Animated, ImageBackground, ScrollView, StatusBar, Switch, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
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

  const nodes = [
    { id: 'JOHN', label: 'John', color: '#ff9999' },
    { id: 'MARK', label: 'Mark', color: '#99ff99' },
    { id: 'LUKE', label: 'Luke', color: '#9999ff' },
    { id: 'MATTHEW', label: 'Matthew', color: '#ffff99' },
    ...Object.entries(BOOKS).flatMap(([book, chapters]) =>
      Object.keys(chapters).map(ch => ({ id: `${book}-${ch}`, label: ch }))
    )
  ];

  const edges = [
    { from: 'MATTHEW', to: 'MARK' },
    { from: 'MARK', to: 'LUKE' },
    { from: 'LUKE', to: 'JOHN' },
    ...Object.entries(BOOKS).flatMap(([book, chapters]) =>
      Object.keys(chapters).map(ch => ({ from: book, to: `${book}-${ch}` }))
    )
  ];

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      html, body { margin:0; height:100%; }
      #network { width:100%; height:100%; background: ${colors.background}; }
    </style>
    <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  </head>
  <body>
    <div id="network"></div>
    <script type="text/javascript">
      const nodes = new vis.DataSet(${JSON.stringify(nodes)});
      const edges = new vis.DataSet(${JSON.stringify(edges)});
      const container = document.getElementById('network');
      const data = { nodes, edges };
      const options = { 
        nodes: { shape: 'dot', size: 20, color: { background: '#fff', border: '#000' } },
        edges: { color: '#888', smooth: true },
        layout: { hierarchical: false },
        interaction: { hover: true }
      };
      const network = new vis.Network(container, data, options);

      network.on('click', function(params) {
        const node = params.nodes[0];
        if (node && node.includes('-')) {
          window.ReactNativeWebView.postMessage(node);
        }
      });
    </script>
  </body>
  </html>
`;


  const handleMessage = (event) => {
    const [book, chapter] = event.nativeEvent.data.split('-');
    navigation.navigate('Reader', { book, chapter });
  };

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      style={{ flex: 1 }}
      onMessage={handleMessage}
    />
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
  const fadeCross = useRef(new Animated.Value(0)).current;
  const fadeWelcome = useRef(new Animated.Value(0)).current;
  const fadeButton = useRef(new Animated.Value(0)).current;
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
