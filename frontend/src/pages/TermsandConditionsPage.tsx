import React from 'react';
import { Link } from 'react-router-dom'; 

const TermsAndConditionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-center text-primary">
            Terms and Conditions
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Last Updated: May 27, 2025 {/* <-- REMEMBER TO UPDATE THIS DATE */}
          </p>
        </header>

        <section className="prose prose-lg dark:prose-invert max-w-none mx-auto bg-card p-6 md:p-8 rounded-lg shadow-md">
          <p>
            Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully 
            before using the MatesRace website and services (the "Service") operated by 
            MatesRace ("us", "we", or "our").
          </p>
          <p>
            Your access to and use of the Service is conditioned on your acceptance of and 
            compliance with these Terms. These Terms apply to all visitors, users, and others 
            who access or use the Service.
          </p>
          <p>
            By accessing or using the Service you agree to be bound by these Terms. If you 
            disagree with any part of the terms then you may not access the Service.
          </p>

          {/* --- Section 1: Accounts and Strava Integration --- */}
          <h2>1. Accounts and Strava Integration</h2>
          <ul>
            <li>
              To use MatesRace, you must register for an account by connecting your existing 
              Strava account. You are responsible for any activity that occurs through your 
              Strava account in connection with our Service.
            </li>
            <li>
              You grant us permission to access your Strava account information as outlined in 
              our Privacy Policy and as permitted by Strava, for the purpose of providing the 
              Service. This includes fetching your profile information and activity data 
              (specifically segment efforts for submitted race activities).
            </li>
            <li>
              MatesRace is not affiliated with Strava beyond using its API. Your use of Strava 
              is governed by Strava's own Terms of Service and Privacy Policy.
            </li>
          </ul>

          {/* --- Section 2: User Conduct and Responsibilities --- */}
          <h2>2. User Conduct and Responsibilities</h2>
          <ul>
            <li>
              You agree to use the Service only for lawful purposes and in a way that does not 
              infringe the rights of, restrict or inhibit anyone else's use and enjoyment of 
              the Service.
            </li>
            <li>
              You are responsible for the accuracy of the information you provide when creating 
              races, including segment selections and race rules you might describe.
            </li>
            <li>
              You are responsible for ensuring your Strava activities are recorded accurately and 
              submitted correctly for participation in races. MatesRace relies on the data 
              provided by Strava.
            </li>
            <li>
              Race organizers are responsible for managing their races, including setting 
              appropriate passwords and communicating them to participants.
            </li>
            <li>
              You agree not to use the Service to:
              <ul>
                <li>Upload or share any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
                <li>Impersonate any person or entity.</li>
                <li>Attempt to gain unauthorized access to the Service, other accounts, computer systems, or networks connected to the Service.</li>
                <li>Interfere with or disrupt the Service or servers or networks connected to the Service.</li>
              </ul>
            </li>
          </ul>

          {/* --- Section 3: User-Generated Content (Races) --- */}
          <h2>3. User-Generated Content (Races)</h2>
          <ul>
            <li>
              Users may create races, which includes defining race names, descriptions, 
              selecting Strava segments, and setting passwords ("User Content").
            </li>
            <li>
              You retain ownership of your User Content. However, by creating User Content on 
              the Service, you grant MatesRace a worldwide, non-exclusive, royalty-free license 
              to use, reproduce, display, and distribute such User Content in connection with 
              providing and promoting the Service.
            </li>
            <li>
              We reserve the right, but are not obligated, to review and remove any User 
              Content that we believe, in our sole discretion, violates these Terms or is 
              otherwise objectionable.
            </li>
          </ul>

          {/* --- Section 4: Intellectual Property --- */}
          <h2>4. Intellectual Property</h2>
          <ul>
            <li>
              The Service and its original content (excluding User Content provided by users), 
              features, and functionality are and will remain the exclusive property of MatesRace 
              and its licensors. The Service is protected by copyright, trademark, and other laws 
              of [Your Country/Jurisdiction] and foreign countries. {/* <-- REMEMBER TO UPDATE JURISDICTION */}
            </li>
            <li>
              Our trademarks and trade dress may not be used in connection with any product or 
              service without the prior written consent of MatesRace.
            </li>
          </ul>

          {/* --- Section 5: Service Availability and Modifications --- */}
          <h2>5. Service Availability and Modifications</h2>
          <ul>
            <li>
              MatesRace is provided on an "AS IS" and "AS AVAILABLE" basis. We strive to keep 
              the Service operational; however, we do not guarantee that the Service will always 
              be available, uninterrupted, or error-free.
            </li>
            <li>
              We reserve the right to modify or discontinue, temporarily or permanently, the 
              Service (or any part thereof) with or without notice.
            </li>
          </ul>

          {/* --- Section 6: Donations --- */}
          <h2>6. Donations</h2>
          <ul>
            <li>
              MatesRace is offered free of charge. Users may voluntarily support the Service 
              through donations via third-party platforms like Ko-fi. Donations are subject to 
              the terms of the respective third-party platform.
            </li>
          </ul>

          {/* --- Section 7: Termination --- */}
          <h2>7. Termination</h2>
          <ul>
            <li>
              We may terminate or suspend your access to our Service immediately, without prior 
              notice or liability, for any reason whatsoever, including without limitation if 
              you breach the Terms.
            </li>
            <li>
              Upon termination, your right to use the Service will immediately cease. If you 
              wish to terminate your account, you may simply discontinue using the Service or 
              contact us at <a href="mailto:info@matesrace.com" className="text-primary hover:underline">info@matesrace.com</a> to request account deletion.
            </li>
          </ul>
          
          {/* --- Section 8: Limitation of Liability --- */}
          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, in no event shall MatesRace, 
            nor its directors, employees, partners, agents, suppliers, or affiliates, be liable 
            for any indirect, incidental, special, consequential or punitive damages, including 
            without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
            resulting from (i) your access to or use of or inability to access or use the Service; 
            (ii) any conduct or content of any third party on the Service; (iii) any content 
            obtained from the Service; and (iv) unauthorized access, use or alteration of your 
            transmissions or content, whether based on warranty, contract, tort (including 
            negligence) or any other legal theory, whether or not we have been informed of the 
            possibility of such damage, and even if a remedy set forth herein is found to have 
            failed of its essential purpose.
          </p>

          {/* --- Section 9: Disclaimer --- */}
          <h2>9. Disclaimer</h2>
          <p>
            Your use of the Service is at your sole risk. The Service is provided without 
            warranties of any kind, whether express or implied, including, but not limited to, 
            implied warranties of merchantability, fitness for a particular purpose, 
            non-infringement, or course of performance.
          </p>
          <p>
            MatesRace does not warrant that a) the Service will function uninterrupted, secure 
            or available at any particular time or location; b) any errors or defects will be 
            corrected; c) the Service is free of viruses or other harmful components; or d) the 
            results of using the Service will meet your requirements.
          </p>
          <p>
            MatesRace relies on data from Strava. We are not responsible for the accuracy, 
            completeness, or timeliness of data provided by Strava or for any errors or 
            omissions in such data.
          </p>

          {/* --- Section 10: Governing Law --- */}
          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of 
            [Your Jurisdiction, e.g., Austria], without regard to its conflict of law provisions. 
            {/* <-- REMEMBER TO UPDATE JURISDICTION */}
          </p>

          {/* --- Section 11: Dispute Resolution --- */}
          <h2>11. Dispute Resolution</h2>
          <p>
            Any disputes arising out of or relating to these Terms or the Service shall be 
            resolved by [Specify method, e.g., binding arbitration in [City, Country] or 
            through the competent courts of [City, Country]]. 
            {/* <-- REMEMBER TO UPDATE DETAILS */}
          </p>

          {/* --- Section 12: Changes to Terms --- */}
          <h2>12. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at 
            any time. If a revision is material, we will try to provide at least 30 days' 
            notice prior to any new terms taking effect. What constitutes a material change 
            will be determined at our sole discretion.
          </p>
          <p>
            By continuing to access or use our Service after those revisions become effective, 
            you agree to be bound by the revised terms. If you do not agree to the new terms, 
            please stop using the Service.
          </p>

          {/* --- Section 13: Contact Us --- */}
          <h2>13. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
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

export default TermsAndConditionsPage;