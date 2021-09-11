const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
const app = require('../../app');
const Gossip = require('../../models/gossip');
const config = require('../../config/config');
const { Error } = require('./postingErrors');

const authError = {
  status: 'Error',
  message: 'Unauthorized',
};

const success = {
  status: 'success',
};

beforeAll(async () => {
  if (config.ENV !== 'test') {
    throw new Error('ENV should be changed to test');
  }
  await Gossip.deleteMany();
});

afterAll(() => {
  mongoose.connection.close();
});

test('invalid gossip body', async () => {
  await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .send({
      gossip: 12345,
      hashtags: ['celebrity', 'cs'],
      author_id: 'author_id',
      author_name: 'testing 5',
      author_authorized: 'true',
      author_pic_id: 'author_pic_id',
    })
    .expect(400);
});

test('invalid gossip hashtags', async () => {
  await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .send({
      gossip: 'hello there mate!',
      hashtags: ['celebrity', 12345],
      author_id: 'author_id',
      author_name: 'testing 5',
      author_authorized: 'true',
      author_pic_id: 'author_pic_id',
    })
    .expect(400);
});

test('invalid gossip author_id', async () => {
  await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .send({
      gossip: 'hello there mate',
      hashtags: ['celebrity', 'cs'],
      author_id: 12345,
      author_name: 'testing 5',
      author_authorized: 'true',
      author_pic_id: 'author_pic_id',
    })
    .expect(400);
});

test('invalid gossip author_name', async () => {
  await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .send({
      gossip: 'hello there mate',
      hashtags: ['celebrity', 'cs'],
      author_id: 'author_id',
      author_name: 12345,
      author_authorized: 'true',
      author_pic_id: 'author_pic_id',
    })
    .expect(400);
});

test('invalid gossip author_authorized', async () => {
  await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .send({
      gossip: 'hello there mate',
      hashtags: ['celebrity', 'cs'],
      author_id: 'author_id',
      author_name: 'author_name',
      author_authorized: 2,
      author_pic_id: 'author_pic_id',
    })
    .expect(400);

  await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .send({
      gossip: 'hello there mate',
      hashtags: ['celebrity', 'cs'],
      author_id: 'author_id',
      author_name: 'author_name',
      author_authorized: 'test',
      author_pic_id: 'author_pic_id',
    })
    .expect(400);
});

test('invalid gossip author_pic_id', async () => {
  await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .send({
      gossip: 'hello there mate',
      hashtags: ['celebrity', 'cs'],
      author_id: 'author_id',
      author_name: 'author_name',
      author_authorized: 'true',
      author_pic_id: 12345,
    })
    .expect(400);
});

test('invalid gossip link', async () => {
  await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .send({
      gossip: 'hello there mate',
      hashtags: ['celebrity', 'cs'],
      author_id: 'author_id',
      author_name: 'author_name',
      author_authorized: 'true',
      author_pic_id: 'author_pic_id',
      link: 12345,
    })
    .expect(400);
});

test('valid gossip data without an image', async () => {
  const gossip = await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .send({
      gossip: 'hello there mate jest testing!',
      hashtags: ['celebrity', 'cs'],
      author_id: 'author_id',
      author_name: 'author_name',
      author_authorized: 'true',
      author_pic_id: 'author_pic_id',
      link: 'link',
    })
    .expect(201);
  expect(gossip.body).toMatchObject(success);
});

test('missing auth key', async () => {
  const gossip = await request(app)
    .post('/posting')
    .send({
      gossip: 'hello there mate jest testing!',
      hashtags: ['celebrity', 'cs'],
      author_id: 'author_id',
      author_name: 'author_name',
      author_authorized: 'true',
      author_pic_id: 'author_pic_id',
      link: 'link',
    })
    .expect(401);
  expect(gossip.body).toMatchObject(authError);
});

test('invalid auth key', async () => {
  const gossip = await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .set(
      'AUTH_KEY',
      'THIS_KEY_MAKES_SURE_THAT_THE_REQUEST_FROM_THE_CLIENT_IS_NOT_VERIFIED'
    )
    .send({
      gossip: 'hello there mate jest testing!',
      hashtags: ['celebrity', 'cs'],
      author_id: 'author_id',
      author_name: 'author_name',
      author_authorized: 'true',
      author_pic_id: 'author_pic_id',
      link: 'link',
    })
    .expect(401);
  expect(gossip.body).toMatchObject(authError);
});

test('valid auth key', async () => {
  const gossipData = await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .send({
      gossip: 'hello there mate jest testing!',
      hashtags: ['celebrity', 'cs'],
      author_id: 'author_id',
      author_name: 'author_name',
      author_authorized: 'true',
      author_pic_id: 'author_pic_id',
      link: 'link',
    })
    .expect(201);
  expect(gossipData.body).toMatchObject(success);
});

test('valid gossip data along with an image', async () => {
  const gossipData = await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .attach('post_img', path.resolve(__dirname, './image_for_testing.jpg'))
    .field('gossip', 'hello there mate jest testing!')
    .field('hashtags', ['celebrity', 'cs'])
    .field('author_id', 'author_id')
    .field('author_name', 'author_name')
    .field('author_authorized', 'true')
    .field('author_pic_id', 'author_pic_id')
    .field('link', 'link')
    .expect(201);
  expect(gossipData.body).toMatchObject(success);
});
