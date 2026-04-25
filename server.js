require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { connectDb } = require('./db');
const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://spotifyaccesstokenretrival.onrender.com/callback";
const PORT = process.env.PORT || 3000


connectDb()

app.set("view engine", "ejs");


app.get("/", (req, res) => {
  res.render("index");
});

app.get('/login', (req, res) => {
  const scope = 'user-read-email';
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      }),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;
    console.log("Access:", access_token);
    console.log("Refresh:", refresh_token);

    res.send("Login successful!");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.send("Error during authentication");
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));