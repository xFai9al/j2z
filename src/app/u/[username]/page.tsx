import { permanentRedirect } from 'next/navigation'

export default async function LegacyBioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  permanentRedirect(`/${username}`)
}
