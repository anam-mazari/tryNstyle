import datasource from '../../config/datasource';
import { Admin } from '../entities/admin';
import * as bcrypt from 'bcryptjs';

async function seedAdmin() {
  const ds = await datasource.initialize(); // <-- FIX: rename variable
  const adminRepo = ds.getRepository(Admin);

  // Check if admin already exists
  const existing = await adminRepo.findOne({
    where: { email: 'admin@example.com' },
  });

  if (existing) {
    console.log('Default admin already exists.');
    await ds.destroy();
    return;
  }

  const hashed = await bcrypt.hash('admin123', 10);

  const admin = adminRepo.create({
    name: 'Default Admin',
    email: 'admin@example.com',
    password: hashed,
  });

  await adminRepo.save(admin);

  console.log('Default admin created successfully!');
  await ds.destroy();
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
