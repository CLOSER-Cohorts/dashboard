import { cookies } from 'next/headers'
import { getToken } from '../../lib/posts';

export async function POST(request) {

  const requestData = await request.json()

  const token = await getToken(requestData.username, requestData.password)

  if (!!token) {
    cookies().set({name: 'token', value: token.access_token, secure:true, httpOnly: true})
    cookies().set({name: 'username', value: requestData.username, secure:true, httpOnly: true})
  }
  return (!!token) ? new Response(JSON.stringify(token), {
    status: 200,
  })
    :
    new Response("", {
      status: 401,
    })

}