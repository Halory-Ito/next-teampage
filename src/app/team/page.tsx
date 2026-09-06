'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { useLocale } from 'next-intl'

import OptionWheel from '@/components/OptionWheel'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getTeamByRole } from '@/data/team'
import MemberCard from '@/features/team/components/member-card'
import type { Locale } from '@/i18n/config'

type Role = 'teacher' | 'phd' | 'master' | 'undergrad'
type GradeFilter = number | 'all'

// OptionWheel 在滚动/拖拽过程中会高频触发 onChange，
// 这里对年级筛选做防抖：停止操作一段时间后才真正更新列表
const GRADE_FILTER_DEBOUNCE_MS = 500

export default function TeamPage() {
  const [role, setRole] = useState<Role>('teacher')
  const [grade, setGrade] = useState<GradeFilter>('all')
  const gradeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 按当前语言取成员数据（useLocale() 为运行时语言，切换语言后自动更新）
  const locale = useLocale()
  const roleData = useMemo(() => getTeamByRole(locale as Locale), [locale])

  // 年级从当前角色的数据里动态派生，新增年级文件后无需改动本页
  const grades = useMemo(() => {
    return [...new Set(roleData[role].map((m) => m.grade))]
      .filter((g): g is number => g != null)
      .sort((a, b) => b - a)
  }, [roleData, role])

  // OptionWheel 的受控数据：'All' + 各年级（降序），保留"全部"选项
  const wheelItems = useMemo(() => ['All', ...grades.map(String)], [grades])

  const data = useMemo(() => {
    const list = roleData[role]
    return grade === 'all' ? list : list.filter((m) => m.grade === grade)
  }, [roleData, role, grade])

  const handleRoleChange = (value: string) => {
    // 切换角色时取消未决的防抖更新，并重置年级筛选，避免落在空列表上
    if (gradeTimerRef.current) {
      clearTimeout(gradeTimerRef.current)
      gradeTimerRef.current = null
    }
    setRole(value as Role)
    setGrade('all')
  }

  // 防抖：滚轮/拖拽连续触发 onChange 时只保留最后一次，
  // 用户停止操作 GRADE_FILTER_DEBOUNCE_MS 后才真正更新 grade
  const handleGradeChange = (index: number) => {
    if (gradeTimerRef.current) {
      clearTimeout(gradeTimerRef.current)
    }
    gradeTimerRef.current = setTimeout(() => {
      gradeTimerRef.current = null
      setGrade(index === 0 ? 'all' : grades[index - 1])
    }, GRADE_FILTER_DEBOUNCE_MS)
  }

  // 卸载时清理未决的防抖定时器
  useEffect(() => {
    return () => {
      if (gradeTimerRef.current) {
        clearTimeout(gradeTimerRef.current)
        gradeTimerRef.current = null
      }
    }
  }, [])

  const roleTabs = (
    <>
      <TabsTrigger value="teacher">Teacher</TabsTrigger>
      <TabsTrigger value="phd">PhD</TabsTrigger>
      <TabsTrigger value="master">Master</TabsTrigger>
      <TabsTrigger value="undergrad">Undergrad</TabsTrigger>
    </>
  )

  return (
    <div className="w-full ">
      {/* PC 端与移动端统一：OptionWheel（年份筛选，含 All）在上，水平角色 Tabs 紧随其后，均在 Team 列表上方。
          PC 端容器与 news 页一致：mx-auto max-w-5xl，轮盘为 w-full，宽度/高度与 news 完全相同 */}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 lg:px-0 pt-12 pb-6">
        {grades.length > 1 && (
          <div className="relative h-12 lg:h-44 w-full">
            <OptionWheel
              key={role}
              items={wheelItems}
              defaultSelected={0}
              onChange={handleGradeChange}
              fontSize={1.1}
              // PC 端尺寸与 news 页保持一致：h-44 容器 + 3rem 字号，
              // 其余参数（spacing/curve/tilt 等）为组件默认值，与 news 页传入的显式值一致
              className="h-full w-full lg:[&>div]:[font-size:3rem]!"
            />
          </div>
        )}
        <Tabs value={role} onValueChange={handleRoleChange} orientation="horizontal">
          <TabsList variant="line" className="self-center">
            {roleTabs}
          </TabsList>
        </Tabs>
      </div>

      <div className="w-full grid grid-cols-1 content-start sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 px-4">
        {data.map((stu) => (
          <MemberCard key={stu.id} {...stu} />
        ))}
        {data.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
            No members found.
          </div>
        )}
      </div>
    </div>
  )
}
