import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Zap, Users, BarChartBig, Trophy, HelpCircle, Mountain } from "lucide-react";

const Login: React.FC = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const stravaLoginUrl = `${backendUrl}/oauth2/authorization/strava`;
  const handleStravaLogin = () => {
    window.location.href = stravaLoginUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <div className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="MatesRace Logo" className="h-16 w-auto mx-auto mb-4" /> {/* Assuming logo.png is in public */}
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
            Welcome to MatesRace!
          </h1>
          <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            Turn your regular Strava segments into epic (but friendly!) races with your mates.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 bg-card/50 p-6 sm:p-8 rounded-lg shadow-lg border">
            <h2 className="text-2xl font-semibold text-foreground mb-1">Tired of duct-taping watches to handlebars?</h2>
            <p className="text-muted-foreground text-sm mb-4"> (Yes, that's genuinely how this whole thing started!) </p>
            <p className="text-foreground/90 leading-relaxed">
              MatesRace is for cyclists who love a good, friendly challenge. Ever wanted an easy way to see who's quickest on your favorite local Strava segments without the faff of spreadsheets or manually checking leaderboards? That's exactly why MatesRace was built.
            </p>

            <h3 className="text-xl font-semibold text-foreground pt-3">Here's the Lowdown:</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <Zap className="h-5 w-5 mr-3 mt-1 text-yellow-500 flex-shrink-0" />
                <span><strong>Pick Your Battleground:</strong> Organizers choose specific Strava segments for the race.</span>
              </li>
              <li className="flex items-start">
                <Users className="h-5 w-5 mr-3 mt-1 text-blue-500 flex-shrink-0" />
                <span><strong>Ride & Record:</strong> Participants ride the segments and record their activities on Strava like they normally would.</span>
              </li>
              <li className="flex items-start">
                <BarChartBig className="h-5 w-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
                <span><strong>Submit Your Ride:</strong> Connect to MatesRace, submit your Strava activity, and we'll pull your segment times.</span>
              </li>
              <li className="flex items-start">
                <Trophy className="h-5 w-5 mr-3 mt-1 text-amber-500 flex-shrink-0" />
                <span><strong>Leaderboard Glory:</strong> See how you and your mates stack up. Simple, fair, and fun!</span>
              </li>
            </ul>
            <p className="text-sm text-center text-muted-foreground/80 pt-4">
              <strong>Heads up:</strong> MatesRace relies on Strava for all activity and segment data. You'll need a Strava account (it's free!) to participate in races. We use it to securely verify you and fetch your segment efforts.
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-semibold">
                Ready to Race Your Mates?
              </CardTitle>
              <CardDescription className="text-center">
                Connect with Strava to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 py-8">
              <Button
                onClick={handleStravaLogin}
                className="w-full max-w-xs text-lg py-3 bg-orange-600 hover:bg-orange-700 text-white shadow-md"
                size="lg"
              >
                <Mountain className="w-5 h-5 mr-2.5" /> {/* Strava-like icon */}
                Connect with Strava
              </Button>
              <p className="text-xs text-muted-foreground text-center max-w-xs px-2">
                MatesRace uses Strava for authentication and to automatically fetch your segment results for races you're part of. We'll never post to Strava or share your data without your permission.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center border-t pt-6 pb-6">
              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2">
                  Curious?{' '}
                  <Link to="/about" className="text-primary hover:underline font-medium">
                    Learn more about MatesRace & Crispy (the maker!)
                  </Link>
                </p>
                 <p className="text-xs mt-2">
                  By connecting, you agree to our imaginary (but soon-to-be-real?) <a href="#" className="text-primary/80 hover:underline">Terms</a> & <a href="#" className="text-primary/80 hover:underline">Privacy Policy</a>.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* IMAGE PLACEHOLDER - User to add image here
        <div className="mt-12 text-center px-4">
          <h3 className="text-xl font-semibold mb-4 text-foreground">MatesRace in Action</h3>
          <img 
            src="/placeholder-matesrace-collage.png" // Replace with your actual image path
            alt="Screenshots of MatesRace showing race creation and leaderboards" 
            className="max-w-3xl mx-auto rounded-lg shadow-2xl border"
          />
          <p className="text-sm text-muted-foreground mt-3">
            (This is where your awesome collage of app screenshots will go!)
          </p>
        </div> 
        */}
      </div>
    </div>
  );
};

export default Login;