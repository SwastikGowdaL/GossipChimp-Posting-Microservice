const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
const app = require('../../app');
const Gossip = require('../../models/gossip');
const config = require('../../config/config');
const postingService = require('./postingService');
const postingDAL = require('./postingDAL');

let savedGossip;

const authError = {
  status: 'error',
  message: 'Unauthorized',
};

const success = {
  status: 'success',
};

beforeAll(async () => {
  if (config.ENV !== 'test') {
    throw new Error('ENV should be changed to test');
  }
  await postingService.load_model();
  await Gossip.deleteMany();

  const gossipBody = {
    author_id: '12345',
    author_name: 'swastik',
    gossip: 'saving in jest',
    author_authorized: 'true',
    author_pic_id: 'author_pic_id',
    hashtags: ['cs', 'coding'],
  };

  const gossip = new Gossip(gossipBody);
  savedGossip = await gossip.save();
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
      link: 'invalid link',
    })
    .expect(400);
});

test('valid gossip data without an image & link', async () => {
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
      link: 'https://www.google.com',
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
      link: 'https://www.google.com',
    })
    .expect(201);
  expect(gossipData.body).toMatchObject(success);
});

test('valid gossip data along with an image', async () => {
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
    .expect(201);
  expect(gossipData.body).toMatchObject(success);
});

test('big image file upload', async () => {
  const gossipData = await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .attach(
      'post_img',
      path.resolve(__dirname, './testing_assets/big_image.jpg')
    )
    .field('gossip', 'hello there mate jest testing!')
    .field('hashtags', ['celebrity', 'cs'])
    .field('author_id', 'author_id')
    .field('author_name', 'author_name')
    .field('author_authorized', 'true')
    .field('author_pic_id', 'author_pic_id')
    .field('link', 'https://www.google.com')
    .expect(400);
  expect(gossipData.body).toMatchObject({
    status: 'error',
    message: 'File too large',
  });
});

test('invalid image upload', async () => {
  const gossipData = await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .attach(
      'post_img',
      path.resolve(
        __dirname,
        './testing_assets/SwastikGowda_FullStackEngg._Resume.pdf'
      )
    )
    .field('gossip', 'hello there mate jest testing!')
    .field('hashtags', ['celebrity', 'cs'])
    .field('author_id', 'author_id')
    .field('author_name', 'author_name')
    .field('author_authorized', 'true')
    .field('author_pic_id', 'author_pic_id')
    .field('link', 'https://www.google.com')
    .expect(400);
  expect(gossipData.body).toMatchObject({
    status: 'error',
    message: 'Please provide a valid image file',
  });
});

test('nsfw jpg image upload', async () => {
  const gossipData = await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .attach('post_img', path.resolve(__dirname, './testing_assets/nsfw.jpg'))
    .field('gossip', 'hello there mate jest testing!')
    .field('hashtags', ['celebrity', 'cs'])
    .field('author_id', 'author_id')
    .field('author_name', 'author_name')
    .field('author_authorized', 'true')
    .field('author_pic_id', 'author_pic_id')
    .field('link', 'https://www.google.com')
    .expect(400);
  expect(gossipData.body).toMatchObject({
    status: 'error',
    message: 'Adult rated content not allowed!',
  });
});

test('nsfw png image upload', async () => {
  const gossipData = await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .attach('post_img', path.resolve(__dirname, './testing_assets/nsfw.png'))
    .field('gossip', 'hello there mate jest testing!')
    .field('hashtags', ['celebrity', 'cs'])
    .field('author_id', 'author_id')
    .field('author_name', 'author_name')
    .field('author_authorized', 'true')
    .field('author_pic_id', 'author_pic_id')
    .field('link', 'https://www.google.com')
    .expect(400);
  expect(gossipData.body).toMatchObject({
    status: 'error',
    message: 'Adult rated content not allowed!',
  });
});

test('nsfw webp image upload', async () => {
  const gossipData = await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .attach('post_img', path.resolve(__dirname, './testing_assets/nsfw.webp'))
    .field('gossip', 'hello there mate jest testing!')
    .field('hashtags', ['celebrity', 'cs'])
    .field('author_id', 'author_id')
    .field('author_name', 'author_name')
    .field('author_authorized', 'true')
    .field('author_pic_id', 'author_pic_id')
    .field('link', 'https://www.google.com')
    .expect(400);
  expect(gossipData.body).toMatchObject({
    status: 'error',
    message: 'Adult rated content not allowed!',
  });
});

test('nsfw gif image upload', async () => {
  const gossipData = await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .attach('post_img', path.resolve(__dirname, './testing_assets/nsfw.gif'))
    .field('gossip', 'hello there mate jest testing!')
    .field('hashtags', ['celebrity', 'cs'])
    .field('author_id', 'author_id')
    .field('author_name', 'author_name')
    .field('author_authorized', 'true')
    .field('author_pic_id', 'author_pic_id')
    .field('link', 'https://www.google.com')
    .expect(400);
  expect(gossipData.body).toMatchObject({
    status: 'error',
    message: 'Adult rated content not allowed!',
  });
});

test('valid gossip data along with profanity text', async () => {
  const gossipData = await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .attach(
      'post_img',
      path.resolve(__dirname, './testing_assets/image_for_testing.jpg')
    )
    .field('gossip', 'what the hell ass !')
    .field('hashtags', ['celebrity', 'cs'])
    .field('author_id', 'author_id')
    .field('author_name', 'author_name')
    .field('author_authorized', 'true')
    .field('author_pic_id', 'author_pic_id')
    .field('link', 'https://www.google.com')
    .expect(201);
  expect(gossipData.body).toMatchObject(success);
});

test('malicious link ', async () => {
  const gossipData = await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .field('gossip', 'hello there mate jest testing!')
    .field('hashtags', ['celebrity', 'cs'])
    .field('author_id', 'author_id')
    .field('author_name', 'author_name')
    .field('author_authorized', 'true')
    .field('author_pic_id', 'author_pic_id')
    .field('link', 'https://www.sebpank.com')
    .expect(201);
  expect(gossipData.body).toMatchObject({
    status: 'success',
  });
});

test('non-malicious link ', async () => {
  const gossipData = await request(app)
    .post('/posting')
    .set('AUTH_KEY', config.AUTH_KEY)
    .field('gossip', 'hello there mate jest testing!')
    .field('hashtags', ['celebrity', 'cs'])
    .field('author_id', 'author_id')
    .field('author_name', 'author_name')
    .field('author_authorized', 'true')
    .field('author_pic_id', 'author_pic_id')
    .field('link', 'https://www.google.com')
    .expect(201);
  expect(gossipData.body).toMatchObject({
    status: 'success',
  });
});

test('finding the specified gossip using postingDAL gossip()', async () => {
  const gossip = await postingDAL.gossip(savedGossip._id);
  const savedGossipID = String(savedGossip._id);
  const gossipID = String(gossip._id);
  expect(gossipID).toEqual(savedGossipID);
});

test('deleting gossip', async () => {
  const gossip = await request(app)
    .delete('/post')
    .set('AUTH_KEY', config.AUTH_KEY)
    .send({
      author_id: savedGossip.author_id,
      gossip_id: savedGossip._id,
    })
    .expect(200);
  expect(gossip.body).toMatchObject({
    status: 'success',
    message: 'post deleted',
  });
});
