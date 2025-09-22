import { useEffect, useState } from "react";
import { Bell, Edit, HelpCircle, Lock, LogOut, Search, Trash2, User, Shield, FileText } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 pb-28 pt-4 px-2 sm:px-4">
      {/* ID Client en haut */}
      {customerData?.code && (
        <div className="text-center pb-6">
          <div className="inline-block bg-gradient-to-br from-white to-gray-50 px-6 sm:px-10 py-4 sm:py-6 rounded-3xl shadow-xl border-2 border-[#c9eaad]/30 mx-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7DBD07] to-[#B7DB25]"></div>
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-[#7DBD07] to-[#B7DB25] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#396F04] uppercase tracking-wide">Votre ID Client</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[#0A2004] tracking-widest font-mono bg-gradient-to-r from-[#0A2004] to-[#396F04] bg-clip-text text-transparent">
              {customerData.code}
            </p>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#B7DB25]/20 to-[#7DBD07]/20 rounded-full"></div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">

        {/* Profil */}
        <section>
          <div className="bg-white rounded-3xl shadow-xl border border-[#c9eaad]/30 p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-[#7DBD07] to-[#B7DB25] rounded-full flex items-center justify-center">
                <User className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0A2004]">Mon Profil</h2>
            </div>

            {customer && customerData ? (
              <>
                {!isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="bg-[#f8fdf4] rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#7DBD07]/20 rounded-full flex items-center justify-center">
                          <User className="w-4 sm:w-5 h-4 sm:h-5 text-[#396F04]" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-[#589507] font-medium">Prénom</p>
                          <p className="font-bold text-[#0A2004]">{customerData.first_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#7DBD07]/20 rounded-full flex items-center justify-center">
                          <Search className="w-4 sm:w-5 h-4 sm:h-5 text-[#396F04]" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-[#589507] font-medium">Email</p>
                          <p className="font-bold text-[#0A2004]">{customerData.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#7DBD07]/20 rounded-full flex items-center justify-center">
                          <HelpCircle className="w-4 sm:w-5 h-4 sm:h-5 text-[#396F04]" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-[#589507] font-medium">Date de naissance</p>
                          <p className="font-bold text-[#0A2004]">
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

                      <div className="flex items-center space-x-3">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#7DBD07]/20 rounded-full flex items-center justify-center">
                          <Lock className="w-4 sm:w-5 h-4 sm:h-5 text-[#396F04]" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-[#589507] font-medium">Téléphone</p>
                          <p className="font-bold text-[#0A2004]">{customerData.phone_number || "Non spécifié"}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="w-full bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] hover:from-[#589507] hover:to-[#7DBD07] text-white py-3 sm:py-4 px-4 sm:px-6 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
                    >
                      <Edit className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span>Modifier mon profil</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                    <div className="space-y-4">
                      <div className="bg-[#f8fdf4] rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
                        <label className="block">
                          <span className="text-[#396F04] font-bold text-xs sm:text-sm mb-2 block">Prénom</span>
                          <input
                            type="text"
                            value={editedData.first_name}
                            onChange={(e) => setEditedData({ ...editedData, first_name: e.target.value })}
                            placeholder="Prénom"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#c9eaad] rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-[#7DBD07]/20 focus:border-[#7DBD07] text-[#0A2004] text-sm sm:text-base"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[#396F04] font-bold text-xs sm:text-sm mb-2 block">Email</span>
                          <input
                            type="email"
                            value={editedData.email}
                            onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                            placeholder="Email"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#c9eaad] rounded-2xl bg-gray-100 text-[#589507] cursor-not-allowed text-sm sm:text-base"
                            disabled
                          />
                        </label>
                        <label className="block">
                          <span className="text-[#396F04] font-bold text-xs sm:text-sm mb-2 block">Date de naissance</span>
                          <input
                            type="date"
                            value={editedData.birth_date}
                            onChange={(e) => setEditedData({ ...editedData, birth_date: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#c9eaad] rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-[#7DBD07]/20 focus:border-[#7DBD07] text-[#0A2004] text-sm sm:text-base"
                          />
                        </label>
                        <label className="block">
                          <span className="text-[#396F04] font-bold text-xs sm:text-sm mb-2 block">Numéro de téléphone</span>
                          <input
                            type="tel"
                            value={editedData.phone_number}
                            onChange={(e) => setEditedData({ ...editedData, phone_number: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                            placeholder="Numéro de téléphone"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#c9eaad] rounded-2xl bg-white focus:outline-none focus:ring-4 focus:ring-[#7DBD07]/20 focus:border-[#7DBD07] text-[#0A2004] text-sm sm:text-base"
                          />
                        </label>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="flex-1 bg-white border-2 border-[#c9eaad] text-[#589507] px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-bold hover:bg-[#f8fdf4] transition-colors text-sm sm:text-base"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
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
          <div className="bg-white rounded-3xl shadow-xl border border-[#c9eaad]/30 p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-[#589507] to-[#396F04] rounded-full flex items-center justify-center">
                <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0A2004]">Sécurité</h2>
            </div>

            <div className="space-y-4">
              <div 
                className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-[#f8fdf4] hover:bg-[#ebffbc] rounded-2xl cursor-pointer transition-all duration-200 transform hover:scale-105" 
                onClick={() => setShowPasswordForm(true)}
              >
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#7DBD07]/20 rounded-full flex items-center justify-center">
                  <Lock className="text-[#396F04] w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                <span className="font-bold text-[#0A2004] text-base sm:text-lg">Changer mon mot de passe</span>
              </div>

              {showPasswordForm && (
                <div className="bg-white border-2 border-[#c9eaad] rounded-2xl p-4 sm:p-6 space-y-4">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe actuel"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#c9eaad] rounded-2xl bg-[#f8fdf4] focus:outline-none focus:ring-4 focus:ring-[#7DBD07]/20 focus:border-[#7DBD07] text-[#0A2004] text-sm sm:text-base"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#c9eaad] rounded-2xl bg-[#f8fdf4] focus:outline-none focus:ring-4 focus:ring-[#7DBD07]/20 focus:border-[#7DBD07] text-[#0A2004] text-sm sm:text-base"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le nouveau mot de passe"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#c9eaad] rounded-2xl bg-[#f8fdf4] focus:outline-none focus:ring-4 focus:ring-[#7DBD07]/20 focus:border-[#7DBD07] text-[#0A2004] text-sm sm:text-base"
                  />
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                      type="button"
                      onClick={() => { setShowPasswordForm(false); setPassword(""); setNewPassword(""); setConfirmPassword(""); setError(null); }}
                      className="flex-1 bg-white border-2 border-[#c9eaad] text-[#589507] px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-bold hover:bg-[#f8fdf4] transition-colors text-sm sm:text-base"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleChangePassword}
                      className="flex-1 bg-gradient-to-r from-[#7DBD07] to-[#B7DB25] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                      disabled={loading || !newPassword || newPassword !== confirmPassword}
                    >
                      {loading ? "Mise à jour..." : "Sauvegarder"}
                    </button>
                  </div>
                </div>
              )}

              <div 
                className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-[#f8fdf4] hover:bg-[#ebffbc] rounded-2xl cursor-pointer transition-all duration-200 transform hover:scale-105" 
                onClick={() => setDeleteStep("reason")}
              >
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="text-red-600 w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                <span className="font-bold text-red-600 text-base sm:text-lg">Supprimer mon compte</span>
              </div>

              <div 
                className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-[#f8fdf4] hover:bg-[#ebffbc] rounded-2xl cursor-pointer transition-all duration-200 transform hover:scale-105" 
                onClick={handleLogout}
              >
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#589507]/20 rounded-full flex items-center justify-center">
                  <LogOut className="text-[#396F04] w-5 sm:w-6 h-5 sm:h-6" />
                </div>
                <span className="font-bold text-[#0A2004] text-base sm:text-lg">Me déconnecter</span>
              </div>
            </div>
          </div>
        </section>

        {/* Confidentialité */}
        <section>
          <div className="bg-white rounded-3xl shadow-xl border border-[#c9eaad]/30 p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-[#396F04] to-[#0A2004] rounded-full flex items-center justify-center">
                <FileText className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0A2004]">Documents Légaux</h2>
            </div>

            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {legalDocuments.map((doc) => (
                <div key={doc.title} className="bg-[#f8fdf4] rounded-2xl p-4 sm:p-6 border border-[#c9eaad]/30 hover:bg-[#ebffbc] transition-all duration-200 transform hover:scale-105">
                  <h3 className="font-bold text-[#0A2004] mb-3 text-base sm:text-lg">{doc.title}</h3>
                  <p className="text-sm text-[#589507] mb-4 leading-relaxed">{doc.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDocument(doc)}
                    className="border-2 border-[#7DBD07] text-[#396F04] hover:bg-[#7DBD07] hover:text-white font-bold transition-all duration-200 text-xs sm:text-sm"
                  >
                    Consulter
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modals de suppression */}
        {deleteStep !== "idle" && deleteStep !== "success" && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-6 border border-[#c9eaad]/30 shadow-2xl mx-2">
              {deleteStep === "confirm" && (
                <div className="space-y-6 text-center">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <Trash2 className="w-6 sm:w-8 h-6 sm:h-8 text-red-600" />
                  </div>
                  <h3 className="font-bold text-red-900 text-lg sm:text-xl">Confirmation de suppression</h3>
                  <p className="text-sm text-red-600 leading-relaxed">
                    Pour des raisons de sécurité, veuillez entrer vos identifiants pour confirmer la suppression.
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <Button variant="outline" size="sm" onClick={() => setDeleteStep("idle")} className="flex-1">
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => setDeleteStep("reauthenticate")}
                    >
                      Continuer
                    </Button>
                  </div>
                </div>
              )}
              {deleteStep === "reauthenticate" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 sm:w-8 h-6 sm:h-8 text-red-600" />
                    </div>
                    <h3 className="font-bold text-red-900 text-lg sm:text-xl mb-2">Vérification d'identité</h3>
                  </div>
                  <div className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-red-300 rounded-2xl bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-200 focus:border-red-500 text-sm sm:text-base"
                      placeholder="Votre email"
                    />
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-red-300 rounded-2xl bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-200 focus:border-red-500 text-sm sm:text-base"
                      placeholder="Votre mot de passe"
                    />
                    {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <Button variant="outline" size="sm" onClick={() => setDeleteStep("idle")} className="flex-1">
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleDeleteAccount}
                    >
                      Supprimer définitivement
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {deleteStep === "reason" && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-6 border border-[#c9eaad]/30 shadow-2xl mx-2">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-6 sm:w-8 h-6 sm:h-8 text-red-600" />
                  </div>
                  <h3 className="font-bold text-red-900 text-lg sm:text-xl">Raison de la suppression</h3>
                </div>
                <textarea
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#c9eaad] rounded-2xl bg-[#f8fdf4] focus:outline-none focus:ring-4 focus:ring-[#7DBD07]/20 focus:border-[#7DBD07] text-[#0A2004] text-sm sm:text-base"
                  rows={4}
                  placeholder="Dites-nous pourquoi vous souhaitez supprimer votre compte..."
                />
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <Button variant="outline" size="sm" onClick={() => setDeleteStep("idle")} className="flex-1">
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-6 border border-[#c9eaad]/30 shadow-2xl mx-2">
              <div className="space-y-6 text-center">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 sm:w-8 h-6 sm:h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-bold text-green-900 text-lg sm:text-xl">Compte supprimé avec succès</h3>
                <p className="text-sm text-green-600">Votre compte a été supprimé. Merci de nous avoir utilisé.</p>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate("/")}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedDocument && (
          <LegalDocumentModal
            title={selectedDocument.title}
            content={selectedDocument.content}
            onClose={() => setSelectedDocument(null)}
          />
        )}
      </div>
      {error && <p className="text-red-600 text-sm mt-2 text-center font-medium">{error}</p>}
    </div>
  );
};

export default CustomerSettings;