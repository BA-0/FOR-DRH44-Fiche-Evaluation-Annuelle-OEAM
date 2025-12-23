# 🔐 Créer un nouvel utilisateur avec première connexion

## Étapes rapides

### 1️⃣ Générer le hash du mot de passe temporaire

```bash
node utils/generate-password-hash.js
```

Le script affichera le hash bcrypt pour le mot de passe `Test1234!`

### 2️⃣ Créer l'utilisateur dans phpMyAdmin

Allez sur phpMyAdmin et exécutez :

```sql
USE formulaire_evaluation;

INSERT INTO users (username, password, role, name, email, first_login, is_active) 
VALUES (
    'nom.utilisateur',                    -- Remplacez par le username
    '$2b$10$...',                         -- Collez le hash généré à l'étape 1
    'N1',                                 -- N1 pour évaluateur, N2 pour validateur
    'Prénom NOM',                         -- Nom complet
    'email@senico.com',                   -- Email
    TRUE,                                 -- TRUE = devra changer son mot de passe
    TRUE                                  -- TRUE = compte actif
);
```

### 3️⃣ Communiquer les identifiants

Donnez à l'utilisateur :
- **Username** : `nom.utilisateur`
- **Mot de passe temporaire** : `Test1234!`
- **URL** : http://localhost:3001/src/pages/login.html

### 4️⃣ Première connexion

L'utilisateur sera automatiquement redirigé vers la page de changement de mot de passe où il devra créer son propre mot de passe sécurisé.

---

## ⚙️ Utilisateurs existants

Si vous voulez que les utilisateurs **existants** ne soient PAS obligés de changer leur mot de passe :

```sql
UPDATE users SET first_login = FALSE WHERE username != 'test.user';
```

---

## 🔍 Vérifier l'état des utilisateurs

```sql
SELECT 
    username, 
    name, 
    role,
    CASE 
        WHEN first_login = 1 THEN '⚠️ Changement requis'
        ELSE '✅ OK'
    END as status
FROM users
ORDER BY first_login DESC, username;
```

---

## 📝 Exemple complet

```sql
-- 1. Créer un nouvel évaluateur
INSERT INTO users (username, password, role, name, email, first_login, is_active) 
VALUES (
    'mamadou.diallo',
    '$2b$10$0h9Wi3WYpk3XJE4/EaW2ZePJthlzwnPQkR8Xdrm3TCOzrgKK.HH2.',
    'N1',
    'Mamadou DIALLO',
    'mamadou.diallo@senico.com',
    TRUE,
    TRUE
);

-- 2. Vérifier la création
SELECT * FROM users WHERE username = 'mamadou.diallo';
```

L'utilisateur `mamadou.diallo` pourra se connecter avec le mot de passe temporaire `Test1234!` et sera obligé de le changer.

---

**SENICO SA** - Système d'Évaluation
