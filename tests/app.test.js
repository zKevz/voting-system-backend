const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')
const Voting = require('../src/models/voting')

beforeAll(async () => {
    const url = 'mongodb://127.0.0.1:27017/voting-test'
    await mongoose.connect(url)
})

afterAll(async () => {
    await User.deleteMany({})
    await Voting.deleteMany({})
    await mongoose.connection.close()
})

beforeEach(async () => {
    await User.deleteMany({})
    await Voting.deleteMany({})
})

describe('Auth Endpoints', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'testuser',
                password: 'password123'
            })

        expect(res.statusCode).toBe(201)
        expect(res.body.code).toBe(200)
        expect(res.body.data).toHaveProperty('token')
    })

    it('should not register a user with existing username', async () => {
        await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'testuser',
                password: 'password123'
            })

        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'testuser',
                password: 'password123'
            })

        expect(res.body.code).toBe(500)
        expect(res.body.message).toContain('already exists')
    })

    it('should login with valid credentials', async () => {
        await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'testuser',
                password: 'password123'
            })

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                username: 'testuser',
                password: 'password123'
            })

        expect(res.statusCode).toBe(200)
        expect(res.body.data).toHaveProperty('token')
    })

    it('should reject login with invalid password', async () => {
        await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'testuser',
                password: 'password123'
            })

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                username: 'testuser',
                password: 'wrongpassword'
            })

        expect(res.body.code).toBe(500)
        expect(res.body.message).toContain('not found')
    })
})

describe('Voting Endpoints', () => {
    let token
    let adminToken

    beforeEach(async () => {
        const userRes = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'testuser',
                password: 'password123'
            })

        token = userRes.body.data.token

        const adminRes = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'admin',
                password: 'password123'
            })

        adminToken = adminRes.body.data.token
    })

    it('should create a new voting option', async () => {
        const res = await request(app)
            .post('/api/v1/votings')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Test Option'
            })

        expect(res.body.code).toBe(200)
    })

    it('should not allow creating duplicate voting options', async () => {
        await request(app)
            .post('/api/v1/votings')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Test Option'
            })

        const res = await request(app)
            .post('/api/v1/votings')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Option'
            })

        expect(res.body.code).toBe(500)
        expect(res.body.message).toContain('already exists')
    })

    it('should allow admin to get all voting options', async () => {
        await request(app)
            .post('/api/v1/votings')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Option 1'
            })

        await request(app)
            .post('/api/v1/votings')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Option 2'
            })

        const res = await request(app)
            .get('/api/v1/votings')
            .set('Authorization', `Bearer ${adminToken}`)

        expect(res.body.code).toBe(200)
        expect(res.body.data.length).toBe(2)
        expect(res.body.data[0]).toHaveProperty('name')
        expect(res.body.data[0]).toHaveProperty('voteCount')
    })

    it('should not allow regular users to get all voting options', async () => {
        const res = await request(app)
            .get('/api/v1/votings')
            .set('Authorization', `Bearer ${token}`)

        expect(res.body.code).toBe(500)
        expect(res.body.message).toBe('Unauthorized')
    })

    it('should allow voting on an option', async () => {
        const createRes = await request(app)
            .post('/api/v1/votings')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Option'
            })

        const allVotings = await request(app)
            .get('/api/v1/votings')
            .set('Authorization', `Bearer ${adminToken}`)

        const votingId = allVotings.body.data[0].id

        const voteRes = await request(app)
            .get(`/api/v1/votings/vote?id=${votingId}`)
            .set('Authorization', `Bearer ${token}`)

        expect(voteRes.body.code).toBe(200)
    })

    it('should not allow voting twice', async () => {
        await request(app)
            .post('/api/v1/votings')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Option A'
            })

        const allVotings = await request(app)
            .get('/api/v1/votings')
            .set('Authorization', `Bearer ${adminToken}`)

        const votingId = allVotings.body.data[0].id

        await request(app)
            .get(`/api/v1/votings/vote?id=${votingId}`)
            .set('Authorization', `Bearer ${token}`)

        const secondVoteRes = await request(app)
            .get(`/api/v1/votings/vote?id=${votingId}`)
            .set('Authorization', `Bearer ${token}`)

        expect(secondVoteRes.body.code).toBe(500)
        expect(secondVoteRes.body.message).toContain('already voted')
    })

    it('should allow admin to delete a voting option', async () => {
        await request(app)
            .post('/api/v1/votings')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Option to Delete'
            })

        const allVotings = await request(app)
            .get('/api/v1/votings')
            .set('Authorization', `Bearer ${adminToken}`)

        const votingId = allVotings.body.data[0].id

        const deleteRes = await request(app)
            .delete(`/api/v1/votings?id=${votingId}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(deleteRes.body.code).toBe(200)

        const checkVotings = await request(app)
            .get('/api/v1/votings')
            .set('Authorization', `Bearer ${adminToken}`)

        expect(checkVotings.body.data.length).toBe(0)
    })
})

describe('User Endpoints', () => {
    let token
    let adminToken
    let userId

    beforeEach(async () => {
        const userRes = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'testuser',
                password: 'password123'
            })

        token = userRes.body.data.token

        const adminRes = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'admin',
                password: 'password123'
            })

        adminToken = adminRes.body.data.token

        const usersRes = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${adminToken}`)

        userId = usersRes.body.data.find(u => u.username === 'testuser').id
    })

    it('should get current user info', async () => {
        const res = await request(app)
            .get('/api/v1/users/me')
            .set('Authorization', `Bearer ${token}`)

        expect(res.body.code).toBe(200)
        expect(res.body.data).toHaveProperty('userId')
        expect(res.body.data).toHaveProperty('role')
        expect(res.body.data.role).toBe('user')
    })

    it('should allow admin to get all users', async () => {
        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${adminToken}`)

        expect(res.body.code).toBe(200)
        expect(Array.isArray(res.body.data)).toBe(true)
        expect(res.body.data.length).toBe(2)
    })

    it('should not allow regular users to get all users', async () => {
        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${token}`)

        expect(res.body.code).toBe(500)
        expect(res.body.message).toBe('Unauthorized')
    })

    it('should allow admin to delete a user', async () => {
        const deleteRes = await request(app)
            .delete(`/api/v1/users?id=${userId}`)
            .set('Authorization', `Bearer ${adminToken}`)

        expect(deleteRes.body.code).toBe(200)

        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({
                username: 'testuser',
                password: 'password123'
            })

        expect(loginRes.body.code).toBe(500)
    })

    it('should not allow regular users to delete users', async () => {
        const res = await request(app)
            .delete(`/api/v1/users?id=${userId}`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.body.code).toBe(500)
        expect(res.body.message).toBe('Unauthorized')
    })
})