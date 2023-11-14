import { cookies } from 'next/headers'
import { getToken } from '../../lib/posts';

export async function GET(request) {

    cookies().delete('token')
    cookies().delete('username')
  
  return (new Response(JSON.stringify("TEST"), {
    status: 200,
  }))

}