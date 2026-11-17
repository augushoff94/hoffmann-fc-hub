DROP POLICY IF EXISTS "Cualquiera puede inscribir" ON public.inscripciones_infantiles;
CREATE POLICY "Cualquiera puede inscribir" ON public.inscripciones_infantiles
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(nombres)) BETWEEN 1 AND 100
  AND char_length(btrim(apellidos)) BETWEEN 1 AND 100
  AND dni ~ '^[0-9.]{6,12}$'
  AND fecha_nacimiento BETWEEN DATE '2000-01-01' AND CURRENT_DATE
  AND char_length(btrim(talle)) BETWEEN 1 AND 20
  AND char_length(alergias) <= 500
  AND char_length(btrim(tutor_nombre)) BETWEEN 1 AND 150
  AND tutor_telefono ~ '^[0-9+ ()-]{6,25}$'
  AND sede IN ('Área 93', 'Barrio 17 de Agosto')
);