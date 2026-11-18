GRANT UPDATE, DELETE ON public.confirmaciones TO authenticated;
GRANT UPDATE, DELETE ON public.inscripciones_infantiles TO authenticated;

CREATE POLICY "Admin edita confirmaciones" ON public.confirmaciones
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admin borra confirmaciones" ON public.confirmaciones
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admin edita inscripciones" ON public.inscripciones_infantiles
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  AND char_length(btrim(nombres)) BETWEEN 1 AND 100
  AND char_length(btrim(apellidos)) BETWEEN 1 AND 100
  AND dni ~ '^[0-9. -]{6,15}$'
  AND fecha_nacimiento >= DATE '2000-01-01' AND fecha_nacimiento <= CURRENT_DATE
  AND char_length(btrim(talle)) BETWEEN 1 AND 20
  AND char_length(alergias) <= 500
  AND char_length(btrim(tutor_nombre)) BETWEEN 1 AND 150
  AND tutor_telefono ~ '^[0-9+ ().-]{6,30}$'
  AND sede IN ('Área 93', 'Barrio 17 de Agosto')
);