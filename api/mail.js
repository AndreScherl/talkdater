const nodemailer = require('nodemailer')
const config = require('config')

module.exports = function() {
	// get the config from config folder
	const mail_cfg = config.get("mail")
	// Mailing stuff with node mailer and custom smtp
	// create reusable transporter object using the default SMTP transport
	const transporter = nodemailer.createTransport(mail_cfg.nodemailer)

	// compose and send the mail
	return function({from, to, subject, body, html}) {
		return new Promise((resolve, reject) => {
			// compose the mail
			const mailOptions = {
				from: config.get("siteName") + "<" + mail_cfg.from + ">",
				to: to,
				subject: subject,
				text: body,
				html: html
			}
			// send mail
			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					return reject(error)
				}
				//console.log('Message sent: %s', info.messageId)
				resolve(error)
			})
		})
	}
}