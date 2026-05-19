import Link from 'next/link'
import { BookOpen, Gamepad2, Users, Zap, Target, Award } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-slate-900 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-800 rounded-full px-4 py-1.5 text-emerald-400 text-sm font-medium mb-6">
            <span>🌱</span>
            <span>Free typing curriculum for everyone</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-100 mb-6 leading-tight">
            Master the Keyboard,
            <br />
            <span className="text-emerald-400">Unlock Your Potential</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            A structured typing curriculum that takes you from hunt-and-peck to professional speed.
            Engaging lessons, fun games, and powerful progress tracking.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors text-lg w-full sm:w-auto text-center"
            >
              Start Learning Free
            </Link>
            <Link
              href="/teacher"
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors border border-slate-700 text-lg w-full sm:w-auto text-center"
            >
              I'm a Teacher
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-100 mb-4">
            Everything you need to type like a pro
          </h2>
          <p className="text-slate-400 text-center mb-12">
            KeySprout provides a complete learning experience from beginner to expert
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-emerald-900/50 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Structured Curriculum</h3>
              <p className="text-slate-400 text-sm">
                30 carefully designed lessons across 5 units. Start with home row keys and build up to
                full speed typing with real English passages.
              </p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-amber-900/50 rounded-xl flex items-center justify-center mb-4">
                <Gamepad2 className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Typing Mini Games</h3>
              <p className="text-slate-400 text-sm">
                Make practice fun with Word Rain and Letter Hunt. Improve your reflexes and accuracy
                while competing for your personal best score.
              </p>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Teacher Dashboard</h3>
              <p className="text-slate-400 text-sm">
                Create virtual classrooms, track student progress in real time, identify struggling
                learners, and celebrate achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-emerald-400 mb-2">30</p>
            <p className="text-slate-400 text-sm">Structured Lessons</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-amber-400 mb-2">2</p>
            <p className="text-slate-400 text-sm">Fun Mini Games</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-blue-400 mb-2">100%</p>
            <p className="text-slate-400 text-sm">Free to Use</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-100 mb-12">How KeySprout Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">1</div>
              <h3 className="font-semibold text-slate-200 mb-2">Sign in with Google</h3>
              <p className="text-slate-400 text-sm">Quick and easy setup. Your progress syncs automatically across devices.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">2</div>
              <h3 className="font-semibold text-slate-200 mb-2">Follow the curriculum</h3>
              <p className="text-slate-400 text-sm">Progress through 30 lessons from home row basics to high-speed passages.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">3</div>
              <h3 className="font-semibold text-slate-200 mb-2">Track your growth</h3>
              <p className="text-slate-400 text-sm">See your WPM and accuracy improve over time with detailed analytics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-100 mb-12">What Students Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah M.',
                role: 'High School Student',
                quote: 'I went from 20 WPM to 65 WPM in just 6 weeks. The games make it actually fun!',
                avatar: 'S',
              },
              {
                name: 'James K.',
                role: 'College Freshman',
                quote: 'The structured curriculum is fantastic. I love how each lesson builds on the last.',
                avatar: 'J',
              },
              {
                name: 'Ms. Chen',
                role: 'Middle School Teacher',
                quote: 'The teacher dashboard makes it so easy to see which students need extra help.',
                avatar: 'C',
              },
            ].map((t) => (
              <div key={t.name} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <p className="text-slate-300 text-sm italic mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-t from-emerald-900/20 to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <Zap className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-100 mb-4">Ready to start typing faster?</h2>
          <p className="text-slate-400 mb-8">Join thousands of learners improving their typing skills with KeySprout.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors">
              Get Started Free
            </Link>
            <Link href="/lessons" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl transition-colors flex items-center gap-2 justify-center">
              <Target className="w-4 h-4" />
              Browse Lessons
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <span>🌱</span>
            <span>KeySprout</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Award className="w-3 h-3" />
            <span>Free forever. No ads.</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
