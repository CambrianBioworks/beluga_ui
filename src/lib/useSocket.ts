// lib/useSocket.ts
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  startPCRRun: (runData: any) => Promise<string>
  stopPCRRun: (runId: string) => void
  getSystemStatus: () => void
  scanBarcode: (scanData?: any, onProgress?: (progress: any) => void) => Promise<any>
  controlDevice: (device: string, number: number, state: number) => Promise<any>
  controlUVLight: (state: boolean) => Promise<any>
  controlSystemLight: (state: boolean) => Promise<any>
  controlHEPAFilter: (state: boolean) => Promise<any>
  getWiFiStatus: () => Promise<any>
  scanWiFiNetworks: () => Promise<any>
  connectToWiFi: (ssid: string, password: string) => Promise<any>
  disconnectWiFi: () => Promise<any>
  getKnownNetworks: () => Promise<any>
}

export function useSocket(serverUrl: string = 'http://localhost:8000'): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  // Keep track of active scan promises
  const scanPromiseRef = useRef<{
    resolve: (value: any) => void
    reject: (reason?: any) => void
    timeout: NodeJS.Timeout
    scanId?: string
  } | null>(null)

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    })

    const socket = socketRef.current

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to PCR WebSocket server')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from PCR WebSocket server')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      setIsConnected(false)
    })

    // PCR-specific event listeners
    socket.on('run_progress', (data) => {
      console.log('Run progress:', data)
      // Handle progress updates here
    })

    socket.on('motor_position', (data) => {
      console.log('Motor position:', data)
      // Handle motor position updates
    })

    socket.on('temperature_update', (data) => {
      console.log('Temperature update:', data)
      // Handle temperature updates
    })

    socket.on('run_started', (data) => {
      console.log('Run started:', data)
    })

    socket.on('run_error', (data) => {
      console.error('PCR run error:', data)
      // Handle errors here
    })

    socket.on('run_complete', (data) => {
      console.log('PCR run completed:', data)
      // Handle completion
    })

    socket.on('system_status', (data) => {
      console.log('System status:', data)
    })

    // Barcode scanner event listeners
    socket.on('scan_started', (data) => {
      console.log('Barcode scan started:', data)
      // Store the scan ID for matching with completion
      if (scanPromiseRef.current && data.scan_id) {
        scanPromiseRef.current.scanId = data.scan_id
      }
    })

    socket.on('scan_progress', (data) => {
      console.log('Barcode scan progress:', data)
      // You can emit this to your React components or handle it here
      // For example, you could store progress in state or call a callback
    })

    socket.on('scan_complete', (data) => {
      console.log('Barcode scan completed:', data)
      
      // Check if we have an active scan promise waiting
      if (scanPromiseRef.current) {
        clearTimeout(scanPromiseRef.current.timeout)
        scanPromiseRef.current.resolve(data)
        scanPromiseRef.current = null
      }
    })

    socket.on('scan_error', (data) => {
      console.error('Barcode scan error:', data)
      
      // Check if we have an active scan promise waiting
      if (scanPromiseRef.current) {
        clearTimeout(scanPromiseRef.current.timeout)
        scanPromiseRef.current.reject(new Error(data.error || 'Barcode scan failed'))
        scanPromiseRef.current = null
      }
    })

    socket.on('control_complete', (data) => {
      console.log('Device control completed:', data)
    })

    socket.on('control_error', (data) => {
      console.error('Device control error:', data)
    })

    socket.on('wifi_status', (data) => {
      console.log('WiFi status:', data)
    })

    socket.on('wifi_networks', (data) => {
      console.log('WiFi networks found:', data)
    })

    socket.on('wifi_connected', (data) => {
      console.log('WiFi connected:', data)
    })

    socket.on('wifi_error', (data) => {
      console.error('WiFi error:', data)
    })

    // Cleanup on unmount
    return () => {
      // Clean up any pending scan promise
      if (scanPromiseRef.current) {
        clearTimeout(scanPromiseRef.current.timeout)
        scanPromiseRef.current.reject(new Error('Component unmounted'))
        scanPromiseRef.current = null
      }
      socket.disconnect()
    }
  }, [serverUrl])

  // Function to start PCR run
  const startPCRRun = async (runData: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        reject(new Error('Socket not connected'))
        return
      }

      console.log('Emitting start_pcr_run event with data:', runData)

      // Set a timeout in case the server doesn't respond
      const timeout = setTimeout(() => {
        reject(new Error('Server response timeout'))
      }, 30000) // 30 second timeout

      try {
        // Send start_pcr_run event with runData and callback
        socketRef.current.emit('start_pcr_run', runData, (response: any) => {
          clearTimeout(timeout)
          
          console.log('Received response from server:', response)
          
          if (response && response.success) {
            console.log('PCR run started successfully:', response.run_id)
            resolve(response.run_id || 'unknown')
          } else {
            const errorMsg = response?.error || 'Unknown error occurred'
            console.error('Failed to start PCR run:', errorMsg)
            reject(new Error(errorMsg))
          }
        })
      } catch (error) {
        clearTimeout(timeout)
        console.error('Error emitting start_pcr_run:', error)
        reject(error)
      }
    })
  }

  // Function to scan barcode - Fixed to use event-based approach
  const scanBarcode = async (scanData: any = {}, onProgress?: (progress: any) => void): Promise<any> => {
      return new Promise((resolve, reject) => {
          if (!socketRef.current || !isConnected) {
              reject(new Error('Socket not connected'))
              return
          }

          // Set up progress handler - this fires immediately for each scan
          const progressHandler = (data: any) => {
                  if (onProgress) {
                      onProgress(data) // This allows real-time updates
                  }
              
          }
          
          socketRef.current.on('scan_progress', progressHandler)
          
          const timeout = setTimeout(() => {
              if (scanPromiseRef.current) {
                  socketRef.current?.off('scan_progress', progressHandler)
                  scanPromiseRef.current = null
                  reject(new Error('Barcode scan timeout'))
              }
          }, 600000)

          scanPromiseRef.current = { 
              resolve: (value) => {
                  socketRef.current?.off('scan_progress', progressHandler)
                  resolve(value)
              }, 
              reject: (reason) => {
                  socketRef.current?.off('scan_progress', progressHandler)
                  reject(reason)
              }, 
              timeout 
          }

          socketRef.current.emit('scan_barcode', scanData)
      })
  }

  const controlUVLight = (state: boolean): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        reject(new Error('Socket not connected'))
        return
      }

      const controlId = `uv_${Date.now()}`
      const timeoutId = setTimeout(() => reject(new Error('UV control timeout')), 10000)

      const handleComplete = (data: any) => {
        if (data.control_id === controlId) {
          clearTimeout(timeoutId)
          socketRef.current?.off('uv_complete', handleComplete)
          socketRef.current?.off('uv_error', handleError)
          resolve(data)
        }
      }

      const handleError = (data: any) => {
        if (data.control_id === controlId) {
          clearTimeout(timeoutId)
          socketRef.current?.off('uv_complete', handleComplete)
          socketRef.current?.off('uv_error', handleError)
          reject(new Error(data.error || 'UV control failed'))
        }
      }

      socketRef.current.on('uv_complete', handleComplete)
      socketRef.current.on('uv_error', handleError)

      const eventName = state ? 'turn_on_uv_hardware' : 'turn_off_uv_hardware'
      socketRef.current.emit(eventName, { control_id: controlId })
    })
  }

  const controlSystemLight = (state: boolean): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        reject(new Error('Socket not connected'))
        return
      }

      const controlId = `light_${Date.now()}`
      const timeoutId = setTimeout(() => reject(new Error('Light control timeout')), 10000)

      const handleComplete = (data: any) => {
        if (data.control_id === controlId) {
          clearTimeout(timeoutId)
          socketRef.current?.off('light_complete', handleComplete)
          socketRef.current?.off('light_error', handleError)
          resolve(data)
        }
      }

      const handleError = (data: any) => {
        if (data.control_id === controlId) {
          clearTimeout(timeoutId)
          socketRef.current?.off('light_complete', handleComplete)
          socketRef.current?.off('light_error', handleError)
          reject(new Error(data.error || 'Light control failed'))
        }
      }

      socketRef.current.on('light_complete', handleComplete)
      socketRef.current.on('light_error', handleError)

      const eventName = state ? 'turn_on_light_hardware' : 'turn_off_light_hardware'
      socketRef.current.emit(eventName, { control_id: controlId })
    })
  }

  const controlHEPAFilter = (state: boolean): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        reject(new Error('Socket not connected'))
        return
      }

      const controlId = `fan_${Date.now()}`
      const timeoutId = setTimeout(() => reject(new Error('Fan control timeout')), 10000)

      const handleComplete = (data: any) => {
        if (data.control_id === controlId) {
          clearTimeout(timeoutId)
          socketRef.current?.off('fan_complete', handleComplete)
          socketRef.current?.off('fan_error', handleError)
          resolve(data)
        }
      }

      const handleError = (data: any) => {
        if (data.control_id === controlId) {
          clearTimeout(timeoutId)
          socketRef.current?.off('fan_complete', handleComplete)
          socketRef.current?.off('fan_error', handleError)
          reject(new Error(data.error || 'Fan control failed'))
        }
      }

      socketRef.current.on('fan_complete', handleComplete)
      socketRef.current.on('fan_error', handleError)

      const eventName = state ? 'turn_on_fan_hardware' : 'turn_off_fan_hardware'
      socketRef.current.emit(eventName, { control_id: controlId })
    })
  }

  const controlDevice = (device: string, number: number, state: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        reject(new Error('Socket not connected'))
        return
      }

      const controlId = `control_${Date.now()}`
      
      const timeoutId = setTimeout(() => {
        reject(new Error('Device control timeout'))
      }, 10000)

      // Listen for completion for this specific control
      const handleComplete = (data: any) => {
        if (data.control_id === controlId) {
          clearTimeout(timeoutId)
          socketRef.current?.off('control_complete', handleComplete)
          socketRef.current?.off('control_error', handleError)
          resolve(data)
        }
      }

      const handleError = (data: any) => {
        if (data.control_id === controlId) {
          clearTimeout(timeoutId)
          socketRef.current?.off('control_complete', handleComplete)
          socketRef.current?.off('control_error', handleError)
          reject(new Error(data.error || 'Device control failed'))
        }
      }

      socketRef.current.on('control_complete', handleComplete)
      socketRef.current.on('control_error', handleError)

      const controlData = {
        device,
        number,
        state,
        control_id: controlId
      }

      socketRef.current.emit('device_control', controlData)
    })
  }

  // Function to stop PCR run
  const stopPCRRun = (runId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('stop_pcr_run', { run_id: runId })
    }
  }

  // Function to get system status
  const getSystemStatus = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('get_system_status')
    }
  }

  // WiFi control functions
  const getWiFiStatus = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        reject(new Error('Socket not connected'))
        return
      }

      const requestId = `wifi_status_${Date.now()}`
      const timeoutId = setTimeout(() => reject(new Error('WiFi status timeout')), 10000)

      const handleStatus = (data: any) => {
        if (data.request_id === requestId) {
          clearTimeout(timeoutId)
          socketRef.current?.off('wifi_status', handleStatus)
          resolve(data)
        }
      }

      socketRef.current.on('wifi_status', handleStatus)
      socketRef.current.emit('get_wifi_status', { request_id: requestId })
    })
  }

  const scanWiFiNetworks = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        reject(new Error('Socket not connected'))
        return
      }

      const requestId = `wifi_scan_${Date.now()}`
      const timeoutId = setTimeout(() => reject(new Error('WiFi scan timeout')), 30000)

      const handleNetworks = (data: any) => {
        if (data.request_id === requestId) {
          clearTimeout(timeoutId)
          socketRef.current?.off('wifi_networks', handleNetworks)
          socketRef.current?.off('wifi_error', handleError)
          resolve(data)
        }
      }

      const handleError = (data: any) => {
        if (data.request_id === requestId) {
          clearTimeout(timeoutId)
          socketRef.current?.off('wifi_networks', handleNetworks)
          socketRef.current?.off('wifi_error', handleError)
          reject(new Error(data.error || 'WiFi scan failed'))
        }
      }

      socketRef.current.on('wifi_networks', handleNetworks)
      socketRef.current.on('wifi_error', handleError)
      socketRef.current.emit('scan_wifi_networks', { request_id: requestId })
    })
  }

  const connectToWiFi = (ssid: string, password: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        reject(new Error('Socket not connected'))
        return
      }

      const requestId = `wifi_connect_${Date.now()}`
      const timeoutId = setTimeout(() => reject(new Error('WiFi connect timeout')), 30000)

      const handleConnected = (data: any) => {
        if (data.request_id === requestId) {
          clearTimeout(timeoutId)
          socketRef.current?.off('wifi_connected', handleConnected)
          socketRef.current?.off('wifi_error', handleError)
          resolve(data)
        }
      }

      const handleError = (data: any) => {
        if (data.request_id === requestId) {
          clearTimeout(timeoutId)
          socketRef.current?.off('wifi_connected', handleConnected)
          socketRef.current?.off('wifi_error', handleError)
          reject(new Error(data.error || 'WiFi connection failed'))
        }
      }

      socketRef.current.on('wifi_connected', handleConnected)
      socketRef.current.on('wifi_error', handleError)
      socketRef.current.emit('connect_wifi', { request_id: requestId, ssid, password })
    })
  }

  const disconnectWiFi = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        reject(new Error('Socket not connected'))
        return
      }

      const requestId = `wifi_disconnect_${Date.now()}`
      const timeoutId = setTimeout(() => reject(new Error('WiFi disconnect timeout')), 10000)

      const handleStatus = (data: any) => {
        if (data.request_id === requestId) {
          clearTimeout(timeoutId)
          socketRef.current?.off('wifi_status', handleStatus)
          resolve(data)
        }
      }

      socketRef.current.on('wifi_status', handleStatus)
      socketRef.current.emit('disconnect_wifi', { request_id: requestId })
    })
  }

  const getKnownNetworks = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        reject(new Error('Socket not connected'))
        return
      }

      const requestId = `wifi_known_${Date.now()}`
      const timeoutId = setTimeout(() => reject(new Error('Get known networks timeout')), 10000)

      const handleNetworks = (data: any) => {
        if (data.request_id === requestId) {
          clearTimeout(timeoutId)
          socketRef.current?.off('wifi_networks', handleNetworks)
          resolve(data)
        }
      }

      socketRef.current.on('wifi_networks', handleNetworks)
      socketRef.current.emit('get_known_networks', { request_id: requestId })
    })
  }

  return {
    socket: socketRef.current,
    isConnected,
    startPCRRun,
    stopPCRRun,
    getSystemStatus,
    scanBarcode,  // Export the new barcode scanner function
    controlDevice, // Export the device control function
    controlUVLight,
    controlSystemLight,
    controlHEPAFilter,
    getWiFiStatus,
    scanWiFiNetworks,
    connectToWiFi,
    disconnectWiFi,
    getKnownNetworks
  }
}