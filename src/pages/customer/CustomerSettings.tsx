import { useEffect, useState } from "react";
import { Bell, Edit, HelpCircle, Lock, LogOut, Search, Trash2, User } from "lucide-react";
import logo from "../../assets/Logo.png";
import { useAuth } from "@/components/firebase/useAuth";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/components/firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword } from "firebase/auth";
import { Button } from "@/components/ui";
import LegalDocumentModal from "@/components/merchant/settings/LegalDocumentModal";

type DeleteStep = "reason" | "confirm" | "reauthenticate" | "success" | "idle";

const CustomerSettings = () => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedData, setEditedData] = useState({
    first_name: "",
    email: "",
    birth_date: "",
    phone_number: "",
  });
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{
    title: string;
    description: string;
    content: string;
  } | null>(null);
  const [deleteStep, setDeleteStep] = useState<DeleteStep>("idle");
  const [deletionReason, setDeletionReason] = useState("");
  const [email, setEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const { customer, customerData } = useAuth();
  const navigate = useNavigate();

  // Initialiser les données éditées avec les valeurs actuelles
  useEffect(() => {
    if (customerData) {
      setEditedData({
        first_name: customerData.first_name || "",
        email: customerData.email || "",
        birth_date: customerData.birth_date
          ? new Date(customerData.birth_date).toISOString().split("T")[0]
          : "",
        phone_number: customerData.phone_number || "",
      });
    }
  }, [customerData]);

  const handleSaveProfile = async () => {
    if (!customer || !customerData) return;

    setLoading(true);
    try {
      const customerRef = doc(db, "customer", customer.uid);
      await updateDoc(customerRef, {
        first_name: editedData.first_name,
        email: editedData.email,
        birth_date: editedData.birth_date,
        phone_number: editedData.phone_number,
      });
      setIsEditingProfile(false);
      setError(null);
    } catch (error) {
      setError("Une erreur est survenue lors de la mise à jour du profil.");
      console.error("Erreur lors de la mise à jour du profil :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!customer || !customer.email || !newPassword || newPassword !== confirmPassword) return;

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(customer.email, password);
      await reauthenticateWithCredential(customer, credential);
      await updatePassword(customer, newPassword);
      setShowPasswordForm(false);
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      alert("Mot de passe mis à jour avec succès.");
    } catch (error: any) {
      setError(
        error.code === "auth/wrong-password"
          ? "Mot de passe incorrect."
          : error.code === "auth/weak-password"
          ? "Le mot de passe doit contenir au moins 6 caractères."
          : "Une erreur est survenue lors de la mise à jour du mot de passe."
      );
      console.error("Erreur lors de la mise à jour du mot de passe :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const credential = EmailAuthProvider.credential(email, deletePassword);
      await reauthenticateWithCredential(user, credential);
      console.log("Ré-authentification réussie");

      const customerRef = doc(db, "customer", user.uid);
      await deleteDoc(customerRef);
      console.log("Document client supprimé");

      await deleteUser(user);
      console.log("Compte supprimé avec succès");

      setDeleteStep("success");
      navigate("/");
    } catch (err: any) {
      setError("Erreur lors de la ré-authentification ou suppression");
      console.error("Erreur lors de la suppression:", err);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      setError("Une erreur est survenue lors de la déconnexion.");
      console.error("Erreur lors de la déconnexion :", error);
    } finally {
      setLoading(false);
    }
  };

  const legalDocuments = [
    {
      title: 'CGU',
      description: "Conditions générales d'utilisation de la plateforme",
      content: `Les présentes conditions générales d'utilisation (CGU) régissent l'utilisation de la plateforme Naymo.

Ces CGU constituent un contrat entre vous et Naymo. En utilisant notre plateforme, vous acceptez ces conditions dans leur intégralité.

1. Inscription et compte
- L'inscription est gratuite
- Vous devez fournir des informations exactes
- Vous êtes responsable de la confidentialité de vos identifiants

2. Utilisation de la plateforme
- La plateforme doit être utilisée conformément aux lois en vigueur
- Tout contenu publié doit respecter nos règles de communauté
- Nous nous réservons le droit de suspendre ou supprimer un compte en cas d'utilisation abusive`
    },
    {
      title: 'Politique de confidentialité',
      description: 'Gestion de vos données personnelles',
      content: `Notre politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles.

1. Collecte des données
- Informations d'inscription
- Données de navigation
- Historique des achats

2. Utilisation des données
- Amélioration de nos services
- Personnalisation de votre expérience
- Communications marketing (avec votre consentement)

3. Protection des données
- Stockage sécurisé
- Non-transmission à des tiers
- Durée de conservation limitée`
    },
    {
      title: 'Charte cookies',
      description: 'Utilisation des cookies sur la plateforme',
      content: `Notre charte cookies explique comment nous utilisons les cookies et technologies similaires sur notre plateforme.

1. Types de cookies utilisés
- Cookies essentiels
- Cookies de performance
- Cookies de personnalisation

2. Gestion des cookies
- Vous pouvez modifier vos préférences à tout moment
- Certains cookies sont nécessaires au fonctionnement du site
- Les cookies tiers peuvent être désactivés

3. Durée de conservation
- Les cookies temporaires sont supprimés à la fermeture du navigateur
- Les cookies permanents ont une durée de vie limitée`
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-28 pt-20 px-4">
      {/* Barre du haut */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50 flex justify-between items-center px-4 py-3">
        {customer && customerData ? <p>{customerData.city}</p> : null }

        <img src={logo} alt="Naymo" className="h-10" />

        <div className="relative">
          <Bell size={24} className="text-green-500 fill-current" />
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
        </div>
      </div>

      {/* Sections principales */}
      <div className="space-y-6 mt-4">
        {/* Profil */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Profil</h2>
          <div className="bg-white rounded-lg shadow p-4 space-y-2">
            {customer && customerData ? (
              <>
                {!isEditingProfile ? (
                  <>
                    <div className="flex items-center p-2">
                      <User className="text-green-500 mr-3" size={20} />
                      <span><strong>Prénom :</strong> {customerData.first_name}</span>
                    </div>
                    <div className="flex items-center p-2">
                      <Search className="text-green-500 mr-3" size={20} />
                      <span><strong>Email :</strong> {customerData.email}</span>
                    </div>
                    <div className="flex items-center p-2">
                      <HelpCircle className="text-green-500 mr-3" size={20} />
                      <span><strong>Date de naissance :</strong> {new Date(customerData.birth_date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}</span>
                    </div>
                    <div className="flex items-center p-2">
                      <Lock className="text-green-500 mr-3" size={20} />
                      <span><strong>Numéro de téléphone :</strong> {customerData.phone_number || "Non spécifié"}</span>
                    </div>
                    <div className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => setIsEditingProfile(true)}>
                      <Edit className="text-green-500 mr-3" size={20} />
                      <span>Modifier</span>
                    </div>
                  </>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                    <div className="ml-8 space-y-4">
                      <span><strong>Prénom :</strong></span>
                      <input
                        type="text"
                        value={editedData.first_name}
                        onChange={(e) => setEditedData({ ...editedData, first_name: e.target.value })}
                        placeholder="Prénom"
                        className="block w-full border p-2 rounded"
                      />
                      <span><strong>Email :</strong></span>
                      <input
                        type="email"
                        value={editedData.email}
                        onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                        placeholder="Email"
                        className="block w-full border p-2 rounded"
                        disabled
                      />
                      <span><strong>Date de naissance :</strong></span>
                      <input
                        type="date"
                        value={editedData.birth_date}
                        onChange={(e) => setEditedData({ ...editedData, birth_date: e.target.value })}
                        className="block w-full border p-2 rounded"
                      />
                      <span><strong>Numéro de téléphone :</strong></span>
                      <input
                        type="tel"
                        value={editedData.phone_number}
                        onChange={(e) => setEditedData({ ...editedData, phone_number: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        placeholder="Numéro de téléphone"
                        className="block w-full border p-2 rounded"
                      />
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="bg-green-500 text-white px-4 py-2 rounded"
                          disabled={loading}
                        >
                          {loading ? "Sauvegarde..." : "Sauvegarder"}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </>
            ) : null}
          </div>
        </section>

        {/* Mon compte */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Mon compte</h2>
          <div className="bg-white rounded-lg shadow p-4 space-y-2">
            <div className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => setShowPasswordForm(true)}>
              <Lock className="text-green-500 mr-3" size={20} />
              <span>Changer mon mot de passe</span>
            </div>
            {showPasswordForm && (
              <div className="ml-8 space-y-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe actuel"
                  className="block border px-3 py-2 w-full rounded"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="block border px-3 py-2 w-full rounded"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le nouveau mot de passe"
                  className="block border px-3 py-2 w-full rounded"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => { setShowPasswordForm(false); setPassword(""); setNewPassword(""); setConfirmPassword(""); setError(null); }}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    disabled={loading || !newPassword || newPassword !== confirmPassword}
                  >
                    {loading ? "Mise à jour..." : "Sauvegarder"}
                  </button>
                </div>
              </div>
            )}
            <div className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={() => setDeleteStep("reason")}>
              <Trash2 className="text-green-500 mr-3" size={20} />
              <span>Supprimer mon compte</span>
            </div>
            <div className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer" onClick={handleLogout}>
              <LogOut className="text-green-500 mr-3" size={20} />
              <span>Me déconnecter</span>
            </div>
          </div>
        </section>

        {/* Confidentialité */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Confidentialité</h2>
          <div className="bg-white rounded-lg shadow p-4 space-y-2">
            <div className="max-w-3xl space-y-8">
              <section className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">Documents légaux</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {legalDocuments.map((doc) => (
                    <div key={doc.title} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">{doc.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        Consulter
                      </Button>
                    </div>
                  ))}
                </div>
              </section>

              {selectedDocument && (
                <LegalDocumentModal
                  title={selectedDocument.title}
                  content={selectedDocument.content}
                  onClose={() => setSelectedDocument(null)}
                />
              )}
            </div>
          </div>
        </section>

        {/* Modal de suppression */}
        {deleteStep !== "idle" && deleteStep !== "success" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              {deleteStep === "confirm" && (
                <div className="space-y-4">
                  <h3 className="font-medium text-red-900">Confirmation de suppression</h3>
                  <p className="text-sm text-red-600">
                    Pour des raisons de sécurité, veuillez entrer vos identifiants pour confirmer la suppression.
                  </p>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setDeleteStep("reauthenticate")}
                  >
                    Vérifier mon identité
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteStep("idle")}>
                    Annuler
                  </Button>
                </div>
              )}

              {deleteStep === "reauthenticate" && (
                <div className="space-y-4">
                  <h3 className="font-medium text-red-900">Vérification d'identité</h3>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Votre email"
                  />
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Votre mot de passe"
                  />
                  {error && <p className="text-red-600">{error}</p>}
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDeleteAccount}
                  >
                    Supprimer mon compte
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteStep("idle")}>
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {deleteStep === "reason" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="space-y-4">
                <h3 className="font-medium text-red-900">Raison de la suppression</h3>
                <textarea
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Dites-nous pourquoi vous souhaitez supprimer votre compte..."
                />
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" size="sm" onClick={() => setDeleteStep("idle")}>
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setDeleteStep("confirm")}
                  >
                    Continuer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteStep === "success" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="space-y-4">
                <h3 className="font-medium text-green-900">Compte supprimé avec succès</h3>
                <p className="text-sm text-green-600">Votre compte a été supprimé. Merci de nous avoir utilisé.</p>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate("/")}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default CustomerSettings;
