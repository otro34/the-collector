import { redirect } from 'next/navigation'

interface VideogameDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function VideogameDetailPage({ params }: VideogameDetailPageProps) {
  const { id } = await params

  // Redirect to the videogames list page with the itemId query parameter
  // This will open the item in a modal
  redirect(`/videogames?itemId=${id}`)
}
