const mail = require('./key/mail.js');
const sendgrid = require('./key/sendgrid.js');
const mailer = require('@sendgrid/mail');

// init lib
const lib = {};

// random number generator
lib.sendMail = function(obj){
  // send enquiry email
  mailer.setApiKey(sendgrid[0].apiKey);
  const msg = {
    to: 'jglangton4@gmail.com',
    from: 'jordanlangton5@gmail.com',
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };

  // send mail
  mailer
  .send(msg, (error, result) => {
    if (error) {return error};
    return 'success'
  });

}

// export
module.exports = lib;
