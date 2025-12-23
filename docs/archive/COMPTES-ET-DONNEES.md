# 📋 COMPTES ET DONNÉES CRÉÉS

## 🔐 Tous les mots de passe : `test123`

---

## 👥 VALIDATEURS (N+2) - 3 comptes

| Username | Email | Nom Complet | Rôle |
|----------|-------|-------------|------|
| `mamadou.fall` | mamadou.fall@senico.com | Mamadou FALL | N+2 |
| `fatou.diagne` | fatou.diagne@senico.com | Fatou DIAGNE | N+2 |
| `ousseynou.seck` | ousseynou.seck@senico.com | Ousseynou SECK | N+2 |

---

## 👥 ÉVALUATEURS (N+1) - 4 comptes

| Username | Email | Nom Complet | Rôle |
|----------|-------|-------------|------|
| `awa.ndiaye` | awa.ndiaye@senico.com | Awa NDIAYE | N+1 |
| `ibrahima.sarr` | ibrahima.sarr@senico.com | Ibrahima SARR | N+1 |
| `aminata.ba` | aminata.ba@senico.com | Aminata BA | N+1 |
| `moussa.gueye` | moussa.gueye@senico.com | Moussa GUEYE | N+1 |

---

## 📊 ÉVALUATIONS CRÉÉES - 5 évaluations

### 1️⃣ Cheikh THIAM - Développeur Full Stack
- **Évaluateur:** Awa NDIAYE (Chef de Projet IT)
- **Période:** Annuelle 2024
- **Direction:** DSI
- **Statut:** 📝 **DRAFT** (en cours de rédaction)
- **Score Global:** 87%
- **Objectifs:**
  - Migration vers microservices (35%) → 85%
  - Réduction temps de chargement (25%) → 92%
  - Formation développeurs juniors (20%) → 78%
  - Tests automatisés (20%) → 88%
- **Points forts:** Expertise technique exceptionnelle, innovation, respect des délais
- **Commentaire évaluateur:** "Excellent collaborateur, force de proposition. À considérer pour une promotion."

---

### 2️⃣ Mariama DIALLO - Chef de Projet Digital
- **Évaluateur:** Ibrahima SARR (Directeur Marketing Digital)
- **Période:** Semestrielle 2024
- **Direction:** Marketing & Communication
- **Statut:** ✅ **SOUMIS À N+2** (en attente validation)
- **Score Global:** 90%
- **Objectifs:**
  - Campagnes digitales ROI > 250% (40%) → 95%
  - Engagement réseaux sociaux +60% (30%) → 82%
  - Reporting automatisé (30%) → 88%
- **Points forts:** Leadership exceptionnel, créativité, maîtrise agile
- **Commentaire évaluateur:** "Performance remarquable, véritable atout pour l'entreprise. Recommande fortement pour le poste de Directrice Adjointe."
- **Signature N+1:** Ibrahima SARR - 15/12/2024

---

### 3️⃣ Amadou SOW - Analyste Data Senior
- **Évaluateur:** Aminata BA (Responsable BI)
- **Période:** Annuelle 2024
- **Direction:** Business Intelligence
- **Statut:** 🎉 **VALIDÉ PAR N+2** (complet)
- **Score Global:** 91%
- **Objectifs:**
  - Création 10 dashboards (35%) → 90%
  - Optimisation SQL -50% (30%) → 94%
  - Formation Tableau/Power BI (20%) → 85%
  - Data lake centralisé (15%) → 88%
- **Points forts:** Expertise SQL/Python niveau expert, pédagogie exceptionnelle, rigueur
- **Commentaire évaluateur:** "Collaborateur modèle, expertise technique de très haut niveau."
- **Signature N+1:** Aminata BA - 10/12/2024
- **Signature N+2:** Mamadou FALL - 18/12/2024 ✅

---

### 4️⃣ Aissatou CISSE - Chargée de Communication
- **Évaluateur:** Moussa GUEYE (Directeur de la Communication)
- **Période:** Semestrielle 2024
- **Direction:** Communication Corporate
- **Statut:** 📝 **DRAFT** (début de rédaction)
- **Score Global:** 82%
- **Objectifs:**
  - 50 publications/mois réseaux sociaux (30%) → 75%
  - Organisation 4 événements (25%) → 80%
  - Refonte site web (25%) → 70%
  - Newsletters +30% ouverture (20%) → 85%
- **Points forts:** Créativité, excellente rédaction, relationnel exceptionnel
- **Commentaire évaluateur:** "Bonne performance globale. Le retard sur le site web est compensé par l'excellence sur les autres missions."

---

### 5️⃣ Ousmane KANE - Développeur Mobile iOS/Android
- **Évaluateur:** Awa NDIAYE (Chef de Projet IT)
- **Période:** Annuelle 2024
- **Direction:** Innovation & Produits
- **Statut:** ✅ **SOUMIS À N+2** (en attente validation)
- **Score Global:** 93%
- **Objectifs:**
  - Livraison 3 apps mobiles (40%) → 100%
  - Réduction crashes -80% (25%) → 95%
  - Paiements mobiles (20%) → 90%
  - Optimisation batterie -30% (15%) → 88%
- **Points forts:** Expertise mobile exceptionnelle, code de qualité, résolution problèmes
- **Commentaire évaluateur:** "Performance exceptionnelle. Talent rare sur le marché mobile. À valoriser et fidéliser absolument."
- **Signature N+1:** Awa NDIAYE - 17/12/2024

---

## 🎯 RÉPARTITION DES STATUTS

- 📝 **Draft:** 2 évaluations (Cheikh THIAM, Aissatou CISSE)
- ✅ **Soumis N+2:** 2 évaluations (Mariama DIALLO, Ousmane KANE)
- 🎉 **Validé:** 1 évaluation (Amadou SOW)

---

## 🧪 SCÉNARIOS DE TEST

### Test 1: Connexion N+1 et création évaluation
1. Login: `awa.ndiaye` / `test123`
2. Voir les 2 évaluations de Cheikh THIAM et Ousmane KANE
3. Créer une nouvelle évaluation

### Test 2: Connexion N+1 et soumission
1. Login: `moussa.gueye` / `test123`
2. Ouvrir l'évaluation d'Aissatou CISSE (Draft)
3. Compléter et soumettre à N+2

### Test 3: Connexion N+2 et validation
1. Login: `mamadou.fall` / `test123`
2. Voir les évaluations en attente (Mariama DIALLO, Ousmane KANE)
3. Valider une évaluation avec signature

### Test 4: Téléchargement PDF
1. Login avec n'importe quel compte
2. Ouvrir l'évaluation d'Amadou SOW (Validé)
3. Cliquer "📥 Télécharger PDF"
4. Vérifier le PDF téléchargé

---

## 📈 STATISTIQUES

- **7 utilisateurs** (3 N+2, 4 N+1)
- **5 évaluations** avec données réalistes
- **20 objectifs** détaillés au total
- **25 compétences** évaluées
- **Score moyen:** 88.6%
- **Taux de complétion:** 60% (3/5 finalisées)

---

## 🚀 CONNEXION RAPIDE

**URL:** http://localhost:3001/login.html

**Exemples de login:**
- N+1: `awa.ndiaye` / `test123`
- N+2: `mamadou.fall` / `test123`
- N+2: `ousseynou.seck` / `test123`
