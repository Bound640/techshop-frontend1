// Transforme une erreur brute (souvent "Failed to fetch") en message clair
export const messageErreurApi = (err) => {
  if (err instanceof TypeError && /fetch/i.test(err.message)) {
    return "Impossible de contacter le serveur. Vérifiez que le backend est démarré (npm run dev dans le dossier backend, port 3001) et que votre connexion internet fonctionne.";
  }
  return err.message || 'Une erreur inattendue est survenue.';
};
