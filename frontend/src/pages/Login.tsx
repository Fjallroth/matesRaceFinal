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
import { Zap, Users, BarChartBig, Trophy, Mountain } from "lucide-react";

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
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
            MatesRace
          </h1>
          <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            Add some friendly competition to your group ride!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 bg-card/50 p-6 sm:p-8 rounded-lg shadow-lg border">
            <h2 className="text-2xl font-semibold text-foreground mb-1">Plan races without the faff</h2>
            <p className="text-foreground/90 leading-relaxed">
              MatesRace is for cyclists who love a bit of healthy competition. Forget spreadsheets and manual timing — this is racing made easy.
            </p>

            <h3 className="text-xl font-semibold text-foreground pt-3">How it works:</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <Zap className="h-5 w-5 mr-3 mt-1 text-yellow-500 flex-shrink-0" />
                <span><strong>Pick Your Racecourse:</strong> Organizers select Strava segments for the race.</span>
              </li>
              <li className="flex items-start">
                <Users className="h-5 w-5 mr-3 mt-1 text-blue-500 flex-shrink-0" />
                <span><strong>Ride & Record:</strong> Participants ride the segments and record their activity on Strava as usual.</span>
              </li>
              <li className="flex items-start">
                <BarChartBig className="h-5 w-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
                <span><strong>Submit Your Ride:</strong> Connect to MatesRace, submit your activity, and we’ll pull your segment times.</span>
              </li>
              <li className="flex items-start">
                <Trophy className="h-5 w-5 mr-3 mt-1 text-amber-500 flex-shrink-0" />
                <span><strong>Leaderboard:</strong> See how you and your mates stack up. Simple, fair, and fun!</span>
              </li>
            </ul>
            <p className="text-sm text-center text-muted-foreground/80 pt-4">
              <strong>Heads up:</strong> MatesRace relies on Strava for all activity and segment data. You’ll need a free Strava account to join races. We use Strava to securely verify your identity and fetch your segment efforts.
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-semibold">
                Ready to Race Your Mates?
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 py-8">
              <Button
                onClick={handleStravaLogin}
                className="w-full max-w-xs text-lg py-3 bg-orange-600 hover:bg-orange-700 text-white shadow-md"
                size="lg"
              >
                <Mountain className="w-5 h-5 mr-2.5" />
                Connect with Strava
              </Button>

              <div className="text-sm text-center text-muted-foreground/80 space-y-4 pt-4">
                <p>
                  <strong>Data:</strong> We never see your contact details. That means:
                  <br />– No marketing spam<br />– No selling your data
                </p>
                <div>
                  <strong>What data do we store?</strong>
                  <p className="pt-1">
                    When you log in with Strava, we securely store the following:
                  </p>
                  <ul className="list-disc list-inside text-left mt-2 space-y-1">
                    <li>Your display name</li>
                    <li>Your selected gender</li>
                    <li>Your city, state, and country (as entered in Strava)</li>
                    <li>Your Strava profile image URL</li>
                  </ul>
                  <p className="pt-2">
                    This data helps us personalise the experience and select a suitable server location. It's stored in a database protected by 2FA.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center border-t pt-6 pb-6">
              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2">
                  Curious?{" "}
                  <Link to="/about" className="text-primary hover:underline font-medium">
                    Learn more about MatesRace & Crispy (the maker!)
                  </Link>
                </p>
                <p className="text-xs mt-2">
                  By connecting, you agree to our  {" "}
                  <a href="/terms-and-conditions" className="text-primary/80 hover:underline">Terms</a> &{" "}
                  <a href="/privacy-policy" className="text-primary/80 hover:underline">Privacy Policy</a>.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
