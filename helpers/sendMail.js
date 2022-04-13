const nodemailer = require("nodemailer");

const sendMail = async (mail, title, content) => {
    let transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.PASSWORD_EMAIL,
        },
        tls: {
            rejectUnauthorized: false,
        }
    });

    let mailOptions = {
        from: process.env.USER_EMAIL,
        to: mail,
        subject: `${title}`,
        text: `Hello email: ${mail}`,
        html: `<b>Your OTP is: ${content}</b>`,
    };

    await transporter.sendMail(mailOptions, (err) => {
        if (err) {
            return res.status(500).json({
                message: `Fail to send email to ${mail}!`,
                status: false,
                err: err
            });
        }
        else {
            return res.status(200).json({
                message: `Success to send email to ${mail}!`,
                status: true,
            });
        }
    });
}

module.exports = sendMail;