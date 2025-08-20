import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MerchantDashboardScreen from '../screens/merchant/MerchantDashboardScreen';
import MerchantStoreScreen from '../screens/merchant/MerchantStoreScreen';
import MerchantOffersScreen from '../screens/merchant/MerchantOffersScreen';
import MerchantCustomersScreen from '../screens/merchant/MerchantCustomersScreen';
import MerchantSettingsScreen from '../screens/merchant/MerchantSettingsScreen';

const Tab = createBottomTabNavigator();

const MerchantTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Store':
              iconName = 'store';
              break;
            case 'Offers':
              iconName = 'local-offer';
              break;
            case 'Customers':
              iconName = 'people';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#7ebd07',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={MerchantDashboardScreen}
        options={{ tabBarLabel: 'Tableau de bord' }}
      />
      <Tab.Screen 
        name="Store" 
        component={MerchantStoreScreen}
        options={{ tabBarLabel: 'Mon Magasin' }}
      />
      <Tab.Screen 
        name="Offers" 
        component={MerchantOffersScreen}
        options={{ tabBarLabel: 'Mes Offres' }}
      />
      <Tab.Screen 
        name="Customers" 
        component={MerchantCustomersScreen}
        options={{ tabBarLabel: 'Mes Clients' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={MerchantSettingsScreen}
        options={{ tabBarLabel: 'Paramètres' }}
      />
    </Tab.Navigator>
  );
};

export default MerchantTabNavigator;