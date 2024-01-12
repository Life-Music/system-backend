import '@src/pre-start';

import type BaseSeeder from './BaseSeeder';
import CategorySeeder from './category/CategorySeeder';
import AdminSeeder from './admin/AdminSeeder';

const perform = async (seeder: typeof BaseSeeder) => {
  const seederInstance = new seeder();
  console.log(`Rollbacking ${seeder.name}...`);

  await seederInstance.down();
  await seederInstance.up();
};
void function () {
  const handler = Promise.all(
    [
      perform(CategorySeeder),
      perform(AdminSeeder),
    ],
  );
  handler.then(() => {
    console.log('Seed Done!');
  });
}();