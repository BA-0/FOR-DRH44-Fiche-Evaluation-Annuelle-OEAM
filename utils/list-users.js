const mysql = require('mysql2/promise');

async function listUsers() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'senico_evaluation'
    });
    
    console.log('\n👥 UTILISATEURS DANS LA BASE DE DONNÉES\n');
    console.log('═══════════════════════════════════════════════\n');
    
    const [users] = await connection.query('SELECT id, username, name, email, role, is_active FROM users ORDER BY role, name');
    
    const roles = { N1: [], N2: [] };
    
    users.forEach(user => {
        roles[user.role] = roles[user.role] || [];
        roles[user.role].push(user);
    });
    
    console.log('📝 ÉVALUATEURS (N+1):');
    console.log('─────────────────────────────────────────────');
    if (roles.N1.length > 0) {
        roles.N1.forEach(user => {
            const status = user.is_active ? '✅' : '❌';
            console.log(`${status} ${user.name}`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Email: ${user.email || 'N/A'}`);
            console.log('');
        });
    } else {
        console.log('   Aucun évaluateur trouvé\n');
    }
    
    console.log('✅ VALIDATEURS (N+2):');
    console.log('─────────────────────────────────────────────');
    if (roles.N2.length > 0) {
        roles.N2.forEach(user => {
            const status = user.is_active ? '✅' : '❌';
            console.log(`${status} ${user.name}`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Email: ${user.email || 'N/A'}`);
            console.log('');
        });
    } else {
        console.log('   Aucun validateur trouvé\n');
    }
    
    console.log('═══════════════════════════════════════════════');
    console.log(`Total: ${users.length} utilisateurs (${roles.N1.length} N+1, ${roles.N2.length} N+2)\n`);
    
    await connection.end();
}

listUsers().catch(console.error);
