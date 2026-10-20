import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { NotFoundPage } from '@/components/error-pages'
import { AnnouncerProvider } from '@/components/announcer'
import { StoreProvider } from '@/data/store'

import '../styles.scss'
import 'datatables.net-bs5/css/dataTables.bootstrap5.css'
import 'datatables.net-responsive-bs5/css/responsive.bootstrap5.css'

const siteName = 'Cadenza — lesson planning for instrument teachers'
const siteDescription =
  'Plan lessons, set homework, track attendance and keep every student’s progress in one calm, secure place.'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: siteName },
      { name: 'description', content: siteDescription },
      { name: 'theme-color', content: '#1f2f57' },
      { property: 'og:title', content: siteName },
      { property: 'og:description', content: siteDescription },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <HeadContent />
      </head>
      <body>
        <StoreProvider>
          <AnnouncerProvider>{children}</AnnouncerProvider>
        </StoreProvider>
        <Scripts />
      </body>
    </html>
  )
}
