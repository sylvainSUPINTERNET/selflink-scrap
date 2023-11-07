import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { configuration } from './stmpClientOvhConfiguration';

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