'use client'

import { LanguagesIcon } from 'lucide-react'
import { useTransition } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { defaultLocale } from '@/i18n/config'
import { setUserLocale } from '@/i18n/service'

import { Button } from './ui/button'

const items = [
  {
    label: 'English',
    value: 'en',
  },
  {
    label: '中文',
    value: 'zh-cn',
  },
]

export default function LocaleToggle({ defaultValue = defaultLocale }) {
  const [isPending, startTransition] = useTransition()

  function handleClick(locale: string) {
    startTransition(() => {
      setUserLocale(locale)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" type="button">
            <LanguagesIcon />
          </Button>
        }
      />
      <DropdownMenuContent>
        {items.map((item) => (
          <DropdownMenuItem onClick={() => handleClick(item.value)} key={item.value}>
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
