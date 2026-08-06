import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

dotenv.config();
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});