'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        // Handle rate limit errors with a friendly message
        if (error.message.toLowerCase().includes('rate limit') || error.status === 429) {
          setError('Muitas tentativas de cadastro. Por favor, aguarde alguns minutos e tente novamente.')
        } else if (error.message.includes('already registered')) {
          setError('Este e-mail já está cadastrado. Tente fazer login ou recuperar sua senha.')
        } else {
          setError(error.message)
        }
        return
      }

      // Force a full page reload to ensure cookies are properly read by middleware
      window.location.href = '/dashboard'
    } catch (err) {
      // Handle network/fetch errors that may also be rate limits
      if (err instanceof Error && (err.message.includes('429') || err.message.includes('rate'))) {
        setError('Muitas tentativas de cadastro. Por favor, aguarde alguns minutos e tente novamente.')
      } else {
        setError('Ocorreu um erro inesperado. Por favor, tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Start practicing ECG interpretation today
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <Input
              id="fullName"
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. John Smith"
              required
              autoComplete="name"
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              autoComplete="new-password"
            />
            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Create account
            </Button>
            <p className="text-sm text-gray-600 text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
