import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Coffee, Github, Mail, Zap, Users, BarChartBig, Trophy, MountainSnow, Wrench } from 'lucide-react';

const AboutPage: React.FC = () => {
  const kofiLink = "https://ko-fi.com/crispy100"
  const githubRepoLink = "https://github.com/Fjallroth/matesRaceFinal"; 
  const contactEmail = "info@matesrace.com"; 

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center mb-4"> 
            <img src="/logo.png" alt="MatesRace Logo" className="h-12 w-auto mr-3" />
            <CardTitle className="text-3xl md:text-4xl font-bold">About MatesRace</CardTitle>
          </div>
          <CardDescription className="text-lg text-muted-foreground">
            Less faff, more riding. Simple, fair, and fun Strava segment races for you and your mates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 text-foreground/90">
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-primary flex items-center">
              <MountainSnow className="mr-2 h-6 w-6" /> Why MatesRace?
            </h2>
            <p className="leading-relaxed">
              Hey, I'm Crispy! I'm a rider, a maker, and someone who tends to dive headfirst into side projects. 
              I have taken part in my share of low budget community organised races and while fun, I recall; laptops in car parks, unreliable timing and the panic of stopping your own timing system at the end of a run (slapping the Casio taped to your handlebars).
            </p>
            <p className="leading-relaxed mt-3">
              I thought, "There has to be a better way!" So, I built one. MatesRace is all about taking that faff out of friendly competition. You pick the Strava segments, set a timeframe, and invite your mates. Ride the segments, submit your Strava activity, and your times land on a group leaderboard. No arguments, no spreadsheets, and definitely no more duct taped stop watches.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center">
                <Zap className="mr-2 h-6 w-6 text-yellow-500" /> How It Works & Key Features
            </h2>
            <p className="leading-relaxed mb-4">
                MatesRace simplifies friendly Strava segment competitions:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Users className="h-5 w-5 mr-3 mt-1 text-blue-500 flex-shrink-0" />
                <span><strong>Create A Race:</strong> Easily set up races for your group. Pick your favorite Strava segments, define the race window, and set a password.</span>
              </li>
              <li className="flex items-start">
                <Trophy className="h-5 w-5 mr-3 mt-1 text-amber-500 flex-shrink-0" />
                <span><strong>Effortless Participation:</strong> Join a race with an ID and password. Once you've ridden the segments, simply submit your Strava ride through MatesRace.</span>
              </li>
              <li className="flex items-start">
                <BarChartBig className="h-5 w-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
                <span><strong>Automatic Leaderboards:</strong> We do the heavy lifting by fetching your segment times directly from your Strava activity. See who's topping the charts at a glance.</span>
              </li>
              <li className="flex items-start">
                <Zap className="h-5 w-5 mr-3 mt-1 text-purple-500 flex-shrink-0" />
                <span><strong>Focus on Fun:</strong> Adds an extra layer of friendly competition to your group rides without the hassle. It's all about enjoying the ride.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-primary flex items-center">
                <Wrench className="mr-2 h-6 w-6" /> Why MatesRace is Free
            </h2>
            <p className="leading-relaxed">
              Like many of you, I'm tired of endless subscriptions for everything. MatesRace is my contribution to the cycling community, particularly for mountain bikers although use it as creatively as you wish. 
              I want this to be an accessible tool that adds a little extra fun to your hobby without reaching for your wallet or being bombarded by ads.
            </p>
          </section>

          <section className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Enjoying MatesRace?</h2>
            <p className="mb-2 text-muted-foreground">
              Your encouragement means a lot and helps keep this project alive and kicking!
            </p>
            <p className="mb-6 text-muted-foreground">
              If MatesRace is adding some fun to your rides and you'd like to support its upkeep, a small tip would be massively appreciated. 
              It helps me dedicate more time to maintaining and improving the app.
              If you don't have the means to tip, don't worry, you can enjoy this for free and I will find a way to make it work.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-white text-base py-3 px-6">
                <a href={kofiLink} target="_blank" rel="noopener noreferrer">
                  <Coffee className="mr-2 h-5 w-5" /> Support MatesRace
                </a>
              </Button>
              <Button variant="outline" asChild className="text-base py-3 px-6">
                <a href={githubRepoLink} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-5 w-5" /> View on GitHub
                </a>
              </Button>
              <Button variant="outline" asChild className="text-base py-3 px-6">
                <a href={`mailto:${contactEmail}`}>
                  <Mail className="mr-2 h-5 w-5" /> Contact Crispy
                </a>
              </Button>
            </div>
            <p className="text-xs mt-4 text-muted-foreground">Everyone who tips gets a virtual high-five and my sincere thanks!</p>
          </section>

          <div className="text-center mt-10">
            <Button asChild size="lg">
              <Link to="/home">Back to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutPage;