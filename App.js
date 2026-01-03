import React, { useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { Animated, ImageBackground, ScrollView, StatusBar, Switch, Text, View, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import haydockImage from './assets/haydock.jpg';
import JOHN from './assets/JOHN.json';
import LUKE from './assets/LUKE.json';
import MARK from './assets/MARK.json';
import MATTHEW from './assets/MATTHEW.json';
import readerBg from './assets/tab-bg/reader.jpg';
import graphBg from './assets/tab-bg/graph.png';
import settingsBg from './assets/tab-bg/settings.png';

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

  const [windows, setWindows] = React.useState([]);
  const [activeWindow, setActiveWindow] = React.useState(null);

  // Whenever a new node is clicked from GraphScreen
  React.useEffect(() => {
    if (!route.params?.book || !route.params?.chapter) return;

    const newWindow = { 
      id: `${route.params.book}-${route.params.chapter}`, 
      book: route.params.book, 
      chapter: route.params.chapter 
    };

    setWindows(prev => {
      // Prevent duplicates
      if (prev.find(w => w.id === newWindow.id)) {
        setActiveWindow(newWindow.id);
        return prev;
      }

      const updated = [newWindow, ...prev];
      if (updated.length > 5) updated.pop(); // limit 5 windows
      setActiveWindow(newWindow.id);
      return updated;
    });
  }, [route.params]);

  const closeWindow = (id) => {
    setWindows(prev => {
      const updated = prev.filter(w => w.id !== id);
      if (id === activeWindow && updated.length > 0) setActiveWindow(updated[0].id);
      if (updated.length === 0) setActiveWindow(null);
      return updated;
    });
  };

  const activeData = activeWindow ? activeWindow.split('-') : [];
  const chapterData = activeData.length === 2 ? BOOKS[activeData[0]]?.[activeData[1]] : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Window Tabs */}
      {windows.length > 0 && (
        <ScrollView
          horizontal
          style={{ flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.text + '55' }}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {windows.map(win => (
            <View
              key={win.id}
              style={{
                flexDirection: 'row',
                backgroundColor: win.id === activeWindow ? colors.text + '22' : colors.text + '11',
                borderRadius: 6,
                marginRight: 6,
                paddingHorizontal: 10,
                paddingVertical: 4,
                alignItems: 'center'
              }}
            >
              <Text
                style={{ color: colors.text, marginRight: 6 }}
                onPress={() => setActiveWindow(win.id)}
              >
                {win.book} {win.chapter}
              </Text>
              <Text
                style={{ color: colors.text, fontWeight: 'bold' }}
                onPress={() => closeWindow(win.id)}
              >
                ✕
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Chapter Content */}
      <ScrollView contentContainerStyle={{
        paddingTop: 12,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 16,
        flexGrow: 1
      }}>
        {!chapterData ? (
          <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center', marginTop: 40 }}>
            Please select a passage.
          </Text>
        ) : (
          <>
            <Text style={{ fontSize: 28, fontWeight: '600', color: colors.text, marginBottom: 0 }}>
              {activeData[0]} {activeData[1]}
            </Text>
            {chapterData.map((line, index) => (
              <Text key={index} style={{ color: colors.text, fontSize: 18, marginBottom: 0 }}>
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
  const [searchText, setSearchText] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const webViewRef = React.useRef(null);

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

        // Function called from React Native to highlight + focus a node
        function highlightNode(nodeId) {
          network.selectNodes([nodeId]);
          network.focus(nodeId, { scale: 1.5, animation: true });
        }
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    const [book, chapter] = event.nativeEvent.data.split('-');
    navigation.navigate('Reader', { book, chapter });
  };

  const handleSearchChange = (text) => {
  setSearchText(text);

  if (!text) {
    setSearchResults([]);
    return;
  }

  const lower = text.trim().toLowerCase();

  // Exact match: look for nodes where "Book Chapter" matches input
  const exact = nodes.find(n => {
    if (!n.id.includes('-')) return false; // skip book nodes
    const [bookId, chapter] = n.id.split('-');
    const bookLabel = nodes.find(b => b.id === bookId)?.label || bookId;
    return `${bookLabel} ${chapter}`.toLowerCase() === lower;
  });

  if (exact) {
    setSearchResults([]);
    webViewRef.current?.injectJavaScript(`highlightNode('${exact.id}'); true;`);
  } else {
    // Partial match: match either book label or chapter number
    const filtered = nodes.filter(n => {
      if (!n.id.includes('-')) return n.label.toLowerCase().includes(lower); // book node
      const [bookId, chapter] = n.id.split('-');
      const bookLabel = nodes.find(b => b.id === bookId)?.label || bookId;
      return bookLabel.toLowerCase().includes(lower) || chapter.toLowerCase().includes(lower);
    });
    setSearchResults(filtered);
  }
};


  const handleResultPress = (node) => {
    setSearchResults([]);
    setSearchText('');
    webViewRef.current?.injectJavaScript(`highlightNode('${node.id}'); true;`);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Search Input at Top-Right */}
      <View style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, width: 160 }}>
        <TextInput
          placeholder="Search node..."
          placeholderTextColor={colors.text + '88'}
          value={searchText}
          onChangeText={handleSearchChange}
          style={{
            backgroundColor: colors.text + '11',
            color: colors.text,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            fontSize: 14
          }}
        />
        {searchResults.length > 0 && (
          <FlatList
            style={{
              maxHeight: 200,
              backgroundColor: colors.background,
              marginTop: 4,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: colors.text + '33'
            }}
            data={searchResults}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleResultPress(item)}
                style={{ paddingVertical: 6, paddingHorizontal: 10 }}
              >
                <Text style={{ color: colors.text }}>{item.id} {item.label}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        style={{ flex: 1 }}
        onMessage={handleMessage}
      />
    </View>
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

function TabButton({ label, background, focused, colors }) {
  return (
    <ImageBackground
      source={background}
      resizeMode="cover"
      style={{
        width: 70,
        height: 34,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: focused ? 2 : 1,
        borderColor: focused ? colors.text : colors.text + '55',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: focused
            ? 'rgba(0,0,0,0.25)'
            : 'rgba(0,0,0,0.45)',
        }}
      />
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
    </ImageBackground>
  );
}



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
      <Tab.Screen
  name="Reader"
  component={ReaderScreen}
  options={{
    tabBarLabel: () => null,
    tabBarIcon: ({ focused }) => (
      <TabButton
        label="Reader"
        background={readerBg}
        focused={focused}
        colors={colors}
      />
    ),
  }}
/>

<Tab.Screen
  name="Graph"
  component={GraphScreen}
  options={{
    tabBarLabel: () => null,
    tabBarIcon: ({ focused }) => (
      <TabButton
        label="Graph"
        background={graphBg}
        focused={focused}
        colors={colors}
      />
    ),
  }}
/>

<Tab.Screen
  name="Settings"
  component={SettingsScreen}
  options={{
    tabBarLabel: () => null,
    tabBarIcon: ({ focused }) => (
      <TabButton
        label="Settings"
        background={settingsBg}
        focused={focused}
        colors={colors}
      />
    ),
  }}
/>
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
