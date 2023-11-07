import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface IEmail {
    from: string;
    to: string;
    envolope: {
        from : string;
        to: string;
    }
}

const startSmtpConn = ():nodemailer.Transporter | null => {
    let transporter:nodemailer.Transporter = nodemailer.createTransport(configuration.smtp.ovh as SMTPTransport.Options);

    transporter.verify( (error, success) => {
        if ( error ) {
            console.log("Failed to send email", error);
            return null;
        } else {
            console.log("SMTP ovh is ready to take our messages")
        }     
    });

    return transporter;
}


const sendEmail  = () => {
    const stmpConn = startSmtpConn();

    if ( stmpConn !== null ) {


    }
}