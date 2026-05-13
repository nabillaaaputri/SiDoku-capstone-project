import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';

app.listen(PORT, host, () => {
  console.log(`SiDoku backend running on http://${host}:${PORT}`);
});