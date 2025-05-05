import { useState } from "react";
import { Bell } from "lucide-react";
import logo from "../../assets/Logo.png";
import PrivacyTab from "@/components/merchant/settings/PrivacyTab";
import { useAuth } from "@/components/firebase/useAuth";

const CustomerSettings = () => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteStep, setShowDeleteStep] = useState(false);
  const [showReasonForm, setShowReasonForm] = useState(false);

  const {customer, customerData} = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 pb-28 pt-20 px-4">
      {/* Barre du haut */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50 flex justify-between items-center px-4 py-3">
        <img src="" alt="Carte Grenoble" className="h-6" />
        <img src={logo} alt="Naymo" className="h-10" />
        <div className="rounded-full border-2 border-gray-300 p-2">
          <Bell size={24} className="text-green-500 fill-current" />
        </div>
      </div>

      {/* Bloc Informations personnelles */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Profil</h2>
        <div className="bg-white p-4 rounded shadow space-y-4 text-gray-800">
            {customer && customerData ? (
                <>
                    <div>
                        <span className="font-semibold">Prénom : </span> {customerData.first_name}
                    </div>
                    <div>
                        <span className="font-semibold">Email :</span> {customerData.email}
                    </div>
                    <div>
                        <span className="font-semibold">Date de naissance :</span>{' '}
                        {new Date(customerData.birth_date).toLocaleDateString("fr-FR", {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        })}
                    </div>
                    <div>
                        <span className="font-semibold">Numéro de téléphone :</span> {' '}
                        {customerData.phone_number
                            // ? customerData.phone_number
                            //     .replace(/\D/g, '') // Supprime tout les caractères non numériques
                            //     .match(/.{1,2}/g) // Divise en groupes de 2 chiffres
                            //     ?.slice(0, 5) // Prend les 5 premiers groupes (10 chiffres)
                            //     .join(' ') || 'Non spécifié' // Joint avec des espaces
                            // : 'Non spécifié'}
                        }
                    </div>
                </>
            ) : null}
            
            

            <div className="text-right">
                <button className="bg-blue-500 text-white px-4 py-2 rounded">
                    Modifier
                </button>
            </div>
        </div>
      </section>


      {/* Bloc Mon compte */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Mon compte</h2>

        <div className="space-y-4">
          {/* Bouton changement d'email */}
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Changer mon adresse email
          </button>

          {/* Bouton changement mot de passe */}
          <div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Changer mot de passe
            </button>
            {showPasswordForm && (
              <div className="mt-3 space-y-2">
                <input
                  type="password"
                  placeholder="Ancien mot de passe"
                  className="block border px-3 py-2 w-full rounded"
                />
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  className="block border px-3 py-2 w-full rounded"
                />
              </div>
            )}
          </div>

          {/* Suppression de compte */}
          <div>
            <button
              onClick={() => setShowDeleteStep(!showDeleteStep)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Supprimer mon compte
            </button>

            {showDeleteStep && (
              <div className="mt-4 p-4 bg-white border rounded shadow space-y-4">
                <p className="font-semibold">Demande de suppression</p>
                <p className="text-sm text-gray-600">
                  Un email sera envoyé aux admins Naymo.
                </p>
                <button
                  onClick={() => setShowReasonForm(!showReasonForm)}
                  className="underline text-sm text-green-600"
                >
                  Pourquoi souhaitez-vous supprimer votre compte ?
                </button>

                {showReasonForm && (
                  <select
                    multiple
                    className="border rounded px-3 py-2 w-full mt-2"
                  >
                    <option>Je ne trouve pas ce que je cherche</option>
                    <option>Problèmes techniques</option>
                    <option>Je ne souhaite plus utiliser Naymo</option>
                    <option>Autre</option>
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Déconnexion */}
          <button className="text-red-500 font-semibold mt-4">
            Déconnexion
          </button>
        </div>
      </section>

      {/* Bloc Confidentialité */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Confidentialité</h2>
        <div className="bg-white mb-4 p-4 bg-gray-100 rounded-lg">
          <PrivacyTab />
        </div>
      </section>
    </div>
  );
};

export default CustomerSettings;
