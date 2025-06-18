import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useState, useEffect } from 'react';

const Map = ({ stores }: { stores: any[] }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyDQns4mxS0cnLznaOJElNlGawZgGoYlvW8', // Remplace par ta vraie clé
    language: 'fr', // Définir la langue en français
  });

  const center = {
    lat: 45.184774, // Centre de Grenoble par défaut
    lng: 5.726812,
  };

  const [geocodedStores, setGeocodedStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any | null>(null);

  // Géocoder les adresses pour obtenir latitude et longitude
  useEffect(() => {
    if (!isLoaded || !stores.length) return;

    const geocoder = new google.maps.Geocoder();
    const updatedStores = stores.map((store) => {
      if (store.address && (!store.latitude || !store.longitude)) {
        geocoder.geocode({ address: store.address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const { lat, lng } = results[0].geometry.location;
            setGeocodedStores((prev) =>
              prev.map((s) =>
                s.name === store.name ? { ...s, latitude: lat(), longitude: lng() } : s
              )
            );
          } else {
            console.error(`Géocodage échoué pour ${store.name}: ${status}`);
          }
        });
      }
      return store;
    });
    setGeocodedStores(updatedStores);
  }, [isLoaded, stores]);

  if (!isLoaded) return <div>Chargement de la carte...</div>;

  return (
    <GoogleMap
      center={center}
      zoom={13}
      mapContainerStyle={{ width: '100%', height: '100%' }}
      options={{ 
        fullscreenControl: true, 
        streetViewControl: false,
        mapTypeControl: false,
      }}
    >
      {geocodedStores.map((store, index) =>
        store.latitude && store.longitude ? (
          <Marker
            key={index}
            position={{ lat: store.latitude, lng: store.longitude }}
            title={store.name}
            onClick={() => setSelectedStore(store)}
            // Icône personnalisée pour imiter le marqueur Google Maps rouge
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png', // Icône rouge standard
              scaledSize: new google.maps.Size(32, 32), // Taille ajustée
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(16, 32), // Ancrage au bas du marqueur
            }}
          >
            {selectedStore && selectedStore.name === store.name && (
              <InfoWindow
                position={{ lat: store.latitude, lng: store.longitude }}
                onCloseClick={() => setSelectedStore(null)}
              >
                <div>
                  <img src={store.logo} alt={store.name} className="w-16 h-16 object-cover rounded-full" />
                  <h3><strong>{selectedStore.name}</strong></h3>
                  <p>Propriétaire : {selectedStore.owner_name}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ) : null
      )}
    </GoogleMap>
  );
};

export default Map;