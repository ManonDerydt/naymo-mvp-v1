import { useEffect, useState } from "react";
import { Bell, Edit, HelpCircle, Lock, LogOut, Search, Trash2, User, Settings as SettingsIcon, Shield, FileText } from "lucide-react";
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
      console.error("Echec de la suppression:", err);
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
      title: "CGU",
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
- Nous nous réservons le droit de suspendre ou supprimer un compte en cas d'utilisation abusive`,
    },
    {
      title: "Politique de confidentialité",
      description: "Gestion de vos données personnelles",
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
- Durée de conservation limitée`,
    },
    {
      title: "Charte cookies",
      description: "Utilisation des cookies sur la plateforme",
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
- Les cookies permanents ont une durée de vie limitée`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebffbc]/10 via-white to-[#ebffbc]/20 pb-28">
      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-[#7ebd07]/20 shadow-xl z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center shadow-lg">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Paramètres</p>
              <p className="text-xs text-gray-500">Mon compte</p>
            </div>
          </div>
          <img src={logo} alt="Naymo" className="h-8" />
        </div>
      </div>

      <div className="pt-24 pb-10 px-4 space-y-6">
        {/* Profil */}
        <section className="bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#396F04]">Mon profil</h2>
          </div>
          
          <div className="space-y-4">
            {customer && customerData ? (
              <>
                {!isEditingProfile ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="bg-[#7ebd07]/20 shadow-sm rounded-full p-3">
                        <User className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Prénom</p>
                        <p className="text-base font-bold text-gray-900">{customerData.first_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="bg-[#7ebd07]/20 shadow-sm rounded-full p-3">
                        <HelpCircle className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email</p>
                        <p className="text-base font-bold text-gray-900">{customerData.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="bg-[#7ebd07]/20 shadow-sm rounded-full p-3">
                        <User className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Date de naissance</p>
                        <p className="text-base font-bold text-gray-900">
                          {customerData.birth_date
                            ? new Date(customerData.birth_date).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "Non spécifié"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="bg-[#7ebd07]/20 shadow-sm rounded-full p-3">
                        <Lock className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Téléphone</p>
                        <p className="text-base font-bold text-gray-900">{customerData.phone_number || "Non spécifié"}</p>
                      </div>
                    </div>
                    
                    <button
                      className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[#7ebd07] to-[#589507] rounded-2xl shadow-lg cursor-pointer hover:from-[#589507] hover:to-[#396F04] transition-all duration-200 transform hover:scale-105"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Edit className="text-white" size={20} />
                      <span className="font-semibold text-white">Modifier</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-gray-700 font-medium">Prénom</span>
                        <input
                          type="text"
                          value={editedData.first_name}
                          onChange={(e) => setEditedData({ ...editedData, first_name: e.target.value })}
                          placeholder="Prénom"
                          className="block w-full border p-3 rounded-2xl mt-1"
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700 font-medium">Email</span>
                        <input
                          type="email"
                          value={editedData.email}
                          onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                          placeholder="Email"
                          className="block w-full border p-3 rounded-2xl mt-1"
                          disabled
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700 font-medium">Date de naissance</span>
                        <input
                          type="date"
                          value={editedData.birth_date}
                          onChange={(e) => setEditedData({ ...editedData, birth_date: e.target.value })}
                          className="block w-full border p-3 rounded-2xl mt-1"
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700 font-medium">Numéro de téléphone</span>
                        <input
                          type="tel"
                          value={editedData.phone_number}
                          onChange={(e) => setEditedData({ ...editedData, phone_number: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                          placeholder="Numéro de téléphone"
                          className="block w-full border p-3 rounded-2xl mt-1"
                        />
                      </label>
                      <div className="flex justify-end space-x-4 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-2xl"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-[#7ebd07] to-[#589507] hover:from-[#589507] hover:to-[#396F04] text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
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
        <section className="bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#396F04]">Sécurité</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl cursor-pointer transition-all" onClick={() => setShowPasswordForm(true)}>
              <div className="bg-[#7ebd07]/20 shadow-sm rounded-full p-3">
                <Lock className="text-[#7ebd07]" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#396F04]">Changer mon mot de passe</p>
                <p className="text-sm text-gray-500">Modifiez votre mot de passe</p>
              </div>
            </div>
            
            {showPasswordForm && (
              <div className="bg-white border border-[#7ebd07]/20 rounded-2xl p-6 space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe actuel"
                  className="block border border-gray-300 px-4 py-3 w-full rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7ebd07] focus:border-transparent"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="block border border-gray-300 px-4 py-3 w-full rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7ebd07] focus:border-transparent"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le nouveau mot de passe"
                  className="block border border-gray-300 px-4 py-3 w-full rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7ebd07] focus:border-transparent"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => { setShowPasswordForm(false); setPassword(""); setNewPassword(""); setConfirmPassword(""); setError(null); }}
                    className="bg-gray-200 text-gray-800 px-6 py-3 rounded-2xl hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="bg-gradient-to-r from-[#7ebd07] to-[#589507] hover:from-[#589507] hover:to-[#396F04] text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                    disabled={loading || !newPassword || newPassword !== confirmPassword}
                  >
                    {loading ? "Mise à jour..." : "Sauvegarder"}
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 p-4 bg-red-50 hover:bg-red-100 rounded-2xl cursor-pointer transition-all" onClick={() => setDeleteStep("reason")}>
              <div className="bg-red-100 shadow-sm rounded-full p-3">
                <Trash2 className="text-[#7ebd07]" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-600">Supprimer mon compte</p>
                <p className="text-sm text-red-500">Action irréversible</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl cursor-pointer transition-all" onClick={handleLogout}>
              <div className="bg-[#7ebd07]/20 shadow-sm rounded-full p-3">
                <LogOut className="text-[#7ebd07]" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#396F04]">Me déconnecter</p>
                <p className="text-sm text-gray-500">Fermer ma session</p>
              </div>
            </div>
          </div>
        </section>

        {/* Confidentialité */}
        <section className="bg-white rounded-2xl shadow-lg border border-[#7ebd07]/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-[#7ebd07] to-[#589507] rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#396F04]">Confidentialité</h2>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#396F04] flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Documents légaux
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
                  {legalDocuments.map((doc) => (
                    <div key={doc.title} className="p-4 bg-gradient-to-br from-[#ebffbc]/30 to-white rounded-2xl border border-[#7ebd07]/20">
                      <h4 className="font-bold text-[#396F04] mb-2">{doc.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDocument(doc)}
                        className="border-[#7ebd07] text-[#589507] hover:bg-[#ebffbc]/50"
                      >
                        Consulter
                      </Button>
                    </div>
                  ))}
            </div>
          </div>
          
          {selectedDocument && (
            <LegalDocumentModal
              title={selectedDocument.title}
              content={selectedDocument.content}
              onClose={() => setSelectedDocument(null)}
            />
          )}
        </section>

        {/* Modals de suppression */}
        {deleteStep !== "idle" && deleteStep !== "success" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
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
                    className="w-full p-3 border rounded-2xl"
                    placeholder="Votre email"
                  />
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full p-3 border rounded-2xl"
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
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="space-y-4">
                <h3 className="font-medium text-red-900">Raison de la suppression</h3>
                <textarea
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  className="w-full p-3 border rounded-2xl"
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
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
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
