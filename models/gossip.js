const mongoose = require('mongoose');

const gossipSchema = new mongoose.Schema({
  gossip: {
    type: String,
    required: true,
  },
  published_date: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: String,
    },
  ],
  shares: [
    {
      type: String,
    },
  ],
  regossips: [
    {
      type: String,
    },
  ],
  comments: [
    {
      commenter_id: {
        type: String,
        new: true,
      },
      comment: {
        type: String,
        new: true,
      },
    },
  ],
  hashtags: [
    {
      type: String,
    },
  ],
  bookmarks: [
    {
      type: String,
    },
  ],
  author_id: {
    type: String,
  },
  author_name: {
    type: String,
  },
  author_pic_id: {
    type: String,
  },
  author_authorized: {
    type: Boolean,
  },
  post_img: {
    type: String,
  },
  link: {
    type: String,
  },
});

const Gossip = mongoose.model('Gossip', gossipSchema);

module.exports = Gossip;
