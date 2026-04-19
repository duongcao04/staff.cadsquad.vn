import type { KnipConfig } from 'knip'

const config: KnipConfig = {
    entry: ['src/**'],

    project: ['src/**/*.ts', 'src/**/*.tsx'],

    // Folders or file patterns to completely skip
    ignore: ['routeTree.gen.ts', 'fonts/**', 'assets/**'],

    ignoreDependencies: [
        'tailwindcss',
        '@tailwindcss/vite',
        '@tailwindcss/postcss',
        'typescript',
    ],

    // Binaries triggered in package.json scripts (e.g., CI/CD pipelines)
    ignoreBinaries: ['bun', 'docker-compose'],

    ignoreExportsUsedInFile: true,
}

export default config
