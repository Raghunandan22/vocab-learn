import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { failResponse } from './api-response'

export async function requireAuth():
  Promise<
    | {
        authorized: false
        response: ReturnType<typeof failResponse>
      }
    | {
        authorized: true
        userId: string
        session: any
      }
  > {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      authorized: false,
      response: failResponse('Unauthorized', 'UNAUTHORIZED', 401),
    }
  }

  return {
    authorized: true,
    userId: session.user.id,
    session,
  }
}
