// LegalPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, Lock, AlertTriangle, Mail, Phone, Home, ChevronLeft } from 'lucide-react';

// Main component
const LegalPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('terms');

  const legalSections = [
    { id: 'terms', title: 'Terms & Conditions', icon: FileText },
    { id: 'privacy', title: 'Privacy Policy', icon: Lock },
    { id: 'disclaimer', title: 'Disclaimer', icon: AlertTriangle },
    { id: 'cookies', title: 'Cookie Policy', icon: Shield },
    { id: 'responsible', title: 'Responsible Gaming', icon: Shield },
    { id: 'aml', title: 'AML Policy', icon: Shield },
    { id: 'contact', title: 'Contact', icon: Mail }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#141432] to-[#0c0c24] text-white font-inter">
      {/* Glass Overlay */}
      <div className="fixed inset-0 bg-radial-gradient(circle_at_20%_50%,_rgba(120,119,198,0.1)_0%,_transparent_50%) pointer-events-none" />

      {/* Header */}
      <header className="bg-[#0f0c29]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                <Shield className="w-4 h-4 text-black" />
              </div>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
                LEGAL & POLICIES
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                <h2 className="font-bold text-lg mb-4 text-[#FFD700]">Legal Documents</h2>
                <nav className="space-y-1">
                  {legalSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/30 text-[#FFD700]'
                            : 'bg-white/5 hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{section.title}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-xs text-white/60">
                    Last Updated: {new Date().toLocaleDateString('en-NG', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    Version 2.1
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8">
              {/* Terms & Conditions */}
              {activeSection === 'terms' && (
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#FFD700]">
                    Terms & Conditions
                  </h1>
                  
                  <div className="space-y-6">
                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">1. Acceptance of Terms</h2>
                      <p className="text-white/70">
                        By accessing and using NextWinner ("Platform"), you agree to be bound by these Terms & Conditions. 
                        If you do not agree to all terms, you must not use our services. These terms constitute a legally 
                        binding agreement between you and NextWinner NG Ltd.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">2. Eligibility Requirements</h2>
                      <p className="text-white/70 mb-3">To participate in raffles, you must:</p>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Be at least 18 years of age</li>
                        <li>Be a resident of Nigeria with valid proof of address</li>
                        <li>Use your real identity and provide accurate information</li>
                        <li>Not be self-excluded from gambling activities in any jurisdiction</li>
                        <li>Not be an employee or immediate family member of NextWinner staff</li>
                        <li>Have full legal capacity to enter into binding contracts</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">3. Account Registration</h2>
                      <p className="text-white/70 mb-3">When creating an account:</p>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>You must provide accurate, current, and complete information</li>
                        <li>You are responsible for maintaining confidentiality of your credentials</li>
                        <li>You must notify us immediately of any unauthorized access</li>
                        <li>We reserve the right to suspend accounts with suspicious activity</li>
                        <li>One person may only maintain one account</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">4. Raffle Participation Rules</h2>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Each raffle has specific ticket prices and total available tickets</li>
                        <li>Tickets are non-refundable except as required by law</li>
                        <li>Drawing times are clearly stated for each raffle</li>
                        <li>Winners are selected using certified Random Number Generation</li>
                        <li>All draws are conducted live and recorded</li>
                        <li>Odds of winning depend on number of tickets sold</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">5. Payment Terms</h2>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>All payments must be made in Nigerian Naira (₦)</li>
                        <li>We accept bank transfers, debit cards, and verified mobile payments</li>
                        <li>All transactions are processed through secure payment gateways</li>
                        <li>Ticket purchases are final and non-transferable</li>
                        <li>We reserve the right to refuse any transaction</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">6. Prize Distribution</h2>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Winners are notified immediately after draw via email and SMS</li>
                        <li>Prizes must be claimed within 30 days of notification</li>
                        <li>Physical prizes are delivered within 14 working days in Nigeria</li>
                        <li>Cash prizes are transferred within 3-5 working days</li>
                        <li>Winners are responsible for any applicable taxes</li>
                        <li>Prizes are non-transferable and cannot be exchanged for cash (except cash prizes)</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">7. Prohibited Activities</h2>
                      <p className="text-white/70 mb-3">You must not:</p>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Use automated systems, bots, or scripts to purchase tickets</li>
                        <li>Participate from restricted jurisdictions</li>
                        <li>Attempt to manipulate raffle outcomes</li>
                        <li>Use stolen payment methods</li>
                        <li>Create multiple accounts</li>
                        <li>Share account access</li>
                        <li>Engage in money laundering activities</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">8. Intellectual Property</h2>
                      <p className="text-white/70">
                        All content on NextWinner including logos, trademarks, graphics, and software are 
                        proprietary property of NextWinner NG Ltd. You may not reproduce, distribute, or 
                        create derivative works without express written permission.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">9. Limitation of Liability</h2>
                      <p className="text-white/70 mb-3">
                        NextWinner shall not be liable for:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Technical failures, interruptions, or delays</li>
                        <li>Loss of data or unauthorized access</li>
                        <li>Any indirect, incidental, or consequential damages</li>
                        <li>Errors in prize descriptions or valuations</li>
                        <li>Force majeure events beyond our control</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">10. Termination</h2>
                      <p className="text-white/70">
                        We reserve the right to terminate or suspend your account at our sole discretion 
                        for violations of these terms. Upon termination, you must immediately cease using 
                        our services.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">11. Governing Law</h2>
                      <p className="text-white/70">
                        These Terms & Conditions are governed by the laws of the Federal Republic of Nigeria. 
                        Any disputes shall be subject to the exclusive jurisdiction of the courts in Lagos State.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">12. Changes to Terms</h2>
                      <p className="text-white/70">
                        We may update these terms periodically. Continued use after changes constitutes 
                        acceptance. We will notify users of material changes via email or platform notification.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* Privacy Policy */}
              {activeSection === 'privacy' && (
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#FFD700]">
                    Privacy Policy
                  </h1>
                  
                  <div className="space-y-6">
                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">1. Information We Collect</h2>
                      <p className="text-white/70 mb-3">We collect the following information:</p>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li><strong>Personal Information:</strong> Name, email, phone number, date of birth, address</li>
                        <li><strong>Identity Documents:</strong> Government-issued ID, proof of address for verification</li>
                        <li><strong>Payment Information:</strong> Bank details, transaction history (we don't store full card details)</li>
                        <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                        <li><strong>Usage Data:</strong> Pages visited, tickets purchased, preferences</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">2. How We Use Your Information</h2>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Process raffle entries and ticket purchases</li>
                        <li>Verify identity and prevent fraud</li>
                        <li>Comply with legal obligations (AML/KYC)</li>
                        <li>Communicate about draws, winners, and promotions</li>
                        <li>Improve our services and user experience</li>
                        <li>Send important updates and security alerts</li>
                        <li>Process prize distributions</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">3. Data Security</h2>
                      <p className="text-white/70 mb-3">
                        We implement industry-standard security measures including:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>SSL/TLS encryption for all data transmissions</li>
                        <li>Secure servers with regular security updates</li>
                        <li>Access controls and authentication protocols</li>
                        <li>Regular security audits and vulnerability assessments</li>
                        <li>PCI DSS compliance for payment processing</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">4. Data Retention</h2>
                      <p className="text-white/70 mb-3">We retain data for as long as necessary:</p>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Active account data: Retained while account is active</li>
                        <li>Transaction records: 7 years for legal compliance</li>
                        <li>Identity verification: 5 years after account closure</li>
                        <li>Inactive accounts: Deleted after 2 years of inactivity</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">5. Your Rights</h2>
                      <p className="text-white/70 mb-3">You have the right to:</p>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Access your personal data</li>
                        <li>Correct inaccurate information</li>
                        <li>Request deletion of your data</li>
                        <li>Object to processing</li>
                        <li>Data portability</li>
                        <li>Withdraw consent</li>
                        <li>Lodge complaints with regulatory authorities</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">6. Third-Party Sharing</h2>
                      <p className="text-white/70 mb-3">
                        We may share data with:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Payment processors for transaction completion</li>
                        <li>Legal authorities when required by law</li>
                        <li>Prize suppliers for delivery purposes</li>
                        <li>Auditors for regulatory compliance</li>
                        <li>IT service providers under strict confidentiality</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">7. Cookies and Tracking</h2>
                      <p className="text-white/70">
                        We use cookies to enhance user experience, analyze traffic, and prevent fraud. 
                        You can control cookie settings through your browser preferences.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">8. International Data Transfers</h2>
                      <p className="text-white/70">
                        Data is primarily stored and processed in Nigeria. Any international transfers 
                        comply with data protection regulations and include appropriate safeguards.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">9. Children's Privacy</h2>
                      <p className="text-white/70">
                        Our services are not intended for individuals under 18. We do not knowingly 
                        collect data from minors. If we discover such collection, we will delete it immediately.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">10. Contact for Privacy Concerns</h2>
                      <p className="text-white/70">
                        For privacy-related inquiries or to exercise your rights, contact our Data 
                        Protection Officer at: dpo@nextwinner.ng
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              {activeSection === 'disclaimer' && (
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#FFD700]">
                    Legal Disclaimer
                  </h1>
                  
                  <div className="space-y-6">
                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">General Disclaimer</h2>
                      <p className="text-white/70">
                        NextWinner operates as a licensed raffle platform in Nigeria. Participation in 
                        raffles involves risk and should be done responsibly. Past performance does not 
                        guarantee future results.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">No Guarantee of Winning</h2>
                      <p className="text-white/70">
                        Purchasing tickets does not guarantee winning. Each raffle has specific odds 
                        based on total tickets sold. The outcome is determined by certified random 
                        selection processes.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Financial Risk Warning</h2>
                      <p className="text-white/70">
                        Raffle participation involves financial risk. Only spend money you can afford 
                        to lose. Ticket purchases are non-refundable. We recommend setting personal 
                        spending limits and sticking to them.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Prize Accuracy</h2>
                      <p className="text-white/70">
                        While we strive for accuracy, prize descriptions and valuations are subject 
                        to change. Actual prizes may vary from descriptions. We reserve the right 
                        to substitute prizes of equal or greater value.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Technical Disclaimer</h2>
                      <p className="text-white/70">
                        We are not liable for technical failures, internet outages, or system errors 
                        that may affect participation. Draws may be postponed due to technical issues 
                        or force majeure events.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Tax Disclaimer</h2>
                      <p className="text-white/70">
                        Winners are solely responsible for declaring prizes and paying applicable taxes 
                        as required by Nigerian law. We recommend consulting with a tax professional 
                        regarding prize taxation.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Third-Party Links</h2>
                      <p className="text-white/70">
                        Our platform may contain links to third-party websites. We are not responsible 
                        for the content, privacy practices, or accuracy of external sites.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Jurisdictional Disclaimer</h2>
                      <p className="text-white/70">
                        Our services are only available to residents of Nigeria where online raffles 
                        are legal. Users from restricted jurisdictions must not access our services.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Investment Disclaimer</h2>
                      <p className="text-white/70">
                        Raffle tickets should not be considered investments. They are entries into 
                        games of chance with no guaranteed return.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Addiction Warning</h2>
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-300 font-bold mb-2">
                          🚨 GAMBLING CAN BE ADDICTIVE. PLEASE PLAY RESPONSIBLY.
                        </p>
                        <p className="text-red-200/80 text-sm">
                          If you feel you may have a gambling problem, seek help immediately:
                          <br />
                          • Set deposit limits in your account settings
                          <br />
                          • Take regular breaks from playing
                          <br />
                          • Never chase losses
                          <br />
                          
                        </p>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* Cookie Policy */}
              {activeSection === 'cookies' && (
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#FFD700]">
                    Cookie Policy
                  </h1>
                  
                  <div className="space-y-6">
                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">What Are Cookies?</h2>
                      <p className="text-white/70">
                        Cookies are small text files stored on your device when you visit our website. 
                        They help us provide a better user experience and enhance security.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Types of Cookies We Use</h2>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h3 className="font-bold mb-2 text-[#FFD700]">Essential Cookies</h3>
                        <p className="text-white/70 text-sm mb-3">
                          Required for basic site functionality. Cannot be disabled.
                        </p>
                        
                        <h3 className="font-bold mb-2 text-[#FFD700]">Security Cookies</h3>
                        <p className="text-white/70 text-sm mb-3">
                          Used for fraud prevention and account security.
                        </p>
                        
                        <h3 className="font-bold mb-2 text-[#FFD700]">Performance Cookies</h3>
                        <p className="text-white/70 text-sm mb-3">
                          Collect anonymous data to improve website performance.
                        </p>
                        
                        <h3 className="font-bold mb-2 text-[#FFD700]">Functionality Cookies</h3>
                        <p className="text-white/70 text-sm mb-3">
                          Remember your preferences and settings.
                        </p>
                        
                        <h3 className="font-bold mb-2 text-[#FFD700]">Advertising Cookies</h3>
                        <p className="text-white/70 text-sm">
                          Used to deliver relevant advertisements (with user consent).
                        </p>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Cookie Duration</h2>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li><strong>Session Cookies:</strong> Temporary, deleted when you close browser</li>
                        <li><strong>Persistent Cookies:</strong> Remain for set period (up to 2 years)</li>
                        <li><strong>Authentication Cookies:</strong> 30 days for logged-in sessions</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Managing Cookies</h2>
                      <p className="text-white/70 mb-3">
                        You can control cookies through your browser settings:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Chrome: Settings → Privacy and Security → Cookies</li>
                        <li>Firefox: Options → Privacy & Security → Cookies</li>
                        <li>Safari: Preferences → Privacy → Cookies</li>
                        <li>Edge: Settings → Privacy, search, and services → Cookies</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Third-Party Cookies</h2>
                      <p className="text-white/70">
                        Some third-party services (like payment processors) may set their own cookies. 
                        These are governed by their respective privacy policies.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Consent</h2>
                      <p className="text-white/70">
                        By continuing to use our site, you consent to our use of cookies as described 
                        in this policy. You can withdraw consent at any time through browser settings.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* Responsible Gaming */}
              {activeSection === 'responsible' && (
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#FFD700]">
                    Responsible Gaming Policy
                  </h1>
                  
                  <div className="space-y-6">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6">
                      <h2 className="text-xl font-bold mb-3 text-red-300">
                        🛑 IMPORTANT: PLAY RESPONSIBLY
                      </h2>
                      <p className="text-red-200/80">
                        Gambling should be entertaining, not a way to make money. Never gamble more than you can afford to lose.
                      </p>
                    </div>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Our Commitment</h2>
                      <p className="text-white/70">
                        NextWinner is committed to promoting responsible gaming and preventing gambling-related harm.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Player Protection Tools</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl">
                          <h3 className="font-bold text-[#FFD700] mb-2">Deposit Limits</h3>
                          <p className="text-white/70 text-sm">
                            Set daily, weekly, or monthly deposit limits in your account settings.
                          </p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl">
                          <h3 className="font-bold text-[#FFD700] mb-2">Time Alerts</h3>
                          <p className="text-white/70 text-sm">
                            Receive notifications after extended play sessions.
                          </p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl">
                          <h3 className="font-bold text-[#FFD700] mb-2">Self-Exclusion</h3>
                          <p className="text-white/70 text-sm">
                            Temporarily or permanently exclude yourself from participation.
                          </p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl">
                          <h3 className="font-bold text-[#FFD700] mb-2">Reality Checks</h3>
                          <p className="text-white/70 text-sm">
                            Regular prompts showing time spent and money wagered.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Warning Signs of Problem Gambling</h2>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Spending more money or time than intended</li>
                        <li>Chasing losses (trying to win back lost money)</li>
                        <li>Borrowing money to gamble</li>
                        <li>Lying about gambling activities</li>
                        <li>Neglecting work, family, or responsibilities</li>
                        <li>Gambling to escape problems or relieve stress</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Self-Assessment Questions</h2>
                      <div className="bg-white/5 p-4 rounded-xl">
                        <p className="text-white/70 mb-3">
                          Ask yourself these questions honestly:
                        </p>
                        <ol className="list-decimal pl-5 space-y-2 text-white/70">
                          <li>Have you ever missed work or important events to gamble?</li>
                          <li>Do you gamble to escape worry or trouble?</li>
                          <li>Have you ever lied about your gambling?</li>
                          <li>Do you feel guilty about your gambling?</li>
                          <li>Have you borrowed money to gamble?</li>
                          <li>Have you sold possessions to get money for gambling?</li>
                        </ol>
                        <p className="text-red-300 mt-3">
                          If you answered "yes" to any of these, please seek help.
                        </p>
                      </div>
                    </section>

                    

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Underage Gambling Prevention</h2>
                      <p className="text-white/70">
                        We strictly prohibit underage gambling. All users must verify they are 18+.
                        Report any suspected underage gambling to: report@nextwinner.ng
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">Our Responsibilities</h2>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Monitor for problematic gambling patterns</li>
                        <li>Provide easy access to support resources</li>
                        <li>Implement age verification processes</li>
                        <li>Train staff to identify problem gambling</li>
                        <li>Display responsible gambling messages</li>
                      </ul>
                    </section>
                  </div>
                </div>
              )}

              {/* AML Policy */}
              {activeSection === 'aml' && (
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#FFD700]">
                    Anti-Money Laundering Policy
                  </h1>
                  
                  <div className="space-y-6">
                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">1. Policy Statement</h2>
                      <p className="text-white/70">
                        NextWinner is committed to preventing money laundering and terrorist financing 
                        in accordance with Nigerian regulations, including the Money Laundering (Prohibition) Act 2022.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">2. Customer Due Diligence (CDD)</h2>
                      <p className="text-white/70 mb-3">
                        We perform thorough verification on all customers:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li><strong>Simplified CDD:</strong> For transactions below ₦100,000</li>
                        <li><strong>Standard CDD:</strong> For transactions ₦100,000 - ₦5,000,000</li>
                        <li><strong>Enhanced CDD:</strong> For transactions above ₦5,000,000 or high-risk customers</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">3. Required Documentation</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl">
                          <h3 className="font-bold text-[#FFD700] mb-2">Individuals</h3>
                          <ul className="text-white/70 text-sm space-y-1">
                            <li>• Valid government-issued photo ID</li>
                            <li>• Proof of address (utility bill, bank statement)</li>
                            <li>• Tax Identification Number (TIN)</li>
                            <li>• Recent passport photograph</li>
                          </ul>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl">
                          <h3 className="font-bold text-[#FFD700] mb-2">Corporate Entities</h3>
                          <ul className="text-white/70 text-sm space-y-1">
                            <li>• Certificate of incorporation</li>
                            <li>• Memorandum & Articles of Association</li>
                            <li>• Board resolution authorizing account</li>
                            <li>• ID documents for all directors</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">4. Transaction Monitoring</h2>
                      <p className="text-white/70 mb-3">
                        We monitor all transactions for suspicious activity including:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Unusual transaction patterns</li>
                        <li>Attempts to avoid reporting thresholds</li>
                        <li>Multiple small transactions (structuring)</li>
                        <li>Transactions with high-risk jurisdictions</li>
                        <li>Inconsistent account activity</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">5. Reporting Obligations</h2>
                      <p className="text-white/70">
                        We report suspicious transactions to the Nigerian Financial Intelligence Unit (NFIU) 
                        as required by law. Reports are filed within 24 hours of detection.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">6. Record Keeping</h2>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Customer identification records: 5 years after account closure</li>
                        <li>Transaction records: 7 years from transaction date</li>
                        <li>Suspicious activity reports: 7 years from filing date</li>
                        <li>All records maintained in secure, encrypted format</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">7. Employee Training</h2>
                      <p className="text-white/70">
                        All employees receive annual AML training covering:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Recognizing suspicious transactions</li>
                        <li>Customer verification procedures</li>
                        <li>Legal reporting requirements</li>
                        <li>Internal controls and processes</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">8. Risk Assessment</h2>
                      <p className="text-white/70">
                        We conduct regular risk assessments considering:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-white/70">
                        <li>Customer risk profiles</li>
                        <li>Geographic risk factors</li>
                        <li>Product/service risk levels</li>
                        <li>Delivery channel risks</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-3 text-white/90">9. Compliance Officer</h2>
                      <p className="text-white/70">
                        Our Compliance Officer oversees AML implementation and ensures regulatory compliance.
                        Contact: compliance@nextwinner.ng
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* Contact */}
              {activeSection === 'contact' && (
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#FFD700]">
                    Contact Information
                  </h1>
                  
                  <div className="space-y-8">
                    <section>
                      <h2 className="text-xl font-bold mb-4 text-white/90">Company Details</h2>
                      <div className="bg-white/5 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-bold text-[#FFD700] mb-2 flex items-center gap-2">
                              <Home className="w-5 h-5" />
                              Registered Office
                            </h3>
                            <p className="text-white/70">
                              NextWinner (SmartchildNation)<br />
                              COMPLETELY ONLINE <br />
                              PLATEFORM<br />
                             
                            </p>
                          </div>
                          
                        </div>
                      </div>
                    </section>

                    <section>
                     
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       
                        <div className="bg-white/5 p-4 rounded-xl">
                          <h3 className="font-bold text-[#FFD700] mb-2 flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Email Support
                          </h3>
                          <p className="text-white/70">
                            General: support@nextwinner.ng<br />
                            Legal: legal@nextwinner.ng<br />
                            Winners: winners@nextwinner.ng
                          </p>
                        </div>
                        
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-4 text-white/90">Complaints Procedure</h2>
                      <div className="bg-white/5 rounded-xl p-6">
                        <ol className="list-decimal pl-5 space-y-3 text-white/70">
                          <li>Contact customer service via phone or email</li>
                          <li>If unresolved within 48 hours, escalate to complaints department</li>
                          <li>Formal complaints acknowledged within 24 hours</li>
                          <li>Resolution within 14 working days</li>
                          <li>If unsatisfied, contact National Lottery Regulatory Commission</li>
                        </ol>
                        <p className="mt-4 text-sm text-white/60">
                          NLRC Address: Plot 423, Aguiyi Ironsi Street, Maitama, Abuja
                        </p>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-4 text-white/90">Physical Location</h2>
                      <div className="bg-white/5 rounded-xl p-6">
                        <p className="text-white/70 mb-4">
                          For in-person inquiries, visit our office:
                        </p>
                        <div className="aspect-video bg-gradient-to-br from-[#FFD700]/10 to-[#FFA500]/10 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Home className="w-12 h-12 mx-auto mb-2 text-[#FFD700]/50" />
                            <p className="text-white/70">
                              NextWinner Headquarters<br />
                              Open: Mon-Fri, 9AM-5PM
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="mt-8 text-center text-white/40 text-sm">
              <p>
                © {new Date().getFullYear()} NextWinner(SmartchildNation). All rights reserved.
                <br />
                This document is legally binding. Please read carefully.
              </p>
              <p className="mt-2 text-xs">
                Need help understanding these terms? Contact legal@nextwinner.ng
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Add to your App.js routes */}
      <div className="hidden">
        {/* Add this route to your existing App.js routes */}
        {/* <Route path="/legal" element={<LegalPage />} /> */}
      </div>

      <style jsx>{`
        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default LegalPage;