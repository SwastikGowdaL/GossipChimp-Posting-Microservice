const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
const app = require('../../app');
const config = require('../../config/config');
const postingService = require('./postingService');

jest.mock('./postingDAL.js');

beforeAll(async () => {
  if (config.ENV !== 'test') {
    throw new Error('ENV should be changed to test');
  }
  await postingService.load_model();
});

afterAll(() => {
  mongoose.connection.close();
});

test('testing mock DAL', async () => {
  const gossipData = await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .attach(
      'post_img',
      path.resolve(__dirname, './testing_assets/image_for_testing.jpg')
    )
    .field('gossip', 'hello there mate jest testing!')
    .field('hashtags', ['celebrity', 'cs'])
    .field('author_id', 'author_id')
    .field('author_name', 'author_name')
    .field('author_authorized', 'true')
    .field('author_pic_id', 'author_pic_id')
    .field('link', 'https://www.google.com')
    .expect(500);
  expect(gossipData.body).toMatchObject({
    status: 'error',
    message: 'error in postingDAL',
  });
});
