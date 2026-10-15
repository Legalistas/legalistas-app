import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomNavigation from '../components/BottomNavigation';
import type { TabParamList } from '../navigation/RootStack';
import CasesScreen from './CasesScreen';
import HomeScreen from './HomeScreen';
import ResourcesScreen from './ResourcesScreen';
import SettingsScreen from './SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

// Pestañas principales, con la barra flotante del portal. El botón "atrás" de
// Android vuelve a Inicio y, desde Inicio, sale de la app.
const MainApp = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <BottomNavigation {...props} />}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Cases" component={CasesScreen} />
    <Tab.Screen name="Resources" component={ResourcesScreen} />
    <Tab.Screen name="Account" component={SettingsScreen} />
  </Tab.Navigator>
);

export default MainApp;
