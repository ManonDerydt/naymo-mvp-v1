import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomerDashboardScreen from '../screens/customer/CustomerDashboardScreen';
import CustomerProfileScreen from '../screens/customer/CustomerProfileScreen';
import CustomerHistoryScreen from '../screens/customer/CustomerHistoryScreen';
import CustomerSearchScreen from '../screens/customer/CustomerSearchScreen';
import CustomerSettingsScreen from '../screens/customer/CustomerSettingsScreen';

const Tab = createBottomTabNavigator();

const CustomerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'home';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            case 'History':
              iconName = 'history';
              break;
            case 'Search':
              iconName = 'search';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#7ebd07',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}>
      <Tab.Screen
        name="Dashboard"
        component={CustomerDashboardScreen}
        options={{tabBarLabel: 'Accueil'}}
      />
      <Tab.Screen
        name="Profile"
        component={CustomerProfileScreen}
        options={{tabBarLabel: 'Profil'}}
      />
      <Tab.Screen
        name="History"
        component={CustomerHistoryScreen}
        options={{tabBarLabel: 'Historique'}}
      />
      <Tab.Screen
        name="Search"
        component={CustomerSearchScreen}
        options={{tabBarLabel: 'Recherche'}}
      />
      <Tab.Screen
        name="Settings"
        component={CustomerSettingsScreen}
        options={{tabBarLabel: 'Paramètres'}}
      />
    </Tab.Navigator>
  );
};

export default CustomerTabNavigator;