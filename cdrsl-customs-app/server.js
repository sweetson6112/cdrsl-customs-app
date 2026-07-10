const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('attachments'); 

app.post('/send-email', upload, (req, res) => {
    const { host, port, user, pass, to, subject, body } = req.body;
    const targetPort = parseInt(port);

    let transporter = nodemailer.createTransport({
        host: host,
        port: targetPort,
        secure: targetPort === 465, 
        auth: { user: user, pass: pass },
        tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000
    });

    let mailAttachments = [];
    if (req.files) {
        mailAttachments = req.files.map(file => ({
            filename: file.originalname,
            content: file.buffer
        }));
    }

    let mailOptions = {
        from: user, // Forces the sender address to match your SMTP2GO username
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CDRSL Server running on port ${PORT}`);
});