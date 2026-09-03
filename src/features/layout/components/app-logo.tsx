import { useTranslations } from 'next-intl'
import Image from 'next/image'

export default function AppLogo() {
  const t = useTranslations('Layout')
  return (
    <div className="flex items-center gap-4">
      <Image src={'/logo.svg'} alt="logo" width={32} height={32} />
      <span className="font-bold text-xl">{t('title')}</span>
    </div>
  )
}
