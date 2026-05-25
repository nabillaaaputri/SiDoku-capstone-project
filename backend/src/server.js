import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SiDoku backend running on port ${PORT}`);
<<<<<<< HEAD
});
=======
});
>>>>>>> 57f6a81 (refactor backend authorization validation and per-user access)
