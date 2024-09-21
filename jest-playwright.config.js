const {join} = require("node:path");
module.exports = {
    launchOptions: {
        headless: false, // Choix optionnel, peut être 'true' si tu veux exécuter en mode headless
        args: [
            '--disable-web-security',
        ],
    },
    browsers: [
        {
            name: 'chromium',
            options: {
                userDataDir: join(__dirname, 'tmp_user_data'), // Chemin vers le répertoire pour les données utilisateur
                args: [
                    '--disable-web-security',
                ],
            },
        },
        // {
        //     name: 'firefox',
        //     options: {
        //         userDataDir: join(__dirname, 'tmp_user_data'), // Chemin vers le répertoire pour les données utilisateur
        //         args: [
        //             '--disable-web-security',
        //         ],
        //     },
        // },
    ],
    contextOptions: {
        javaScriptEnabled: true, // Pour s'assurer que l'API IndexedDB est accessible
    },
}
