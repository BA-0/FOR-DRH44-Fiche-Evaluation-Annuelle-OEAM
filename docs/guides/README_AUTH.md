# 🌐 Système d'Évaluation 100% Digital - Avec Authentification

Application web complète pour la gestion des évaluations professionnelles avec workflow N / N+1 / N+2, **authentification sécurisée** et génération de PDF.

## ✨ Fonctionnalités Principales

### 🔐 Authentification et Sécurité
- **Connexion sécurisée** avec identifiant et mot de passe
- **Rôles séparés** : N+1 (Évaluateur) et N+2 (Validateur)
- **Sessions utilisateur** avec gestion des tokens
- **Protection des pages** : redirection automatique si non authentifié
- **Déconnexion sécurisée** avec confirmation

### 📝 Formulaire d'Évaluation (N+1)
- **Informations générales** complètes avec date
- **Section I** : Évaluation des résultats (5 objectifs avec indicateurs)
- **Section II** : Évaluation du savoir-faire et savoir-être (30 critères)
  - 10 Qualités Professionnelles
  - 10 Qualités Personnelles
  - 10 Qualités Relationnelles
- **Section III** : Score final automatique (N°1 + N°2) / 2
- **Section IV** : Remarques et observations
  - De l'évaluateur sur l'évalué (points forts, faibles, axes de progrès)
  - De l'évalué sur lui-même (réussites, difficultés, souhaits)
- **Section V** : Signatures électroniques (N, N+1, N+2)
- **Calcul automatique** de tous les scores
- **Sauvegarde automatique** en brouillon
- **Validation** avant soumission

### ✅ Validation N+2
- **Tableau de bord** avec statistiques en temps réel
- **Liste des évaluations** en attente et validées
- **Détails complets** de chaque évaluation
- **Signature électronique** pour validation
- **📥 Téléchargement PDF** après validation
- **Envoi par email** à la DRH (après téléchargement)

### 📄 Génération de PDF
- **PDF professionnel** avec toutes les sections
- **Signatures intégrées** dans le document
- **Mise en page optimisée** pour impression
- **En-tête et pied de page** personnalisés
- **Nom de fichier automatique** : `Evaluation_NomPrenom_Annee.pdf`

## 🚀 Démarrage Rapide

### Prérequis
- Node.js (version 14 ou supérieure)
- npm

### Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur
npm start
```

Le serveur démarre sur : **http://localhost:3001**

### 🔑 Accès à l'Application

1. **Page de connexion** : http://localhost:3001/login.html

#### Identifiants de démonstration

**Pour N+1 (Évaluateur) :**
- Identifiant : `evaluateur`
- Mot de passe : `eval123`

**Pour N+2 (Validateur) :**
- Identifiant : `validateur`
- Mot de passe : `valid123`

## 📊 Workflow Complet

```
┌─────────────────────────────────────────────────────────────┐
│                    1. CONNEXION (N+1)                        │
│              http://localhost:3001/login.html                │
│          Identifiant: evaluateur / MDP: eval123              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              2. REMPLIR LE FORMULAIRE (N+1)                  │
│        http://localhost:3001/formulaire-online.html          │
│   • Informations générales                                  │
│   • Objectifs (5) avec indicateurs                          │
│   • Compétences (30 critères)                               │
│   • Observations (N+1 et N)                                 │
│   • Signatures électroniques (N et N+1)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              3. SOUMETTRE À N+2                              │
│   • Notification automatique envoyée                        │
│   • Statut : "Soumis"                                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              4. CONNEXION (N+2)                              │
│              http://localhost:3001/login.html                │
│          Identifiant: validateur / MDP: valid123             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              5. VALIDATION (N+2)                             │
│          http://localhost:3001/validation.html               │
│   • Voir les évaluations en attente                         │
│   • Vérifier les détails et scores                          │
│   • Signer électroniquement                                 │
│   • Valider                                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│          6. TÉLÉCHARGER LE PDF ET ENVOYER À DRH             │
│   • Bouton "📥 Télécharger le PDF" apparaît                 │
│   • PDF généré avec toutes les signatures                   │
│   • Envoyer le PDF par email à la DRH                       │
│   • Archivage numérique                                     │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Structure du Projet

```
formulaire-evaluation/
├── server.js                   # Serveur Node.js + API REST + Authentification
├── package.json                # Configuration npm
├── evaluations.json            # Base de données (générée auto)
├── login.html                  # Page de connexion
├── formulaire-online.html      # Formulaire N+1
├── formulaire-online.js        # Logique du formulaire
├── validation.html             # Interface N+2
├── validation.js               # Logique de validation
├── pdf-generator.js            # Générateur de PDF
└── README.md                   # Documentation
```

## 🔧 Technologies Utilisées

- **Backend** : Node.js + Express
- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Signatures** : HTML5 Canvas API
- **PDF** : jsPDF
- **Stockage** : JSON (fichier local)
- **CORS** : Activé pour développement

## 🔒 Sécurité

### Version de Démonstration
- Authentification simple (identifiants en mémoire)
- Tokens basiques en Base64
- localStorage pour les sessions

### Pour la Production (Recommandations)
- Utiliser **JWT** (JSON Web Tokens)
- Hasher les mots de passe avec **bcrypt**
- Base de données sécurisée (PostgreSQL, MongoDB)
- HTTPS obligatoire
- Variables d'environnement pour les secrets
- Rate limiting sur les routes d'authentification
- Validation des entrées côté serveur
- Protection CSRF

## 📥 Téléchargement PDF

Après la validation par N+2, un bouton "📥 Télécharger le PDF" apparaît sur chaque évaluation validée.

Le PDF généré contient :
- Toutes les informations de l'évaluation
- Les 5 objectifs avec indicateurs
- Les 30 critères de compétences
- Toutes les observations
- Les 3 signatures électroniques (N, N+1, N+2)
- Mise en page professionnelle
- En-tête et pied de page

Le fichier est automatiquement téléchargé avec le nom : `Evaluation_NomPrenom_2025.pdf`

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier si le port 3001 est occupé
netstat -ano | findstr :3001

# Tuer les processus Node.js
taskkill /F /IM node.exe
```

### Erreur de connexion
- Vérifier que le serveur est bien démarré
- Ouvrir la console du navigateur (F12)
- Vérifier l'URL de l'API dans les fichiers JS
- Vider le cache et localStorage

### Le PDF ne se génère pas
- Vérifier que jsPDF est bien chargé (console F12)
- Vérifier que l'évaluation est bien validée
- Consulter les erreurs dans la console
- Vérifier que toutes les données sont présentes

### Redirection vers login en boucle
- Vider le localStorage du navigateur
- Se reconnecter avec les bons identifiants

## 📄 Licence

Projet de démonstration - À adapter selon vos besoins

---

**🎉 Système 100% Digital - Authentification - Signatures Électroniques - Génération PDF**
