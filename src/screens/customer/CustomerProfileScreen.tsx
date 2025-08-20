import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';

const CustomerProfileScreen = () => {
  const { customerData } = useAuth();
  const points = customerData?.points || 0;
  const level = Math.floor(points / 100);
  const bonsRestants = Math.floor(points / 100);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {customerData?.first_name?.charAt(0) || 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Mon profil Naymo</Text>
            <Text style={styles.headerSubtitle}>Niveau {level}</Text>
          </View>
        </View>
        <Image 
          source={require('../../assets/Logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <LinearGradient
          colors={['#7ebd07', '#589507']}
          style={styles.profileCard}
        >
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Icon name="person" size={32} color="white" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {customerData?.first_name} {customerData?.last_name}
              </Text>
              <Text style={styles.profileMember}>
                Membre depuis {new Date().getFullYear()}
              </Text>
            </View>
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.profileDetailCard}>
              <Icon name="cake" size={16} color="white" />
              <View style={styles.profileDetailInfo}>
                <Text style={styles.profileDetailLabel}>Date de naissance</Text>
                <Text style={styles.profileDetailValue}>
                  {customerData?.birth_date 
                    ? new Date(customerData.birth_date).toLocaleDateString("fr-FR")
                    : "Non renseignée"}
                </Text>
              </View>
            </View>

            <View style={styles.profileDetailCard}>
              <Icon name="phone" size={16} color="white" />
              <View style={styles.profileDetailInfo}>
                <Text style={styles.profileDetailLabel}>Téléphone</Text>
                <Text style={styles.profileDetailValue}>
                  {customerData?.phone_number || "Non renseigné"}
                </Text>
              </View>
            </View>

            <View style={styles.profileDetailCard}>
              <Icon name="location-on" size={16} color="white" />
              <View style={styles.profileDetailInfo}>
                <Text style={styles.profileDetailLabel}>Ville</Text>
                <Text style={styles.profileDetailValue}>
                  {customerData?.city || "Non renseignée"}
                </Text>
              </View>
            </View>

            <View style={styles.profileDetailCard}>
              <Icon name="star" size={16} color="white" />
              <View style={styles.profileDetailInfo}>
                <Text style={styles.profileDetailLabel}>Niveau</Text>
                <Text style={styles.profileDetailValue}>Niveau {level}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="trending-up" size={24} color="#7ebd07" />
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Points totaux</Text>
              <Text style={styles.statValue}>{points}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <Icon name="card-giftcard" size={24} color="#10b981" />
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Bons disponibles</Text>
              <Text style={styles.statValue}>{bonsRestants}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <Icon name="history" size={24} color="#f59e0b" />
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Bons utilisés</Text>
              <Text style={styles.statValue}>0</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <Icon name="favorite" size={24} color="#8b5cf6" />
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Commerçant préféré</Text>
              <Text style={styles.statValue}>Aucun</Text>
            </View>
          </View>
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7ebd07',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
  profileCard: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileMember: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  profileDetails: {
    gap: 12,
  },
  profileDetailCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileDetailInfo: {
    flex: 1,
  },
  profileDetailLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  profileDetailValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
});

export default CustomerProfileScreen;