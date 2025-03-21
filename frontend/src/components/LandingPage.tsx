import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LandingPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  console.log(token);

  const handleGetStarted = () => {
    const destination = token ? "/board" : "/login";
    navigate(destination);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="bg-[url(/image.jpg)] w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container max-w-none px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                OpenKanban
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-900 md:text-xl dark:text-gray-600">
                A simple, powerful, and open-source Kanban board to manage your
                projects with ease.
              </p>
              <div className="space-x-4">
                <Button size="lg" onClick={handleGetStarted}>
                  Get Started
                </Button>

                <a
                  href="https://github.com/saurabhchopda/openkanban"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg">
                    View on GitHub
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container max-w-none px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Simple & Intuitive</CardTitle>
                  <CardDescription>
                    Easy to use interface that gets out of your way
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  Drag and drop cards, create lists, and organize your work
                  effortlessly.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Collaborative</CardTitle>
                  <CardDescription>
                    Work together with your team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  Share boards, assign tasks, and track progress in real-time.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Customizable</CardTitle>
                  <CardDescription>Make it yours</CardDescription>
                </CardHeader>
                <CardContent>
                  Customize labels, create templates, and adapt the board to
                  your workflow.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container max-w-none px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter">
                Ready to get started?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                Join thousands of teams already using OpenKanban to manage their
                projects.
              </p>
              <Button size="lg" onClick={handleGetStarted}>
                Create Your First Board
              </Button>
              {/* <Link to="/board">
                <Button size="lg">Create Your First Board</Button>
              </Link> */}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-6">
        <div className="container max-w-none px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 OpenKanban. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                to="/privacy"
                className="text-sm text-gray-500 hover:underline dark:text-gray-400"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-500 hover:underline dark:text-gray-400"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
