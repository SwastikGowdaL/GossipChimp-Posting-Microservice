const hashtags = (hashtagID) => {
  let hashtag;
  switch (hashtagID) {
    case 'computer':
      hashtag = 'hashtag_computer';
      break;
    case 'technology':
      hashtag = 'hashtag_technology';
      break;
    default:
      hashtag = 'hashtags';
      break;
  }
  return hashtag;
};

module.exports = hashtags;
