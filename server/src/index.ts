import { app } from './app.js';
import { config } from './config.js';
import { initAmi } from './ami.js';

app.listen(config.port, () => {
  console.log(`NuroDial backend listening on port ${config.port}`);
});

void initAmi();
