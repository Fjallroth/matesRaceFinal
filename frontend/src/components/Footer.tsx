import React from 'react';
import { Coffee } from 'lucide-react';
import { Link } from 'react-router-dom'; 

const Footer: React.FC = () => {
  const kofiLink = "https://www.https://ko-fi.com/crispy100";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 text-muted-foreground py-8 text-center mt-auto">
      <div className="container mx-auto px-4">
        <div className="mb-4">
          <Coffee className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-sm md:text-base leading-relaxed">
            I made MatesRace because strapping digital watches to handlebars and calling it "timing" needed an upgrade! This app is my way of taking the faff out so you can enjoy the ride (and the friendly competition!).
          </p>
          <p className="text-sm md:text-base leading-relaxed mt-3">
            I am offering this for free and I want to keep it that way, I can't be bleeding folks dry with yet another subscription. 
            That being said if you are enjoying it and want help keep the servers online, I would really appreciate a tip or donation. 
            I will try my best to maintain this and your encouragement does a long way!
          </p>
          <div className="mt-4">
            <a
              href={kofiLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 transition-colors"
            >
              <Coffee className="mr-2 h-5 w-5" /> Support MatesRace
            </a>
          </div>
        </div>
        <div className="text-xs mt-6">
          <p>&copy; {currentYear} MatesRace by Crispy.</p>
          <p>
            <Link to="/about" className="hover:underline">About MatesRace</Link>
            {' | '}
            <a href="https://www.strava.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Powered by Strava</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;