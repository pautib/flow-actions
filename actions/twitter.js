module.exports = async function postToTwitter(user) {
  console.log(`Posting to Twitter about ${user.name}`);

  // Replace with real Twitter integration when ready
  return Promise.resolve(`Tweet sent for ${user.name}`);
}; 