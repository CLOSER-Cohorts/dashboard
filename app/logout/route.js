import { cookies } from 'next/headers'

export async function GET(request) {

    const cookieStore = await cookies();

    cookieStore.delete('token');
    cookieStore.delete('username');

  return (new Response(JSON.stringify("Logout successful"), {
    status: 200,
  }))

}