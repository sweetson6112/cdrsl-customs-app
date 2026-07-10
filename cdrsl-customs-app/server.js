const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

const app = express();

// Serve the frontend interface automatically from the public directory
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.memoryStorage();
const upload = multer.array('attachments'); 

app.post('/send-email', upload, (req, res) => {
    const { host, port, user, pass, to, subject, body } = req.body;

    let transporter = nodemailer.createTransport({
        host: host,
        port: parseInt(port),
        secure: parseInt(port) === 465,
        auth: { user: user, pass: pass }
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