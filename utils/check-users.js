const fetch = require('node-fetch');
const API_URL = 'http://localhost:3001/api';

async function checkUsers() {
    console.log('\n👥 VÉRIFICATION DES UTILISATEURS\n');
    console.log('═══════════════════════════════════════════════\n');
    
    // Simuler des tentatives de login pour vérifier les rôles
    const testUsers = [
        { username: 'drh', password: 'Test123@', name: 'DRH' },
        { username: 'admin', password: 'Test123@', name: 'Admin' },
        { username: 'awa.ndiaye', password: 'test123', name: 'N1' },
        { username: 'cherif.ba', password: 'test123', name: 'N2' }
    ];

    for (const user of testUsers) {
        console.log(`👤 Test de connexion : ${user.name} (${user.username})`);
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user.username,
                    password: user.password
                })
            });
            const data = await response.json();
            if (response.ok && data.token) {
                console.log(`   ✅ Connexion réussie`);
                console.log(`   Rôle: ${data.role}`);
                console.log(`   Nom: ${data.userName}`);
                let page = 'formulaire-online.html';
                if (data.role === 'N2') page = 'validation.html';
                if (data.role === 'DRH') page = 'drh-evaluations.html';
                if (data.role === 'admin') page = 'admin-dashboard.html';
                console.log(`   Page attendue: ${page}`);
            } else {
                console.log(`   ❌ Échec: ${data.message || 'Erreur inconnue'}`);
            }
        } catch (error) {
            console.log(`   ❌ Erreur: ${error.message}`);
        }
        console.log('');
    }
    
    console.log('═══════════════════════════════════════════════\n');
}

checkUsers();
