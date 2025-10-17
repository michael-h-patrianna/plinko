async function globalTeardown() {
  console.log('\n🧹 Cleaning up after tests...');

  // Clean up test artifacts if needed
  // Any other cleanup

  console.log('✅ Global teardown complete');
}

export default globalTeardown;
