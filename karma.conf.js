coverageReporter: {
  dir: require('path').join(__dirname, './coverage'),
  subdir: '.',
  reporters: [
    { type: 'lcov', subdir: '.' },
    { type: 'text-summary' }
  ]
}
