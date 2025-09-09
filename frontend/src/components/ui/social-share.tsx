'use client'

import { useState } from 'react'
import {
  Share2,
  Facebook,
  Twitter,
  MessageCircle,
  Copy,
  Check,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SocialShareProps {
  url: string
  title: string
  description?: string
  image?: string
  className?: string
}

export function SocialShare({
  url,
  title,
  description,
  image,
  className = ""
}: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined' ? window.location.origin + url : url
  const shareText = `${title}${description ? ` - ${description}` : ''}`

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleShare = (platform: keyof typeof shareLinks) => {
    const link = shareLinks[platform]
    window.open(link, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        })
        setIsOpen(false)
      } catch (err) {
        console.error('Error sharing:', err)
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="border-gray-300 hover:border-pink-300 hover:text-pink-600"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Share Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Share this product</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Native Share (if available) */}
            {navigator.share && (
              <Button
                onClick={handleNativeShare}
                className="w-full mb-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                size="sm"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share via...
              </Button>
            )}

            {/* Social Media Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Button
                onClick={() => handleShare('facebook')}
                variant="outline"
                size="sm"
                className="flex items-center justify-center border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>

              <Button
                onClick={() => handleShare('twitter')}
                variant="outline"
                size="sm"
                className="flex items-center justify-center border-sky-200 text-sky-600 hover:bg-sky-50"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>

              <Button
                onClick={() => handleShare('whatsapp')}
                variant="outline"
                size="sm"
                className="flex items-center justify-center border-green-200 text-green-600 hover:bg-green-50"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>

              <Button
                onClick={() => handleShare('linkedin')}
                variant="outline"
                size="sm"
                className="flex items-center justify-center border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Button>
            </div>

            {/* Copy Link */}
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className="w-full border-gray-300 hover:border-gray-400"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>

            {/* Share URL Display */}
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
              {shareUrl}
            </div>
          </div>
        </>
      )}
    </div>
  )
}