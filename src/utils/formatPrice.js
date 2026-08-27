// ============================================================
// TechShop - Formatage des prix en Franc CFA (XOF)
// Fichier : src/utils/formatPrice.js
// ============================================================

// Le Franc CFA (XOF) n'utilise pas de décimales (pas de centimes)
export const formatPrice = (montant) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant);
};

// Seuil de livraison gratuite (équivalent à 50€ ≈ 30 000 F CFA)
export const SEUIL_LIVRAISON_GRATUITE = 30000;
export const FRAIS_LIVRAISON = 2500; // ≈ 4,99€

// Taux de TVA appliqué (Sénégal : 18%)
export const TAUX_TVA = 0.18;
