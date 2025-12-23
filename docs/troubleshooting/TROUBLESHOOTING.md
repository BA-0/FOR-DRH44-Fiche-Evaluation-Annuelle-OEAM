# 🔍 Guide de Dépannage MySQL

## ⚠️ Problèmes courants et solutions

### 1️⃣ Le serveur ne démarre pas

#### Erreur : "Cannot connect to MySQL"

**Causes possibles :**
- ❌ WAMP Server n'est pas démarré
- ❌ MySQL n'est pas actif
- ❌ La base de données n'existe pas

**Solutions :**

1. **Vérifier que WAMP est démarré**
   - L'icône WAMP doit être **VERTE** 🟢
   - Si elle est orange 🟠 ou rouge 🔴 :
     - Clic droit sur l'icône WAMP
     - "Redémarrer tous les services"

2. **Vérifier MySQL spécifiquement**
   - Clic droit sur icône WAMP
   - MySQL > Service
   - Vérifier qu'il est démarré

3. **Tester phpMyAdmin**
   - Ouvrir http://localhost/phpmyadmin
   - Si ça ne fonctionne pas, redémarrer WAMP

4. **Créer la base de données**
   ```sql
   -- Dans phpMyAdmin, exécuter database.sql
   ```

---

### 2️⃣ Erreur "Access denied for user 'root'"

**Cause :** Le mot de passe MySQL ne correspond pas

**Solutions :**

1. **Vérifier le fichier db.config.js**
   ```javascript
   {
       user: 'root',
       password: '',  // Doit être VIDE par défaut dans WAMP
   }
   ```

2. **Si vous avez changé le mot de passe root dans MySQL**
   - Modifiez `password: ''` dans db.config.js
   - Mettez le bon mot de passe

3. **Réinitialiser le mot de passe MySQL (si oublié)**
   - Dans WAMP : Clic droit > MySQL > Console MySQL
   - Tapez le mot de passe actuel (vide par défaut = appuyez Enter)
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY '';
   FLUSH PRIVILEGES;
   ```

---

### 3️⃣ Erreur "Database 'formulaire_evaluation' does not exist"

**Cause :** La base de données n'a pas été créée

**Solution :**

1. **Ouvrir phpMyAdmin** : http://localhost/phpmyadmin
2. **Cliquer sur "SQL"** (en haut)
3. **Ouvrir database.sql** avec Notepad
4. **Copier TOUT le contenu**
5. **Coller dans phpMyAdmin**
6. **Cliquer "Exécuter"**
7. **Vérifier** : Vous devriez voir "formulaire_evaluation" dans la liste des bases

---

### 4️⃣ Les utilisateurs ne peuvent pas se connecter

#### Erreur : "Identifiants incorrects"

**Vérifications :**

1. **Vérifier que les utilisateurs existent dans la base**
   ```sql
   -- Dans phpMyAdmin
   USE formulaire_evaluation;
   SELECT username, role, name FROM users;
   ```
   
   Vous devriez voir :
   ```
   evaluateur | N1 | Jean Dupont
   validateur | N2 | Marie Martin
   ```

2. **Si la table est vide**
   - Réexécutez la partie INSERT du fichier database.sql
   ```sql
   INSERT INTO users (username, password, role, name, email) VALUES
   ('evaluateur', '$2b$10$JwwV.yB1DNCKv7YLmXo1kuRcqdaGJyHE0NPPZ3943.Rd0zzM8vWeG', 'N1', 'Jean Dupont', 'jean.dupont@entreprise.com'),
   ('validateur', '$2b$10$F3MFXYS8tteUOZaCUDw3neNr.DOtxBCdhokvmNZfWHBhhyelL.9Iy', 'N2', 'Marie Martin', 'marie.martin@entreprise.com');
   ```

3. **Vérifier les informations de connexion**
   - Username : `evaluateur` (tout en minuscules)
   - Password : `eval123`
   - Role : Sélectionner **N+1**

---

### 5️⃣ Le nom ne s'affiche pas (affiche "evaluateur" au lieu de "Jean Dupont")

✅ **Ce problème est RÉSOLU avec MySQL !**

Si vous voyez toujours le username au lieu du nom complet :

1. **Vérifier les données dans la base**
   ```sql
   SELECT username, name FROM users WHERE username = 'evaluateur';
   ```
   Doit retourner : `Jean Dupont`

2. **Vider le cache du navigateur**
   - F12 > Application > Local Storage
   - Clic droit > Clear
   - Ou tapez dans la console :
   ```javascript
   localStorage.clear();
   ```

3. **Se reconnecter**
   - Le nom devrait maintenant s'afficher : **👤 Jean Dupont**

---

### 6️⃣ Port 3001 déjà utilisé

**Erreur :** "EADDRINUSE: address already in use :::3001"

**Cause :** Un autre serveur utilise déjà le port 3001

**Solutions :**

1. **Fermer l'ancien serveur**
   - Cherchez la fenêtre terminal avec "node server"
   - Appuyez sur Ctrl+C pour arrêter

2. **Ou changer le port**
   - Ouvrir server-mysql.js
   - Changer `const PORT = 3001;` en `const PORT = 3002;`
   - Redémarrer le serveur

---

### 7️⃣ Module 'mysql2' not found

**Erreur :** "Cannot find module 'mysql2'"

**Cause :** Les dépendances ne sont pas installées

**Solution :**
```bash
npm install mysql2 bcrypt
```

---

### 8️⃣ Module 'bcrypt' not found

**Erreur :** "Cannot find module 'bcrypt'"

**Solutions :**

1. **Installer bcrypt**
   ```bash
   npm install bcrypt
   ```

2. **Si l'installation échoue (problème de compilation)**
   ```bash
   # Désinstaller d'abord
   npm uninstall bcrypt
   
   # Installer la version précompilée
   npm install bcrypt --build-from-source=false
   ```

3. **Alternative (si bcrypt ne fonctionne vraiment pas)**
   ```bash
   npm install bcryptjs
   ```
   Puis modifier server-mysql.js :
   ```javascript
   const bcrypt = require('bcryptjs'); // au lieu de 'bcrypt'
   ```

---

### 9️⃣ WAMP est orange 🟠 (pas vert)

**Causes possibles :**
- Un service n'est pas démarré correctement
- Conflit de port

**Solutions :**

1. **Identifier le problème**
   - Clic droit sur icône WAMP > Outils > Tester le port 80
   - Si utilisé : un autre logiciel utilise le port (Skype, IIS, etc.)

2. **Changer le port Apache (si 80 est occupé)**
   - Clic gauche sur WAMP > Apache > httpd.conf
   - Chercher `Listen 80`
   - Remplacer par `Listen 8080`
   - Redémarrer WAMP
   - Accéder à phpMyAdmin via : http://localhost:8080/phpmyadmin

3. **Vérifier MySQL (port 3306)**
   - Clic gauche sur WAMP > MySQL > my.ini
   - Vérifier `port = 3306`
   - Si occupé, le changer en 3307 et modifier db.config.js

---

### 🔟 Les évaluations ne se sauvegardent pas

**Vérifications :**

1. **Vérifier les logs du serveur**
   - Regarder la console où tourne `npm start`
   - Chercher les erreurs SQL

2. **Tester manuellement dans phpMyAdmin**
   ```sql
   INSERT INTO evaluations (
       evalue_nom, evaluateur_nom, status
   ) VALUES (
       'Test', 'Test Evaluateur', 'draft'
   );
   
   SELECT * FROM evaluations;
   ```

3. **Vérifier les permissions**
   ```sql
   SHOW GRANTS FOR 'root'@'localhost';
   ```

---

## 🧰 Outils de diagnostic

### Test de connexion MySQL

Créez un fichier `test-mysql.js` :

```javascript
const mysql = require('mysql2/promise');

async function test() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'formulaire_evaluation'
        });
        
        console.log('✅ Connexion réussie!');
        
        const [rows] = await connection.query('SELECT * FROM users');
        console.log('👥 Utilisateurs:', rows);
        
        await connection.end();
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

test();
```

Exécuter : `node test-mysql.js`

---

### Test bcrypt

Créez un fichier `test-bcrypt.js` :

```javascript
const bcrypt = require('bcrypt');

async function test() {
    const password = 'eval123';
    const hash = '$2b$10$JwwV.yB1DNCKv7YLmXo1kuRcqdaGJyHE0NPPZ3943.Rd0zzM8vWeG';
    
    const match = await bcrypt.compare(password, hash);
    console.log('Password:', password);
    console.log('Match:', match ? '✅ OK' : '❌ Incorrect');
}

test();
```

Exécuter : `node test-bcrypt.js`

---

## 📞 Checklist de vérification complète

Avant de demander de l'aide, vérifiez :

- [ ] WAMP Server est démarré (icône verte 🟢)
- [ ] phpMyAdmin est accessible (http://localhost/phpmyadmin)
- [ ] La base de données `formulaire_evaluation` existe
- [ ] Les 3 tables existent : users, evaluations, audit_log
- [ ] Les 2 utilisateurs existent dans la table users
- [ ] Les modules npm sont installés (`npm install`)
- [ ] Le serveur démarre sans erreur (`npm start`)
- [ ] Le fichier db.config.js a les bons paramètres
- [ ] Le port 3001 est libre

---

## 🎯 Commandes utiles

```bash
# Vérifier la version de Node.js
node --version

# Vérifier les modules installés
npm list mysql2 bcrypt

# Réinstaller toutes les dépendances
npm install

# Nettoyer et réinstaller
rm -rf node_modules
npm install

# Tester la connexion
node test-mysql.js

# Générer un nouveau hash
npm run hash monMotDePasse
```

---

## 🆘 Besoin d'aide supplémentaire ?

Si le problème persiste :

1. **Vérifier les logs du serveur** (terminal où tourne npm start)
2. **Vérifier la console du navigateur** (F12)
3. **Vérifier les logs MySQL** (dans phpMyAdmin ou my.ini)
4. **Consulter la documentation** : README.md, MIGRATION.md

---

✅ **Dans 99% des cas, le problème vient de :**
1. WAMP pas démarré ou orange
2. Base de données pas créée
3. Modules npm pas installés
4. Mauvais mot de passe MySQL dans db.config.js
