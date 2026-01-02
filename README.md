"# 📊 SENICO SA - Système d'Évaluation des Collaborateurs

## 🎯 Vue d'ensemble

Système complet de gestion des évaluations de performance pour SENICO SA (SÉNÉGALAISE INDUSTRIE COMMERCE).

### 🌟 Fonctionnalités Principales

#### 👥 Gestion Multi-Rôles
- **N+1** : Évaluateurs - Créent et soumettent les évaluations
- **N+2** : Validateurs - Valident et signent les évaluations
- **Admin** : Administrateurs - Gestion complète du système

#### 🔐 Sécurité Renforcée
- ✅ Authentification obligatoire pour toutes les pages
- ✅ System "First Login" pour tous les utilisateurs
- ✅ Réinitialisation de mot de passe par l'admin
- ✅ Nettoyage automatique des sessions
- ✅ Protection contre le retour arrière du navigateur

#### 📋 Gestion des Évaluations
- **Création** : Formulaire complet avec 33 critères d'évaluation
- **Brouillons** : Sauvegarde automatique et reprise
- **Validation hiérarchique** : N+1 → N+2 avec signatures électroniques
- **Export** : PDF avec signatures et Excel pour analyses

#### 👨‍💼 Dashboard Admin
- 📊 **Statistiques en temps réel** : Graphiques interactifs (Chart.js)
- 👤 **Gestion utilisateurs** : CRUD complet avec réinitialisation de mots de passe
- 📄 **Gestion évaluations** : Consultation et export
- 📈 **Analyses** : 4 graphiques (statuts, mensuels, rôles, directions)
- 🔧 **Paramètres** : Configuration système

#### ✅ Page N+2 Améliorée
- 🎯 **Onglets** : En attente / Validées
- 🔍 **Filtres avancés** : Recherche, direction, score, tri
- 📥 **Export Excel** : CSV avec toutes les données
- ☑️ **Validation par lot** : Sélection multiple avec signatures
- 👁️ **Vue rapide** : Aperçu sans modal complet
- 🎨 **Badges de score** : Colorés selon la performance

---

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+ 
- MySQL 8+
- Navigateur moderne (Chrome, Edge, Firefox)

### Étapes d'installation

1. **Cloner le projet**
```bash
cd "c:\Users\cheri\Documents\SENICO\formulaire evaluation"
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer la base de données**
```bash
# Importer le schéma
mysql -u root -p formulaire_evaluation < database/schema/database.sql
```

4. **Démarrer le serveur**
```bash
npm start
```
Serveur accessible sur : `http://localhost:3001`

5. **Accéder à l'application**
```
http://localhost:3001/
```

---

## 🔑 Comptes par Défaut

### Administrateur
- **Identifiant** : `admin`
- **Mot de passe** : `Test123@`
- **Rôle** : Admin (gestion complète)

### Utilisateurs de test
Consultez la base de données `users` pour les autres comptes.

⚠️ **Important** : Tous les nouveaux comptes ont `first_login = 1` et doivent changer leur mot de passe à la première connexion.

---

## 📚 Documentation

### Guides Disponibles

| Document | Description |
|----------|-------------|
| [GUIDE-GESTION-MOTS-DE-PASSE.md](GUIDE-GESTION-MOTS-DE-PASSE.md) | 🔐 Gestion complète des mots de passe (first login, réinitialisation) |
| [README-SECURITE.md](README-SECURITE.md) | 🔒 Système de sécurité et authentification |
| [AMELIORATIONS-N2.md](AMELIORATIONS-N2.md) | ✨ Fonctionnalités avancées de la page N+2 |

### Structure du Projet

```
formulaire evaluation/
├── src/
│   ├── pages/           # Pages HTML
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── validation.html
│   │   └── ...
│   ├── scripts/         # JavaScript
│   │   ├── core/        # Config, sécurité, notifications
│   │   └── pages/       # Scripts par page
│   └── styles/          # CSS
├── server/              # Backend Node.js/Express
│   ├── server-mysql.js  # API principale
│   └── db.js           # Connexion MySQL
├── database/            # SQL
│   ├── schema/         # Structure
│   └── migrations/     # Modifications
├── utils/              # Scripts utilitaires
├── admin-dashboard.html # Dashboard admin (racine)
├── admin-dashboard.js   # Logic admin
├── first-login-password-change.html # Changement mdp
└── index.html          # Page d'accueil (→ login)
```

---

## 🔐 Système de Gestion des Mots de Passe

### First Login (Première Connexion)

**Pour TOUS les utilisateurs** (N+1, N+2, Admin) :

1. Création du compte avec `first_login = 1`
2. Mot de passe par défaut : `Test123@`
3. À la première connexion → Redirection automatique vers changement de mot de passe
4. **Obligatoire** : L'utilisateur doit changer son mot de passe avant d'accéder à l'application

### Réinitialisation par Admin

**Dashboard Admin → Onglet Utilisateurs → Bouton 🔑**

1. Admin clique sur 🔑 à côté d'un utilisateur
2. Confirmation de la réinitialisation
3. Mot de passe réinitialisé à `Test123@`
4. `first_login = 1` réactivé
5. L'utilisateur devra changer son mot de passe à la prochaine connexion

### Mot de Passe Oublié

**Page de connexion → Lien "🔑 Mot de passe oublié ?"**

- Modal avec informations de contact
- Email : support.dsi@senico.sn
- L'utilisateur contacte l'admin pour réinitialisation

---

## 🎨 Fonctionnalités par Rôle

### 👤 N+1 (Évaluateur)
- ✅ Créer des évaluations
- ✅ Sauvegarder en brouillon
- ✅ Soumettre pour validation N+2
- ✅ Consulter ses évaluations
- ✅ Signer électroniquement

### ✅ N+2 (Validateur)
- ✅ Voir évaluations en attente
- ✅ Filtrer par direction, score, date
- ✅ Tri avancé (6 options)
- ✅ Vue rapide des évaluations
- ✅ Validation individuelle avec signature
- ✅ **Validation par lot** (nouvelle !)
- ✅ Export Excel
- ✅ Consulter évaluations validées
- ✅ Télécharger PDF

### 👑 Admin (Administrateur)
- ✅ Gestion utilisateurs (CRUD complet)
- ✅ **Réinitialisation de mots de passe** 🔑
- ✅ Gestion évaluations
- ✅ Statistiques avec graphiques
- ✅ Export Excel global
- ✅ Logs d'audit
- ✅ Configuration système

---

## 📊 Technologies Utilisées

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Chart.js 4.4.1 (graphiques)
- Signature Canvas API

### Backend
- Node.js 22.18.0
- Express.js 4.18.2
- MySQL 8.2.0
- bcrypt (hachage mots de passe)

---

## 🧪 Tests

### Vérifier le fonctionnement

1. **Test de connexion**
```
http://localhost:3001/
→ Redirection automatique vers login
→ Se connecter avec admin / Test123@
```

2. **Test first login**
```
Créer un nouvel utilisateur via Dashboard Admin
Se déconnecter
Se connecter avec le nouveau compte
→ Redirection vers changement de mot de passe
```

3. **Test réinitialisation**
```
Dashboard Admin → Utilisateurs → Bouton 🔑
Confirmer la réinitialisation
Se déconnecter
Se connecter avec l'utilisateur réinitialisé
→ Redirection vers changement de mot de passe
```

---

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier que le port 3001 n'est pas utilisé
netstat -ano | findstr :3001

# Redémarrer le serveur
npm start
```

### Erreur de connexion à la base de données
```bash
# Vérifier MySQL est démarré
# Vérifier les credentials dans server/db.config.js
```

### Page blanche ou erreur 404
```bash
# Vérifier l'URL : http://localhost:3001/
# Vérifier que index.html existe à la racine
# Vider le cache du navigateur (Ctrl + Shift + Del)
```

---

## 📞 Support

**Équipe Technique SENICO SA**
- Email : support.dsi@senico.sn
- Documentation : [GUIDE-GESTION-MOTS-DE-PASSE.md](GUIDE-GESTION-MOTS-DE-PASSE.md)

---

## 📝 Notes de Version

### Version 2.1 (26 décembre 2025)
- ✨ First login pour admin
- ✨ Réinitialisation de mot de passe par admin
- ✨ Colonne "First Login" dans tableau utilisateurs
- ✨ Bouton 🔑 de réinitialisation
- 📚 Documentation complète

### Version 2.0 (25 décembre 2025)
- ✨ Page N+2 améliorée (validation par lot, filtres, tri)
- ✨ Sécurité renforcée (nettoyage sessions, index.html)
- ✨ Dashboard admin avec Chart.js
- 🎨 UI/UX améliorée

---

**© 2025 SENICO SA - Tous droits réservés**
" 
