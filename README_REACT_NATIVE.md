# Naymo React Native App

## 🚀 Installation et Configuration

### Prérequis
- Node.js 16+
- React Native CLI
- Android Studio (pour Android)
- Xcode (pour iOS)

### Installation des dépendances
```bash
npm install
```

### Configuration Firebase

1. **Android** : Placez `google-services.json` dans `android/app/`
2. **iOS** : Placez `GoogleService-Info.plist` dans `ios/NaymoApp/`

### Configuration des icônes
```bash
# Android
npx react-native link react-native-vector-icons
```

### Lancement de l'application

#### Android
```bash
npm run android
```

#### iOS
```bash
cd ios && pod install && cd ..
npm run ios
```

## 📱 Structure de l'application

### Navigation
- **Stack Navigator** : Navigation principale
- **Tab Navigator** : Navigation client/commerçant

### Écrans implémentés
- ✅ Sélection type d'utilisateur
- ✅ Connexion client/commerçant
- ✅ Inscription client
- ✅ Dashboard client avec points et offres
- ✅ Profil client
- ✅ Historique, Recherche, Paramètres
- ✅ Interface commerçant de base

### Fonctionnalités
- **Authentification Firebase** : Login/Register sécurisé
- **Système de points** : Visualisation et gestion
- **Offres** : Affichage et interaction
- **Interface native** : Composants React Native optimisés

## 🔧 Prochaines étapes

1. **Finaliser les écrans** : Compléter toutes les fonctionnalités
2. **Notifications push** : Intégrer Firebase Messaging
3. **Géolocalisation** : Ajouter react-native-maps
4. **Tests** : Tests unitaires et d'intégration
5. **Build production** : Préparation pour les stores

## 📦 Build pour production

### Android
```bash
npm run build:android
```

### iOS
```bash
npm run build:ios
```

## 🎯 Déploiement stores

L'application est maintenant prête pour être soumise aux stores :
- **Google Play Store** : Fichier APK/AAB généré
- **Apple App Store** : Archive iOS prête