# Naymo React Native

## 🚀 Installation et Configuration

### Prérequis
- Node.js 16+
- React Native CLI
- Android Studio (pour Android)
- Xcode (pour iOS)

### Installation
```bash
npm install
```

### Configuration Firebase
1. Créer un projet Firebase
2. Ajouter `google-services.json` dans `android/app/`
3. Ajouter `GoogleService-Info.plist` dans `ios/Naymo/`

### Lancement
```bash
# Android
npm run android

# iOS
npm run ios
```

## 📱 Fonctionnalités Implémentées

### ✅ Authentification
- Connexion client/commerçant
- Inscription avec validation
- Gestion des sessions Firebase

### ✅ Interface Client
- Dashboard avec points et niveaux
- Système de coupons
- Recherche d'offres
- Profil utilisateur

### ✅ Design Mobile-First
- Navigation par onglets
- Interface responsive
- Animations fluides
- Thème cohérent

## 🎯 Prochaines Étapes

### 📋 À Implémenter
1. **Notifications Push**
   - Configuration Firebase Messaging
   - Notifications d'offres
   - Alertes de points

2. **Géolocalisation**
   - Commerces à proximité
   - Carte interactive
   - Filtres par distance

3. **Mode Offline**
   - Cache des offres
   - Synchronisation
   - État hors ligne

4. **Fonctionnalités Natives**
   - Caméra pour QR codes
   - Partage d'offres
   - Authentification biométrique

## 🏗️ Architecture

```
src/
├── components/          # Composants réutilisables
├── screens/            # Écrans de l'application
├── navigation/         # Configuration navigation
├── contexts/           # Contextes React
├── services/           # Services Firebase
├── utils/              # Utilitaires
└── assets/             # Images et ressources
```

## 🎨 Design System

### Couleurs
- Primary: #7ebd07
- Secondary: #589507
- Background: #f8f9fa
- Success: #4CAF50
- Warning: #FFCD29

### Composants
- Cards avec ombres
- Boutons arrondis
- Inputs avec icônes
- Modals centrées

## 📦 Déploiement

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
cd ios
xcodebuild -workspace Naymo.xcworkspace -scheme Naymo archive
```

## 🔧 Configuration Stores

### Google Play Store
1. Créer un compte développeur
2. Générer une clé de signature
3. Uploader l'APK/AAB
4. Configurer les métadonnées

### Apple App Store
1. Compte Apple Developer
2. Certificats et profils
3. App Store Connect
4. Soumission pour review

L'application est maintenant prête pour les stores ! 🎉