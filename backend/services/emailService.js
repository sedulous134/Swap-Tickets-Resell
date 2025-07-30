import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USERNAME, 
    pass: process.env.EMAIL_APP_PASSWORD, 
  },
});

// export const sendConfirmationEmail = async (userEmail, movieDetails) => {
//   const mailOptions = {
//     from: `"Movie Tickets 🎟️" <${process.env.EMAIL_USERNAME}>`, // ✅ Makes sender look professional
//     to: userEmail,
//     subject: `🎬 Ticket Confirmation for ${movieDetails.title}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border-radius: 10px; background-color: #f7f7f7;">
//         <h2 style="color: #e63946;">🎟️ Your Movie Ticket is Confirmed!</h2>
//         <hr style="border: 0; height: 1px; background: #ccc; margin: 20px 0;">
//         <p><strong>Movie:</strong> <span style="color: #1d3557;">${movieDetails.title}</span></p>
//         <p><strong>Date & Time:</strong> <span style="color: #457b9d;">${movieDetails.date} | ${movieDetails.time}</span></p>
//         <p><strong>Venue:</strong> <span style="color: #2a9d8f;">${movieDetails.venue}</span></p>
//         <p><strong>Seats:</strong> <span style="color: #e76f51;">${movieDetails.seats.join(", ")}</span></p>
//         <hr style="border: 0; height: 1px; background: #ccc; margin: 20px 0;">
//         <p>✅ Your booking is confirmed! See you at the movies 🍿</p>
//       </div>
//     `,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log(`✅ Email sent to ${userEmail}: ${info.response}`);
//     return { success: true, message: "Email sent successfully!" };
//   } catch (error) {
//     console.error("❌ Error sending email:", error);
//     return { success: false, message: "Failed to send email." };
//   }
// };


export const sendConfirmationEmail = async (userEmail, movieDetails) => {
  console.log(movieDetails.poster);
  const mailOptions = {
    from: `"🎬 Movie Tickets" <${process.env.EMAIL_USERNAME}>`, // ✅ Professional branding
    to: userEmail,
    subject: `🎟️ Your Ticket for ${movieDetails.title} is Confirmed!`,
    html: `
      <div style="max-width: 600px; margin: auto; font-family: 'Helvetica Neue', sans-serif; background: #141414; color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 30px rgba(0,0,0,0.4);">

        <!-- Header -->
        <div style="background: linear-gradient(to right, #d4145a, #fbb03b); padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎟️ Ticket Confirmed!</h1>
          <p style="margin: 6px 0 0; font-size: 16px;">You’re going to <strong>${movieDetails.title}</strong></p>
        </div>

        <!-- Poster -->
        <div style="text-align: center; padding: 20px;">
          <img src="https://image.tmdb.org/t/p/w780${movieDetails.poster}" alt="${movieDetails.title} Poster"
               style="width: 90%; max-width: 360px; border-radius: 10px; box-shadow: 0 10px 20px rgba(255,255,255,0.1);">
        </div>

        <!-- Ticket Card -->
        <div style="background-color: #1f1f1f; margin: 0 20px 20px; padding: 20px; border-radius: 12px; border: 1px dashed #fbb03b;">
          <h2 style="color: #fbb03b; margin: 0 0 10px;">🎬 ${movieDetails.title}</h2>
          <p style="font-size: 16px; margin: 6px 0;"><strong>📍 Venue:</strong> ${movieDetails.venue}</p>
          <p style="font-size: 16px; margin: 6px 0;"><strong>🎟️ Seats:</strong> ${movieDetails.seats.join(", ")}</p>
        </div>

        <!-- Info -->
        <div style="padding: 0 24px 20px; text-align: center; font-size: 16px;">
          <p style="margin: 12px 0;">Your full ticket will be emailed within <strong>24–48 hours</strong>.</p>
          <p style="margin: 0;">Get ready for a thrilling experience! 🍿</p>
        </div>

        <!-- CTA -->
        <div style="text-align: center; padding: 10px 24px 30px;">
          <a href="#" style="display: inline-block; background: #fbb03b; color: #141414; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold;">🎟 View Ticket Status</a>
        </div>

        <!-- Footer -->
        <div style="background: #0d0d0d; text-align: center; font-size: 12px; color: #888; padding: 16px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} CinePulse. All Rights Reserved.</p>
          <p style="margin: 4px 0 0;">Need help? <a href="#" style="color: #fbb03b; text-decoration: underline;">Contact Support</a></p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${userEmail}: ${info.response}`);
    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, message: "Failed to send email." };
  }
};
