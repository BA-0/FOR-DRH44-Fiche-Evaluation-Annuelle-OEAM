# 👑 Dashboard Administrateur - SENICO SA

## 🎯 Démarrage Rapide

### 1. Installation (première fois uniquement)

```bash
# Exécuter la migration SQL
mysql -u root formulaire_evaluation < database/migrations/add-admin-role.sql
```

Ou via phpMyAdmin : Exécuter le fichier `database/migrations/add-admin-role.sql`

### 2. Démarrer le serveur

**Option A - Script automatique (recommandé) :**
```bash
Double-cliquer sur: DEMARRER-ADMIN.bat
```

**Option B - Manuel :**
```bash
cd server
node server-mysql.js
```

### 3. Accéder au dashboard

1. Ouvrir : http://localhost:3001/login.html
2. Username : `admin`
3. Se connecter → Redirection automatique vers dashboard admin

---

## 📋 Fonctionnalités Principales

### 👥 Gestion Utilisateurs
- Créer, modifier, supprimer des utilisateurs
- Activer/désactiver des comptes
- Gérer les rôles (admin, N1, N2)
- Recherche et filtres avancés

### 📊 Gestion Évaluations
- Voir toutes les évaluations (tous statuts)
- Supprimer des évaluations
- Filtres par statut et année
- Statistiques en temps réel

### 📜 Logs d'Audit
- Consulter toutes les actions système
- Filtrer par action et utilisateur
- Exporter en CSV

### ⚙️ Configuration
- Paramètres système
- Export/backup base de données
- Réinitialisation BDD

---

## 🔐 Compte Administrateur

L'utilisateur admin existe déjà dans votre base de données :
- **ID** : 21
- **Username** : admin
- **Email** : admin@senico.com

Le mot de passe est celui actuellement dans la base de données.

---

## 📚 Documentation Complète

Consultez `GUIDE-ADMINISTRATION.md` pour :
- Guide d'utilisation détaillé
- Fonctionnalités complètes
- Dépannage
- Bonnes pratiques

---

## 🛠️ Résolution de Problèmes

### Le dashboard admin ne s'affiche pas ?

1. Vérifier le rôle dans la base :
```sql
SELECT username, role FROM users WHERE username='admin';
```

2. Si le rôle n'est pas 'admin', le forcer :
```sql
UPDATE users SET role='admin' WHERE username='admin';
```

### Erreur 403 (Accès refusé) ?

- Déconnectez-vous et reconnectez-vous
- Vérifiez que vous utilisez le bon compte admin

### Le serveur ne démarre pas ?

1. Vérifier que WAMP est démarré (icône verte)
2. Vérifier la base de données existe
3. Vérifier `server/db.config.js`

---

## 📞 Support

**Email** : support.dsi@senico.sn

---

## 📁 Fichiers Créés

- `admin-dashboard.html` - Interface admin
- `admin-dashboard.js` - Logique admin  
- `GUIDE-ADMINISTRATION.md` - Documentation complète
- `ADMIN-PROFILE-IMPLEMENTATION.md` - Détails techniques
- `database/migrations/add-admin-role.sql` - Migration SQL
- `DEMARRER-ADMIN.bat` - Script de démarrage
- `README-ADMIN.md` - Ce fichier

---

**Version** : 1.0.0  
**Date** : 26 décembre 2025

© 2025 SENICO SA
