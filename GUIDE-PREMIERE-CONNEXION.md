# 🔐 Guide - Changement de mot de passe à la première connexion

## 📋 Vue d'ensemble

Ce système permet de forcer les nouveaux utilisateurs à créer un nouveau mot de passe personnel lors de leur première connexion à l'application.

## 🔧 Composants mis en place

### 1. **Modification de la base de données**

Un nouveau champ `first_login` a été ajouté à la table `users` :
```sql
ALTER TABLE users 
ADD COLUMN first_login BOOLEAN DEFAULT TRUE;
```

**Fichier SQL de migration** : [`database/migrations/add-first-login-field.sql`](database/migrations/add-first-login-field.sql)

### 2. **Nouvelle page de changement de mot de passe**

**Fichier** : [`first-login-password-change.html`](first-login-password-change.html)

**Fonctionnalités** :
- ✅ Formulaire sécurisé avec 2 champs (nouveau mot de passe + confirmation)
- ✅ Validation en temps réel de la force du mot de passe
- ✅ Affichage visuel des exigences de sécurité
- ✅ Bouton pour afficher/masquer les mots de passe
- ✅ Vérification que les deux mots de passe correspondent

**Exigences du mot de passe** :
- Minimum 8 caractères
- Au moins 1 lettre majuscule (A-Z)
- Au moins 1 lettre minuscule (a-z)
- Au moins 1 chiffre (0-9)
- Au moins 1 caractère spécial (@, #, $, %, etc.)

### 3. **API Backend**

**Fichier modifié** : [`server/server-mysql.js`](server/server-mysql.js)

#### Route de connexion modifiée
```javascript
POST /api/auth/login
```
**Nouveau champ retourné** : `firstLogin` (true/false)

#### Nouvelle route de changement de mot de passe
```javascript
POST /api/auth/change-password-first-login
```

**Body attendu** :
```json
{
  "userId": 123,
  "newPassword": "MonNouveauMotDePasse123!"
}
```

**Headers requis** :
```
Authorization: Bearer <token>
```

**Fonctionnalités** :
- ✅ Validation côté serveur de la complexité du mot de passe
- ✅ Hachage sécurisé avec bcrypt (10 rounds)
- ✅ Mise à jour du champ `first_login` à FALSE
- ✅ Mise à jour automatique du timestamp `updated_at`

### 4. **Modification du processus de connexion**

**Fichier modifié** : [`login.html`](login.html)

**Workflow** :
1. L'utilisateur se connecte normalement
2. Le serveur vérifie si `first_login = TRUE`
3. Si oui → Redirection automatique vers `first-login-password-change.html`
4. Si non → Redirection normale vers le dashboard

## 🚀 Utilisation

### Pour créer un nouvel utilisateur

1. **Exécuter le script SQL de migration** :
```sql
-- Dans MySQL Workbench ou phpMyAdmin
SOURCE database/migrations/add-first-login-field.sql;
```

2. **Créer le nouvel utilisateur avec un mot de passe temporaire** :
```sql
-- Générer un hash bcrypt du mot de passe temporaire
-- Exemple avec Node.js : bcrypt.hash('Temp1234!', 10)

INSERT INTO users (username, password, role, name, email, first_login) 
VALUES (
    'nouveau.user',
    '$2b$10$...', -- Hash bcrypt du mot de passe temporaire
    'N1', -- ou 'N2'
    'Prénom Nom',
    'email@entreprise.com',
    TRUE  -- Important : TRUE pour forcer le changement
);
```

3. **Communiquer les identifiants temporaires** à l'utilisateur :
   - Username : `nouveau.user`
   - Mot de passe temporaire : `Temp1234!`

### Lors de la première connexion

1. L'utilisateur se connecte avec ses identifiants temporaires
2. Il est **automatiquement redirigé** vers la page de changement de mot de passe
3. Il doit créer un nouveau mot de passe respectant les exigences de sécurité
4. Le nouveau mot de passe est **hashé et stocké** dans la base de données
5. Le champ `first_login` est mis à `FALSE`
6. L'utilisateur est redirigé vers son tableau de bord

### Lors des connexions suivantes

L'utilisateur se connecte normalement avec son nouveau mot de passe et accède directement au dashboard.

## 🔒 Sécurité

### Côté Client
- ✅ Validation en temps réel des exigences de sécurité
- ✅ Vérification de correspondance des mots de passe
- ✅ Affichage visuel de la force du mot de passe
- ✅ Désactivation du bouton jusqu'à validation complète

### Côté Serveur
- ✅ Validation stricte de toutes les exigences
- ✅ Hachage bcrypt avec 10 rounds (salt automatique)
- ✅ Vérification du token d'authentification
- ✅ Protection contre les attaques par force brute
- ✅ Messages d'erreur explicites sans révéler d'infos sensibles

## 📝 Exemple complet

### Créer un utilisateur de test

```sql
-- 1. Exécuter la migration
SOURCE database/migrations/add-first-login-field.sql;

-- 2. Créer un utilisateur test
-- Note: Le mot de passe temporaire "Test1234!" sera hashé
INSERT INTO users (username, password, role, name, email, first_login) 
VALUES (
    'jean.test',
    '$2b$10$XNt7vkzYQx4BqXJ0zKh8/.kLhE.P8Zw1J5GZVmj5Ln1V8Qh5J5Qhe', -- Hash de "Test1234!"
    'N1',
    'Jean Test',
    'jean.test@senico.com',
    TRUE
);
```

### Test de connexion

1. **Aller sur** : http://localhost:3001/login.html
2. **Se connecter avec** :
   - Username : `jean.test`
   - Mot de passe : `Test1234!`
   - Rôle : N+1
3. **Vous serez redirigé vers** : `first-login-password-change.html`
4. **Créer un nouveau mot de passe** (ex: `MonNouveauMDP123!`)
5. **Confirmer le mot de passe**
6. **Cliquer sur** "Enregistrer mon nouveau mot de passe"
7. **Redirection automatique** vers le dashboard

## 🛠️ Pour les développeurs

### Générer un hash bcrypt en Node.js

```javascript
const bcrypt = require('bcrypt');

async function hashPassword(password) {
    const hash = await bcrypt.hash(password, 10);
    console.log('Hash:', hash);
}

hashPassword('Temp1234!');
```

### Tester l'API directement

```bash
# Test de connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jean.test",
    "password": "Test1234!",
    "role": "N1"
  }'

# Test de changement de mot de passe
curl -X POST http://localhost:3001/api/auth/change-password-first-login \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "userId": 1,
    "newPassword": "MonNouveauMDP123!"
  }'
```

## ⚠️ Points importants

1. **Migration obligatoire** : Exécuter le script SQL avant toute utilisation
2. **Mots de passe temporaires** : Utiliser des mots de passe forts même temporairement
3. **Communication sécurisée** : Transmettre les identifiants temporaires de manière sécurisée
4. **Validation stricte** : Ne jamais désactiver les validations de sécurité
5. **Logs** : Surveiller les logs serveur pour détecter les tentatives suspectes

## 📚 Fichiers modifiés/créés

1. ✅ `database/migrations/add-first-login-field.sql` - Migration SQL
2. ✅ `first-login-password-change.html` - Page de changement de mot de passe
3. ✅ `server/server-mysql.js` - API backend modifiée
4. ✅ `login.html` - Détection de première connexion
5. ✅ `GUIDE-PREMIERE-CONNEXION.md` - Ce guide

## 🎯 Résumé

Ce système garantit que **tous les nouveaux utilisateurs** créent un mot de passe personnel fort lors de leur première connexion, améliorant ainsi la sécurité globale de l'application.

**Processus** : Création user → Première connexion → Changement obligatoire du mot de passe → Accès normal

---
**SENICO SA** - Système d'Évaluation 100% Digital
