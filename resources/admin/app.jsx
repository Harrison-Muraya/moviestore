// import '@mantine/core/styles.css';
import '../css/app.css';
import './bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
// import { createTheme, MantineProvider } from '@mantine/core';
// import { ColorSchemeScript } from '@mantine/core';
// import { ModalsProvider } from '@mantine/modals';
// import { Notifications } from '@mantine/notifications';


const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // const theme = createTheme({
        //     /** customize your theme if needed */
        // });

        root.render(
            // <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
                // <ModalsProvider>
                    <App {...props} />
                // </ModalsProvider>
            // </MantineProvider>
        );

    },
    progress: {
        color: '#4B5563',
    },
});

