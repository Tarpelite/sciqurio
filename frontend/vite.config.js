import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vitePluginImp from 'vite-plugin-imp';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // 更新 Ant Design 样式导入配置
    vitePluginImp({
      optimize: true,
      libList: [
        {
          libName: 'antd',
          libDirectory: 'es',
          style: (name) => {
            // 特殊处理 theme 组件
            if (name === 'theme') {
              return false; // 不处理 theme 组件的样式导入
            }
            return `antd/es/${name}/style`;
          }
        }
      ]
    })
    // 移除压缩插件，改用内置配置
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@primary-color': '#1DA57A',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // 配置API代理，如有需要可以取消注释并修改
      // '/api': {
      //   target: 'http://localhost:8000',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // }
    },
  },
  build: {
    outDir: 'build',
    sourcemap: false, // 生产环境关闭 sourcemap 以减小文件体积
    minify: 'terser', // 使用 terser 进行更彻底的压缩
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.log'], // 移除 console.log
      },
    },
    // 配置 rollup 选项
    rollupOptions: {
      external: [
        /^antd\/es\/theme\/style/,  // 把不存在的路径标记为外部模块
      ],
      output: {
        // 将依赖项拆分为不同的 chunk
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
        },
        // 配置静态资源输出
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    cssCodeSplit: true, // 启用 CSS 代码分割
    assetsInlineLimit: 4096, // 小于 4kb 的资源内联为 base64,
    // 启用内置的 gzip 压缩
    reportCompressedSize: true,
  },
});
