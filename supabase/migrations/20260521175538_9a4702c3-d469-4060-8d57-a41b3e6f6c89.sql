
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL DEFAULT '',
  prenom TEXT NOT NULL DEFAULT '',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, prenom, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nom',''), COALESCE(NEW.raw_user_meta_data->>'prenom',''), NEW.email);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Médicaments
CREATE TABLE public.medicaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  categorie TEXT NOT NULL DEFAULT 'Général',
  prix_fcfa INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  seuil_alerte INTEGER NOT NULL DEFAULT 10,
  date_peremption DATE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medicaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users read medicaments" ON public.medicaments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth users insert medicaments" ON public.medicaments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth users update medicaments" ON public.medicaments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth users delete medicaments" ON public.medicaments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Patients
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  telephone TEXT,
  age INTEGER,
  sexe TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users read patients" ON public.patients FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth users insert patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth users update patients" ON public.patients FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth users delete patients" ON public.patients FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Ventes
CREATE TABLE public.ventes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicament_id UUID REFERENCES public.medicaments(id) ON DELETE SET NULL,
  medicament_nom TEXT NOT NULL,
  quantite INTEGER NOT NULL DEFAULT 1,
  prix_unitaire INTEGER NOT NULL DEFAULT 0,
  total_fcfa INTEGER NOT NULL DEFAULT 0,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_nom TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ventes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users read ventes" ON public.ventes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth users insert ventes" ON public.ventes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth users delete ventes" ON public.ventes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Ordonnances
CREATE TABLE public.ordonnances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_nom TEXT NOT NULL,
  medecin TEXT,
  medicaments_prescrits TEXT NOT NULL,
  notes TEXT,
  date_ordonnance DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ordonnances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth users read ordo" ON public.ordonnances FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth users insert ordo" ON public.ordonnances FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth users update ordo" ON public.ordonnances FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth users delete ordo" ON public.ordonnances FOR DELETE TO authenticated USING (auth.uid() = user_id);
