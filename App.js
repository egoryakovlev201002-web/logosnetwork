import React, { useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { Image, Animated, Dimensions, ImageBackground, ScrollView, StatusBar, Switch, Text, View, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
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
import ChrysostomOnMatthew from './assets/ChrysostomOnMatthew.json';
import ChrysostomOnJohn from './assets/ChrysostomOnJohn.json';
import introslide1_background from './assets/introslide1_background.jpg';
import introslide2_background from './assets/introslide2_background.jpg';
import introslide2_box1 from './assets/introslide2_box1.jpg';
import introslide2_box2 from './assets/introslide2_box2.jpg';
import introslide3_background from './assets/introslide3_background.jpg';
import screenshot1 from './assets/screenshot1.jpg';
import introslide4_background from './assets/introslide4_background.jpg';
import screenshot2 from './assets/screenshot2.jpg';
import introslide5_background from './assets/introslide5_background.jpg';
import screenshot3 from './assets/screenshot3.jpg';
import introslide6_background from './assets/introslide6_background.jpg';
import introslide7_background from './assets/introslide7_background.jpg';
import CyrilOfAlexandriaOnLuke from './assets/CyrilOfAlexandriaOnLuke.json';



const ThemeContext = React.createContext();
const BOOKS = { John, Mark, Luke, Matthew };
const COMMENTARIES = [
  {
    id: 'Chrysostom',
    author: 'Chrysostom',
    color: '#c084fc',
    books: {
      Matthew: ChrysostomOnMatthew,
      John: ChrysostomOnJohn,
    },
  },
  {
    id: 'Cyril',
    author: 'Cyril of Alexandria',
    color: '#ecd501', // choose a unique color for this commentary
    books: {
      Luke: CyrilOfAlexandriaOnLuke,
    },
  },
];

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
  let chapterData = null;
  let displayTitle = '';

  if (activeData.length === 2) {
    const [book, chapter] = activeData;
    chapterData = BOOKS[book]?.[chapter];
    displayTitle = `${book} ${chapter}`;
  } else if (activeData.length === 3) {
    const [author, book, chapter] = activeData;
    chapterData = COMMENTARIES.find(c => c.id === author)?.books[book]?.[chapter];
    displayTitle = `${author} on ${book} ${chapter}`;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
              {displayTitle}
            </Text>

            {chapterData?.map((line, index) => (
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
    const parts = id.split('-');

    if (parts.length === 3) {
      const [author, book, chapter] = parts;
      return `${author} on ${book} ${chapter}`;
    }

    if (parts.length === 2) {
      const [book, chapter] = parts;
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
      Object.keys(chapters).map(ch => ({
        id: `${book}-${ch}`,
        label: `${book} ${ch}`,
      }))
    ),

    ...COMMENTARIES.flatMap(comm =>
      Object.entries(comm.books).flatMap(([book, chapters]) =>
        Object.keys(chapters).map(ch => ({
          id: `${comm.id}-${book}-${ch}`,
          label: `${comm.author} on ${book} ${ch}`,
          color: comm.color,
        }))
      )
    ),
  ];


  const edges = [
    { from: 'Matthew', to: 'Mark' },
    { from: 'Mark', to: 'Luke' },
    { from: 'Luke', to: 'John' },

    ...Object.entries(BOOKS).flatMap(([book, chapters]) =>
      Object.keys(chapters).map(ch => ({
        from: book,
        to: `${book}-${ch}`,
      }))
    ),

    ...COMMENTARIES.flatMap(comm =>
      Object.entries(comm.books).flatMap(([book, chapters]) =>
        Object.keys(chapters).map(ch => ({
          from: `${book}-${ch}`,
          to: `${comm.id}-${book}-${ch}`,
        }))
      )
    ),
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
        if (node) {
          window.ReactNativeWebView.postMessage(node);
        }
      });

    </script>
  </body>
  </html>
`;

  const handleMessage = (event) => {
    const parts = event.nativeEvent.data.split('-');

    if (parts.length === 2) {
      const [book, chapter] = parts;
      navigation.navigate('Reader', { book, chapter });
    } else if (parts.length === 3) {
      const [author, book, chapter] = parts;
      navigation.navigate('Reader', { book: `${author}-${book}`, chapter });
    }
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

function IntroSlide({ slide, width, height }) {
  if (slide.id === 's1') {
    return (
      <ImageBackground
        source={introslide1_background}
        style={{ width, height }}
        resizeMode="cover"
      >
        <View
          style={{
            position: 'absolute',
            top: height * 0.4, 
            left: width * 0.05, 
            width: width * 0.9, 
          }}
        >
          <View
            style={{
              backgroundColor: '#03032E',
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderRadius: 12,
              marginBottom: 12,
              alignSelf: 'flex-start',
              maxWidth: '90%',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, lineHeight: 24 }}>
              What is Logos Network?
            </Text>
          </View>

          <View
            style={{
              backgroundColor: '#03032E',
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderRadius: 12,
              marginBottom: 12,
              alignSelf: 'flex-start',
              maxWidth: '90%',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, lineHeight: 24 }}>
              It is a scholar's vault for Scriptural and Patristic studies, especially for Catholic usage.
            </Text>
          </View>

          <View
            style={{
              backgroundColor: '#03032E',
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderRadius: 12,
              alignSelf: 'flex-start',
              maxWidth: '90%',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, lineHeight: 24 }}>
              Read the Holy Bible and Church Fathers, explore interconnections visually, select writings based on themes, authors and chapters.
            </Text>
          </View>
        </View>
      </ImageBackground>
    );
  }
  if (slide.id === 's2') {
    return (
      <ImageBackground
        source={introslide2_background}
        style={{ width, height }}
        resizeMode="cover"
      >
        <View
          style={{
            backgroundColor: '#03032E',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 12,
            marginTop: height * 0.05,
            marginHorizontal: width * 0.05,
            marginBottom: 24,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600', textAlign: 'center' }}>
            What inspired its creation?
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: width * 0.05,
          }}
        >
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 20,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#03032E',
            alignItems: 'stretch',
          }}
        >
          <Image
            source={introslide2_box1}
            style={{
              width: 120,
              height: '100%',
            }}
            resizeMode="cover"
          />
          <View
            style={{
              flex: 1,
              paddingVertical: 16,
              paddingHorizontal: 16,
              justifyContent: 'center',
              backgroundColor: 'transparent',
            }}
          >
              <Text style={{ color: '#fff', fontSize: 16, lineHeight: 22 }}>
                Catena Aurea by St. Thomas Aquinas, an unmatched compilation of Patristic commentary on the Gospels composed by the Angelic Doctor, one of the greatest scholars and theologians to ever be gifted by God to our Holy Church.
              </Text>
            </View>
          </View>

        <View
          style={{
            flexDirection: 'row',
            marginBottom: 20,
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: '#03032E',
            alignItems: 'stretch',
          }}
        >
          <Image
            source={introslide2_box2}
            style={{
              width: 120,
              height: '100%',
            }}
            resizeMode="cover"
          />
          <View
            style={{
              flex: 1,
              paddingVertical: 16,
              paddingHorizontal: 16,
              justifyContent: 'center',
              backgroundColor: 'transparent',
            }}
        >
              <Text style={{ color: '#fff', fontSize: 16, lineHeight: 22 }}>
                Commentary upon the Douay-Rheims Bible by fr. George Leo Haydock, work of his whole life, in which he combined Patristic opinions directly from their Homilies, often scattered, which he gathered together, with scholarly notes on linguistics and history.
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>);
  }
  if (slide.id === 's3') {
    return (
      <ImageBackground
        source={introslide3_background}
        style={{ width, height }}
        resizeMode="cover"
      >
        <View
          style={{
            position: 'absolute',
            top: height * 0.4, 
            left: width * 0.05, 
            width: width * 0.9, 
          }}
        >
          <View
            style={{
              backgroundColor: '#03032E',
              paddingVertical: 7,
              paddingHorizontal: 20,
              borderRadius: 12,
              marginBottom: 12,
              alignSelf: 'flex-start',
              maxWidth: '90%',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, lineHeight: 24 }}>
              What is the purpose?
            </Text>
          </View>

          <View
            style={{
              backgroundColor: '#03032E',
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderRadius: 12,
              marginBottom: 12,
              alignSelf: 'flex-start',
              maxWidth: '90%',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, lineHeight: 24 }}>
              Representation of interconnectedness of Scripture and Patristic writings, displaying Tradition holistically, as a living body, not isolated texts scattered aroung the internet. 
            </Text>
          </View>
          <View
            style={{
              backgroundColor: '#03032E',
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderRadius: 12,
              alignSelf: 'flex-start',
              maxWidth: '90%',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, lineHeight: 24 }}>
              Most importantly, to serve the King of Kings.
            </Text>
          </View>
        </View>
      </ImageBackground>
    );
  }
  if (slide.id === 's4') {
    return (
      <ImageBackground
        source={introslide4_background}
        style={{ width, height }}
        resizeMode="cover"
      >
        <View
          style={{
            backgroundColor: '#03032E',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 12,
            marginTop: height * 0.05,
            marginHorizontal: width * 0.05,
            marginBottom: 24,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600', textAlign: 'center' }}>
            How to use the app?
          </Text>
        </View>
        <View style={{ height: height * 0.03 }} />

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            paddingHorizontal: width * 0.05,
            marginTop: height * 0.06,
          }}
        >
          <View style={{ flex: 1,  justifyContent: 'flex-start',}}>
            {[
              'Search for a node you need, representing a chapter from Scripture, a homily, or a theology tractate...',
              '…or explore freely by following connections between books and authors.',
              'All nodes are clickable, except index nodes for Scripture books.',
              'Once you click a node...→',
            ].map((text, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: '#03032E',
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 15 }}>{text}</Text>
              </View>
            ))}
          </View>

          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', paddingLeft: 12 }}>
            <Image
              source={screenshot1}
              style={{ width: '100%', aspectRatio: 0.5, resizeMode: 'contain' }}
            />
          </View>
        </View>
      </ImageBackground>
    )
  }
  if (slide.id === 's5') {
  return (
      <ImageBackground
        source={introslide5_background}
        style={{ width, height }}
        resizeMode="cover"
      >
        <View
          style={{
            backgroundColor: '#03032E',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 12,
            marginTop: height * 0.05,
            marginHorizontal: width * 0.05,
            marginBottom: 24,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600', textAlign: 'center' }}>
            ...the selected text is opened in the Reader tab!
          </Text>
        </View>
        <View style={{ height: height * 0.03 }} />

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            paddingHorizontal: width * 0.05,
            marginTop: height * 0.03,
          }}
        >
          <View style={{ flex: 1,  justifyContent: 'flex-start',}}>
            {[
              'Here you can read the selected passage. Note that the Bible translation used is Douay-Rheims.',
              'And multiple passages can be opened in separate windows, switchable at the top bar.',
              'For the safety of your device, only 5 windows can be opened at a time, but it is enough to keep multiple references while reading your particular passage.',
            ].map((text, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: '#03032E',
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 15 }}>{text}</Text>
              </View>
            ))}
          </View>

          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', paddingLeft: 12  }}>
            <Image
              source={screenshot2}
              style={{ width: '100%', aspectRatio: 0.5, resizeMode: 'contain' }}
            />
          </View>
        </View>
      </ImageBackground>
    )
  }
    if (slide.id === 's6') {
  return (
      <ImageBackground
        source={introslide6_background}
        style={{ width, height }}
        resizeMode="cover"
      >
        <View
          style={{
            backgroundColor: '#03032E',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 12,
            marginTop: height * 0.05,
            marginHorizontal: width * 0.05,
            marginBottom: 24,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600', textAlign: 'center' }}>
            You can always manage the way your app looks in Settings tab.
          </Text>
        </View>
        <View style={{ height: height * 0.03 }} />

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            paddingHorizontal: width * 0.05,
            marginTop: height * 0.03,
          }}
        >
          <View style={{ flex: 1,  justifyContent: 'flex-start',}}>
            {[
              'But for now there is only a theme switcher...',
              'I promise more settings will be added in future updates!',
            ].map((text, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: '#03032E',
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 15 }}>{text}</Text>
              </View>
            ))}
          </View>

          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', paddingLeft: 12  }}>
            <Image
              source={screenshot3}
              style={{ width: '100%', aspectRatio: 0.5, resizeMode: 'contain' }}
            />
          </View>
        </View>
      </ImageBackground>
    )
  }
    if (slide.id === 's7') {
  return (
      <ImageBackground
        source={introslide7_background}
        style={{ width, height }}
        resizeMode="cover"
      >
        <View
          style={{
            backgroundColor: '#03032E',
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 12,
            marginTop: height * 0.05,
            marginHorizontal: width * 0.05,
            marginBottom: 24,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600', textAlign: 'center' }}>
            Disclaimer!
          </Text>
        </View>
        <View style={{ height: height * 0.03 }} />

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            paddingHorizontal: width * 0.05,
            marginTop: height * 0.03,
          }}
        >
          <View style={{ flex: 1,  justifyContent: 'flex-start',}}>
            {[
              'This app is made by a lay teenager in process of entering the full communion with the Catholic Church, with no education in software development;',
              'It is not an official Church product, it is not endorsed by any Church authority and I sincerely apologise for any errors you may find in it;',
              'Use it for personal study and prayer, if you will, and I am very grateful for any use. If you have any suggestions, please contact me via email: egor.yakovlev@mascamarena.es;',
              'Give glory Lord Jesus Christ, eternal begotten Son of True God and pray to Immaculate Virgin Mary, our Queen and Mother, for intercession.'
            ].map((text, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: '#03032E',
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 15 }}>{text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>
    )
  }
  return <View style={{ width, height, backgroundColor: '#000' }} />;
}







function SplashScreen({ onFinish }) {
  const fadeCross = useRef(new Animated.Value(0)).current;
  const fadeWelcome = useRef(new Animated.Value(0)).current;
  const fadeButtons = useRef(new Animated.Value(0)).current;
  const { width, height } = Dimensions.get('window');

  const introSlides = [
    { id: 's1' },
    { id: 's2' },
    { id: 's3' },
    { id: 's4' },
    { id: 's5' },
    { id: 's6' },
    { id: 's7' },
  ];

  const insets = useSafeAreaInsets();
  const [showIntro, setShowIntro] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    Animated.stagger(400, [
      Animated.timing(fadeCross, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeWelcome, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeButtons, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleIntroductionPress = () => setShowIntro(true);
  const handleProceedPress = () => onFinish();

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={haydockImage}
        style={{ flex: 1, width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
          {!showIntro && (
            <>
              <View style={{ flex: 8, justifyContent: 'center', alignItems: 'center' }}>
                <Animated.View style={{ opacity: fadeCross, alignItems: 'center' }}>
                  <Text style={{ fontSize: 100, color: '#fff', marginBottom: 20 }}>✠</Text>
                </Animated.View>
                <Animated.View style={{ opacity: fadeWelcome, alignItems: 'center' }}>
                  <Text
                    style={{ fontSize: 25, color: '#fff', textAlign: 'center', marginBottom: 20 }}
                  >
                    Welcome to the Logos App!
                  </Text>
                </Animated.View>
              </View>
              <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                <Animated.View style={{ opacity: fadeButtons }}>
                  <Text
                    style={{
                      fontSize: 20,
                      color: '#fff',
                      paddingVertical: 14,
                      paddingHorizontal: 40,
                      backgroundColor: '#03032E',
                      borderRadius: 30,
                      overflow: 'hidden',
                      textAlign: 'center',
                      marginBottom: 60,
                    }}
                    onPress={handleIntroductionPress}
                  >
                    Introduction →
                  </Text>
                </Animated.View>
              </View>
            </>
          )}

          {showIntro && (
            <FlatList
              data={introSlides}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setCurrentSlide(index);
              }}
              renderItem={({ item }) => (
                <IntroSlide slide={item} width={width} height={height} />
              )}
              style={{ position: 'absolute', top: 0, left: 0, width, height }}
            />
          )}

          <Text
            style={{
              position: 'absolute',
              bottom: insets.bottom + 20,
              left: '30%',
              fontSize: 16,
              color: '#ffffffaa',
              paddingVertical: 10,
              paddingHorizontal: 20,
              backgroundColor: '#03032E33',
              borderRadius: 20,
              textAlign: 'center',
            }}
            onPress={handleProceedPress}
          >
            Proceed to App
          </Text>
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