import { useState } from "react";
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth } from "@/components/firebase/firebaseConfig";

interface ChangePasswordModalProps {
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Tous les champs doivent être remplis.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setError("Utilisateur non trouvé.");
      return;
    }

    setLoading(true);
    try {
      // Réauthentifier l'utilisateur
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // Mettre à jour le mot de passe
      await updatePassword(user, newPassword);
      
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      setError("Échec de la mise à jour. Vérifiez votre ancien mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="font-medium text-gray-900">Changer le mot de passe</h3>
        
        {success ? (
          <p className="text-green-600 text-sm">Mot de passe mis à jour avec succès !</p>
        ) : (
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Ancien mot de passe"
              className="w-full p-2 border rounded-md"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              className="w-full p-2 border rounded-md"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirmer le nouveau mot de passe"
              className="w-full p-2 border rounded-md"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 bg-gray-300 rounded-md text-sm"
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Modification..." : "Confirmer"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
