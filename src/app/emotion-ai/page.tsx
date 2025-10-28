import type { Metadata } from "next";
import Link from "next/link";
import TransitionLink from "@/components/ui/TransitionLink";
import { LuBrain, LuMessageSquare, LuBarChart3, LuSparkles } from "react-icons/lu";

export const metadata: Metadata = {
  title: "Emotion AI & Sentiment Analysis | Antimatter AI",
  description:
    "Advanced emotion detection and sentiment analysis powered by our custom AI built on Hume AI and OpenAI GPT-5. Real-time facial expression tracking and 53-dimensional text emotion analysis.",
};

export default function EmotionAIPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Emotion AI that
              <br />
              <span className="text-secondary">just works</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8">
              From concept to deployment, we built custom sentiment tracking AI on top of Hume AI and OpenAI GPT-5. Real-time emotion detection, seamlessly integrated, and ready to understand your customers 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <TransitionLink
                href="/emotion-tracking-demo"
                className="bg-secondary text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-secondary/80 transition-all"
              >
                Try Emotion AI Demo
              </TransitionLink>
              <TransitionLink
                href="/contact"
                className="border border-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-all"
              >
                Build Your Own
              </TransitionLink>
            </div>
          </div>

          <p className="text-center text-gray-400 text-lg">
            Here, every emotion matters.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Emotional intelligence,
            <br />
            <span className="text-secondary">powered by AI.</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <LuBrain className="text-secondary" size={32} />
                </div>
                <div>
                  <span className="text-secondary font-semibold text-sm">01</span>
                  <h3 className="text-2xl font-semibold">Real-Time Facial Expression Tracking</h3>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Live emotion detection through webcam analysis powered by Hume AI. Track facial expressions in real-time across 53 emotional dimensions with human-like accuracy.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <LuMessageSquare className="text-secondary" size={32} />
                </div>
                <div>
                  <span className="text-secondary font-semibold text-sm">02</span>
                  <h3 className="text-2xl font-semibold">Advanced Text Sentiment Analysis</h3>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Comprehensive text emotion analysis using our custom AI built on GPT-5. Detect sentiment, intent, and emotional nuances with confidence scores and detailed insights.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <LuBarChart3 className="text-secondary" size={32} />
                </div>
                <div>
                  <span className="text-secondary font-semibold text-sm">03</span>
                  <h3 className="text-2xl font-semibold">Multi-Dimensional Emotion Metrics</h3>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Visualize emotional data through interactive radar charts. Track intensity, positivity, authenticity, complexity, clarity, and energy across all interactions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <LuSparkles className="text-secondary" size={32} />
                </div>
                <div>
                  <span className="text-secondary font-semibold text-sm">04</span>
                  <h3 className="text-2xl font-semibold">Custom Training & Integration</h3>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Seamlessly integrate emotion AI into your applications. From customer support to healthcare, our custom-trained models adapt to your specific use case and industry needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-4 bg-gray-950/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Built on cutting-edge AI technology
          </h2>
          <p className="text-gray-400 text-lg mb-12">
            Our emotion AI combines the best of Hume AI's 53-dimensional emotion detection with OpenAI GPT-5's advanced natural language understanding to deliver unparalleled emotional intelligence.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-2">Hume AI</h3>
              <p className="text-gray-400 text-sm">
                Real-time facial expression and emotion detection across 53 dimensions
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-2">OpenAI GPT-5</h3>
              <p className="text-gray-400 text-sm">
                Advanced sentiment analysis and intent detection with deep understanding
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-2">Custom Integration</h3>
              <p className="text-gray-400 text-sm">
                Seamlessly integrated into your workflow with real-time processing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to understand your customers' emotions?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Experience our emotion AI demo or contact us to build a custom solution for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <TransitionLink
              href="/emotion-tracking-demo"
              className="bg-secondary text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-secondary/80 transition-all"
            >
              Try Live Demo
            </TransitionLink>
            <TransitionLink
              href="/contact"
              className="border border-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-all"
            >
              Get Started
            </TransitionLink>
          </div>
        </div>
      </section>

      {/* Contact Footer */}
      <section className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <a
            href="mailto:atom@antimatterai.com"
            className="text-2xl font-semibold hover:text-secondary transition-colors"
          >
            atom@antimatterai.com
          </a>
        </div>
      </section>
    </div>
  );
}

