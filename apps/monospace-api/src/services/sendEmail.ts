import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';

interface IEmailParams {
  email: string;
  verificationToken?: string | undefined;
  resetToken?: string | undefined;
}

const sendEmail = async ({
  email,
  verificationToken,
  resetToken,
}: IEmailParams) => {

  const backend_url = process.env.BACKEND_URL;
  // const frontend_url = process.env.FRONTEND_URL;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const currentWorkingDirectory = process.cwd();

  let fullPath: string;

  if (resetToken !== undefined) {
    fullPath = path.join(
      currentWorkingDirectory,
      '/apps/monospace-api/src/views/forgotPasswordTemplate.hbs'
    );
  } else {
    fullPath = path.join(
      currentWorkingDirectory,
      '/apps/monospace-api/src/views/verificationTemplate.hbs'
    );
  }

  const templatePath = path.resolve(fullPath);

  // Read the Handlebars template from a file
  const templateFile = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(templateFile);

  // Create the email content using the template
  let html: string;
  if (resetToken !== undefined) {
    html = template({
      resetLink: `http://localhost:4200/api/auth/reset-password/token=${resetToken}`,
    });
  } else {
    html = template({
      verificationLink: `${backend_url}/api/auth/verify/${verificationToken}`,
    });
  }

  const mailOptions = {
    from: `"Aryan Sri" <${process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: 'Please verify your account',
    html: html,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

export default sendEmail;
