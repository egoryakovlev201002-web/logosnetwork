import React, { useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { Animated, ImageBackground, ScrollView, StatusBar, Switch, Text, View, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import haydockImage from './assets/haydock.jpg';
import John from './assets/JOHN.json';
import Luke from './assets/LUKE.json';
import Mark from './assets/MARK.json';
import Matthew from './assets/MATTHEW.json';
import readerBg from './assets/tab-bg/reader.jpg';
import graphBg from './assets/tab-bg/graph.png';
import settingsBg from './assets/tab-bg/settings.png';

const ThemeContext = React.createContext();
const BOOKS = { John, Mark, Luke, Matthew };
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
            Please select a passage via Graph Screen.
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
  const [filteredNodes, setFilteredNodes] = React.useState([]);
  const webViewRef = React.useRef(null);

  const formatNodeLabel = (id) => {
    if (id.includes('-')) {
      const [book, chapter] = id.split('-');
      return `${book} ${chapter}`;
    }
    return id;
  };

  const nodes = [
    { id: 'John', label: 'John', color: '#ff9999' },
    { id: 'Mark', label: 'Mark', color: '#99ff99' },
    { id: 'Luke', label: 'Luke', color: '#9999ff' },
    { id: 'Matthew', label: 'Matthew', color: '#ffff99' },
    ...Object.entries(BOOKS).flatMap(([book, chapters]) =>
      Object.keys(chapters).map(ch => ({ id: `${book}-${ch}`, label: ch }))
    )
  ];

  const edges = [
    { from: 'Matthew', to: 'Mark' },
    { from: 'Mark', to: 'Luke' },
    { from: 'Luke', to: 'John' },
    ...Object.entries(BOOKS).flatMap(([book, chapters]) =>
      Object.keys(chapters).map(ch => ({ from: book, to: `${book}-${ch}` }))
    )
  ];

  React.useEffect(() => {
    if (!searchText) return setFilteredNodes([]);
    const lower = searchText.toLowerCase();
    const partialMatches = nodes.filter(n => formatNodeLabel(n.id).toLowerCase().includes(lower));
    setFilteredNodes(partialMatches);
  }, [searchText]);

  const handleSelectNode = (nodeId) => {
    setSearchText('');
    setFilteredNodes([]);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if(window.selectNode) { window.selectNode("${nodeId}"); }
        true;
      `);
    }
  };

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
      window.graphNodes = new vis.DataSet(${JSON.stringify(nodes)});
      window.graphEdges = new vis.DataSet(${JSON.stringify(edges)});
      window.graphContainer = document.getElementById('network');
      window.graphData = { nodes: window.graphNodes, edges: window.graphEdges };
      window.graphOptions = { 
        nodes: { shape: 'dot', size: 20, color: { background: '#fff', border: '#000' }, font: {color: '${colors.graphText}', size: 14, } },
        edges: { color: '#888', smooth: true },
        layout: { hierarchical: false },
        interaction: { hover: true }
      };
      window.network = new vis.Network(window.graphContainer, window.graphData, window.graphOptions);

      window.selectNode = function(nodeId) {
        if(window.network && nodeId) {
          window.network.unselectAll();
          window.network.selectNodes([nodeId]);
          window.network.focus(nodeId, { scale: 1.5, animation: true });
        }
      }

      window.network.on('click', function(params) {
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
    <View style={{ flex: 1 }}>
      <View style={{ padding: 8, backgroundColor: colors.background, zIndex: 2 }}>
        <TextInput
          placeholder="Search a node..."
          placeholderTextColor={colors.text + '88'}
          value={searchText}
          onChangeText={setSearchText}
          style={{
            backgroundColor: colors.text + '11',
            color: colors.text,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            fontSize: 16,
          }}
        />
        {filteredNodes.length > 0 && (
          <FlatList
            data={filteredNodes}
            keyExtractor={(item) => item.id}
            style={{
              position: 'absolute',
              top: 42,
              left: 8,
              right: 8,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.text + '33',
              borderRadius: 6,
              maxHeight: 200,
              zIndex: 2,
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectNode(item.id)}
                style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: colors.text + '22' }}
              >
                <Text style={{ color: colors.text }}>{formatNodeLabel(item.id)}</Text>
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
      ? {
        background: '#03032E',
        text: '#ffffff',
        graphText: '#ffffff',
      }
      :{
        background: '#F5EAD6',
        text: '#2B1D0E',
        graphText: '#2B1D0E',
      },

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
