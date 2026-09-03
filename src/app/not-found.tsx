'use client'
import FuzzyText from '@/components/FuzzyText'

export default function GlobalNotFound() {
  return (
    <div className="flex flex-col justify-center items-center gap-16">
      <FuzzyText baseIntensity={0.2} hoverIntensity={0.5} enableHover>
        404
      </FuzzyText>
      <FuzzyText baseIntensity={0.2} hoverIntensity={0.5} enableHover>
        not found
      </FuzzyText>
    </div>
  )
}
