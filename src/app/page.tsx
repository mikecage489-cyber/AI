import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Government Bid Scraper</h1>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Automate Your Government Bid Discovery
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Extract procurement bids from multiple US state and local government portals.
            Secure, scalable, and built for efficiency.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>🔐 Secure</CardTitle>
              <CardDescription>AES-256-GCM encryption for credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Your portal credentials are encrypted and stored securely.
                JWT-based authentication protects your data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🤖 Automated</CardTitle>
              <CardDescription>Intelligent scraping with Playwright</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Automatically scrape bids from multiple portals with support for
                authentication, pagination, and error handling.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Normalized</CardTitle>
              <CardDescription>Unified data format across portals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                All bid data is normalized to a standard schema, making it easy
                to search, filter, and export.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get started in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                <div>
                  <p className="font-semibold">Add a Portal</p>
                  <p className="text-sm text-gray-600">Configure your first government portal with credentials if needed</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                <div>
                  <p className="font-semibold">Run Scraper</p>
                  <p className="text-sm text-gray-600">Click the scrape button to extract today&apos;s bids</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                <div>
                  <p className="font-semibold">View & Export</p>
                  <p className="text-sm text-gray-600">Browse bids and export to CSV or Excel</p>
                </div>
              </li>
            </ol>
            <div className="mt-6">
              <Link href="/dashboard">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-2">Built with modern technology</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <span>Next.js 14</span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>Prisma</span>
            <span>•</span>
            <span>PostgreSQL</span>
            <span>•</span>
            <span>Redis</span>
            <span>•</span>
            <span>Playwright</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2025 Government Bid Scraper. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
