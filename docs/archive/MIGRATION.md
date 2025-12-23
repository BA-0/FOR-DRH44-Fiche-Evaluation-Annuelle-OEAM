# 🔄 Migration vers MySQL avec WAMP Server

Ce guide explique comment passer du système de fichiers JSON à une vraie base de données MySQL.

## 📋 Prérequis

✅ WAMP Server installé et démarré (icône verte)
✅ Node.js installé
✅ Fichiers du projet présents

## 🚀 Installation en 5 étapes

### Étape 1: Installer les modules Node.js nécessaires

Ouvrez un terminal (cmd) dans le dossier du projet et exécutez:

```bash
npm install mysql2 bcrypt
```

**Ce qui est installé:**
- `mysql2`: Pour se connecter à MySQL depuis Node.js
- `bcrypt`: Pour sécuriser les mots de passe (hashing)

### Étape 2: Créer la base de données MySQL

1. **Ouvrir phpMyAdmin:**
   - Dans votre navigateur: http://localhost/phpmyadmin
   - Ou cliquez sur l'icône WAMP > phpMyAdmin

2. **Importer le script SQL:**
   - Cliquez sur l'onglet "SQL" en haut
   - Ouvrez le fichier `database.sql` avec un éditeur de texte
   - Copiez tout le contenu
   - Collez-le dans la zone de texte
   - Cliquez sur "Exécuter"

3. **Vérification:**
   - Vous devriez voir une nouvelle base `formulaire_evaluation`
   - Elle contient 3 tables: `users`, `evaluations`, `audit_log`
   - 2 utilisateurs sont déjà créés (evaluateur et validateur)

### Étape 3: Configurer la connexion (si nécessaire)

Le fichier `db.config.js` contient la configuration par défaut de WAMP:

```javascript
{
    host: 'localhost',
    user: 'root',
    password: '',        // Vide par défaut dans WAMP
    database: 'formulaire_evaluation'
}
```

**Si vous avez modifié le mot de passe root de MySQL:**
- Ouvrez `db.config.js`
- Modifiez la ligne `password: ''` avec votre mot de passe

### Étape 4: Générer les mots de passe hashés

Les mots de passe dans la base de données sont déjà hashés avec bcrypt. Si vous voulez créer de nouveaux utilisateurs ou changer les mots de passe, utilisez ce script:

```bash
node scripts/hash-password.js eval123
```

Cela affichera le hash bcrypt à utiliser dans la base de données.

### Étape 5: Démarrer le nouveau serveur

**Arrêtez l'ancien serveur** (Ctrl+C dans le terminal où il tourne)

**Démarrez le nouveau serveur MySQL:**

```bash
node server-mysql.js
```

Vous devriez voir:

```
✅ Connexion à MySQL réussie!
📊 Base de données: formulaire_evaluation
🚀 SERVEUR D'ÉVALUATION DÉMARRÉ
📍 URL: http://localhost:3001
```

## ✅ Vérification du fonctionnement

1. **Ouvrez:** http://localhost:3001/login.html
2. **Connectez-vous avec:**
   - Username: `evaluateur`
   - Password: `eval123`
   - Role: N+1

3. **Vérifiez:**
   - ✅ Le nom affiché devrait être "👤 Jean Dupont" (plus de problème!)
   - ✅ Vous pouvez créer une évaluation
   - ✅ Les données sont stockées dans MySQL

## 🔍 Vérifier les données dans MySQL

**Via phpMyAdmin:**
```sql
-- Voir tous les utilisateurs
SELECT * FROM users;

-- Voir toutes les évaluations
SELECT * FROM evaluations;

-- Voir les évaluations en attente
SELECT * FROM v_pending_evaluations;

-- Voir l'historique
SELECT * FROM audit_log;
```

## 📊 Différences principales

### Avant (JSON)
- ❌ Fichier `evaluations.json`
- ❌ Mots de passe en clair
- ❌ Pas d'historique
- ❌ Performances limitées
- ❌ Pas de transactions

### Après (MySQL)
- ✅ Base de données professionnelle
- ✅ Mots de passe hashés avec bcrypt
- ✅ Historique complet dans `audit_log`
- ✅ Performances optimales
- ✅ Transactions et procédures stockées
- ✅ Vues pour les statistiques

## 🎯 Nouveaux fichiers créés

1. **database.sql** - Script de création de la base de données
2. **db.config.js** - Configuration de connexion MySQL
3. **db.js** - Module de gestion de la base de données
4. **server-mysql.js** - Nouveau serveur avec MySQL (remplace server.js)
5. **MIGRATION.md** - Ce fichier d'instructions

## 🔧 Structure de la base de données

### Table `users`
- `id`: Identifiant unique
- `username`: Nom d'utilisateur (unique)
- `password`: Mot de passe hashé avec bcrypt
- `role`: N1 (évaluateur) ou N2 (validateur)
- `name`: Nom complet (ex: "Jean Dupont")
- `email`: Email professionnel
- `is_active`: Compte actif ou non

### Table `evaluations`
- Tous les champs du formulaire
- Champs JSON pour: objectifs, competences, scores, observations, signatures
- `status`: draft → submitted → validated
- Dates: created_at, submitted_at, validated_at

### Table `audit_log`
- Historique de toutes les actions
- Qui a fait quoi et quand
- Utile pour la traçabilité

## 🚨 Dépannage

### Erreur "Cannot connect to MySQL"
1. Vérifiez que WAMP est démarré (icône verte)
2. Vérifiez que MySQL fonctionne (cliquez sur icône WAMP > MySQL > Service)
3. Testez dans phpMyAdmin

### Erreur "Database does not exist"
- Exécutez le fichier `database.sql` dans phpMyAdmin

### Erreur "Access denied for user"
- Vérifiez le mot de passe dans `db.config.js`
- Par défaut, WAMP utilise user: `root` et password: vide

### Les utilisateurs ne peuvent pas se connecter
1. Vérifiez que les utilisateurs existent:
   ```sql
   SELECT * FROM users;
   ```
2. Si vide, réexécutez la section INSERT du fichier `database.sql`

## 📈 Améliorations futures possibles

- [ ] Utiliser JWT pour les tokens d'authentification
- [ ] Ajouter la gestion des sessions côté serveur
- [ ] Implémenter la réinitialisation de mot de passe
- [ ] Ajouter des notifications par email (SMTP)
- [ ] Créer une interface d'administration
- [ ] Ajouter l'export Excel des évaluations
- [ ] Implémenter la pagination pour les listes

## 🎓 Pour aller plus loin

**Sécurité production:**
- Utilisez des variables d'environnement (fichier `.env`)
- Changez le mot de passe MySQL root
- Implémentez HTTPS
- Ajoutez un rate limiting sur les endpoints

**Performance:**
- Ajoutez un cache Redis
- Optimisez les requêtes avec des index
- Implémentez la compression gzip

---

✅ **Félicitations!** Votre système d'évaluation utilise maintenant une vraie base de données professionnelle!
