import config = require("config");
import nodemailer = require("nodemailer");

export default function() {
  // get the config from config folder
  const mailCfg = config.get("mail");
  // Mailing stuff with node mailer and custom smtp
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport(mailCfg.nodemailer);

  // compose and send the mail
  return ({from, to, subject, body, html}) => {
    return new Promise<void>((resolve, reject) => {
      // compose the mail
      const mailOptions = {
        from: config.get("siteName") + "<" + mailCfg.from + ">",
        to,
        subject,
        text: body,
        html
      };
      // send mail
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return reject(error);
        }
        // tslint:disable-next-line:no-console
        console.log("Message sent: %s", info.messageId);
        resolve(error);
      });
    });
  };
}
