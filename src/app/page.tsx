import HomeIntro from '@/features/home/components/home-intro'
import HomeStats from '@/features/home/components/home-stats'
import HomeTestimonials from '@/features/home/components/home-testimonials'

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-16 pb-20 sm:gap-20">
      <HomeIntro />
      <HomeStats />
      <HomeTestimonials />
    </main>
  )
}
