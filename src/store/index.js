import { init } from '@rematch/core';
import * as models from '../models';
import createRematchPersist from '@rematch/persist';
// import updatedPlugin from '@rematch/updated';

// const updated = updatedPlugin();

const persistPlugin = createRematchPersist({
  key: 'cfl',
  throttle: 500,
  version: 2,
});

export const store = init({
  models,
  plugins: [persistPlugin],
});

export const dispatch = store.dispatch;
