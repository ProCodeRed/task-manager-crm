const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'vipinyadav1305@gmail.com',
        subject: 'Welcome to The company',
        text: `Welcome to company, ${name}. Let me know how you feels.`
    }).then(() => {}, error => {
            console.error(error);
        
            if (error.response) {
              console.error(error.response.body)
            }
        });
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'vipinyadav1305@gmail.com',
        subject: 'Goodbye from The company',
        text: `Have a bright future, ${name}. Let me know how you feels.`
    }).then(() => {}, error => {
        console.error(error);
    
        if (error.response) {
          console.error(error.response.body)
        }
    });
}

module.exports = {
    sendWelcomeEmail: sendWelcomeEmail,
    sendGoodbyeEmail: sendGoodbyeEmail
}

