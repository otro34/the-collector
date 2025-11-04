import { redirect } from 'next/navigation'

interface BookDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params

  // Redirect to the books list page with the itemId query parameter
  // This will open the item in a modal
  redirect(`/books?itemId=${id}`)
}
