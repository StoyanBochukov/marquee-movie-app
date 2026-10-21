module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['coverage/', 'android/', 'ios/'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/features/*/*'],
            message: 'Import other features through their public index (e.g. "@/features/movies").',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['src/core/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/features/*', '@/app/*'],
                message: 'core must stay app-agnostic and cannot depend on features or app.',
              },
            ],
          },
        ],
      },
    },
  ],
};
