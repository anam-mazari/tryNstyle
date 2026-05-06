import datasource from '../../config/datasource';
import { seedCategories } from './category.seed';

async function runSeed() {
  const ds = await datasource.initialize();

  try {
    console.log('Starting category seed...');
    await seedCategories(ds);
    console.log('Category seed completed successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  } finally {
    await ds.destroy();
  }
}

runSeed();
