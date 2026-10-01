CREATE TABLE public.confirmaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL CHECK (char_length(nombre) BETWEEN 1 AND 120),
  dni text NOT NULL CHECK (char_length(dni) BETWEEN 1 AND 30),
  documento text NOT NULL CHECK (documento IN ('seguro','reglamento')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.confirmaciones TO anon, authenticated;
GRANT ALL ON public.confirmaciones TO service_role;
ALTER TABLE public.confirmaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cualquiera puede confirmar" ON public.confirmaciones FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Panel admin abierto" ON public.confirmaciones FOR SELECT TO anon, authenticated USING (true);