import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // better-sqlite3 はネイティブモジュールのためサーバ側でバンドルしない
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
