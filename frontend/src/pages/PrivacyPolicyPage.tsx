import React from 'react';
import { Link } from 'react-router-dom'; 

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-center text-primary">
            Privacy Policy
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Last Updated: May 27, 2025 
          </p>
        </header>

        <section className="prose prose-lg dark:prose-invert max-w-none mx-auto bg-card p-6 md:p-8 rounded-lg shadow-md">
          <p>
            Welcome to MatesRace! This Privacy Policy explains how MatesRace ("we," "us," or "our") 
            collects, uses, shares, and protects your personal information when you use our website 
            and services (collectively, the "Service"). We are committed to protecting your privacy 
            and ensuring your personal data is handled in a safe and responsible manner.
          </p>
          <p>
            Please read this Privacy Policy carefully. By using our Service, you agree to the 
            collection and use of information in accordance with this policy.
          </p>

          {/* --- Section 1: Information We Collect --- */}
          <h2>1. Information We Collect</h2>
          <p>
            When you use MatesRace, we collect information to provide and improve our Service. 
            The types of information we collect depend on how you interact with us.
          </p>

          <h3>a. Information You Provide to Us via Strava:</h3>
          <p>
            To use MatesRace, you will need to log in using your Strava account. When you connect 
            your Strava account, Strava provides us with access to certain information from your 
            Strava profile, subject to your Strava privacy settings and the permissions you grant. 
            This information includes:
          </p>
          <ul>
            <li><strong>Strava ID:</strong> Your unique Strava identifier.</li>
            <li>
              <strong>Profile Information:</strong> Your display name, first name, last name, 
              profile picture URL, gender (sex), city, state, and country as provided on your 
              Strava profile.
            </li>
            <li>
              <strong>Strava Authentication Tokens:</strong> Access tokens, refresh tokens, and 
              token expiry dates to securely connect to your Strava account and fetch data 
              on your behalf.
            </li>
          </ul>

          <h3>b. Information Related to Your Use of the Service:</h3>
          <ul>
            <li>
              <strong>Race Participation:</strong> Information about the races you create or join, 
              including race name, description, chosen Strava segments, and passwords for races 
              you organize.
            </li>
            <li>
              <strong>Activity Data for Races:</strong> When you submit a Strava activity for a 
              race you've joined, we access details of that specific activity from Strava, 
              including segment efforts (times, segment names, segment IDs) and the activity ID. 
              We only fetch activities that fall within the race's defined start and end dates.
            </li>
          </ul>

          <h3>c. Cookies and Usage Data:</h3>
          <ul>
            <li>
              <strong>Session Cookies:</strong> We use session cookies (e.g., <code>connect.sid</code>) 
              to manage your login session and allow you to navigate the Service without having to 
              log in repeatedly. These cookies are strictly necessary for the functioning of the 
              authenticated parts of our Service. They typically expire when you close your 
              browser or after a set period (e.g., 24 hours).
            </li>
            <li>
              <strong>Log Data:</strong> We may automatically collect information that your browser 
              sends whenever you visit our Service ("Log Data"). This Log Data may include 
              information such as your computer's Internet Protocol ("IP") address, browser type, 
              browser version, the pages of our Service that you visit, the time and date of your 
              visit, the time spent on those pages, and other statistics. This information is 
              used for service-related diagnostics and performance monitoring.
            </li>
          </ul>

          {/* --- Section 2: How We Use Your Information --- */}
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect for various purposes:</p>
          <ul>
            <li><strong>To Provide and Maintain Our Service:</strong> To allow you to create an account, log in, create and join races, submit your activities, and view leaderboards.</li>
            <li><strong>To Personalize Your Experience:</strong> To display your name and profile picture within the Service, such as on leaderboards or participant lists.</li>
            <li><strong>To Manage Your Account:</strong> To communicate with you about your account or our Service if necessary.</li>
            <li><strong>To Improve Our Service:</strong> To understand how users interact with our Service and to make improvements.</li>
            <li><strong>To Ensure Security and Prevent Abuse:</strong> To protect the security of our Service and prevent fraudulent activity.</li>
            <li><strong>For Legal Compliance:</strong> To comply with applicable legal obligations.</li>
          </ul>

          {/* --- Section 3: How We Share Your Information --- */}
          <h2>3. How We Share Your Information</h2>
          <p>
            We do not sell your personal information. We may share your information in the 
            following circumstances:
          </p>
          <ul>
            <li>
              <strong>With Other MatesRace Users:</strong>
              <ul>
                <li>Your Strava display name, first name, last name, profile picture, and gender may be visible to other participants in races you join or organize, particularly on leaderboards and participant lists.</li>
                <li>Your segment times and total race times for submitted activities will be visible on leaderboards, subject to the race organizer's settings for hiding leaderboards until the race finish.</li>
              </ul>
            </li>
            <li>
              <strong>With Strava:</strong> We interact with the Strava API to authenticate you and 
              retrieve your activity data as described. Our use of Strava data is subject to 
              Strava's API Agreement and their policies. We encourage you to review Strava's 
              Privacy Policy.
            </li>
            <li>
              <strong>Service Providers:</strong> We use third-party service providers for hosting our 
              application and database (e.g., Render, MongoDB). These providers only process 
              your information on our behalf and are obligated to protect it.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose your information if required to do 
              so by law or in response to valid requests by public authorities (e.g., a court 
              or a government agency).
            </li>
            <li>
              <strong>Business Transfers:</strong> If MatesRace is involved in a merger, acquisition, 
              or asset sale, your Personal Data may be transferred.
            </li>
          </ul>
          
          {/* --- Section 4: Data Retention --- */}
          <h2>4. Data Retention</h2>
          <p>
            We will retain your personal information only for as long as is necessary for the 
            purposes set out in this Privacy Policy. This includes:
          </p>
          <ul>
            <li>Your Strava profile information (name, Strava ID, profile picture, etc.) will be retained as long as your MatesRace account is active.</li>
            <li>Race data, including participant lists and segment results, will be retained to display historical race information.</li>
            <li>Strava access tokens are stored to allow you to submit activities without re-authenticating repeatedly and are refreshed or removed according to Strava's policies and your token expiry.</li>
            <li>Session cookies are temporary and expire as described above.</li>
          </ul>
          <p>
            You can request deletion of your account and associated personal data by contacting us 
            at <a href="mailto:info@matesrace.com" className="text-primary hover:underline">info@matesrace.com</a>.
          </p>

          {/* --- Section 5: Your Data Protection Rights (GDPR) --- */}
          <h2>5. Your Data Protection Rights (GDPR)</h2>
          <p>
            If you are a resident of the European Economic Area (EEA), you have certain data 
            protection rights. MatesRace aims to take reasonable steps to allow you to correct, 
            amend, delete, or limit the use of your Personal Data.
          </p>
          <ul>
            <li><strong>The right to access, update or delete</strong> the information we have on you.</li>
            <li><strong>The right of rectification.</strong> You have the right to have your information rectified if that information is inaccurate or incomplete.</li>
            <li><strong>The right to object.</strong> You have the right to object to our processing of your Personal Data.</li>
            <li><strong>The right of restriction.</strong> You have the right to request that we restrict the processing of your personal information.</li>
            <li><strong>The right to data portability.</strong> You have the right to be provided with a copy of the information we have on you in a structured, machine-readable, and commonly used format.</li>
            <li><strong>The right to withdraw consent.</strong> You also have the right to withdraw your consent at any time where MatesRace relied on your consent to process your personal information.</li>
          </ul>
          <p>
            Please note that we may ask you to verify your identity before responding to such 
            requests. You have the right to complain to a Data Protection Authority about our 
            collection and use of your Personal Data.
          </p>

          {/* --- Section 6: Data Security --- */}
          <h2>6. Data Security</h2>
          <p>
            The security of your data is important to us. We use MongoStore for session management, 
            which is stored in our MongoDB database. User passwords for races are stored, and 
            while we take measures to protect your data, no method of transmission over the 
            Internet or method of electronic storage is 100% secure. Passwords you set for races 
            are for sharing with participants and should not be reused from other important accounts.
          </p>

          {/* --- Section 7: Children's Privacy --- */}
          <h2>7. Children's Privacy</h2>
          <p>
            Our Service does not address anyone under the age of 13 (or a higher age threshold 
            depending on your local jurisdiction, e.g., 16 in some EU countries). We do not 
            knowingly collect personally identifiable information from children. If you are a 
            parent or guardian and you are aware that your child has provided us with Personal 
            Data, please contact us. If we become aware that we have collected Personal Data 
            from children without verification of parental consent, we take steps to remove 
            that information from our servers.
          </p>

          {/* --- Section 8: Links to Other Sites --- */}
          <h2>8. Links to Other Sites</h2>
          <p>
            Our Service may contain links to other sites that are not operated by us (e.g., 
            Ko-fi for donations, Strava). If you click on a third-party link, you will be 
            directed to that third party's site. We strongly advise you to review the Privacy 
            Policy of every site you visit. We have no control over and assume no responsibility 
            for the content, privacy policies, or practices of any third-party sites or services.
          </p>

          {/* --- Section 9: Changes to This Privacy Policy --- */}
          <h2>9. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any 
            changes by posting the new Privacy Policy on this page and updating the "Last Updated" 
            date. You are advised to review this Privacy Policy periodically for any changes. 
            Changes to this Privacy Policy are effective when they are posted on this page.
          </p>

          {/* --- Section 10: Contact Us --- */}
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul>
            <li>
              By email: <a href="mailto:info@matesrace.com" className="text-primary hover:underline">info@matesrace.com</a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;