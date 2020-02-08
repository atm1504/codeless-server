const nodemailer = require('nodemailer');
const fs = require('fs');
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {user: 'dscappsocietyiitp@gmail.com', pass: 'appified@1504'}
});

function send_email(email,body,subject,headers) {
    transporter.sendMail({
        to: email,
        from: headers,
        subject: subject,
        html:body
    }).then(result => {
        return true;
    }).catch(err => {
        return false
    });
}
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      throw(err);
    }
  });
};

exports.deleteFile = deleteFile;

exports.send_email = send_email;
