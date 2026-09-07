import { Project } from '@/types/project'

/**
 * R&D project list (English).
 * Append new projects to this array; the homepage "R&D Projects" counter updates automatically.
 */
export const projects: Project[] = [
  {
    id: 'nsfc-remote-sensing',
    name: 'Key Techniques of Deep Unfolding Networks for Intelligent Interpretation of Remote Sensing Big Data',
    category: 'Vertical Fund',
    sponsor: 'National Natural Science Foundation of China (NSFC)',
    period: '2022–2025',
  },
  {
    id: 'cqupt-teaching-reform',
    name: 'Development of a Core Big Data Technology Course Cluster and Industry-Education Integration Reform',
    category: 'Vertical Fund',
    sponsor: 'Chongqing Municipal Education Commission Fund',
    period: '2021–2023',
  },
  {
    id: 'power-grid-platform',
    name: 'Planning and Construction of a Big Data Analytics Platform for the Power Industry',
    category: 'Industry Project',
    sponsor: 'Power industry enterprise',
    period: '2022–2024',
  },
  {
    id: 'health-bigdata',
    name: 'Development of an Intelligent Application System for Children\u2019s Medical Health Big Data',
    category: 'Industry Project',
    sponsor: 'Healthcare industry enterprise',
    period: '2020–2023',
  },
]
