const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

const app = express();

// Serve the frontend interface automatically from the public directory
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('attachments');

app.post('/send-email', upload, (req, res) => {
    const { host, port, user, pass, to, subject, body } = req.body;

    const targetPort = parseInt(port);

    let transporter = nodemailer.createTransport({
        host: host,
        port: targetPort,
        // secure must be false for port 587
        secure: targetPort === 465, 
        auth: { user: user, pass: pass },
        // Critical for cloud platforms like Render:
        tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
        },
        connectionTimeout: 10000, // 10 seconds timeout limit
        greetingTimeout: 10000
    });

    let mailAttachments = [];
    if (req.files) {
        mailAttachments = req.files.map(file => ({
            filename: file.originalname,
            content: file.buffer
        }));
    }

    let mailOptions = {
        from: user,
        to: to,
        subject: subject,
        text: body,
        attachments: mailAttachments
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Nodemailer Error Details:", error);
            return res.status(500).json({ message: 'Transmission Failed: ' + error.message });
        }
        res.status(200).json({ message: 'Email sent successfully! ID: ' + info.messageId });
    });
});

// Render sets the PORT dynamically via environment variable
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CDRSL Server running on port ${PORT}`);
});
