'use client'

import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import { Bookmark, Chrome } from 'lucide-react'

export default function LoginPage() {
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`
      }
    })
  }

  return (
    <div className="min-h-screen bg-background gradient-mesh flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-scale-in">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-xl">
            <Bookmark className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-2">
            SmartMark
          </h1>

          <p className="text-foreground-muted text-lg">
            Your personal bookmark manager
          </p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
            Welcome back
          </h2>

          <p className="text-foreground-muted text-center mb-8">
            Sign in to access your bookmarks
          </p>

          <Button
            onClick={loginWithGoogle}
            className="w-full"
            size="lg"
          >
            <Chrome className="w-5 h-5" />
            Continue with Google
          </Button>

          <p className="text-xs text-foreground-subtle text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">∞</div>
            <div className="text-xs text-foreground-muted mt-1">Unlimited</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">⚡</div>
            <div className="text-xs text-foreground-muted mt-1">Real-time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">🔒</div>
            <div className="text-xs text-foreground-muted mt-1">Secure</div>
          </div>
        </div>
      </div>
    </div>
  )
}
