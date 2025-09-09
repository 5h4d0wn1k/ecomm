'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Volume2, VolumeX, ShoppingCart, Search, X, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

interface VoiceShoppingProps {
  isOpen: boolean
  onClose: () => void
  onProductFound?: (product: { id: number; name: string; price: number; category: string }) => void
}

interface VoiceCommand {
  command: string
  action: string
  product?: { id: number; name: string; price: number; category: string }
  confidence: number
}

export function VoiceShopping({ isOpen, onClose, onProductFound }: VoiceShoppingProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [commands, setCommands] = useState<VoiceCommand[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentStep, setCurrentStep] = useState<'welcome' | 'listening' | 'processing' | 'results'>('welcome')

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as typeof window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition || (window as typeof window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onstart = () => {
          setIsListening(true)
          setCurrentStep('listening')
          speak("I'm listening. Try saying something like 'find me a red dress' or 'show me running shoes'")
        }

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = ''
          let interimTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          setTranscript(finalTranscript || interimTranscript)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
          if (transcript) {
            processVoiceCommand(transcript)
          }
        }

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          speak("Sorry, I didn't catch that. Please try again.")
        }
      }

      // Initialize speech synthesis
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [transcript, processVoiceCommand])

  // Speak text using speech synthesis
  const speak = (text: string) => {
    if (!synthRef.current) return

    setIsSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synthRef.current.speak(utterance)
  }

  // Process voice commands
  const processVoiceCommand = useCallback(async (command: string) => {
    setIsProcessing(true)
    setCurrentStep('processing')

    try {
      const processedCommands = await analyzeVoiceCommand(command)
      setCommands(processedCommands)

      // Execute commands
      for (const cmd of processedCommands) {
        await executeCommand(cmd)
      }

      setCurrentStep('results')
    } catch (error) {
      console.error('Error processing voice command:', error)
      speak("Sorry, I couldn't process that command. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Analyze voice command using NLP-like processing
  const analyzeVoiceCommand = async (command: string): Promise<VoiceCommand[]> => {
    const lowerCommand = command.toLowerCase()
    const commands: VoiceCommand[] = []

    // Product search patterns
    const searchPatterns = [
      /(?:find|show|search|get|look for)\s+(?:me\s+)?(.+?)(?:\s+(?:in|for|with|under|below|above)\s+.+)?$/i,
      /(?:i want|i need|i'm looking for)\s+(.+?)(?:\s+(?:in|for|with|under|below|above)\s+.+)?$/i,
      /(?:do you have|got any)\s+(.+?)(?:\s+(?:in|for|with|under|below|above)\s+.+)?$/i
    ]

    // Shopping action patterns
    const actionPatterns = [
      /(?:add|put|place)\s+(.+?)\s+(?:to|in)\s+(?:cart|basket)/i,
      /(?:buy|purchase|order)\s+(.+?)/i,
      /(?:remove|delete|take out)\s+(.+?)\s+(?:from|out of)\s+(?:cart|basket)/i,
      /(?:show me|display|view)\s+(?:my\s+)?(cart|basket|wishlist|orders)/i
    ]

    // Check for search commands
    for (const pattern of searchPatterns) {
      const match = lowerCommand.match(pattern)
      if (match) {
        const searchTerm = match[1].trim()
        commands.push({
          command: `Search for "${searchTerm}"`,
          action: 'search',
          confidence: 0.9
        })
        break
      }
    }

    // Check for shopping actions
    for (const pattern of actionPatterns) {
      const match = lowerCommand.match(pattern)
      if (match) {
        const action = match[1].toLowerCase()
        if (action.includes('cart') || action.includes('basket')) {
          commands.push({
            command: 'View shopping cart',
            action: 'view_cart',
            confidence: 0.8
          })
        } else if (action.includes('wishlist')) {
          commands.push({
            command: 'View wishlist',
            action: 'view_wishlist',
            confidence: 0.8
          })
        } else {
          commands.push({
            command: `Add "${action}" to cart`,
            action: 'add_to_cart',
            confidence: 0.7
          })
        }
        break
      }
    }

    // If no specific commands found, treat as general search
    if (commands.length === 0 && lowerCommand.length > 3) {
      commands.push({
        command: `Search for "${command.trim()}"`,
        action: 'search',
        confidence: 0.6
      })
    }

    return commands
  }

  // Execute voice command
  const executeCommand = async (command: VoiceCommand) => {
    switch (command.action) {
      case 'search':
        // Simulate product search
        const mockProducts = [
          { id: 1, name: 'Red Dress', price: 2999, category: 'Fashion' },
          { id: 2, name: 'Running Shoes', price: 4999, category: 'Sports' },
          { id: 3, name: 'Wireless Headphones', price: 7999, category: 'Electronics' }
        ]

        const foundProduct = mockProducts.find(p =>
          command.command.toLowerCase().includes(p.name.toLowerCase().split(' ')[0])
        )

        if (foundProduct) {
          speak(`Found ${foundProduct.name} for ₹${foundProduct.price}. Would you like to add it to cart?`)
          onProductFound?.(foundProduct)
        } else {
          speak("I found several products matching your search. Let me show you the results.")
        }
        break

      case 'view_cart':
        speak("Opening your shopping cart.")
        window.location.href = '/cart'
        break

      case 'view_wishlist':
        speak("Opening your wishlist.")
        window.location.href = '/wishlist'
        break

      case 'add_to_cart':
        speak("Added item to your cart.")
        break

      default:
        speak("I'm not sure how to help with that. Try saying 'find me a product' or 'show my cart'.")
    }
  }

  // Start voice recognition
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setCommands([])
      recognitionRef.current.start()
    }
  }

  // Stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  // Toggle voice feedback
  const toggleVoiceFeedback = () => {
    if (synthRef.current) {
      if (isSpeaking) {
        synthRef.current.cancel()
        setIsSpeaking(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Voice Shopping Assistant</h2>
              <p className="text-blue-100 mt-1">Shop hands-free with voice commands</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceFeedback}
                className="text-white hover:bg-white/20"
              >
                {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Voice Visualization */}
          <div className="text-center mb-6">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-red-100 border-4 border-red-500 animate-pulse'
                : isProcessing
                ? 'bg-yellow-100 border-4 border-yellow-500'
                : 'bg-gray-100 border-4 border-gray-300'
            }`}>
              {isListening ? (
                <Mic className="h-8 w-8 text-red-500" />
              ) : isProcessing ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              ) : (
                <MicOff className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <p className="mt-4 text-lg font-medium text-gray-900">
              {currentStep === 'welcome' && 'Ready to help you shop'}
              {currentStep === 'listening' && 'Listening...'}
              {currentStep === 'processing' && 'Processing your request...'}
              {currentStep === 'results' && 'Here are the results'}
            </p>
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">You said:</h3>
              <p className="text-gray-900 italic">&ldquo;{transcript}&rdquo;</p>
            </div>
          )}

          {/* Commands */}
          {commands.length > 0 && (
            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Actions:</h3>
              {commands.map((command, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">{command.command}</p>
                      <p className="text-sm text-blue-700">Confidence: {Math.round(command.confidence * 100)}%</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {command.action === 'search' && <Search className="h-5 w-5 text-blue-500" />}
                      {command.action === 'view_cart' && <ShoppingCart className="h-5 w-5 text-blue-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Voice Commands Help */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Try saying:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
              <div>• &ldquo;Find me a red dress&rdquo;</div>
              <div>• &ldquo;Show me running shoes&rdquo;</div>
              <div>• &ldquo;Add this to my cart&rdquo;</div>
              <div>• &ldquo;Show my wishlist&rdquo;</div>
              <div>• &ldquo;Search for headphones&rdquo;</div>
              <div>• &ldquo;View my cart&rdquo;</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isListening ? (
              <Button
                onClick={startListening}
                disabled={isProcessing}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Mic className="h-5 w-5 mr-2" />
                Start Listening
              </Button>
            ) : (
              <Button
                onClick={stopListening}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                <MicOff className="h-5 w-5 mr-2" />
                Stop Listening
              </Button>
            )}

            <Button
              onClick={() => {
                setTranscript('')
                setCommands([])
                setCurrentStep('welcome')
              }}
              variant="outline"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}