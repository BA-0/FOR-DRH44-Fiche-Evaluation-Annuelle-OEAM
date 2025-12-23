# Guide de Sécurité et Déploiement - SENICO SA

## 🔒 Comprendre la Sécurité Web

### ⚠️ Mythes vs Réalité

#### ❌ MYTHE : "On peut cacher complètement le code source côté client"
**✅ RÉALITÉ :** Le code HTML/CSS/JavaScript est **toujours visible** dans le navigateur. C'est la nature du web.

#### ❌ MYTHE : "Désactiver le clic droit = sécurité"
**✅ RÉALITÉ :** Ce sont des mesures **symboliques et dissuasives**, facilement contournables. La vraie sécurité est **côté serveur**.

### 🎯 Où Se Trouve la Vraie Sécurité ?

#### ✅ CÔTÉ SERVEUR (Déjà implémenté dans server-mysql.js)
1. **Authentification forte** - Vérification des tokens
2. **Autorisation** - Vérification des droits d'accès
3. **Validation des données** - Ne jamais faire confiance au client
4. **Chiffrement** - Mots de passe hashés avec bcrypt
5. **HTTPS** - Communication chiffrée
6. **Rate limiting** - Prévention des attaques par force brute

#### ⚡ CÔTÉ CLIENT (Mesures complémentaires)
1. **Obfuscation** - Rendre le code difficile à lire (mais pas impossible)
2. **Minification** - Réduire la taille et la lisibilité
3. **Protections symboliques** - Désactiver clic droit, F12, etc.
4. **Ne jamais stocker de secrets** - Pas de mots de passe, clés API, etc.

---

## 🛡️ Mesures de Sécurité Mises en Place

### 1. Configuration Environnementale (config.js)

```javascript
// Détection automatique de l'environnement
const CONFIG = {
    API_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:3001/api'      // Dev
        : 'https://api.evaluation.senico.sn/api',  // Prod
};
```

**Avantages :**
- ✅ URL API automatique selon l'environnement
- ✅ Désactivation des console.log en production
- ✅ Configuration centralisée

### 2. Protections Symboliques (security.js)

```javascript
// Désactiver clic droit en production
document.addEventListener('contextmenu', function(e) {
    if (ENV === 'production') {
        e.preventDefault();
        return false;
    }
});
```

**Protections incluses :**
- ✅ Désactivation du clic droit
- ✅ Blocage de F12, Ctrl+Shift+I, Ctrl+U
- ✅ Vérification de l'intégrité du token
- ✅ Messages de sécurité dans la console

### 3. Sécurité Serveur (Déjà en place)

**Dans server-mysql.js :**
- ✅ Middleware `requireAuth` - Vérification des tokens
- ✅ Validation des emails - Empêche l'accès aux données d'autres utilisateurs
- ✅ Mots de passe hashés - bcrypt
- ✅ CORS configuré
- ✅ Protection SQL injection - Requêtes préparées

---

## 🚀 Déploiement en Production

### Étape 1 : Préparer le Serveur

#### Option A : Serveur Linux (Recommandé)
```bash
# Installer Node.js et MySQL
sudo apt update
sudo apt install nodejs npm mysql-server

# Créer un utilisateur pour l'application
sudo useradd -m -s /bin/bash senico
```

#### Option B : Hébergement Cloud
- **AWS** : EC2 + RDS
- **Azure** : App Service + Azure Database
- **DigitalOcean** : Droplet + Managed Database
- **Heroku** : Dyno + ClearDB

### Étape 2 : Configurer HTTPS

#### Avec Let's Encrypt (Gratuit)
```bash
# Installer Certbot
sudo apt install certbot

# Obtenir un certificat SSL
sudo certbot certonly --standalone -d evaluation.senico.sn
```

#### Configuration Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name evaluation.senico.sn;
    
    ssl_certificate /etc/letsencrypt/live/evaluation.senico.sn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/evaluation.senico.sn/privkey.pem;
    
    # Sécurité HTTPS
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        root /var/www/senico/;
        index login.html;
        try_files $uri $uri/ =404;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name evaluation.senico.sn;
    return 301 https://$server_name$request_uri;
}
```

### Étape 3 : Variables d'Environnement

Créer un fichier `.env` sur le serveur :

```bash
# .env
NODE_ENV=production
PORT=3001

# Base de données
DB_HOST=localhost
DB_USER=senico_user
DB_PASSWORD=MOT_DE_PASSE_FORT_ICI
DB_NAME=senico_evaluations

# Sécurité
JWT_SECRET=GENERER_UNE_CLE_SECRETE_LONGUE_ET_ALEATOIRE
SESSION_SECRET=AUTRE_CLE_SECRETE_POUR_SESSIONS

# CORS
ALLOWED_ORIGINS=https://evaluation.senico.sn
```

**⚠️ IMPORTANT :** Ne jamais commiter le fichier `.env` dans Git !

### Étape 4 : Modifier server-mysql.js pour Production

```javascript
// Utiliser les variables d'environnement
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Configuration CORS stricte en production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS.split(',')
        : '*',
    credentials: true
};

app.use(cors(corsOptions));
```

### Étape 5 : Déployer l'Application

```bash
# Sur le serveur
cd /var/www/senico/

# Copier les fichiers
scp -r * user@evaluation.senico.sn:/var/www/senico/

# Installer les dépendances
npm install --production

# Utiliser PM2 pour gérer le processus Node.js
npm install -g pm2

# Démarrer l'application
pm2 start server-mysql.js --name senico-api

# Configuration pour démarrage automatique
pm2 startup
pm2 save
```

---

## 🔐 Checklist de Sécurité Avant Production

### Côté Serveur
- [ ] Mots de passe en variables d'environnement (`.env`)
- [ ] HTTPS configuré avec certificat SSL valide
- [ ] CORS restreint aux domaines autorisés
- [ ] Rate limiting sur les routes d'authentification
- [ ] Logs d'audit activés
- [ ] Backups automatiques de la base de données
- [ ] Firewall configuré (uniquement ports 80, 443, 22)
- [ ] Base de données non accessible publiquement

### Côté Client
- [ ] Minification du JavaScript (avec `uglify-js` ou `terser`)
- [ ] Suppression des console.log en production
- [ ] Scripts `config.js` et `security.js` inclus
- [ ] Pas de secrets dans le code (tokens, clés API, etc.)
- [ ] Headers de sécurité configurés dans Nginx

### Général
- [ ] Domaine réel configuré (pas localhost)
- [ ] DNS pointant vers le serveur
- [ ] Certificat SSL valide et renouvelable automatiquement
- [ ] Monitoring et alertes configurés
- [ ] Plan de sauvegarde et restauration testé

---

## 📋 Minification du Code (Optionnel)

Pour rendre le code plus difficile à lire :

### Installation des outils
```bash
npm install -g terser html-minifier clean-css-cli
```

### Minifier JavaScript
```bash
terser dashboard.js -c -m -o dashboard.min.js
terser validation.js -c -m -o validation.min.js
terser formulaire-online.js -c -m -o formulaire-online.min.js
```

### Minifier HTML
```bash
html-minifier --collapse-whitespace --remove-comments --minify-js --minify-css login.html -o login.min.html
```

### Minifier CSS
```bash
cleancss -o senico-theme.min.css senico-theme.css
```

**Note :** En production, référencer les fichiers `.min.js` et `.min.css`

---

## 🎯 URL et Domaine

### Actuellement (Développement)
```
http://localhost:3001/login.html
```

### En Production (Exemple)
```
https://evaluation.senico.sn/login.html
```

**Pour obtenir un domaine :**
1. Acheter un nom de domaine (ex: evaluation.senico.sn)
2. Configurer les DNS pour pointer vers votre serveur
3. Installer un certificat SSL (Let's Encrypt gratuit)
4. Configurer Nginx pour servir l'application

---

## ⚠️ Points Importants à Retenir

### ✅ À FAIRE
1. **Toujours utiliser HTTPS en production**
2. **Ne jamais stocker de secrets dans le code client**
3. **Valider TOUTES les données côté serveur**
4. **Utiliser des tokens avec expiration**
5. **Implémenter le rate limiting**
6. **Faire des sauvegardes régulières**
7. **Monitorer les tentatives de connexion échouées**

### ❌ À NE PAS FAIRE
1. **Ne jamais exposer les mots de passe en clair**
2. **Ne pas faire confiance aux données du client**
3. **Ne pas utiliser HTTP en production**
4. **Ne pas commiter les fichiers `.env` dans Git**
5. **Ne pas oublier de renouveler les certificats SSL**
6. **Ne pas utiliser localhost en production**

---

## 📞 Support et Maintenance

### Logs à Surveiller
- Tentatives de connexion échouées
- Erreurs serveur
- Requêtes suspectes
- Utilisation de la bande passante

### Mises à Jour Régulières
```bash
# Mettre à jour les dépendances Node.js
npm outdated
npm update

# Mettre à jour le serveur
sudo apt update && sudo apt upgrade
```

---

## 🎓 Formation Utilisateurs

### Pour les Administrateurs
- Comment gérer les comptes utilisateurs
- Comment consulter les logs
- Comment faire des sauvegardes
- Procédures en cas d'incident

### Pour les Utilisateurs Finaux
- Bonnes pratiques de sécurité (mots de passe forts)
- Ne jamais partager ses identifiants
- Se déconnecter après utilisation
- Signaler toute activité suspecte

---

**Date de création :** 20 décembre 2024  
**Version :** 1.0  
**Auteur :** Documentation Technique SENICO SA
