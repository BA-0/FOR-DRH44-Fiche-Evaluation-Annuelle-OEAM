// Module de gestion de la base de données MySQL
const mysql = require('mysql2/promise');
const dbConfig = require('./db.config');

// Créer le pool de connexions
const pool = mysql.createPool(dbConfig);

// Tester la connexion
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connexion à MySQL réussie!');
        console.log(`📊 Base de données: ${dbConfig.database}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion à MySQL:', error.message);
        console.error('💡 Vérifiez que:');
        console.error('   - WAMP Server est démarré');
        console.error('   - MySQL est actif (icône verte)');
        console.error('   - La base de données existe (exécutez database.sql)');
        console.error('   - Les paramètres dans db.config.js sont corrects');
        return false;
    }
}

// Fonction utilitaire pour exécuter une requête
async function query(sql, params = []) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Erreur SQL:', error.message);
        throw error;
    }
}

// Fonction utilitaire pour les transactions
async function transaction(callback) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    query,
    transaction,
    testConnection
};
