import { cookies } from 'next/headers'
import { getToken } from '../../lib/posts';

export async function POST(request) {

  const requestData = await request.json()

  const token = await getToken(requestData.username, requestData.password)

  if (!!token) {
    cookies().set('token', token.access_token)
    cookies().set('username', requestData.username)
  }
  return (!!token) ? new Response(JSON.stringify(token), {
    status: 200,
  })
    :
    new Response("", {
      status: 401,
    })

}