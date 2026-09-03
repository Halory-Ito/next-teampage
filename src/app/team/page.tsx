'use client'

import { useState } from 'react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { masters } from '@/data/team/master'
import { phds } from '@/data/team/phd'
import { teachers } from '@/data/team/teachers'
import { undergrads } from '@/data/team/undergrad'
import MemberCard from '@/features/team/components/member-card'
import { Member } from '@/types/member'

export default function TeamPage() {
  const [data, setData] = useState<Member[]>(teachers)
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'teacher':
        setData(teachers)
        break
      case 'phd':
        setData(phds)
        break
      case 'master':
        setData(masters)
        break
      case 'undergrad':
        setData(undergrads)
        break
    }
  }

  return (
    <div className="w-full flex justify-between min-h-[calc(100svh-2rem)]">
      <div className="flex-1">
        <Tabs
          onValueChange={handleTabChange}
          className="fixed top-24"
          defaultValue="teacher"
          orientation="vertical"
        >
          <TabsList variant="line">
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
            <TabsTrigger value="phd">PhD</TabsTrigger>
            <TabsTrigger value="master">Master</TabsTrigger>
            <TabsTrigger value="undergrad">Undergrad</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-5 grid grid-cols-1 content-start xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {data.map((stu) => (
          <MemberCard key={stu.id} {...stu} />
        ))}
      </div>
    </div>
  )
}
