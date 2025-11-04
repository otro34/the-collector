import { redirect } from 'next/navigation'

interface MusicDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MusicDetailPage({ params }: MusicDetailPageProps) {
  const { id } = await params

  // Redirect to the music list page with the itemId query parameter
  // This will open the item in a modal
  redirect(`/music?itemId=${id}`)
}
