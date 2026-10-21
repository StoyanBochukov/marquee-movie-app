module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Zod 4 ships `export * as ns` syntax that the RN preset does not transform.
    '@babel/plugin-transform-export-namespace-from',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.ts', '.android.ts', '.ts', '.ios.tsx', '.android.tsx', '.tsx', '.js', '.json'],
        alias: { '@': './src' },
      },
    ],
    // Must stay last.
    'react-native-worklets/plugin',
  ],
};
