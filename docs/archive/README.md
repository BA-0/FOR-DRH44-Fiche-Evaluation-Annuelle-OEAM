# 📋 Système d'Évaluation 100% Digital - Zéro Papier

## 📋 Vue d'ensemble

Système complet de gestion des évaluations professionnelles entièrement en ligne, avec signatures électroniques, workflow automatisé et **base de données MySQL**.

## ✨ Fonctionnalités principales

### 🔐 Pour N+1 (Évaluateur)
- ✅ Formulaire d'évaluation interactif en ligne
- ✅ Sauvegarde automatique en base de données MySQL
- ✅ Signature électronique avec canvas
- ✅ Calcul automatique des scores
- ✅ Soumission directe à N+2 par email

### 📧 Pour N+2 (Validateur)
- ✅ Interface dédiée de validation
- ✅ Tableau de bord avec statistiques
- ✅ Visualisation complète des évaluations
- ✅ Signature électronique de validation
- ✅ Téléchargement PDF automatique

### 🎯 Avantages
- 🌱 **Zéro papier** - 100% digital
- ⚡ **Rapide** - Soumission instantanée
- 🔒 **Sécurisé** - Mots de passe hashés avec bcrypt
- 📊 **Traçable** - Historique complet dans audit_log
- 📱 **Responsive** - Fonctionne sur mobile et tablette
- 💪 **Production-ready** - Base de données MySQL professionnelle

## 🚀 Installation et Démarrage

### Prérequis
- ✅ **WAMP Server** installé et démarré (icône verte 🟢)
- ✅ Node.js version 14 ou supérieure
- ✅ npm (inclus avec Node.js)

### Installation Rapide

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Créer la base de données MySQL**
   - Ouvrir phpMyAdmin : http://localhost/phpmyadmin
   - Cliquer sur l'onglet "SQL"
   - Copier tout le contenu du fichier `database.sql`
   - Coller et cliquer sur "Exécuter"
   - ✅ Vous devriez voir : "Base de données créée avec succès!"

3. **Démarrer le serveur**
   ```bash
   npm start
   ```
   
   ✅ Vous devriez voir :
   ```
   ✅ Connexion à MySQL réussie!
   🚀 SERVEUR D'ÉVALUATION DÉMARRÉ
   📍 URL: http://localhost:3001
   ```

📖 **Guide détaillé** : Voir [DEMARRAGE-RAPIDE.md](DEMARRAGE-RAPIDE.md)

4. **Ouvrir votre navigateur**
   - Formulaire d'évaluation : http://localhost:3000/formulaire-online.html
   - Espace de validation N+2 : http://localhost:3000/validation.html

## 📱 Utilisation

### 👤 Workflow pour N+1 (Évaluateur)

1. **Accéder au formulaire**
   - Ouvrir `http://localhost:3000/formulaire-online.html`

2. **Remplir l'évaluation**
   - Informations générales
   - Objectifs et indicateurs
   - Évaluation des compétences
   - Observations

3. **Signer électroniquement**
   - Saisir nom et date
   - Dessiner la signature sur le canvas (souris ou doigt)
   - Obtenir la signature de l'évalué (N)

4. **Sauvegarder et soumettre**
   - Cliquer sur "💾 Sauvegarder Brouillon" (optionnel)
   - Cliquer sur "✅ Soumettre à N+2"
   - Le N+2 reçoit automatiquement une notification

### 👔 Workflow pour N+2 (Validateur)

1. **Accéder à l'espace de validation**
   - Ouvrir `http://localhost:3000/validation.html`

2. **Entrer votre email**
   - Saisir l'adresse email renseignée dans le formulaire
   - Cliquer sur "🔍 Charger mes évaluations"

3. **Consulter les évaluations**
   - Voir les statistiques en temps réel
   - Consulter le détail de chaque évaluation
   - Cliquer sur "👁️ Voir le détail complet" pour voir tout le formulaire

4. **Valider**
   - Cliquer sur "✅ Valider cette évaluation"
   - Saisir nom et date
   - Apposer votre signature électronique
   - Confirmer la validation

5. **Archivage**
   - L'évaluation validée est automatiquement archivée
   - Statut mis à jour en temps réel

## 🗂️ Structure des fichiers

```
formulaire evaluation/
│
├── server.js                 # Serveur Node.js + API REST
├── package.json             # Dépendances du projet
├── evaluations.json         # Base de données (créée automatiquement)
│
├── formulaire-online.html   # Page de formulaire pour N+1
├── formulaire-online.js     # Logique du formulaire
│
├── validation.html          # Page de validation pour N+2
├── validation.js            # Logique de validation
│
└── README.md               # Ce fichier
```

## 🔧 Configuration avancée

### Modifier le port du serveur

Éditer `server.js` ligne 6 :
```javascript
const PORT = 3000; // Changer ici
```

### Activer l'envoi d'emails (optionnel)

1. Installer nodemailer (déjà inclus)
2. Configurer les paramètres SMTP dans `server.js`
3. Décommenter la fonction `sendEmailNotification`

Exemple de configuration :
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.entreprise.com',
    port: 587,
    secure: false,
    auth: {
        user: 'votre-email@entreprise.com',
        pass: 'votre-mot-de-passe'
    }
});
```

## 📊 API REST

Le serveur expose les endpoints suivants :

### Évaluations
- `POST /api/evaluations` - Créer une nouvelle évaluation
- `GET /api/evaluations` - Obtenir toutes les évaluations
- `GET /api/evaluations/:id` - Obtenir une évaluation spécifique
- `PUT /api/evaluations/:id` - Mettre à jour une évaluation
- `POST /api/evaluations/:id/submit` - Soumettre à N+2
- `POST /api/evaluations/:id/validate` - Valider par N+2
- `GET /api/evaluations/pending/:email` - Évaluations en attente pour un email

## 🔐 Sécurité

### Recommandations pour la production

1. **Authentification**
   - Ajouter un système de login (JWT, OAuth)
   - Vérifier les permissions utilisateur

2. **Base de données**
   - Utiliser MongoDB, PostgreSQL ou MySQL
   - Chiffrer les données sensibles

3. **HTTPS**
   - Activer SSL/TLS
   - Utiliser des certificats valides

4. **Validation**
   - Valider toutes les entrées utilisateur
   - Protéger contre les injections

## 🎨 Personnalisation

### Modifier les couleurs

Éditer les gradients dans les fichiers HTML :
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Ajouter des champs

1. Ajouter le champ HTML dans `formulaire-online.html`
2. Mettre à jour `collectFormData()` dans `formulaire-online.js`
3. Mettre à jour la structure de données dans `server.js`

## 🐛 Dépannage

### Le serveur ne démarre pas
- Vérifier que Node.js est installé : `node --version`
- Vérifier que le port 3000 est libre
- Réinstaller les dépendances : `npm install`

### Les évaluations ne se sauvent pas
- Vérifier que le serveur est démarré
- Vérifier la console du navigateur (F12)
- Vérifier les logs du serveur

### Les signatures ne s'affichent pas
- Vérifier que JavaScript est activé
- Essayer un autre navigateur
- Vider le cache du navigateur

## 📞 Support

Pour toute question ou assistance :
- Consulter la documentation
- Vérifier les logs du serveur
- Contacter l'équipe de développement

## 🚀 Prochaines étapes

- [ ] Intégration avec Active Directory
- [ ] Export PDF automatique
- [ ] Dashboard analytics pour la DRH
- [ ] Application mobile native
- [ ] Rappels automatiques par email
- [ ] Multi-langues (FR/EN)

## 📄 Licence

© 2025 - Système d'évaluation digital
Tous droits réservés.

---

**Développé avec ❤️ pour un monde sans papier 🌱**
