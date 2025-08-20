import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UserTypeScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EBFFBC" />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/Logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.merchantButton]}
            onPress={() => navigation.navigate('MerchantLogin')}
            activeOpacity={0.8}
          >
            <Icon name="store" size={24} color="#589507" />
            <Text style={styles.buttonText}>Je suis commerçant</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.customerButton]}
            onPress={() => navigation.navigate('CustomerLogin')}
            activeOpacity={0.8}
          >
            <Icon name="people" size={24} color="#589507" />
            <Text style={styles.buttonText}>Je suis client</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBFFBC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 60,
  },
  logo: {
    width: 200,
    height: 100,
  },
  buttonsContainer: {
    width: '100%',
    gap: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  merchantButton: {
    borderWidth: 2,
    borderColor: '#7ebd07',
  },
  customerButton: {
    borderWidth: 2,
    borderColor: '#7ebd07',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#589507',
  },
});

export default UserTypeScreen;