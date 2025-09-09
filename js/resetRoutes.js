const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

// ⚠️ TODO: yaha apne DB functions connect karo
// Abhi demo ke liye in-memory store use kar raha hoon
let otpStore = {};

// Step 1: send OTP
router.post('/auth/forgot', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  // Yaha tumhe email bhejna hoga
  console.log(`OTP for ${email}: ${otp}`);

  res.json({ ok: true });
});

// Step 2: reset password
router.post('/auth/reset', async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password)
    return res.status(400).json({ error: 'Missing fields' });

  const record = otpStore[email];
  if (!record || record.otp !== otp || record.expires < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  // Password ko hash karo
  const hashed = await bcrypt.hash(password, 10);

  // TODO: Yaha DB me user ka password update karo
  console.log(`Password updated for ${email}: ${hashed}`);

  delete otpStore[email];
  res.json({ ok: true });
});

module.exports = router;
