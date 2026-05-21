// Médicaments couramment utilisés au Mali
export const MEDICAMENTS_MALI = [
  { nom: "Paracétamol 500mg", categorie: "Antalgique", prix_fcfa: 500 },
  { nom: "Amoxicilline 500mg", categorie: "Antibiotique", prix_fcfa: 2500 },
  { nom: "Coartem (Artéméther-Luméfantrine)", categorie: "Antipaludique", prix_fcfa: 1500 },
  { nom: "Quinine 300mg", categorie: "Antipaludique", prix_fcfa: 1200 },
  { nom: "Métronidazole 500mg", categorie: "Antibiotique", prix_fcfa: 1800 },
  { nom: "Ibuprofène 400mg", categorie: "Anti-inflammatoire", prix_fcfa: 800 },
  { nom: "ORS (Sels de Réhydratation)", categorie: "Réhydratation", prix_fcfa: 300 },
  { nom: "Vitamine C 500mg", categorie: "Vitamine", prix_fcfa: 600 },
  { nom: "Fer + Acide folique", categorie: "Supplément", prix_fcfa: 1000 },
  { nom: "Albendazole 400mg", categorie: "Antiparasitaire", prix_fcfa: 750 },
  { nom: "Cotrimoxazole", categorie: "Antibiotique", prix_fcfa: 1500 },
  { nom: "Chloroquine", categorie: "Antipaludique", prix_fcfa: 900 },
];

export const CATEGORIES = [
  "Antalgique", "Antibiotique", "Antipaludique", "Anti-inflammatoire",
  "Réhydratation", "Vitamine", "Supplément", "Antiparasitaire",
  "Antihistaminique", "Antifongique", "Cardiovasculaire", "Général"
];

export const formatFCFA = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
