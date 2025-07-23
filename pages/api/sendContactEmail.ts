import nodemailer from 'nodemailer';

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
      host: process.env.EMAIL_SMTP_HOST, // ssl0.ovh.net
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL, // contact@beaute-dugeste.fr
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL_ADMINS,
      subject: 'Nouvelle demande depuis le formulaire de contact Beauté du Geste',
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
