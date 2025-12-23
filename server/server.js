// Serveur Node.js pour la gestion des évaluations
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// Base de données simple (fichier JSON)
const DB_FILE = path.join(__dirname, 'evaluations.json');

// Utilisateurs de démonstration (en production, utiliser une vraie base de données avec mots de passe hashés)
const DEMO_USERS = {
    'evaluateur': { password: 'eval123', role: 'N1', name: 'Jean Dupont', email: 'jean.dupont@entreprise.com' },
    'validateur': { password: 'valid123', role: 'N2', name: 'Marie Martin', email: 'marie.martin@entreprise.com' }
};

// Initialiser la base de données si elle n'existe pas
async function initDB() {
    try {
        await fs.access(DB_FILE);
    } catch {
        await fs.writeFile(DB_FILE, JSON.stringify({ evaluations: [], users: [] }, null, 2));
    }
}

// Lire la base de données
async function readDB() {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
}

// Écrire dans la base de données
async function writeDB(data) {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Routes API

// Route de connexion
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        
        const user = DEMO_USERS[username];
        
        if (!user || user.password !== password || user.role !== role) {
            return res.status(401).json({ 
                success: false, 
                message: 'Identifiants incorrects ou rôle invalide' 
            });
        }
        
        // Générer un token simple (en production, utiliser JWT)
        const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
        
        res.json({
            success: true,
            token: token,
            role: user.role,
            userName: user.name,
            email: user.email
        });
    } catch (error) {
        console.error('Erreur de connexion:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Vérifier l'authentification (middleware simple)
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    next();
}

// Créer une nouvelle évaluation
app.post('/api/evaluations', async (req, res) => {
    try {
        const db = await readDB();
        const evaluation = {
            id: Date.now().toString(),
            ...req.body,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        db.evaluations.push(evaluation);
        await writeDB(db);
        res.json({ success: true, evaluation });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtenir toutes les évaluations
app.get('/api/evaluations', async (req, res) => {
    try {
        const db = await readDB();
        res.json({ success: true, evaluations: db.evaluations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtenir une évaluation par ID
app.get('/api/evaluations/:id', async (req, res) => {
    try {
        const db = await readDB();
        const evaluation = db.evaluations.find(e => e.id === req.params.id);
        if (!evaluation) {
            return res.status(404).json({ success: false, error: 'Évaluation non trouvée' });
        }
        res.json({ success: true, evaluation });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Mettre à jour une évaluation
app.put('/api/evaluations/:id', async (req, res) => {
    try {
        const db = await readDB();
        const index = db.evaluations.findIndex(e => e.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Évaluation non trouvée' });
        }
        db.evaluations[index] = {
            ...db.evaluations[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        await writeDB(db);
        res.json({ success: true, evaluation: db.evaluations[index] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Soumettre une évaluation à N+2
app.post('/api/evaluations/:id/submit', async (req, res) => {
    try {
        const db = await readDB();
        const index = db.evaluations.findIndex(e => e.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Évaluation non trouvée' });
        }
        
        db.evaluations[index].status = 'submitted';
        db.evaluations[index].submittedAt = new Date().toISOString();
        db.evaluations[index].updatedAt = new Date().toISOString();
        
        await writeDB(db);
        
        // Envoyer notification email (à implémenter avec nodemailer)
        await sendEmailNotification(db.evaluations[index]);
        
        res.json({ success: true, evaluation: db.evaluations[index] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Valider une évaluation par N+2
app.post('/api/evaluations/:id/validate', async (req, res) => {
    try {
        const db = await readDB();
        const index = db.evaluations.findIndex(e => e.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Évaluation non trouvée' });
        }
        
        db.evaluations[index].status = 'validated';
        db.evaluations[index].validatedAt = new Date().toISOString();
        db.evaluations[index].signatures.N2 = req.body.signature;
        db.evaluations[index].updatedAt = new Date().toISOString();
        
        await writeDB(db);
        res.json({ success: true, evaluation: db.evaluations[index] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Obtenir les évaluations en attente pour N+2
app.get('/api/evaluations/pending/:email', async (req, res) => {
    try {
        const db = await readDB();
        const pendingEvaluations = db.evaluations.filter(
            e => e.emailN2 === req.params.email && e.status === 'submitted'
        );
        res.json({ success: true, evaluations: pendingEvaluations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Fonction d'envoi d'email (simulation)
async function sendEmailNotification(evaluation) {
    console.log(`📧 Email envoyé à ${evaluation.emailN2}`);
    console.log(`Évaluation de ${evaluation.evalueNom} prête pour validation`);
    console.log(`Lien: http://localhost:${PORT}/validation.html?id=${evaluation.id}`);
    // Implémenter avec nodemailer pour production
}

// Route pour obtenir une évaluation complète (pour génération PDF)
app.get('/api/evaluations/:id/full', async (req, res) => {
    try {
        const db = await readDB();
        const evaluation = db.evaluations.find(e => e.id === req.params.id);
        if (!evaluation) {
            return res.status(404).json({ success: false, error: 'Évaluation non trouvée' });
        }
        res.json({ success: true, evaluation });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Démarrer le serveur
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
        console.log(`🔐 Page de connexion: http://localhost:${PORT}/login.html`);
        console.log(`📋 Formulaire d'évaluation: http://localhost:${PORT}/formulaire-online.html`);
        console.log(`✅ Validation N+2: http://localhost:${PORT}/validation.html`);
    });
});
