# 👑 GUIDE D'ADMINISTRATION - SENICO SA
## Système d'Évaluation des Collaborateurs

---

## 📋 SOMMAIRE

1. [Vue d'ensemble](#vue-densemble)
2. [Accès administrateur](#accès-administrateur)
3. [Fonctionnalités principales](#fonctionnalités-principales)
4. [Installation et configuration](#installation-et-configuration)
5. [Gestion des utilisateurs](#gestion-des-utilisateurs)
6. [Gestion des évaluations](#gestion-des-évaluations)
7. [Statistiques et rapports](#statistiques-et-rapports)
8. [Logs d'audit](#logs-daudit)
9. [Configuration système](#configuration-système)
10. [Sécurité](#sécurité)
11. [Dépannage](#dépannage)

---

## 🎯 VUE D'ENSEMBLE

Le profil administrateur permet une gestion complète du système d'évaluation avec des privilèges étendus pour :
- **Créer, modifier et supprimer des utilisateurs**
- **Gérer toutes les évaluations** (tous statuts)
- **Consulter les statistiques globales**
- **Auditer toutes les actions** du système
- **Configurer les paramètres** de l'application
- **Exporter et sauvegarder** la base de données

---

## 🔐 ACCÈS ADMINISTRATEUR

### Création du compte admin

Le compte administrateur a été créé automatiquement lors de l'export de la base de données :

```
Username: admin
Email: admin@senico.com
Mot de passe: (à définir lors de la première connexion)
```

### Connexion

1. Accédez à la page de connexion : `http://localhost:3001/login.html`
2. Entrez vos identifiants administrateur
3. Vous serez automatiquement redirigé vers le **Dashboard Admin**

---

## ⚙️ INSTALLATION ET CONFIGURATION

### 1. Mise à jour de la base de données

Exécutez le script de migration pour ajouter le rôle admin :

```bash
cd "c:\Users\cheri\Documents\SENICO\formulaire evaluation"
mysql -u root formulaire_evaluation < database/migrations/add-admin-role.sql
```

Ou via phpMyAdmin :
1. Ouvrez phpMyAdmin : `http://localhost/phpmyadmin`
2. Sélectionnez la base `formulaire_evaluation`
3. Onglet "SQL"
4. Copiez et exécutez le contenu de `add-admin-role.sql`

### 2. Vérification

Pour vérifier que le rôle admin est bien ajouté :

```sql
-- Vérifier la structure de la table users
DESCRIBE users;

-- Vérifier l'utilisateur admin
SELECT id, username, role, name, email, is_active 
FROM users 
WHERE role = 'admin';
```

### 3. Démarrage du serveur

```bash
cd server
node server-mysql.js
```

Le serveur doit afficher :
```
🚀 SERVEUR D'ÉVALUATION DÉMARRÉ
📍 URL: http://localhost:3001
```

---

## 👥 GESTION DES UTILISATEURS

### Créer un nouvel utilisateur

1. Cliquez sur **"➕ Nouvel Utilisateur"**
2. Remplissez le formulaire :
   - **Nom d'utilisateur** : identifiant unique
   - **Nom complet** : prénom et nom
   - **Email** : adresse email professionnelle
   - **Rôle** : 
     - `admin` : Administrateur
     - `N1` : Évaluateur
     - `N2` : Validateur
   - **Mot de passe** : minimum 8 caractères
   - **Statut** : Actif / Inactif

3. Cliquez sur **"💾 Enregistrer"**

### Modifier un utilisateur

1. Trouvez l'utilisateur dans la liste
2. Cliquez sur **✏️ (Modifier)**
3. Modifiez les informations nécessaires
4. Laissez le mot de passe vide pour le conserver
5. Cliquez sur **"💾 Enregistrer"**

### Désactiver/Activer un utilisateur

- Cliquez sur **🔒 (Désactiver)** pour bloquer l'accès
- Cliquez sur **🔓 (Activer)** pour réactiver

Un utilisateur désactivé ne peut plus se connecter mais ses données restent préservées.

### Supprimer un utilisateur

⚠️ **ATTENTION** : Cette action est irréversible !

1. Cliquez sur **🗑️ (Supprimer)**
2. Confirmez deux fois la suppression
3. L'utilisateur et toutes ses évaluations seront supprimés

**Note** : Impossible de supprimer le dernier administrateur actif.

### Filtres et recherche

- **Recherche** : Tapez un nom, email ou username
- **Filtrer par rôle** : Admin / N1 / N2
- **Filtrer par statut** : Actif / Inactif

---

## 📋 GESTION DES ÉVALUATIONS

### Vue d'ensemble

L'onglet **"Gestion Évaluations"** affiche toutes les évaluations :
- ✏️ **Brouillon** (draft)
- 📤 **Soumis** (submitted) 
- ✅ **Validé** (validated)

### Consulter une évaluation

1. Trouvez l'évaluation dans la liste
2. Cliquez sur **👁️ (Voir)**
3. L'évaluation s'ouvre dans un nouvel onglet en mode lecture seule

### Supprimer une évaluation

⚠️ **ATTENTION** : Cette action est irréversible !

1. Cliquez sur **🗑️ (Supprimer)**
2. Confirmez la suppression
3. L'évaluation et ses logs d'audit seront supprimés

### Filtres et recherche

- **Recherche** : Nom évalué, évaluateur, direction, service
- **Filtrer par statut** : Brouillon / Soumis / Validé
- **Filtrer par année** : 2023 / 2024 / 2025

---

## 📊 STATISTIQUES ET RAPPORTS

### Cartes de statistiques (en haut)

- **Total Utilisateurs** : Nombre total + actifs ce mois
- **Total Évaluations** : Nombre total + créées ce mois
- **En Attente** : Évaluations soumises non validées
- **Validées** : Évaluations complétées

### Graphiques (onglet Statistiques)

1. **Évaluations par Statut** : Répartition draft/submitted/validated
2. **Évaluations par Mois** : Évolution temporelle
3. **Utilisateurs par Rôle** : Distribution admin/N1/N2
4. **Évaluations par Direction** : Analyse par direction

*Note : Les graphiques nécessitent l'ajout de Chart.js (à implémenter)*

---

## 📜 LOGS D'AUDIT

### Consultation des logs

L'onglet **"Logs d'Audit"** affiche toutes les actions système :
- ✅ Création d'évaluation
- 📤 Soumission (N1 → N2)
- ✅ Validation (N2)
- 🗑️ Suppression
- ✏️ Modification

### Informations disponibles

- **Date/Heure** : Horodatage précis
- **Utilisateur** : Qui a effectué l'action
- **Action** : Type d'opération
- **Évaluation** : ID de l'évaluation concernée
- **Statuts** : Ancien → Nouveau
- **Adresse IP** : IP d'origine
- **Détails** : Informations supplémentaires

### Exporter les logs

1. Appliquez les filtres souhaités
2. Cliquez sur **"📥 Exporter les Logs"**
3. Un fichier CSV sera téléchargé

Format CSV : Compatible Excel, LibreOffice, etc.

---

## ⚙️ CONFIGURATION SYSTÈME

### Paramètres disponibles

#### Email de notification
```
Adresse email pour les notifications système
Défaut : admin@senico.sn
```

#### Année d'évaluation courante
```
Année utilisée par défaut dans les formulaires
Défaut : 2025
```

#### Politique de mot de passe
- **Faible** : 6 caractères minimum
- **Moyen** : 8 caractères, lettres et chiffres
- **Fort** : 12 caractères, lettres, chiffres et symboles

#### Session timeout
```
Durée en minutes avant déconnexion automatique
Défaut : 30 minutes
```

#### Mode maintenance
```
Activé : Bloque l'accès aux utilisateurs (sauf admin)
Désactivé : Système accessible normalement
```

### Enregistrer les modifications

Cliquez sur **"💾 Enregistrer la Configuration"**

---

## 🔒 SÉCURITÉ

### Actions dangereuses

⚠️ **Ces actions sont disponibles mais très dangereuses !**

#### 🗑️ Réinitialiser la Base de Données

**Effet** : Supprime TOUTES les données (évaluations, utilisateurs sauf admin, logs)

**Procédure** :
1. Une sauvegarde automatique est créée
2. Confirmation requise (2 fois)
3. Toutes les données sont effacées
4. Seul le compte admin est conservé

#### 📦 Exporter la Base de Données

**Utilité** : Créer une sauvegarde complète

**Procédure** :
1. Cliquez sur **"📦 Exporter la Base de Données"**
2. Un fichier SQL sera téléchargé
3. Format : `backup_YYYY-MM-DD.sql`

**Emplacement** : `database/backups/`

### Bonnes pratiques

✅ **À FAIRE** :
- Créer des sauvegardes régulières (hebdomadaires)
- Utiliser des mots de passe forts
- Désactiver les comptes inutilisés
- Consulter les logs d'audit régulièrement
- Limiter le nombre d'administrateurs (1-2 max)

❌ **À ÉVITER** :
- Partager les identifiants admin
- Supprimer des données sans sauvegarde
- Laisser des comptes admin inactifs
- Ignorer les alertes de sécurité

---

## 🛠️ DÉPANNAGE

### Problème : Impossible d'accéder au dashboard admin

**Causes possibles** :
1. Le rôle n'a pas été ajouté à la base de données
2. L'utilisateur n'a pas le rôle 'admin'
3. Le serveur n'est pas démarré

**Solutions** :
```bash
# Vérifier le rôle dans la base
mysql -u root formulaire_evaluation -e "SELECT role FROM users WHERE username='admin';"

# Forcer la mise à jour du rôle
mysql -u root formulaire_evaluation -e "UPDATE users SET role='admin' WHERE username='admin';"

# Redémarrer le serveur
cd server
node server-mysql.js
```

### Problème : Erreur 403 lors des actions admin

**Cause** : Le middleware de vérification admin échoue

**Solution** :
1. Vérifiez que vous êtes bien connecté
2. Vérifiez le token dans localStorage :
```javascript
console.log(localStorage.getItem('authToken'));
console.log(localStorage.getItem('userRole'));
```
3. Reconnectez-vous si nécessaire

### Problème : Les statistiques ne s'affichent pas

**Cause** : Problème de chargement des données

**Solution** :
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs réseau
3. Vérifiez que le serveur répond :
```bash
curl http://localhost:3001/api/users
```

### Problème : Export de base de données échoue

**Cause** : mysqldump non accessible

**Solution** :
```bash
# Windows (WAMP)
# Ajouter au PATH : C:\wamp64\bin\mysql\mysql8.x.x\bin

# Ou utiliser le chemin complet dans admin-dashboard.js
C:\wamp64\bin\mysql\mysql8.2.0\bin\mysqldump.exe
```

---

## 📝 API ENDPOINTS ADMIN

### Authentification requise
Tous les endpoints nécessitent le header :
```
Authorization: Bearer <token>
```

### Routes utilisateurs

```http
GET    /api/users              # Liste tous les utilisateurs
POST   /api/users              # Créer un utilisateur
PUT    /api/users/:id          # Modifier un utilisateur
PATCH  /api/users/:id/status   # Activer/désactiver
DELETE /api/users/:id          # Supprimer un utilisateur
```

### Routes évaluations

```http
GET    /api/evaluations/all    # Liste toutes les évaluations
DELETE /api/evaluations/:id    # Supprimer une évaluation
```

### Routes audit et stats

```http
GET    /api/audit-logs         # Tous les logs (limit 500)
GET    /api/stats              # Statistiques globales
```

### Routes configuration

```http
POST   /api/admin/settings           # Enregistrer config
GET    /api/admin/export-database    # Exporter BDD
POST   /api/admin/reset-database     # Réinitialiser BDD
```

---

## 📞 SUPPORT

### Contact DSI

- **Email** : support.dsi@senico.sn
- **Téléphone** : +221 33 XXX XX XX

### Documentation complémentaire

- `README.md` : Vue d'ensemble du projet
- `GUIDE-PREMIERE-CONNEXION.md` : Connexion initiale
- `CREER-NOUVEL-UTILISATEUR.md` : Création d'utilisateurs

---

## 📋 CHECKLIST PREMIÈRE UTILISATION

- [ ] Exécuter la migration `add-admin-role.sql`
- [ ] Vérifier que le compte admin existe
- [ ] Se connecter avec admin
- [ ] Changer le mot de passe admin
- [ ] Créer une sauvegarde initiale
- [ ] Configurer l'email de notification
- [ ] Créer les comptes N1 et N2 nécessaires
- [ ] Tester la création d'une évaluation
- [ ] Vérifier les logs d'audit
- [ ] Planifier les sauvegardes régulières

---

## 🎯 PROCHAINES ÉTAPES

### Améliorations prévues

1. **Graphiques interactifs** avec Chart.js
2. **Notifications par email** automatiques
3. **Export Excel** des évaluations
4. **Tableau de bord personnalisable**
5. **Gestion des rôles avancée** (permissions granulaires)
6. **Sauvegarde automatique** programmée
7. **Authentification à deux facteurs** (2FA)
8. **Journal d'activité détaillé** par utilisateur

---

**Version** : 1.0.0  
**Date** : 26 décembre 2025  
**Auteur** : Équipe DSI SENICO SA

---

© 2025 SENICO SA - Tous droits réservés
