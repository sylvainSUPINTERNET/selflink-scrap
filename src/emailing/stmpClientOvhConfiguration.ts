const configuration = {
    smtp: {
        ovh: {
            pool: true,
            host: "ssl0.ovh.net", // Serveur SMTP OVH
            port: 587, // Port standard avec STARTTLS
            secure: false, // `false` pour STARTTLS, `true` si vous utilisez le port 465 avec SSL
            auth: {
                user: process.env.emailOvh,
                pass: process.env.passwordOvh
            },
            tls: {
                rejectUnauthorized: true,
                minVersion: "TLSv1.2"
            }
        }

    }
}