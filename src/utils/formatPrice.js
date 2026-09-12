// TechShop - Formatage des prix et constantes de commande (Franc CFA - XOF)

export const SEUIL_LIVRAISON_GRATUITE = 500000; // livraison gratuite au-delà de 500 000 FCFA
export const FRAIS_LIVRAISON = 3000;            // frais de livraison standard
export const TAUX_TVA = 0.18;                   // TVA 18% (Sénégal)

export const formatPrice = (montant) => {
  const valeur = Number(montant) || 0;
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(valeur);
};
