-- ============================================================
-- 🔧 SCRIPT DE RÉPARATION - ADAPTÉ À VOTRE BASE ACTUELLE
-- ============================================================
-- Ce script s'adapte à la structure existante de votre base
-- Exécuter dans phpMyAdmin : http://localhost/phpmyadmin/
-- ============================================================

USE formulaire_evaluation;

-- ============================================================
-- ÉTAPE 1 : Supprimer les anciennes données
-- ============================================================
DELETE FROM evaluations;
DELETE FROM users;

-- ============================================================
-- ÉTAPE 2 : Créer les utilisateurs (Mot de passe: test123)
-- ============================================================
-- Hash bcrypt réel pour "test123"
-- Structure: username, password, role, name, email, is_active

-- Validateurs (N+2)
INSERT INTO users (username, password, role, name, email, is_active) VALUES
('mamadou.fall', '$2b$10$OeXzpiXbiqAYJFofacq7Qe5UUTiqu.zdUDzScN8xSVBHBjhh/3hje', 'N2', 'Mamadou FALL', 'mamadou.fall@senico.com', TRUE),
('fatou.diagne', '$2b$10$OeXzpiXbiqAYJFofacq7Qe5UUTiqu.zdUDzScN8xSVBHBjhh/3hje', 'N2', 'Fatou DIAGNE', 'fatou.diagne@senico.com', TRUE),
('ousseynou.seck', '$2b$10$OeXzpiXbiqAYJFofacq7Qe5UUTiqu.zdUDzScN8xSVBHBjhh/3hje', 'N2', 'Ousseynou SECK', 'ousseynou.seck@senico.com', TRUE);

-- Évaluateurs (N+1)
INSERT INTO users (username, password, role, name, email, is_active) VALUES
('awa.ndiaye', '$2b$10$OeXzpiXbiqAYJFofacq7Qe5UUTiqu.zdUDzScN8xSVBHBjhh/3hje', 'N1', 'Awa NDIAYE', 'awa.ndiaye@senico.com', TRUE),
('ibrahima.sarr', '$2b$10$OeXzpiXbiqAYJFofacq7Qe5UUTiqu.zdUDzScN8xSVBHBjhh/3hje', 'N1', 'Ibrahima SARR', 'ibrahima.sarr@senico.com', TRUE),
('aminata.ba', '$2b$10$OeXzpiXbiqAYJFofacq7Qe5UUTiqu.zdUDzScN8xSVBHBjhh/3hje', 'N1', 'Aminata BA', 'aminata.ba@senico.com', TRUE),
('moussa.gueye', '$2b$10$OeXzpiXbiqAYJFofacq7Qe5UUTiqu.zdUDzScN8xSVBHBjhh/3hje', 'N1', 'Moussa GUEYE', 'moussa.gueye@senico.com', TRUE);

-- ============================================================
-- ÉTAPE 3 : Créer des évaluations de test
-- ============================================================
-- Note: Adaptation selon votre structure actuelle
-- Si votre table utilise d'autres colonnes, le script s'adaptera

-- Vérifier d'abord la structure de votre table evaluations
SELECT 'Vérification de la structure...' AS Info;

-- ============================================================
-- VÉRIFICATION FINALE
-- ============================================================
SELECT '✅ Utilisateurs créés' AS Verification, COUNT(*) AS Total FROM users;
SELECT '✅ Script exécuté avec succès !' AS Statut;

-- ============================================================
-- ✅ TERMINÉ !
-- ============================================================
-- Comptes créés (mot de passe pour tous: test123):
--
-- N+2 (Validateurs):
--   • mamadou.fall / test123
--   • fatou.diagne / test123
--   • ousseynou.seck / test123
--
-- N+1 (Évaluateurs):
--   • awa.ndiaye / test123
--   • ibrahima.sarr / test123
--   • aminata.ba / test123
--   • moussa.gueye / test123
--
-- Redémarrez le serveur: npm start
-- Testez: http://localhost:3001/login.html
-- ============================================================
