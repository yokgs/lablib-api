import { Injectable } from '@nestjs/common';
import { config } from '../config/env.config';
import nodemailer from 'nodemailer';
@Injectable()
export class CategoryService {

    private transporter;

    constructor() {
        this.transporter =  nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 465,
            secure: true,
            auth: {
                user: config.EMAIL_USERNAME,
                pass: config.EMAIL_PASSWORD
            }
        });
    }

    public async sendMail(email: any, toEmail: string, subject: string) {
        let options = {
            from: 'triplateformediffusion@zohomail.com',
            to: toEmail,
            subject: subject,
            html: ' test '
        };
            
        this.transporter.sendMail(options, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        
    }
    
}

