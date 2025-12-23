# 🔄 WORKFLOW: RELATION N+1 ↔ N+2

## 📊 Vue d'ensemble

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   N (Évalué)│         │ N+1 (Chef)  │         │ N+2 (DG/Dir)│
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                        │
       │  ① Remplit formulaire │                        │
       │ ◄─────────────────────┤                        │
       │                       │                        │
       │  ② Signe              │                        │
       ├──────────────────────►│                        │
       │                       │                        │
       │                       │  ③ Soumet à N+2        │
       │                       ├───────────────────────►│
       │                       │  (email_n2)            │
       │                       │                        │
       │                       │                   ④ Reçoit │
       │                       │              notification  │
       │                       │                        │
       │                       │  ⑤ Valide/Rejette      │
       │                       │ ◄──────────────────────┤
       │                       │                        │
```

---

## 🔗 LIEN ENTRE N+1 ET N+2

### 1️⃣ **Champ Email N+2** (Base de données: `email_n2`)

📍 **Dans le formulaire** (`formulaire-online.html`):
```html
<input type="email" 
       id="emailN2" 
       name="emailN2" 
       value="ousseynou.seck@senico.sn"
       required>
```

📌 **Ce champ est crucial** : il crée le lien entre N+1 et N+2

---

### 2️⃣ **Processus de soumission**

#### Étape A: N+1 clique sur "✅ Soumettre à N+2"
```javascript
// formulaire-online.js - ligne 587
async function submitToN2() {
    // 1. Validation du formulaire
    if (!validateForm()) return;
    
    // 2. Confirmation
    if (!confirm('Soumettre à N+2 ?')) return;
    
    // 3. Appel API
    const response = await fetch(
        `${API_URL}/evaluations/${currentEvaluationId}/submit`,
        { method: 'POST' }
    );
}
```

#### Étape B: Le serveur change le statut
```javascript
// server-mysql.js - ligne 285
app.post('/api/evaluations/:id/submit', async (req, res) => {
    // Appel de la procédure stockée
    await db.query('CALL sp_submit_evaluation(?, ?)', 
                   [req.params.id, userId]);
    
    // Statut passe de 'draft' à 'submitted'
});
```

#### Étape C: Stockage dans la base de données
```sql
-- La procédure stockée sp_submit_evaluation fait:
UPDATE evaluations 
SET status = 'submitted',
    submitted_at = NOW()
WHERE id = ?;

-- ✅ L'évaluation est maintenant liée à N+2 via email_n2
```

---

### 3️⃣ **N+2 voit les évaluations en attente**

#### N+2 se connecte à `validation.html`
```javascript
// validation.js - ligne 206
async function loadPendingEvaluations() {
    // Récupère l'email du N+2 connecté
    const email = 'ousseynou.seck@senico.sn';
    
    // Appel API
    const response = await fetch(
        `/api/evaluations/pending/${email}`
    );
}
```

#### Le serveur filtre par email_n2
```javascript
// server-mysql.js - ligne 160
app.get('/api/evaluations/pending/:email', async (req, res) => {
    const sql = `
        SELECT * FROM evaluations 
        WHERE email_n2 = ?          -- ← FILTRE PAR EMAIL N+2
          AND status = 'submitted'   -- ← SEULEMENT LES SOUMISES
        ORDER BY submitted_at DESC
    `;
    
    const results = await db.query(sql, [req.params.email]);
    res.json({ success: true, evaluations: results });
});
```

---

## 📋 EXEMPLE CONCRET

### Données dans la base:

```
┌────┬──────────────┬─────────────────────────┬────────────┬────────────────┐
│ id │ evalue_nom   │ email_n2                │ status     │ submitted_at   │
├────┼──────────────┼─────────────────────────┼────────────┼────────────────┤
│ 52 │ Cherif BA    │ ousseynou.seck@senico.sn│ submitted  │ 2025-12-19...  │
│ 53 │ Moussa NDIAYE│ ousseynou.seck@senico.sn│ submitted  │ 2025-12-19...  │
│ 54 │ Fatou FALL   │ mamadou.diop@senico.sn  │ draft      │ NULL           │
└────┴──────────────┴─────────────────────────┴────────────┴────────────────┘
```

### Quand `ousseynou.seck@senico.sn` se connecte:
- ✅ Il voit les évaluations #52 et #53
- ❌ Il ne voit PAS #54 (email différent + statut draft)

### Quand `mamadou.diop@senico.sn` se connecte:
- ❌ Il ne voit RIEN (éval #54 n'est pas encore soumise)

---

## 🔐 SÉCURITÉ DU LIEN

### Vérification lors de la soumission:
```javascript
// On vérifie que l'email N+2 est renseigné
if (!document.getElementById('emailN2').value) {
    showAlert('❌ Email du N+2 requis !', 'error');
    return;
}
```

### Vérification côté serveur:
```sql
-- La procédure sp_submit_evaluation vérifie:
IF email_n2 IS NULL OR email_n2 = '' THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Email N+2 requis pour soumettre';
END IF;
```

---

## 📧 NOTIFICATION EMAIL (Optionnel)

Vous pouvez ajouter un envoi d'email automatique :

```javascript
// server-mysql.js - après la soumission
app.post('/api/evaluations/:id/submit', async (req, res) => {
    await db.query('CALL sp_submit_evaluation(?, ?)', [id, userId]);
    
    // 📧 Récupérer l'évaluation
    const [evaluation] = await db.query(
        'SELECT * FROM evaluations WHERE id = ?', [id]
    );
    
    // 📧 Envoyer email au N+2
    await sendEmail({
        to: evaluation.email_n2,
        subject: `Nouvelle évaluation à valider - ${evaluation.evalue_nom}`,
        body: `
            Bonjour,
            
            Une nouvelle évaluation nécessite votre validation :
            - Évalué: ${evaluation.evalue_nom}
            - Évaluateur: ${evaluation.evaluateur_nom}
            - Date: ${evaluation.submitted_at}
            
            Connectez-vous sur: http://localhost:3001/validation.html
        `
    });
    
    res.json({ success: true });
});
```

---

## ✅ VÉRIFICATION DU LIEN

### Test 1: Créer une évaluation
```bash
curl -X POST http://localhost:3001/api/evaluations \
  -H "Content-Type: application/json" \
  -d '{
    "evalueNom": "Test User",
    "emailN2": "n2@senico.sn"
  }'
```

### Test 2: Soumettre à N+2
```bash
curl -X POST http://localhost:3001/api/evaluations/1/submit
```

### Test 3: Vérifier que N+2 voit l'évaluation
```bash
curl http://localhost:3001/api/evaluations/pending/n2@senico.sn
```

Résultat attendu:
```json
{
  "success": true,
  "evaluations": [
    {
      "id": 1,
      "evalue_nom": "Test User",
      "email_n2": "n2@senico.sn",
      "status": "submitted"
    }
  ]
}
```

---

## 🎯 RÉSUMÉ DU LIEN N+1 → N+2

| Étape | Action | Champ clé | Fichier |
|-------|--------|-----------|---------|
| 1 | N+1 remplit `emailN2` | `email_n2` | `formulaire-online.html` |
| 2 | N+1 soumet | `status = 'submitted'` | `formulaire-online.js` |
| 3 | Serveur enregistre | `submitted_at = NOW()` | `server-mysql.js` |
| 4 | N+2 charge ses évaluations | `WHERE email_n2 = ?` | `validation.js` |
| 5 | N+2 valide | `status = 'validated'` | `validation.js` |

**🔑 Le champ `email_n2` est la clé du lien entre N+1 et N+2 !**

---

## 📊 États du formulaire

```
draft ───────► submitted ───────► validated
 (N+1)          (N+2 voit)         (N+2 valide)
```

- **draft**: En cours de remplissage par N+1
- **submitted**: Soumis à N+2, en attente de validation
- **validated**: Validé par N+2, archivé

---

## 🐛 DÉPANNAGE

### Problème: N+2 ne voit aucune évaluation

✅ **Vérifications**:
1. Email N+2 correct dans le formulaire ?
   ```sql
   SELECT email_n2 FROM evaluations WHERE id = ?;
   ```

2. Évaluation bien soumise ?
   ```sql
   SELECT status, submitted_at FROM evaluations WHERE id = ?;
   ```

3. Email N+2 correspond à celui de la connexion ?
   ```javascript
   console.log('Email connecté:', localStorage.getItem('userEmail'));
   ```

### Problème: Double soumission

✅ **Protection**:
```javascript
// formulaire-online.js
if (formStatus === 'submitted') {
    showAlert('❌ Déjà soumis !', 'error');
    return;
}
```

---

**✨ Le système fonctionne maintenant correctement !**
