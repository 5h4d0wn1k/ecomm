'use client'

import { useState } from 'react'
import { Trophy, Star, Target, Gift, Award, TrendingUp, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Progress } from '@/components/ui/progress'

interface GamificationSystemProps {
  isOpen: boolean
  onClose: () => void
}

interface UserStats {
  points: number
  level: number
  badges: Badge[]
  challenges: Challenge[]
  streak: number
  totalSpent: number
  totalOrders: number
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface Challenge {
  id: string
  title: string
  description: string
  reward: number
  progress: number
  target: number
  completed: boolean
  type: 'purchase' | 'review' | 'referral' | 'streak'
  deadline?: string
}

export function GamificationSystem({ isOpen, onClose }: GamificationSystemProps) {
  const [userStats] = useState<UserStats>({
    points: 1250,
    level: 5,
    streak: 7,
    totalSpent: 45000,
    totalOrders: 23,
    badges: [
      {
        id: 'first-purchase',
        name: 'First Steps',
        description: 'Made your first purchase',
        icon: '🎯',
        earned: true,
        earnedDate: '2024-01-15',
        rarity: 'common'
      },
      {
        id: 'reviewer',
        name: 'Review Master',
        description: 'Left 10 product reviews',
        icon: '⭐',
        earned: true,
        earnedDate: '2024-02-20',
        rarity: 'rare'
      },
      {
        id: 'loyal-customer',
        name: 'Loyal Customer',
        description: 'Shopped for 6 consecutive months',
        icon: '💎',
        earned: true,
        earnedDate: '2024-03-10',
        rarity: 'epic'
      },
      {
        id: 'fashion-icon',
        name: 'Fashion Icon',
        description: 'Spent ₹50,000 on fashion items',
        icon: '👑',
        earned: false,
        rarity: 'legendary'
      }
    ],
    challenges: [
      {
        id: 'weekly-spender',
        title: 'Weekly Warrior',
        description: 'Spend ₹5,000 this week',
        reward: 500,
        progress: 3200,
        target: 5000,
        completed: false,
        type: 'purchase'
      },
      {
        id: 'review-champion',
        title: 'Review Champion',
        description: 'Leave 5 reviews this month',
        reward: 300,
        progress: 3,
        target: 5,
        completed: false,
        type: 'review'
      },
      {
        id: 'referral-master',
        title: 'Referral Master',
        description: 'Refer 3 friends who make a purchase',
        reward: 1000,
        progress: 1,
        target: 3,
        completed: false,
        type: 'referral'
      },
      {
        id: 'streak-maintainer',
        title: 'Streak Master',
        description: 'Maintain a 30-day shopping streak',
        reward: 750,
        progress: 7,
        target: 30,
        completed: false,
        type: 'streak'
      }
    ]
  })

  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'challenges' | 'leaderboard'>('overview')

  // Calculate level progress
  const getLevelProgress = () => {
    const pointsForCurrentLevel = (userStats.level - 1) * 1000
    const currentLevelPoints = userStats.points - pointsForCurrentLevel
    const progressToNext = (currentLevelPoints / 1000) * 100
    return Math.min(progressToNext, 100)
  }

  // Get badge rarity color
  const getBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500'
      case 'rare': return 'from-blue-400 to-blue-500'
      case 'epic': return 'from-purple-400 to-purple-500'
      case 'legendary': return 'from-yellow-400 to-orange-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Rewards & Achievements</h2>
                <p className="text-yellow-100">Earn points, unlock badges, and complete challenges!</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              ×
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: Star },
              { id: 'badges', label: 'Badges', icon: Award },
              { id: 'challenges', label: 'Challenges', icon: Target },
              { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-500 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[600px] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Level & Points */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Level {userStats.level}</h3>
                    <p className="text-gray-600">{userStats.points} Points</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-500">{userStats.streak}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to Level {userStats.level + 1}</span>
                    <span>{userStats.points % 1000}/1000</span>
                  </div>
                  <Progress value={getLevelProgress()} className="h-3" />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <ShoppingBag className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-blue-900">{userStats.totalOrders}</div>
                  <div className="text-sm text-blue-700">Total Orders</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Gift className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-green-900">₹{userStats.totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-green-700">Total Spent</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <Award className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-purple-900">
                    {userStats.badges.filter(b => b.earned).length}
                  </div>
                  <div className="text-sm text-purple-700">Badges Earned</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <Target className="h-6 w-6 text-red-500 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-red-900">
                    {userStats.challenges.filter(c => c.completed).length}
                  </div>
                  <div className="text-sm text-red-700">Challenges Won</div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                <div className="space-y-3">
                  {userStats.badges.filter(b => b.earned).slice(0, 3).map((badge) => (
                    <div key={badge.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{badge.name}</h4>
                        <p className="text-sm text-gray-600">{badge.description}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {badge.earnedDate && new Date(badge.earnedDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Your Badge Collection</h3>
                <p className="text-gray-600">Earn badges by completing various activities</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {userStats.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`relative bg-gradient-to-br ${getBadgeColor(badge.rarity)} rounded-lg p-4 text-white text-center ${
                      badge.earned ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    {!badge.earned && (
                      <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                        <div className="text-white/70 text-xs font-medium">Locked</div>
                      </div>
                    )}
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <h4 className="font-semibold mb-1">{badge.name}</h4>
                    <p className="text-xs text-white/90 mb-2">{badge.description}</p>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      badge.rarity === 'legendary' ? 'bg-yellow-500' :
                      badge.rarity === 'epic' ? 'bg-purple-500' :
                      badge.rarity === 'rare' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}>
                      {badge.rarity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Active Challenges</h3>
                <p className="text-gray-600">Complete challenges to earn bonus points</p>
              </div>

              <div className="space-y-4">
                {userStats.challenges.map((challenge) => (
                  <div key={challenge.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-500">+{challenge.reward}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{challenge.progress}/{challenge.target}</span>
                      </div>
                      <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
                    </div>

                    {challenge.completed && (
                      <div className="mt-3 flex items-center text-green-600">
                        <Trophy className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Completed!</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Community Leaderboard</h3>
                <p className="text-gray-600">See how you rank among other shoppers</p>
              </div>

              <div className="space-y-3">
                {/* Mock leaderboard data */}
                {[
                  { rank: 1, name: 'ShopperPro', points: 15420, level: 12, isCurrentUser: false },
                  { rank: 2, name: 'FashionQueen', points: 14850, level: 11, isCurrentUser: false },
                  { rank: 3, name: 'You', points: 1250, level: 5, isCurrentUser: true },
                  { rank: 4, name: 'DealHunter', points: 980, level: 4, isCurrentUser: false },
                  { rank: 5, name: 'StyleMaster', points: 750, level: 3, isCurrentUser: false }
                ].map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      user.isCurrentUser ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      user.rank === 1 ? 'bg-yellow-500 text-white' :
                      user.rank === 2 ? 'bg-gray-400 text-white' :
                      user.rank === 3 ? 'bg-orange-500 text-white' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {user.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">Level {user.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{user.points.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}