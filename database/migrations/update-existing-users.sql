-- Script pour mettre à jour les utilisateurs existants
-- À exécuter après avoir ajouté le champ first_login
-- Ceci met first_login à FALSE pour tous les utilisateurs existants

USE formulaire_evaluation;

-- Afficher l'état actuel
SELECT 
    id, 
    username, 
    name, 
    first_login,
    CASE 
        WHEN first_login = 1 THEN '⚠️ Devra changer son mot de passe'
        ELSE '✅ Pas de changement requis'
    END as status
FROM users
ORDER BY id;

-- Mettre à jour les utilisateurs existants (sauf test.user)
-- Décommentez la ligne suivante si vous voulez que les utilisateurs existants ne changent PAS leur mot de passe
-- UPDATE users SET first_login = FALSE WHERE username != 'test.user';

-- Vérifier les modifications
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN first_login = 1 THEN 1 ELSE 0 END) as users_first_login,
    SUM(CASE WHEN first_login = 0 THEN 1 ELSE 0 END) as users_normal
FROM users;
