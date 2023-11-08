import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { configuration } from './stmpClientOvhConfiguration';
import * as jwt from 'jsonwebtoken';
export interface IEmail {
    from: string;
    to: string;
    envelope: {
        from : string;
        to: string;
    },
    subject: string,
    html: string,
    text: string,
}


// https://blog.nodemailer.com/

// ( async () => {
    
//     let t :IEmail[]= [{
//         from: process.env.emailOvh as string, 
//         to: "lapotion.store@gmail.com",       
//         envelope: {
//             from: process.env.emailOvh as string, 
//             to: "lapotion.store@gmail.com"        
//         },
//         subject: 'Message',
//         html: 'I hope this <b>message</b> gets sent!',
//         text: 'I hope this message gets sent!',
//     }];
//     poolSendEmail(t);

// })();


export const poolSendEmail  = (messages:IEmail[]) => {

    console.log(messages.length, "messages to send");
    let transporter:nodemailer.Transporter = nodemailer.createTransport(configuration.smtp.ovh as SMTPTransport.Options);

    transporter.verify( (error, success) => {
        if ( error ) {
            console.log("Failed to send email", error);
            return null;
        } else {
            console.log("SMTP ovh is ready to take our messages", success)
            if ( transporter !== null ) {
                
                console.log("Start sending emails");

                console.log(transporter.isIdle());
 
                (transporter as nodemailer.Transporter).on('idle', () => {
                    console.log("Transporter is idle");
                    while(transporter.isIdle() && messages.length ) {
                        transporter.sendMail(messages.shift() as IEmail, ( error, infos) => {
                            if ( error ) {
                                console.log("Failed to send email", error);
                            } else {
                                console.log("Email sent", infos);
                            }
                        });
                    }
                });
        
                // console.log("Stopping SMTP connection")
                // transporter.close();
            }
        }     
    });


}


export const sendEmail = (to:string) => {

    try {

        const token = jwt.sign({ email: to }, process.env.BACON_PIXEl_TOKEN_SECRET as string);

            // Create a transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'ssl0.ovh.net', // OVH SMTP server
            port: 587, // SMTP port
            secure: false, // true for 465, false for other ports
            // pool:true, // use pooled connection ( hold the app open !)
            auth: {
                user: process.env.emailOvh, // Your OVH email address
                pass: process.env.emailPasswordOvh // Your OVH email password
            }
        });

        const pixelBacon = `https://selflink-backend.onrender.com/static/bacon-pixel.png?email=${token}`;

        const template:string = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Email Template</title>
            <style>
                .email-container {
                    width: 100%;
                    max-width: 600px;
                    margin: auto;
                    text-align: center;
                }

                .email-content {
                    padding: 20px;
                    background-color: #f7f7f7;
                }

                .email-button {
                    display: inline-block;
                    padding: 10px 20px;
                    margin-top: 20px;
                    background-color: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                }

                .email-image {
                    max-width: 100%;
                    height: auto;
                }
            </style>
        </head>
        <body>
            <img src="${pixelBacon}" width="1" height="1" style="display:block; border:none; outline:none; text-decoration:none;" />

            <div class="email-container">
                <div class="email-content">
                    <h1>Hello, there!</h1>
                    <p>This is a sample email template with an image and a button.</p>
                    <a href="https://www.example.com" class="email-button">Click Me!</a>
                </div>
            </div>
        </body>
        </html>
        `;

        // Setup email data
        let mailOptions = {
            from: '"JOLY Sylvain" ' + process.env.emailOvh, // Sender address
            to: `${to}`, // List of receivers
            subject: 'Hello ✔', // Subject line
            // text: 'Hello world?', // Plain text body
            html: template // HTML body content
        };

        // Send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
        });

    } catch ( e ) {
        console.log(e);
    }
    
    
}