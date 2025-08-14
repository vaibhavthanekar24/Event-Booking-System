// This file is specifically designed to be run by ts-node
import { getPayload } from '../payload';
import { seed } from './seed';

// Self-executing function to run the seed
(async () => {
  try {
    console.log('Starting seed process...');
    const payload = await getPayload();
    await seed(payload);
    console.log('Seed process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seed process:', error);
    process.exit(1);
  }
})();