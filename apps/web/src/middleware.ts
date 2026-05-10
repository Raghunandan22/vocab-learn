import { withAuth } from 'next-auth/middleware'

export const middleware = withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: ['/dashboard/:path*', '/flashcards/:path*'],
}
