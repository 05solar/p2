import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// 개발 중에는 /api 요청을 백엔드(4000)로 프록시합니다.
// 운영 빌드는 백엔드가 같은 오리진에서 정적 파일로 서빙합니다.
export default defineConfig({
    base: '/',
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': 'http://localhost:4000',
        },
    },
    build: {
        outDir: 'dist',
    },
});
