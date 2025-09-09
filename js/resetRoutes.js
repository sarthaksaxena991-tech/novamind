const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

// temporary OTP store (demo ke liye; production me DB use karo)
let otpStore = {};

// send OTP (demo me console.log)
async function sendOtpEmail(email, otp) {
  console.log(`OTP for ${email}: ${otp}`);
}

// STEP 1: forgot password -> send OTP
router.post('/auth/forgot', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 5*60*1000 };
  await sendOtpEmail(email, otp);

  res.json({ ok: true });
});

// STEP 2: reset password -> verify OTP and update
router.post('/auth/reset', async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) return res.status(400).json({ error: 'Missing fields' });

  const record = otpStore[email];
  if (!record || record.otp !== otp || record.expires < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  const hashed = await bcrypt.hash(password, 12);
  console.log(`Password updated for ${email}: ${hashed}`);

  delete otpStore[email];
  res.json({ ok: true });
});

module.exports = router;

