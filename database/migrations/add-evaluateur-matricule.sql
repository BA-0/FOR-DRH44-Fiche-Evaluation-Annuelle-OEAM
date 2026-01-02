-- Ajout du champ matricule de l'évaluateur (N+1) dans la table evaluations
ALTER TABLE evaluations ADD COLUMN evaluateur_matricule VARCHAR(50) AFTER evaluateur_nom;