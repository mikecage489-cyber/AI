import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline">Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Total Portals</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Active Bids</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Scrape Jobs</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Today&apos;s Bids</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Portal Management</CardTitle>
              <CardDescription>Add and manage government portals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Configure portals to scrape bids from different government websites.
                Store credentials securely and customize field mappings.
              </p>
              <div className="flex gap-2">
                <Button disabled>Add Portal</Button>
                <Button variant="outline" disabled>View Portals</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bid Management</CardTitle>
              <CardDescription>View and export collected bids</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Browse all collected bids, filter by portal or date, and export
                to CSV or Excel format for further analysis.
              </p>
              <div className="flex gap-2">
                <Button disabled>View Bids</Button>
                <Button variant="outline" disabled>Export</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scraper Status</CardTitle>
              <CardDescription>Monitor scraping jobs and logs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Track the status of scraping jobs, view detailed logs, and
                troubleshoot any issues with the scraper.
              </p>
              <div className="flex gap-2">
                <Button disabled>View Jobs</Button>
                <Button variant="outline" disabled>View Logs</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Access the API reference</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                The platform provides a REST API for programmatic access to all
                features. View the full API documentation in the README.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <a href="https://github.com/mikecage489-cyber/AI#api-documentation" target="_blank" rel="noopener noreferrer">
                    View API Docs
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Follow these steps to start scraping bids</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600">1.</span>
                <div>
                  <p className="font-semibold">Set up environment variables</p>
                  <p className="text-gray-600">Copy .env.example to .env and configure your database, Redis, and encryption keys</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600">2.</span>
                <div>
                  <p className="font-semibold">Run database migrations</p>
                  <p className="text-gray-600">Execute <code className="bg-gray-100 px-1 py-0.5 rounded">npm run prisma:migrate</code> to set up the database</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600">3.</span>
                <div>
                  <p className="font-semibold">Start the scraper worker</p>
                  <p className="text-gray-600">Run <code className="bg-gray-100 px-1 py-0.5 rounded">npm run worker</code> in a separate terminal</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-blue-600">4.</span>
                <div>
                  <p className="font-semibold">Add your first portal</p>
                  <p className="text-gray-600">Use the API or add a portal through the database to get started</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
