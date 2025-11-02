import { env } from 'cloudflare:test'
import { app } from '../src/index'

// describe('Example', () => {
//   it('Should return 200 response', async () => {
//     const res = await app.request('/hello', {}, env)

//     expect(res.status).toBe(200)
//     expect(await res.json()).toEqual({
//       hello: 'world',
//       var: 'my variable',
//     })
//   })
// })



describe('Authentication', () => {
  it('Should return 200 response', async () => {
    const res = await app.request('/themepark/list', {
        headers: {
            Cookie: `authjs.session-token=${env.SESSION_TOKEN}`
        }
    }, env)

    expect(res.status).toBe(200)
    // expect(await res.json()).toEqual({
    //   hello: 'world',
    //   var: 'my variable',
    // })
  })
})


// describe('Example', () => {
//   it('Should return 200 response', async () => {
//     const res = await app.request('/protected', {}, env)

//     expect(res.status).toBe(200)
//   })
// })