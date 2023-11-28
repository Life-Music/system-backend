import '@src/pre-start';

import type BaseSeeder from './BaseSeeder';
import CategorySeeder from './category/CategorySeeder';

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
    ],
  );
  handler.then(() => {
    console.log('Seed Done!');
  });
}();