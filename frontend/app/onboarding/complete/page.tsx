'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function OnboardingComplete() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    zipCode: '',
    interestCount: 0
  })

  useEffect(() => {
    // Load data from localStorage
    const firstName = localStorage.getItem('onboarding_firstName') || ''
    const lastName = localStorage.getItem('onboarding_lastName') || ''
    const zipCode = localStorage.getItem('onboarding_zipCode') || ''
    const interests = localStorage.getItem('onboarding_interests')
    const interestCount = interests ? JSON.parse(interests).length : 0

    setUserData({
      firstName,
      lastName,
      zipCode,
      interestCount
    })

    // Mark onboarding as completed in the database
    const completeOnboarding = async () => {
      try {
        const response = await fetch('/api/profile/onboarding', {
          method: 'POST'
        })

        if (!response.ok) {
          console.error('Failed to complete onboarding:', await response.text())
        } else {
          console.log('Onboarding completed successfully')
          // Refresh user context to update onboardingCompleted flag
          await refreshUser()
        }
      } catch (error) {
        console.error('Error completing onboarding:', error)
      }
    }
    completeOnboarding()
  }, [refreshUser])

  const handleGoToDashboard = () => {
    // Clear onboarding data from localStorage
    localStorage.removeItem('onboarding_firstName')
    localStorage.removeItem('onboarding_lastName')
    localStorage.removeItem('onboarding_zipCode')
    localStorage.removeItem('onboarding_interests')
    localStorage.removeItem('onboarding_representatives')

    router.push('/dashboard')
  }

  return (
    <div className="space-y-8">
      {/* Success Animation */}
      <div className="flex justify-center">
        <div className="animate-in zoom-in-50 duration-500">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <div className="absolute -right-2 -top-2">
              <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="space-y-3 text-center">
        <h1 className="text-4xl font-bold tracking-tight animate-in fade-in-50 duration-700">
          You're all set{userData.firstName && `, ${userData.firstName}`}!
        </h1>
        <p className="text-xl text-muted-foreground animate-in fade-in-50 duration-700 delay-100">
          Your personalized civic engagement dashboard is ready
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4 animate-in fade-in-50 duration-700 delay-200">
        <h3 className="font-semibold text-center">Here's what we set up:</h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="mb-2 text-3xl">👤</div>
            <p className="text-sm font-medium">Your Profile</p>
            <p className="text-xs text-muted-foreground mt-1">
              {userData.firstName} {userData.lastName}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="mb-2 text-3xl">📍</div>
            <p className="text-sm font-medium">Your Location</p>
            <p className="text-xs text-muted-foreground mt-1">
              Zip code {userData.zipCode}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="mb-2 text-3xl">💡</div>
            <p className="text-sm font-medium">Your Interests</p>
            <p className="text-xs text-muted-foreground mt-1">
              {userData.interestCount} {userData.interestCount === 1 ? 'topic' : 'topics'} selected
            </p>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6 space-y-4 animate-in fade-in-50 duration-700 delay-300">
        <h3 className="font-semibold text-lg">What's next?</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <div>
              <p className="font-medium">Explore Your Dashboard</p>
              <p className="text-sm text-muted-foreground">
                See personalized bill recommendations and your representatives
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <div>
              <p className="font-medium">Track Bills You Care About</p>
              <p className="text-sm text-muted-foreground">
                Follow legislation and get updates on their progress
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20">
              <span className="text-xs font-bold text-primary">3</span>
            </div>
            <div>
              <p className="font-medium">Listen to Your Daily Briefing</p>
              <p className="text-sm text-muted-foreground">
                Get audio summaries of important legislation
              </p>
            </div>
          </li>
        </ul>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center pt-4 animate-in fade-in-50 duration-700 delay-400">
        <Button
          size="lg"
          onClick={handleGoToDashboard}
          className="group"
        >
          Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-muted-foreground animate-in fade-in-50 duration-700 delay-500">
        <p>
          You can always update your preferences in{' '}
          <button
            onClick={() => router.push('/settings')}
            className="font-medium text-primary hover:underline"
          >
            Settings
          </button>
        </p>
      </div>
    </div>
  )
}
