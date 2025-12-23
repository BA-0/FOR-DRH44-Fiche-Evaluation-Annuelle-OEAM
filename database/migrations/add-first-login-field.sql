-- Migration pour ajouter le champ first_login à la table users
-- Ce champ indique si l'utilisateur doit changer son mot de passe lors de sa première connexion

USE formulaire_evaluation;

-- Ajouter le champ first_login
-- Note: Si la colonne existe déjà, cette requête échouera (c'est normal)
ALTER TABLE users 
ADD COLUMN first_login BOOLEAN DEFAULT TRUE COMMENT 'TRUE si l\'utilisateur doit changer son mot de passe à la première connexion';

-- Pour les utilisateurs existants, on peut les mettre à FALSE si vous voulez qu'ils n'aient pas à changer leur mot de passe
-- Décommentez la ligne suivante si nécessaire :
-- UPDATE users SET first_login = FALSE WHERE id > 0;

-- Vérifier les modifications
DESCRIBE users;
