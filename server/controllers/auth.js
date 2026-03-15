import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

export const Login = async (req, res) => {
  const ticket = await client.verifyIdToken({
    idToken: req.body.token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { email, name, picture } = payload;
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ email, name, picture, token });
};

export const Logout = async (req, res) => {
  res.json({ message: "Logout successful" });
};
