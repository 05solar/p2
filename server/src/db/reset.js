// 데이터를 비우고 데모 시드를 다시 채웁니다: `npm run seed:reset`
import { store } from './store.js';
import { seedIfEmpty } from './seed.js';

store.reset();
seedIfEmpty();
console.log('✓ 데이터 초기화 완료');
