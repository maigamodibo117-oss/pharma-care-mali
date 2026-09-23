# Assistant Médicament — architecture proposée

Nouvelle section de PharmaCare Mali : rechercher un médicament et afficher une fiche professionnelle vérifiée, avec une aide IA facultative pour l'explication.

## Principe de séparation

Cinq briques indépendantes, comme demandé :

1. **Données fiables** — une base de fiches médicaments distincte du stock de la pharmacie. Chaque fiche porte ses sources et sa date de mise à jour. Elle n'est jamais écrite par l'IA.
2. **Images** — un champ image par fiche, alimenté uniquement par une source vérifiée (lien officiel ou fichier déposé). Aucune image générée par IA. Sans image fiable : visuel générique + mention « Image non disponible ».
3. **Moteur de recherche** — recherche par nom commercial, DCI/substance active et laboratoire, insensible aux accents et à la casse, avec correspondance partielle.
4. **IA** — bouton « Expliquer avec l'IA », appelé uniquement côté serveur. L'IA reçoit la fiche existante et ne peut que reformuler, résumer ou comparer. Elle n'a pas le droit d'ajouter une indication, une posologie ou un effet indésirable absent de la fiche, et doit répondre « information non disponible dans la fiche » le cas échéant.
5. **Comptes utilisateurs** — la section reste réservée aux pharmaciens connectés. Les fiches sont une référence partagée en lecture ; le stock personnel reste inchangé.

## Ce qui sera ajouté

**Base de données (nouvelle table de fiches)**
- Champs : nom commercial, DCI, dosage, forme, classe thérapeutique, laboratoire, indications, posologie de référence, contre-indications, précautions, effets indésirables, interactions, conservation, image, sources, date de mise à jour.
- Lecture autorisée à tout pharmacien connecté ; écriture réservée au service (pas d'écriture depuis le navigateur).
- Contenu initial : une trentaine de fiches correspondant aux médicaments courants au Mali (paracétamol, amoxicilline, métronidazole, Coartem/artéméther-luméfantrine, quinine, SRO, ibuprofène, cotrimoxazole, albendazole, fer-acide folique, etc.), rédigées à partir des documents de référence (OMS — liste des médicaments essentiels et fiches EML, notices ANSM/EMA), chaque fiche citant ses sources.

**Nouvelle page « Assistant Médicament »**
- Barre de recherche unique + résultats en cartes.
- Fiche détaillée en sections claires, image ou visuel « Image non disponible ».
- Bandeau permanent : date de dernière mise à jour + sources.
- Avertissement : outil d'information, pas de prescription automatique ; toute dose personnalisée exige validation par un professionnel de santé.
- Bouton « Expliquer avec l'IA » avec 4 modes : expliquer simplement, résumer, comprendre effets indésirables et interactions, comparer avec un autre médicament (sélection d'une seconde fiche).

**Côté serveur**
- Recherche et lecture des fiches par fonctions serveur protégées.
- Nouvelle fonction serveur dédiée à l'explication IA, séparée de l'assistant existant, avec consignes strictes anti-invention, gestion des erreurs (crédits épuisés, trop de requêtes) et limite simple de requêtes par utilisateur.
- La clé API reste exclusivement côté serveur ; rien n'est exposé au navigateur.

**Navigation**
- Un onglet supplémentaire dans le menu latéral ; sur mobile, le menu du bas passe à 5 entrées principales avec « Médicament » regroupé aux côtés de l'Assistant IA.

## Détails techniques

- Table `fiches_medicaments` créée par migration avec GRANT + RLS (SELECT pour `authenticated`), données initiales insérées littéralement dans la même migration.
- `src/lib/fiches.functions.ts` : `rechercherFiches`, `getFiche` (createServerFn + requireSupabaseAuth).
- `src/lib/fiche-ia.functions.ts` : `expliquerFiche` (modes explain/summary/effects/compare) — appel gateway côté serveur, prompt verrouillé sur le contenu de la fiche.
- `src/routes/_authenticated.assistant-medicament.tsx` (liste + fiche sélectionnée) ; mise à jour de `src/components/AppLayout.tsx`.
- Images : colonne `image_url` (URL officielle vérifiée) + `image_source` ; fallback composant générique. Aucun appel à un générateur d'images.
- Aucune modification des tables `medicaments`, `patients`, `ventes`, ni de l'assistant IA existant.

## Limites assumées

- Les fiches initiales couvrent les médicaments essentiels courants au Mali ; les autres renverront « fiche non disponible » plutôt qu'un contenu inventé.
- Les images officielles libres de droits sont rares : la plupart des fiches afficheront d'abord le visuel « Image non disponible », en attendant des photos vérifiées que vous pourrez fournir.
