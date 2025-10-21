import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [
    angular()
  ],
  server: {
    fs: {
      // Only allow serving files from the project root and node_modules
      allow: [
        // Allow serving files from the project root
        '.',
        // Allow serving files from one level up for monorepo support
        '..',
        // Explicitly allow node_modules
        'node_modules',
      ],
      // Deny access to sensitive system directories
      deny: [
        // Deny access to the root directory
        '/',
        // Deny access to the user's home directory
        '~',
        // Deny access to system directories
        '/etc',
        '/usr',
        '/var',
        '/bin',
        '/sbin',
        '/lib',
        '/lib64',
        '/boot',
        '/dev',
        '/proc',
        '/sys',
      ],
      // Enable strict mode to prevent directory traversal
      strict: true,
    },
  },
  // Configure build settings
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Minify the production build
    minify: 'esbuild',
    // Set chunk size warning limit to 500KB
    chunkSizeWarningLimit: 500,
    // Configure rollup options
    rollupOptions: {
      // Externalize dependencies that should not be bundled
      external: [],
      output: {
        // Split vendor and app code for better caching
        manualChunks: {
          'vendor': ['@angular/core', '@angular/common', '@angular/forms', '@angular/router'],
        },
      },
    },
  },
  // Configure development server options
  preview: {
    port: 4200,
    strictPort: true,
  },
  // Configure global CSS preprocessor options
  css: {
    preprocessorOptions: {
      scss: {
        // Add global SCSS imports here
        additionalData: `
          @import "src/styles/variables";
          @import "src/styles/mixins";
        `,
      },
    },
  },
});
