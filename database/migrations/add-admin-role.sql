-- ============================================
-- Migration: Ajout du rôle admin
-- Date: 2025-12-26
-- ============================================

USE formulaire_evaluation;

-- Modifier la table users pour ajouter le rôle 'admin'
ALTER TABLE users 
MODIFY COLUMN role ENUM('N1', 'N2', 'admin') NOT NULL 
COMMENT 'N1 = Évaluateur, N2 = Validateur, admin = Administrateur';

-- Mettre à jour l'utilisateur admin existant
UPDATE users SET role = 'admin' WHERE username = 'admin';

-- Vérification
SELECT id, username, role, name, email, is_active FROM users WHERE role = 'admin';
