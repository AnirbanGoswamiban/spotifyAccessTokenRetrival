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
    addTokenToDB(access_token)
    res.render("success");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.render("index");
  }
});

async function addTokenToDB(access_token, refresh_token) {
  try {
    const userResponse = await axios.get(
      'https://api.spotify.com/v1/me',
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )
    const user = userResponse.data;
    console.log(user)
  } catch (err) { }
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));