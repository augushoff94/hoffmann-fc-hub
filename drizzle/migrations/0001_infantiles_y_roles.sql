CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver mis roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

CREATE TABLE public.inscripciones_infantiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombres text NOT NULL,
  apellidos text NOT NULL,
  dni text NOT NULL,
  fecha_nacimiento date NOT NULL,
  talle text NOT NULL,
  alergias text NOT NULL DEFAULT 'No',
  tutor_nombre text NOT NULL,
  tutor_telefono text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inscripciones_infantiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inscripciones_infantiles TO authenticated;
GRANT ALL ON public.inscripciones_infantiles TO service_role;
ALTER TABLE public.inscripciones_infantiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cualquiera puede inscribir" ON public.inscripciones_infantiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin ve inscripciones" ON public.inscripciones_infantiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin borra inscripciones" ON public.inscripciones_infantiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY "Panel admin abierto" ON public.confirmaciones;
CREATE POLICY "Admin ve confirmaciones" ON public.confirmaciones FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));