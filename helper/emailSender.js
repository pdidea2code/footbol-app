var nodemailer = require('nodemailer');
var fs = require('fs');
var handlebars = require('handlebars');
const {queryErrorRelatedResponse, successResponse} = require('./sendResponse');

const sendMail = (data) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mitalkachhadiya951@gmail.com',
            pass: 'czxv bqed lzrj spsb'
        }
    });

    fs.readFile(data.htmlFile, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
          console.log(err);
        } else {
            var template = handlebars.compile(html);
            var replacements = {
                OTP:data.extraData.OTP,
                reset_link: data.extraData.reset_link
            };
            var htmlToSend = template(replacements);
            

            var mailOptions = {
                from: data.from,
                to: data.to,
                subject: data.sub,
                html: htmlToSend
            };
            
            transporter.sendMail(mailOptions, function(err,info) {
                if(err){
                    console.log("err");
                    return 0;
                }else{
                    return 1;
                }
            });


        }
    });

}
    module.exports.sendMail = sendMail;