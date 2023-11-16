import { cookies } from 'next/headers'

export async function GET(request) {

    cookies().delete('token')
    cookies().delete('username')
  
  return (new Response(JSON.stringify("Logout successful"), {
    status: 200,
  }))

}