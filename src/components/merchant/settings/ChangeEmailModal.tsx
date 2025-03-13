import { useState } from "react";
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updateEmail 
} from "firebase/auth";
import { auth, db } from "@/components/firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

interface ChangeEmailModalProps {
  userId: string;
  onClose: () => void;
}

const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({ userId, onClose }) => {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState(""); // Ajout du champ mot de passe
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    
    if (!newEmail || !password) {
      setError("Veuillez entrer un nouvel email et votre mot de passe.");
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setError("Utilisateur non trouvé. Veuillez vous reconnecter.");
      return;
    }

    setLoading(true);
    try {
      // Étape 1 : Ré-authentifier l'utilisateur
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Étape 2 : Mettre à jour l'email
      await updateEmail(user, newEmail);

      // Étape 3 : Mettre à jour Firestore
      const userDocRef = doc(db, "merchant", userId);
      await updateDoc(userDocRef, { email: newEmail });

      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      if (err.code === "auth/wrong-password") {
        setError("Mot de passe incorrect.");
      } else if (err.code === "auth/invalid-email") {
        setError("Format de l'email invalide.");
      } else if (err.code === "auth/requires-recent-login") {
        setError("Veuillez vous reconnecter pour modifier votre email.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="font-medium text-gray-900">Changer l'email</h3>

        {success ? (
          <p className="text-green-600 text-sm">Email mis à jour avec succès !</p>
        ) : (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Nouvel email"
              className="w-full p-2 border rounded-md"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mot de passe actuel"
              className="w-full p-2 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

export default ChangeEmailModal;
