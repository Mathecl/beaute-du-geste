import nodemailer from 'nodemailer';

async function myCustomMethod(ctx) {
  const response = await ctx.sendCommand(
    'AUTH MY-CUSTOM-METHOD ' + Buffer.from(ctx.auth.credentials.pass).toString('base64')
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error('Authentication failed: ' + response.text);
  }
}

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { firstName, lastName, email, phone } = req.body;

  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        type: 'custom',
        method: 'MY-CUSTOM-METHOD',
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
      customAuth: {
        'MY-CUSTOM-METHOD': myCustomMethod,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL_ADMINS,
      subject: 'Nouveau message de contact Unigate',
      html: `
        <h2>Nouveau message reçu</h2>
        <ul>
          <li><strong>Prénom :</strong> ${firstName}</li>
          <li><strong>Nom :</strong> ${lastName}</li>
          <li><strong>Email :</strong> ${email}</li>
          <li><strong>Téléphone :</strong> ${phone}</li>
        </ul>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email envoyé avec succès' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur lors de l’envoi de l’email' });
  }
};

export default handler;
