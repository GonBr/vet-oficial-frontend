import '@testing-library/jest-dom'

// Mock MediaRecorder
global.MediaRecorder = class MockMediaRecorder {
  static isTypeSupported = jest.fn(() => true)
  
  constructor() {
    this.start = jest.fn()
    this.stop = jest.fn()
    this.pause = jest.fn()
    this.resume = jest.fn()
    this.ondataavailable = null
    this.onstart = null
    this.onstop = null
    this.onerror = null
    this.state = 'inactive'
  }

  start = jest.fn()
  stop = jest.fn()
  pause = jest.fn()
  resume = jest.fn()
  ondataavailable: ((event: any) => void) | null = null
  onstart: ((event: any) => void) | null = null
  onstop: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  state: string = 'inactive'
} as any

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn(() => Promise.resolve({
      getTracks: () => [{ stop: jest.fn() }]
    }))
  }
})

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: jest.fn(() => Promise.resolve())
  }
})

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock Blob
global.Blob = class MockBlob {
  constructor(public parts: any[], public options?: any) {}
} as any
