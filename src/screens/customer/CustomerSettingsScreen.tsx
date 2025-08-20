import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';

const CustomerSettingsScreen = ({ navigation }: any) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.replace('UserType');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            }
          },
        },
      ]
    );
  };

  const settingsOptions = [
    {
      icon: 'person',
      title: 'Modifier mon profil',
      subtitle: 'Informations personnelles',
      onPress: () => {},
      color: '#7ebd07',
    },
    {
      icon: 'lock',
      title: 'Changer mon mot de passe',
      subtitle: 'Sécurité du compte',
      onPress: () => {},
      color: '#3b82f6',
    },
    {
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Gérer les alertes',
      onPress: () => {},
      color: '#f59e0b',
    },
    {
      icon: 'help',
      title: 'Aide et support',
      subtitle: 'FAQ et contact',
      onPress: () => {},
      color: '#8b5cf6',
    },
    {
      icon: 'privacy-tip',
      title: 'Confidentialité',
      subtitle: 'Données personnelles',
      onPress: () => {},
      color: '#06b6d4',
    },
    {
      icon: 'logout',
      title: 'Se déconnecter',
      subtitle: 'Fermer la session',
      onPress: handleLogout,
      color: '#ef4444',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Icon name="settings" size={20} color="white" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Paramètres</Text>
            <Text style={styles.headerSubtitle}>Mon compte</Text>
          </View>
        </View>
        <Image 
          source={require('../../assets/Logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingCard}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIcon, { backgroundColor: `${option.color}20` }]}>
                <Icon name={option.icon} size={24} color={option.color} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7ebd07',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  logo: {
    width: 80,
    height: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  settingCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default CustomerSettingsScreen;