import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/app.jsx',
                'resources/admin/app.jsx',
            ],
            refresh: true,
        }),
        react(),
    ],
});

// import { defineConfig } from 'vite';
// import laravel from 'laravel-vite-plugin';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//     plugins: [
//         laravel({
//             input: [
//                 'resources/js/app.jsx',
//                 'resources/css/app.css'
//             ],
//             refresh: true,
//         }),
//         react(),
//     ],
// });