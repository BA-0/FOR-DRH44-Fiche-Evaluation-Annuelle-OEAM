-- ============================================
-- CORRECTION RAPIDE - Rôle Administrateur
-- SENICO SA - Système d'Évaluation
-- ============================================

USE formulaire_evaluation;

-- Étape 1: Vérifier le rôle actuel de l'admin
SELECT 
    id, 
    username, 
    role, 
    name, 
    email, 
    is_active
FROM users 
WHERE username = 'admin';

-- Étape 2: Modifier la colonne role pour accepter 'admin'
ALTER TABLE users 
MODIFY COLUMN role ENUM('N1', 'N2', 'admin') NOT NULL 
COMMENT 'N1 = Évaluateur, N2 = Validateur, admin = Administrateur';

-- Étape 3: Mettre à jour le rôle de l'utilisateur admin
UPDATE users 
SET role = 'admin' 
WHERE username = 'admin';

-- Étape 4: Vérification finale
SELECT 
    id, 
    username, 
    role, 
    name, 
    email, 
    is_active,
    'CORRECTION REUSSIE - Role mis a jour' as status
FROM users 
WHERE username = 'admin';
