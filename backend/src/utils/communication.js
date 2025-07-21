import crypto from "crypto";
import nodemailer from "nodemailer";
// import twilio from "twilio"; // Uncomment and configure if using SMS services
import { User } from "../models/user.model.js";

// Optional: Configure Twilio here if using
// const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const OTP_EXPIRY_MINUTES = 5;

// Generates a 6-digit OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Returns expiry date `minutes` from now
export const getExpiry = (minutes = OTP_EXPIRY_MINUTES) => {
    return new Date(Date.now() + minutes * 60 * 1000);
};

// Send OTP via email
export const sendOTPByEmail = async (email, otp) => {
    console.log(`🔐 Sending OTP ${otp} to email: ${email}`);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"MyApp 👾" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your OTP Code",
        html: `<p>Your OTP code is <b>${otp}</b>. It will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>`,
    });
};

// Send OTP via SMS
export const sendOTPByPhone = async (phone, otp) => {
    console.log(`📲 Sending OTP ${otp} to phone: ${phone}`);
    // Uncomment and use real SMS service here
    // await twilioClient.messages.create({
    //   body: `Your OTP is ${otp}`,
    //   from: process.env.TWILIO_PHONE,
    //   to: phone
    // });
};

// Generic message via email
export const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: `"MyApp Bot 🤖" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });
};

// Generic message via SMS
export const sendSMS = async (to, message) => {
    console.log(`📤 Sending message "${message}" to ${to}`);
    // await twilioClient.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE,
    //   to,
    // });
};

// Save and send OTP
export const sendOTP = async ({ phone, email }) => {
    if (!phone && !email) throw new Error("Email or phone is required");

    const otp = generateOTP();
    const otpExpiry = getExpiry();

    const user = await User.findOne({ $or: [{ email }, { phone }] });
    if (!user) throw new Error("User not found");

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    if (email) await sendOTPByEmail(email, otp);
    else if (phone) await sendOTPByPhone(phone, otp);

    return true;
};

// Verify OTP
export const verifyOTP = async ({ phone, email, otp }) => {
    if (!otp || (!email && !phone)) throw new Error("OTP and email/phone required");

    const query = email ? { email } : { phone };
    const user = await User.findOne(query);

    if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
        throw new Error("Invalid or expired OTP");
    }

    if (email) user.emailVerified = true;
    if (phone) user.phoneVerified = true;

    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return true;
};
