'use client'

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Download, Star, Award, Shield, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Blog', href: '/blog' },
      { name: 'Sustainability', href: '/sustainability' },
    ],
    customerService: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Help Center', href: '/help' },
      { name: 'Size Guide', href: '/size-guide' },
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Returns & Exchanges', href: '/returns' },
      { name: 'Track Order', href: '/track-order' },
    ],
    shopping: [
      { name: 'New Arrivals', href: '/new-arrivals' },
      { name: 'Best Sellers', href: '/best-sellers' },
      { name: 'Sale', href: '/sale' },
      { name: 'Gift Cards', href: '/gift-cards' },
      { name: 'Store Locator', href: '/stores' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Vendor Terms', href: '/vendor-terms' },
      { name: 'Accessibility', href: '/accessibility' },
    ]
  }

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/davcreations', color: 'hover:text-blue-600' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/davcreations', color: 'hover:text-pink-600' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/davcreations', color: 'hover:text-blue-400' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/davcreations', color: 'hover:text-red-600' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info & Newsletter */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">DAV Creations</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Your premier destination for quality products from verified vendors across India.
                Discover amazing deals, fast shipping, and exceptional customer service.
              </p>
            </div>

            {/* Newsletter Signup */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Stay Updated</h4>
              <p className="text-gray-300 text-sm mb-4">
                Get exclusive deals and latest updates delivered to your inbox.
              </p>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-pink-500"
                />
                <Button className="bg-pink-500 hover:bg-pink-600 text-white px-4">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center bg-gray-800 px-3 py-2 rounded-lg">
                <Shield className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-xs font-medium">100% Secure</span>
              </div>
              <div className="flex items-center bg-gray-800 px-3 py-2 rounded-lg">
                <Award className="h-4 w-4 text-yellow-400 mr-2" />
                <span className="text-xs font-medium">Verified Vendors</span>
              </div>
              <div className="flex items-center bg-gray-800 px-3 py-2 rounded-lg">
                <Truck className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-xs font-medium">Fast Delivery</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {footerLinks.customerService.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shopping Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Shopping</h4>
            <ul className="space-y-2">
              {footerLinks.shopping.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 mb-6">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                <span>1-800-DAV-HELP</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <span>support@davcreations.com</span>
              </div>
              <div className="flex items-start text-sm text-gray-300">
                <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                <span>123 Commerce Street<br />Mumbai, MH 400001</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* App Download & Social Media */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* App Download */}
          <div className="mb-6 lg:mb-0">
            <h4 className="text-lg font-semibold mb-4 text-center lg:text-left">Download Our App</h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="bg-white text-gray-900 hover:bg-gray-100 border-white flex items-center justify-center px-6 py-3"
              >
                <Download className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="bg-white text-gray-900 hover:bg-gray-100 border-white flex items-center justify-center px-6 py-3"
              >
                <Download className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Social Media */}
          <div className="text-center lg:text-right">
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex justify-center lg:justify-end space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-300 ${social.color} transition-colors p-2 rounded-full hover:bg-gray-800`}
                  aria-label={`Follow us on ${social.name}`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center lg:justify-end space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                <span>4.8/5 Rating</span>
              </div>
              <div className="flex items-center">
                <Download className="h-4 w-4 mr-1" />
                <span>2M+ Downloads</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
          <div className="mb-4 md:mb-0">
            <p>&copy; {currentYear} DAV Creations. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end space-x-6">
            <span>Made with ❤️ in India</span>
            <div className="flex items-center space-x-2">
              <span>🇮🇳</span>
              <span>Proudly Indian</span>
            </div>
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex flex-wrap justify-center space-x-6 text-xs text-gray-500">
            <Link href="/sitemap" className="hover:text-gray-300 transition-colors">Sitemap</Link>
            <Link href="/security" className="hover:text-gray-300 transition-colors">Security</Link>
            <Link href="/fraud-protection" className="hover:text-gray-300 transition-colors">Fraud Protection</Link>
            <Link href="/responsible-disclosure" className="hover:text-gray-300 transition-colors">Responsible Disclosure</Link>
            <Link href="/vendor-portal" className="hover:text-gray-300 transition-colors">Vendor Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}