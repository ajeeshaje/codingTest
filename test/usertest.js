"use strict";

const app = require('../server');
const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const should = require('should');
const userService = require('../user/user.service');

const respData = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0b3B0YWwuY29tIiwiZXhwIjoxNDI2NDIwODAwLCJodHRwOi8vdG9wdGFsLmNvbS9qd3RfY2xhaW1zL2lzX2FkbWluIjp0cnVlLCJjb21wYW55IjoiVG9wdGFsIiwiYXdlc29tZSI6dHJ1ZX0.yRQYnWzskCZUxPwaQupWkiUzKELZ49eM7oWxAQK_ZXw',
  user:
  {
    id: 'ayty453453',
    userName: 'howareyou',
    firstName: 'Alice',
    lastName: 'bob',
    email: 'Alice@gmail.com'
  }
};

const reqBody = {
  userName: 'howareyou',
  firstName: 'Alice',
  lastName: 'bob',
  email: 'Alice@gmail.com',
  password: 'wqreytwqret'
};

describe('User test cases', () => {
  before(async () => {
    sinon.stub(userService, 'authenticate').resolves(respData);
    sinon.stub(userService, 'register').resolves({ message: 'Please check the verification email send to your email' });
  });
  after(async () => {
    userService.authenticate.restore();
    userService.register.restore();
  });

  it('should create a user', (done) => {
    request(app)
      .post('/user/register')
      .send(reqBody)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) { return done(err); }
        res.body.should.eql({ message: 'Please check the verification email send to your email' });
        done();
      });
  });

  it('should do user login', (done) => {
    request(app)
      .post('/user/login')
      .send({ userName: 'howareyou', password: 'wqreytwqret' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) { return done(err); }
        res.body.should.eql(respData);
        done();
      });
  });
});

describe('User negative test cases', () => {
  before(async () => {
    sinon.stub(userService, 'authenticate').rejects(`Invalid UserName/Password`);
    sinon.stub(userService, 'register').rejects('Failed to create the user.');
  });
  after(async () => {
    userService.authenticate.restore();
    userService.register.restore();
  });
  it('should not create a user', (done) => {
    request(app)
      .post('/user/register')
      .send(reqBody)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end((err, res) => {
        if (err) { return done(err); }
        res.status.should.equal(500);
        console.log(res.body);
        res.body.message.should.eql(`Failed to create the user.`);
        done();
      });
  });
  it('Should throw an error if not provided with required registration attributes', (done) => {
    request(app)
      .post('/user/register')
      .send({ firstName: 'user@email.com', password: 'yourpassword' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (err) { return done(err); }
        res.status.should.equal(400);
        res.body.message.should.equal(`"userName" is required, "lastName" is required, "email" is required`);
        done();
      });
  });

  it('Should throw an error if not provided with valid email', (done) => {
    request(app)
      .post('/user/register')
      .send({ ...reqBody, email: 'iamnotvalid.com' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (err) { return done(err); }
        res.status.should.equal(400);
        res.body.message.should.equal(`"email" must be a valid email`);
        done();
      });
  });

  it('Should throw an error if not provided password does not meet criteria(less than 6 characters)', (done) => {
    request(app)
      .post('/user/register')
      .send({ ...reqBody, password: 'q2345' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (err) { return done(err); }
        res.status.should.equal(400);
        res.body.message.should.equal(`"password" length must be at least 6 characters long`);
        done();
      });
  });

  it('Should throw an error if provided with invalid login attributes', (done) => {
    request(app)
      .post('/user/login')
      .send({ firstName: 'anyone@gmail.com', password: 'wqreytwqret' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (err) { return done(err); }
        res.status.should.equal(400);
        res.body.message.should.equal(`"userName" is required`);
        done();
      });
  });

  it('Should throw an error if provided with invalid login credentials', (done) => {
    request(app)
      .post('/user/login')
      .send({ userName: 'anyone@gmail.com', password: 'wqreytwqret' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end((err, res) => {
        if (err) { return done(err); }
        res.status.should.equal(500);
        res.body.message.should.equal(`Invalid UserName/Password`);
        done();
      });
  });
});