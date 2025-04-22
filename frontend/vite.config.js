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
    sourcemap: true,
    // 添加外部化配置，跳过无法解析的模块
    rollupOptions: {
      external: [
        /^antd\/es\/theme\/style/,  // 把不存在的路径标记为外部模块
      ]
    }
  },
});
