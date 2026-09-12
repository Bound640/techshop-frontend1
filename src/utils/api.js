// TechShop - Client API + adaptateur de données produit
// Convertit le format renvoyé par le backend (nom, prix, categorie, images...)
// vers le format attendu par les composants existants (name, price, category, image...)

export const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export const adapterProduit = (p) => {
  if (!p) return null;
  const specsObj = p.specifications
    ? (p.specifications instanceof Map ? Object.fromEntries(p.specifications) : p.specifications)
    : {};

  return {
    id: p._id,
    _id: p._id,
    name: p.nom,
    price: p.prixPromo || p.prix,
    originalPrice: p.prixPromo ? p.prix : null,
    enPromo: !!p.prixPromo,
    category: p.categorie?.slug || p.categorie || '',
    categoryLabel: p.categorie?.nom || '',
    categoryIcon: p.categorie?.icone || '',
    image: p.images?.[0]?.url || '',
    images: p.images || [],
    description: p.description,
    rating: p.note || 0,
    reviews: p.nombreAvis || 0,
    stock: p.stock,
    specs: specsObj,
    badge: p.badge,
    marque: p.marque || '',
    vedette: !!p.vedette,
  };
};

export const adapterCategorie = (c) => ({
  id: c.slug,
  _id: c._id,
  label: c.nom,
  icon: c.icone,
});
