import { redirect } from 'next/navigation';
import { getUserData } from '@/lib/actions/user-data';
import { Button } from '@/components/ui/button';
import { ArrowRight, GraduationCap, Users, UserCheck, Award, TrendingUp, Shield } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import Link from 'next/link';

export default async function HomePage() {
  const user = await getUserData();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight sm:text-5xl md:text-6xl">
            Welcome to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {siteConfig.name}
            </span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
            {siteConfig.description}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="text-lg rounded-full px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Link href="/sign-up">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg rounded-full px-8 py-3"
            >
              <Link href="/sign-in">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">
              Designed for Every User
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you're a student, parent, or counselor, we have the tools you need
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="flex justify-center mb-4">
                <GraduationCap className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Students</h3>
              <p className="text-muted-foreground mb-4">
                Track applications, manage deadlines, and maximize your scholarship opportunities
              </p>
              <ul className="text-sm text-left space-y-2">
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  Application tracking
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Progress analytics
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Deadline reminders
                </li>
              </ul>
            </div>

            <div className="text-center p-6 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Parents</h3>
              <p className="text-muted-foreground mb-4">
                Monitor and support your child's scholarship journey with transparency
              </p>
              <ul className="text-sm text-left space-y-2">
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-600" />
                  Child progress monitoring
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Financial planning tools
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Real-time updates
                </li>
              </ul>
            </div>

            <div className="text-center p-6 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <div className="flex justify-center mb-4">
                <UserCheck className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Counselors</h3>
              <p className="text-muted-foreground mb-4">
                Guide students effectively with comprehensive management tools
              </p>
              <ul className="text-sm text-left space-y-2">
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  Student portfolio management
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  Success analytics
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  Program oversight
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Scholarship Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of students who have maximized their scholarship opportunities
          </p>
          <Button
            asChild
            size="lg"
            className="text-lg rounded-full px-8 py-3 bg-white text-blue-600 hover:bg-gray-100"
          >
            <Link href="/sign-up">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}