import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import firestore from '@react-native-firebase/firestore';

const CustomerDashboardScreen = () => {
  const { customer, customerData } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  const points = customerData?.points || 0;
  const level = Math.floor(points / 100);
  const coupons = Math.floor(points / 100);
  const progress = points % 100;

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const querySnapshot = await firestore().collection('offer').get();
        const offersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOffers(offersList);
      } catch (error) {
        console.error("Erreur lors de la récupération des offres :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const openOfferModal = async (offer: any) => {
    setSelectedOffer(offer);
    setShowOfferModal(true);

    try {
      await firestore().collection('offer').doc(offer.id).update({
        views: firestore.FieldValue.increment(1)
      });
    } catch (error) {
      console.error("Erreur lors de l'incrémentation des vues :", error);
    }
  };

  const addOfferToCustomer = async (offerId: string) => {
    if (!customer) return;

    try {
      const customerRef = firestore().collection('customer').doc(customer.uid);
      const customerSnap = await customerRef.get();
      const currentOffers = customerSnap.data()?.offers || [];

      if (currentOffers.includes(offerId)) {
        alert("Vous avez déjà cette offre !");
        return;
      }

      await customerRef.update({
        offers: firestore.FieldValue.arrayUnion(offerId),
      });

      alert("Offre ajoutée avec succès !");
      setShowOfferModal(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'offre :", error);
    }
  };

  const renderOffer = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => openOfferModal(item)}
    >
      <View style={styles.offerHeader}>
        <Text style={styles.offerName}>{item.name}</Text>
        {item.isBoosted && (
          <View style={styles.boostedBadge}>
            <Icon name="star" size={12} color="white" />
          </View>
        )}
      </View>
      <Text style={styles.offerDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.offerFooter}>
        <Text style={styles.offerDuration}>Durée: {item.duration} mois</Text>
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Points Card */}
        <LinearGradient
          colors={['#7ebd07', '#589507']}
          style={styles.pointsCard}
        >
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
              <Text style={styles.progressValue}>{progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
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
              onPress={() => setShowCouponsModal(true)}
            >
              <Text style={styles.couponsButtonText}>Voir mes bons</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="location-on" size={24} color="#3b82f6" />
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Localisation</Text>
              <Text style={styles.statValue}>{customerData?.city || 'Non définie'}</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Icon name="trending-up" size={24} color="#10b981" />
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Économies</Text>
              <Text style={styles.statValue}>{coupons * 10}% dispo</Text>
            </View>
          </View>
        </View>

        {/* Offers Section */}
        <View style={styles.offersSection}>
          <Text style={styles.sectionTitle}>Découvrir les offres</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7ebd07" />
              <Text style={styles.loadingText}>Chargement des offres...</Text>
            </View>
          ) : (
            <FlatList
              data={offers}
              renderItem={renderOffer}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.offersList}
            />
          )}
        </View>
      </ScrollView>

      {/* Coupons Modal */}
      <Modal
        visible={showCouponsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCouponsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="card-giftcard" size={32} color="#FFCD29" />
              <Text style={styles.modalTitle}>Mes bons de réduction</Text>
            </View>

            {coupons > 0 ? (
              <ScrollView style={styles.couponsScrollView}>
                {[...Array(coupons)].map((_, idx) => (
                  <View key={idx} style={styles.couponCard}>
                    <View style={styles.couponContent}>
                      <Text style={styles.couponDiscount}>-10% de réduction</Text>
                      <Text style={styles.couponDescription}>
                        Valable chez tous nos partenaires
                      </Text>
                    </View>
                    <Text style={styles.couponEmoji}>🎁</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noCouponsContainer}>
                <Text style={styles.noCouponsText}>Aucun bon disponible</Text>
                <Text style={styles.noCouponsSubtext}>
                  Continuez à acheter pour en gagner !
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCouponsModal(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Offer Modal */}
      <Modal
        visible={showOfferModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOfferModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOffer && (
              <>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowOfferModal(false)}
                >
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>

                <View style={styles.offerModalContent}>
                  <Text style={styles.offerModalTitle}>{selectedOffer.name}</Text>
                  <Text style={styles.offerModalDescription}>
                    {selectedOffer.description}
                  </Text>

                  <View style={styles.offerModalDetails}>
                    <Text style={styles.offerModalDuration}>
                      Durée: {selectedOffer.duration} mois
                    </Text>
                    {selectedOffer.discount && (
                      <View style={styles.offerModalDiscount}>
                        <Text style={styles.offerModalDiscountText}>
                          -{selectedOffer.discount}%
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.addOfferButton}
                    onPress={() => addOfferToCustomer(selectedOffer.id)}
                  >
                    <Text style={styles.addOfferButtonText}>Ajouter cette offre</Text>
                  </TouchableOpacity>
                </View>
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
    width: 80,
    height: 32,
  },
  scrollView: {
    flex: 1,
  },
  pointsCard: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 4,
  },
  levelContainer: {
    alignItems: 'flex-end',
  },
  levelValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
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
  progressValue: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
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
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 20,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  offersSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  offersList: {
    gap: 12,
  },
  offerCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  offerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  boostedBadge: {
    backgroundColor: '#FFCD29',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerDuration: {
    fontSize: 12,
    color: '#999',
  },
  discountBadge: {
    backgroundColor: '#10b981',
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  couponsScrollView: {
    maxHeight: 300,
    marginBottom: 20,
  },
  couponCard: {
    backgroundColor: '#ebffbc',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#7ebd07',
    borderStyle: 'dashed',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 12,
    color: '#589507',
    marginTop: 2,
  },
  couponEmoji: {
    fontSize: 24,
  },
  noCouponsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCouponsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  noCouponsSubtext: {
    fontSize: 14,
    color: '#999',
  },
  closeButton: {
    backgroundColor: '#7ebd07',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  offerModalContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  offerModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  offerModalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  offerModalDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  offerModalDuration: {
    fontSize: 12,
    color: '#999',
  },
  offerModalDiscount: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offerModalDiscountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addOfferButton: {
    backgroundColor: '#7ebd07',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  addOfferButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomerDashboardScreen;