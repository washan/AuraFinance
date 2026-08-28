import imaps from 'imap-simple';

const config = {
    imap: {
        user: 'jmadrigal19@gmail.com',
        password: 'gmhn wbdn vcfn eqih', // The one user provided
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000,
        tlsOptions: { rejectUnauthorized: false }
    }
};

(async () => {
    let connection;
    try {
        console.log('Connecting...');
        connection = await imaps.connect(config);
        console.log('Connected! Opening INBOX...');
        await connection.openBox('INBOX');

        const searchCriteria = ['UNSEEN', ['OR', ['FROM', 'baccredomatic.cr'], ['FROM', 'notificacionesbaccr.com']]];
        console.log('Searching...', JSON.stringify(searchCriteria));
        
        const fetchOptions = { bodies: ['HEADER'], markSeen: false };
        const results = await connection.search(searchCriteria, fetchOptions);
        
        console.log(`Found ${results.length} results.`);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        if (connection) connection.end();
    }
})();
