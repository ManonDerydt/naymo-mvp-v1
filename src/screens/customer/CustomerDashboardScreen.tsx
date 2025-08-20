import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../../contexts/AuthContext';

const CustomerDashboardScreen = () => {
  const {customer, customerData} = useAuth();
  const [offers, setOffers] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const points = customerData?.points || 0;
  const level = Math.floor(points / 100) || 0;
  const coupons = Math.floor(points / 100) || 0;
  const progress = points % 100;

  const filteredOffers = offers.filter(offer =>
    offer.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const openOfferModal = (offer) => {
    setSelectedOffer(offer);
    setShowOfferModal(true);
  };

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
            <Text style={styles.greeting}>
              Salut {customerData?.first_name} ! 👋
            </Text>
            <Text style={styles.level}>Niveau {level}</Text>
          </View>
        </View>
        <Image
          source={require('../../assets/Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Points Card */}
        <LinearGradient
          colors={['#7ebd07', '#589507']}
          style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <View>
              <Text style={styles.pointsLabel}>Mes points</Text>
              <Text style={styles.pointsValue}>{points}</Text>
            </View>
            <View style={styles.levelContainer}>
              <Text style={styles.pointsLabel}>Niveau</Text>
              <Text style={styles.levelValue}>{level}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progression</Text>
              <Text style={styles.progressLabel}>{progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, {width: `${progress}%`}]}
              />
            </View>
          </View>

          <View style={styles.couponsContainer}>
            <View style={styles.couponsInfo}>
              <Icon name="card-giftcard" size={20} color="white" />
              <Text style={styles.couponsText}>
                {coupons} bon{coupons > 1 ? 's' : ''} disponible{coupons > 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.couponsButton}
              onPress={() => setShowCoupons(true)}>
              <Text style={styles.couponsButtonText}>Voir mes bons</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="location-on" size={24} color="#2196F3" />
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Localisation</Text>
              <Text style={styles.statValue}>
                {customerData?.city || 'Non définie'}
              </Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Icon name="trending-up" size={24} color="#4CAF50" />
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Économies</Text>
              <Text style={styles.statValue}>{coupons * 10}% dispo</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.sectionTitle}>Découvrir les offres</Text>
          <View style={styles.searchBox}>
            <Icon name="search" size={20} color="#7ebd07" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une offre..."
              value={searchFilter}
              onChangeText={setSearchFilter}
            />
          </View>
        </View>

        {/* Offers */}
        <View style={styles.offersContainer}>
          {filteredOffers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>🔍</Text>
              <Text style={styles.emptyStateTitle}>Aucune offre trouvée</Text>
            </View>
          ) : (
            filteredOffers.map((offer, index) => (
              <TouchableOpacity
                key={offer.id}
                style={styles.offerCard}
                onPress={() => openOfferModal(offer)}>
                <View style={styles.offerContent}>
                  <Text style={styles.offerEmoji}>🎁</Text>
                  <View style={styles.offerInfo}>
                    <Text style={styles.offerName}>{offer.name}</Text>
                    <Text style={styles.offerDescription}>
                      {offer.description}
                    </Text>
                    <Text style={styles.offerDuration}>
                      Durée: {offer.duration} mois
                    </Text>
                  </View>
                  {offer.discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>-{offer.discount}%</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Coupons Modal */}
      <Modal
        visible={showCoupons}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCoupons(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Icon name="card-giftcard" size={32} color="white" />
              </View>
              <Text style={styles.modalTitle}>Mes bons de réduction</Text>
            </View>

            {coupons > 0 ? (
              <View style={styles.couponsListContainer}>
                {[...Array(coupons)].map((_, idx) => (
                  <View key={idx} style={styles.couponItem}>
                    <View style={styles.couponContent}>
                      <Text style={styles.couponDiscount}>-10% de réduction</Text>
                      <Text style={styles.couponDescription}>
                        Valable chez tous nos partenaires
                      </Text>
                    </View>
                    <Text style={styles.couponEmoji}>🎁</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCoupons}>
                <Text style={styles.emptyCouponsText}>Aucun bon disponible</Text>
                <Text style={styles.emptyCouponsSubtext}>
                  Continuez à acheter pour en gagner !
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCoupons(false)}>
              <Text style={styles.modalCloseButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Offer Modal */}
      <Modal
        visible={showOfferModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOfferModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={() => setShowOfferModal(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>

            {selectedOffer && (
              <>
                <View style={styles.offerModalHeader}>
                  <Text style={styles.offerModalEmoji}>🎁</Text>
                  <Text style={styles.offerModalTitle}>{selectedOffer.name}</Text>
                  <Text style={styles.offerModalDescription}>
                    {selectedOffer.description}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.addOfferButton}
                  onPress={() => {
                    Alert.alert('Succès', 'Offre ajoutée avec succès !');
                    setShowOfferModal(false);
                  }}>
                  <Text style={styles.addOfferButtonText}>Ajouter cette offre</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    borderBottomColor: '#e0e0e0',
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
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  level: {
    fontSize: 12,
    color: '#666',
  },
  logo: {
    width: 60,
    height: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pointsCard: {
    borderRadius: 20,
    padding: 24,
    marginVertical: 20,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pointsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  pointsValue: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  levelContainer: {
    alignItems: 'flex-end',
  },
  levelValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  couponsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  couponsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  couponsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  couponsButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  couponsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  offersContainer: {
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    color: '#666',
  },
  offerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  offerEmoji: {
    fontSize: 32,
  },
  offerInfo: {
    flex: 1,
  },
  offerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  offerDuration: {
    fontSize: 12,
    color: '#999',
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFCD29',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  couponsListContainer: {
    gap: 12,
    marginBottom: 24,
  },
  couponItem: {
    backgroundColor: '#ebffbc',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7ebd07',
    borderStyle: 'dashed',
  },
  couponContent: {
    flex: 1,
  },
  couponDiscount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#396F04',
  },
  couponDescription: {
    fontSize: 14,
    color: '#589507',
  },
  couponEmoji: {
    fontSize: 24,
  },
  emptyCoupons: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyCouponsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptyCouponsSubtext: {
    fontSize: 14,
    color: '#999',
  },
  modalCloseButton: {
    backgroundColor: '#7ebd07',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  offerModalHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  offerModalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  offerModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  offerModalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  addOfferButton: {
    backgroundColor: '#7ebd07',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addOfferButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomerDashboardScreen;