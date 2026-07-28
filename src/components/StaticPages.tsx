import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl text-center">About SocialStream</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Connect, Share, and Stream with the world
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-muted-foreground">
                SocialStream is designed to bring people together through shared experiences, 
                creative content, and meaningful connections. We believe in fostering a community 
                where everyone can express themselves freely and safely.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3">What We Offer</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Social media platform with posts, stories, and reels</li>
                <li>• Live streaming with real-time interaction</li>
                <li>• Matchmaking and dating features</li>
                <li>• Secure messaging and chat</li>
                <li>• Community-driven content moderation</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center pt-6">
            <h3 className="text-xl font-semibold mb-4">Download Our App</h3>
            <div className="flex justify-center space-x-4">
              <Button className="bg-black text-white hover:bg-gray-800">
                <Download className="w-4 h-4 mr-2" />
                Download for iOS
              </Button>
              <Button className="bg-green-600 text-white hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Download for Android
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h3>
            <p className="text-muted-foreground">
              By accessing and using SocialStream, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3">2. User Conduct</h3>
            <p className="text-muted-foreground">
              Users must not post content that is illegal, harmful, threatening, abusive, 
              harassing, defamatory, vulgar, obscene, or otherwise objectionable.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3">3. Privacy Policy</h3>
            <p className="text-muted-foreground">
              Your privacy is important to us. Please review our Privacy Policy, which also 
              governs your use of the service.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3">4. Content Ownership</h3>
            <p className="text-muted-foreground">
              Users retain ownership of content they post, but grant SocialStream a license 
              to use, modify, and distribute such content on the platform.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3">5. Termination</h3>
            <p className="text-muted-foreground">
              We may terminate or suspend your account at any time for violations of these terms.
            </p>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const PrivacyPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Information We Collect</h3>
            <p className="text-muted-foreground">
              We collect information you provide directly to us, such as when you create an account, 
              post content, or contact us for support.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3">How We Use Your Information</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• To provide and maintain our service</li>
              <li>• To notify you about changes to our service</li>
              <li>• To provide customer support</li>
              <li>• To detect, prevent and address technical issues</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3">Data Security</h3>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3">Your Rights</h3>
            <p className="text-muted-foreground">
              You have the right to access, update, or delete your personal information. 
              You may also opt out of certain communications from us.
            </p>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">SocialStream</h3>
            <p className="text-gray-400">
              Connect, Share, and Stream with the world. Join millions of users 
              in our growing community.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Download App</h4>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-black">
                <Download className="w-4 h-4 mr-2" />
                iOS App Store
              </Button>
              <Button variant="outline" className="w-full justify-start text-black">
                <Download className="w-4 h-4 mr-2" />
                Google Play
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Youtube className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 SocialStream. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};