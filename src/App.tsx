import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar} from 'react-native';
import UserTypeScreen from './screens/UserTypeScreen';
import CustomerLoginScreen from './screens/auth/CustomerLoginScreen';
import MerchantLoginScreen from './screens/auth/MerchantLoginScreen';
import CustomerRegisterScreen from './screens/customer/CustomerRegisterScreen';
import CustomerTabNavigator from './navigation/CustomerTabNavigator';
import MerchantTabNavigator from './navigation/MerchantTabNavigator';
import {AuthProvider} from './contexts/AuthContext';

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#ebffbc" />
        <Stack.Navigator
          initialRouteName="UserType"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="UserType" component={UserTypeScreen} />
          <Stack.Screen name="CustomerLogin" component={CustomerLoginScreen} />
          <Stack.Screen name="MerchantLogin" component={MerchantLoginScreen} />
          <Stack.Screen name="CustomerRegister" component={CustomerRegisterScreen} />
          <Stack.Screen name="CustomerApp" component={CustomerTabNavigator} />
          <Stack.Screen name="MerchantApp" component={MerchantTabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;