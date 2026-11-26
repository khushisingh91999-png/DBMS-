
require('dotenv').config({ path: __dirname + '/.env' });

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  console.error('Configure backend/.env first.');
  process.exit(1);
}

const app = require('./app');
const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
  console.log('API listening on port ' + port);
});
