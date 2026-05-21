import { supabase } from "@/integrations/supabase/client";

const MEDS = [
  { nom: "Paracétamol 500mg", categorie: "Antalgique", prix_fcfa: 500, stock: 120, seuil_alerte: 20, jExp: 180 },
  { nom: "Amoxicilline 500mg", categorie: "Antibiotique", prix_fcfa: 2500, stock: 8, seuil_alerte: 15, jExp: 90 },
  { nom: "Métronidazole 500mg", categorie: "Antibiotique", prix_fcfa: 1800, stock: 45, seuil_alerte: 15, jExp: 60 },
  { nom: "Coartem (Artéméther-Luméfantrine)", categorie: "Antipaludique", prix_fcfa: 1500, stock: 60, seuil_alerte: 20, jExp: 240 },
  { nom: "Quinine 300mg", categorie: "Antipaludique", prix_fcfa: 1200, stock: 5, seuil_alerte: 10, jExp: 20 },
  { nom: "ORS (Sels de Réhydratation)", categorie: "Réhydratation", prix_fcfa: 300, stock: 200, seuil_alerte: 30, jExp: 365 },
  { nom: "Vitamine C 500mg", categorie: "Vitamine", prix_fcfa: 600, stock: 75, seuil_alerte: 20, jExp: 300 },
  { nom: "Ibuprofène 400mg", categorie: "Anti-inflammatoire", prix_fcfa: 800, stock: 12, seuil_alerte: 15, jExp: 150 },
  { nom: "Fer + Acide folique", categorie: "Supplément", prix_fcfa: 1000, stock: 40, seuil_alerte: 15, jExp: 200 },
  { nom: "Albendazole 400mg", categorie: "Antiparasitaire", prix_fcfa: 750, stock: 3, seuil_alerte: 10, jExp: 15 },
  { nom: "Cotrimoxazole", categorie: "Antibiotique", prix_fcfa: 1500, stock: 50, seuil_alerte: 15, jExp: 120 },
  { nom: "Chloroquine", categorie: "Antipaludique", prix_fcfa: 900, stock: 25, seuil_alerte: 10, jExp: 10 },
];

const PATIENTS = [
  { nom: "Traoré", prenom: "Aminata", age: 32, sexe: "F", telephone: "+223 70 12 34 56", notes: "Allergie pénicilline" },
  { nom: "Diarra", prenom: "Moussa", age: 45, sexe: "M", telephone: "+223 76 23 45 67", notes: "Hypertension" },
  { nom: "Keïta", prenom: "Fatoumata", age: 28, sexe: "F", telephone: "+223 65 34 56 78", notes: "" },
  { nom: "Coulibaly", prenom: "Ibrahim", age: 60, sexe: "M", telephone: "+223 78 45 67 89", notes: "Diabète type 2" },
  { nom: "Sangaré", prenom: "Mariam", age: 22, sexe: "F", telephone: "+223 79 56 78 90", notes: "" },
  { nom: "Touré", prenom: "Oumar", age: 38, sexe: "M", telephone: "+223 66 67 89 01", notes: "Paludisme récurrent" },
  { nom: "Sissoko", prenom: "Awa", age: 51, sexe: "F", telephone: "+223 75 78 90 12", notes: "" },
  { nom: "Diallo", prenom: "Boubacar", age: 19, sexe: "M", telephone: "+223 77 89 01 23", notes: "" },
  { nom: "Camara", prenom: "Kadiatou", age: 34, sexe: "F", telephone: "+223 69 90 12 34", notes: "Enceinte" },
  { nom: "Konaté", prenom: "Sékou", age: 47, sexe: "M", telephone: "+223 73 01 23 45", notes: "" },
];

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export async function seedDemoData() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Non connecté");

  // Wipe existing demo data for this user
  await supabase.from("ventes").delete().eq("user_id", user.id);
  await supabase.from("ordonnances").delete().eq("user_id", user.id);
  await supabase.from("patients").delete().eq("user_id", user.id);
  await supabase.from("medicaments").delete().eq("user_id", user.id);

  // Insert medicaments
  const medsRows = MEDS.map((m) => ({
    user_id: user.id,
    nom: m.nom,
    categorie: m.categorie,
    prix_fcfa: m.prix_fcfa,
    stock: m.stock,
    seuil_alerte: m.seuil_alerte,
    date_peremption: addDays(m.jExp),
  }));
  const { data: insertedMeds, error: e1 } = await supabase
    .from("medicaments").insert(medsRows).select("id,nom,prix_fcfa");
  if (e1) throw e1;

  // Insert patients
  const patientsRows = PATIENTS.map((p) => ({ ...p, user_id: user.id }));
  const { data: insertedPatients, error: e2 } = await supabase
    .from("patients").insert(patientsRows).select("id,nom,prenom");
  if (e2) throw e2;

  // Generate 60 sales over last 14 days
  const ventesRows: any[] = [];
  for (let i = 0; i < 60; i++) {
    const med = insertedMeds![Math.floor(Math.random() * insertedMeds!.length)];
    const pat = insertedPatients![Math.floor(Math.random() * insertedPatients!.length)];
    const qte = Math.floor(Math.random() * 4) + 1;
    const daysAgo = Math.floor(Math.random() * 14);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
    ventesRows.push({
      user_id: user.id,
      medicament_id: med.id,
      medicament_nom: med.nom,
      patient_id: pat.id,
      patient_nom: `${pat.prenom} ${pat.nom}`,
      quantite: qte,
      prix_unitaire: med.prix_fcfa,
      total_fcfa: med.prix_fcfa * qte,
      created_at: date.toISOString(),
    });
  }
  const { error: e3 } = await supabase.from("ventes").insert(ventesRows);
  if (e3) throw e3;

  // Ordonnances
  const ordoRows = insertedPatients!.slice(0, 5).map((p, i) => ({
    user_id: user.id,
    patient_id: p.id,
    patient_nom: `${p.prenom} ${p.nom}`,
    medecin: ["Dr. Sidibé", "Dr. Maïga", "Dr. Diakité"][i % 3],
    medicaments_prescrits: ["Paracétamol 500mg x20", "Coartem x1 boîte", "Amoxicilline 500mg x21"][i % 3],
    date_ordonnance: addDays(-i * 2),
    notes: "",
  }));
  await supabase.from("ordonnances").insert(ordoRows);

  return { meds: medsRows.length, patients: patientsRows.length, ventes: ventesRows.length };
}
