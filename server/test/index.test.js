const supertest = require('supertest');
const chai = require('chai');
const app = require('./../app.js');

const expect = chai.expect;
const request = supertest(app.listen());

describe('start test', () => {
    it('/api/getUserInfo/:phonenumber', (done) => {
        request
            .get('/api/getUserInfo/13426259983')
            .set('cookie', 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZW51bWJlciI6IjEyMzQ1Njc4OSIsImlhdCI6MTU0MTQ5MDE0MiwiZXhwIjoxNjI3ODkwMTQyfQ.OuhkoYDNt02BuR0uuzqocsQjq49kXsT84X1HTkVMPDM')
            .expect(200)
            .end((err, res) => {
                // console.log(res.body);
                expect(res.body).to.be.an('object');
                expect(res.body.errno).to.equal(0);
                done();
            })
    })
    it('/api/updateUserInfo', (done) => {
        request
            .post('/api/updateUserInfo')
            .send({phonenumber:13426259983, userid: 1, avatar: 'https://opencollective.com/mochajs/sponsor/2/avatar'})
            .expect(200)
            .end((err, res) => {
                // console.log(res)
                expect(res.body).to.be.an('object');
                expect(res.body.errno).to.equal(0);
                expect(res.header['set-cookie'][0]).to.include('token');
                done()
            })
    })
})