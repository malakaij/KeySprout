import Link from 'next/link'
import { BookOpen, Gamepad2, Users, Zap, Target, Award } from 'lucide-react'
import { Pip } from '@/components/ui/Pip'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Pip size="lg" variant="wave" />
          </div>
          <div className="inline-flex items-center gap-2 kq-chip bg-mint/20 border-mint text-ink text-sm mb-6">
            <span>🌱</span>
            <span>Free typing curriculum for everyone</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-display text-ink mb-6 leading-tight">
            Master the Keyboard,
            <br />
            <span className="text-coral">Unlock Your Potential</span>
          </h1>
          <p className="text-xl text-ink/50 mb-10 max-w-2xl mx-auto font-body">
            A structured typing curriculum that takes you from hunt-and-peck to professional speed.
            Engaging lessons, fun games, and powerful progress tracking.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="kq-btn bg-coral text-white px-8 py-4 font-display text-lg w-full sm:w-auto text-center"
            >
              Start Learning Free
            </Link>
            <Link
              href="/teacher"
              className="kq-btn bg-paper-dark text-ink px-8 py-4 font-display text-lg w-full sm:w-auto text-center"
            >
              I&apos;m a Teacher
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-paper-dark">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-display text-center text-ink mb-4">
            Everything you need to type like a pro
          </h2>
          <p className="text-ink/50 text-center mb-12 font-body">
            KeySprout provides a complete learning experience from beginner to expert
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="kq-card p-6">
              <div className="w-12 h-12 bg-mint/30 rounded-xl border-2 border-mint flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-ink" />
              </div>
              <h3 className="text-lg font-display text-ink mb-2">Structured Curriculum</h3>
              <p className="text-ink/50 text-sm font-body">
                250 carefully designed lessons across 5 sections. Start with home row keys and build up to
                full speed typing with real English passages.
              </p>
            </div>

            <div className="kq-card p-6">
              <div className="w-12 h-12 bg-sunny/30 rounded-xl border-2 border-sunny flex items-center justify-center mb-4">
                <Gamepad2 className="w-6 h-6 text-ink" />
              </div>
              <h3 className="text-lg font-display text-ink mb-2">Typing Mini Games</h3>
              <p className="text-ink/50 text-sm font-body">
                Make practice fun with Word Rain and Letter Hunt. Improve your reflexes and accuracy
                while competing for your personal best score.
              </p>
            </div>

            <div className="kq-card p-6">
              <div className="w-12 h-12 bg-sky/30 rounded-xl border-2 border-sky flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-ink" />
              </div>
              <h3 className="text-lg font-display text-ink mb-2">Teacher Dashboard</h3>
              <p className="text-ink/50 text-sm font-body">
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
            <p className="text-4xl font-display text-mint mb-2">250</p>
            <p className="text-ink/50 text-sm font-body">Structured Lessons</p>
          </div>
          <div>
            <p className="text-4xl font-display text-sunny mb-2">2</p>
            <p className="text-ink/50 text-sm font-body">Fun Mini Games</p>
          </div>
          <div>
            <p className="text-4xl font-display text-coral mb-2">100%</p>
            <p className="text-ink/50 text-sm font-body">Free to Use</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-paper-dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-display text-center text-ink mb-12">How KeySprout Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '1', title: 'Sign in with Google', desc: 'Quick and easy setup. Your progress syncs automatically across devices.', color: 'bg-coral' },
              { n: '2', title: 'Follow the curriculum', desc: 'Progress through 250 lessons from home row basics to high-speed passages.', color: 'bg-mint' },
              { n: '3', title: 'Track your growth', desc: 'See your WPM and accuracy improve over time with detailed analytics.', color: 'bg-sky' },
            ].map((step) => (
              <div key={step.n} className="text-center">
                <div className={`w-12 h-12 ${step.color} rounded-full border-[3px] border-ink flex items-center justify-center mx-auto mb-4 font-display text-white text-lg shadow-ink-sm`}>{step.n}</div>
                <h3 className="font-display text-ink mb-2">{step.title}</h3>
                <p className="text-ink/50 text-sm font-body">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-display text-center text-ink mb-12">What Students Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', role: 'High School Student', quote: 'I went from 20 WPM to 65 WPM in just 6 weeks. The games make it actually fun!', avatar: 'S', color: 'bg-coral' },
              { name: 'James K.', role: 'College Freshman', quote: 'The structured curriculum is fantastic. I love how each lesson builds on the last.', avatar: 'J', color: 'bg-sky' },
              { name: 'Ms. Chen', role: 'Middle School Teacher', quote: 'The teacher dashboard makes it so easy to see which students need extra help.', avatar: 'C', color: 'bg-mint' },
            ].map((t) => (
              <div key={t.name} className="kq-card p-5">
                <p className="text-ink/70 text-sm italic mb-4 font-body">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${t.color} rounded-full border-[3px] border-ink flex items-center justify-center text-white text-sm font-display flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink font-body">{t.name}</p>
                    <p className="text-xs text-ink/40 font-body">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-paper-dark">
        <div className="max-w-2xl mx-auto text-center">
          <Zap className="w-12 h-12 text-coral mx-auto mb-4" />
          <h2 className="text-3xl font-display text-ink mb-4">Ready to start typing faster?</h2>
          <p className="text-ink/50 mb-8 font-body">Join thousands of learners improving their typing skills with KeySprout.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="kq-btn bg-coral text-white px-8 py-4 font-display">
              Get Started Free
            </Link>
            <Link href="/lessons" className="kq-btn bg-paper text-ink px-8 py-4 font-display flex items-center gap-2 justify-center">
              <Target className="w-4 h-4" />
              Browse Lessons
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t-[3px] border-ink/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-ink/30 text-sm font-body">
          <div className="flex items-center gap-2">
            <span>🌱</span>
            <span className="font-display text-ink/50">KeySprout</span>
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
