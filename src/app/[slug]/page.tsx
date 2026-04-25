import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function SlugFallback() {
  redirect('/?notfound=1')
}
