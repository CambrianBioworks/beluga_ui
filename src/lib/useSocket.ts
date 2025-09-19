// lib/useSocket.ts
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  startPCRRun: (runData: any) => Promise<string>
  stopPCRRun: (runId: string) => void
  getSystemStatus: () => void
  scanBarcode: (scanData?: any) => Promise<any>  // New barcode scanner function
  controlDevice: (device: string, number: number, state: number) => Promise<any>

}

export function useSocket(serverUrl: string = 'http://localhost:8000'): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

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
    })

    socket.on('scan_complete', (data) => {
      console.log('Barcode scan completed:', data)
      // Handle scan completion with result data
    })

    socket.on('scan_error', (data) => {
      console.error('Barcode scan error:', data)
      // Handle scan errors
    })

    socket.on('control_complete', (data) => {
      console.log('Device control completed:', data)
    })

    socket.on('control_error', (data) => {
      console.error('Device control error:', data)
    })

    // Cleanup on unmount
    return () => {
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

  // Function to scan barcode
  const scanBarcode = async (scanData: any = {}): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        reject(new Error('Socket not connected'))
        return
      }

      console.log('Emitting scan_barcode event with data:', scanData)

      // Set a timeout in case the server doesn't respond
      const timeout = setTimeout(() => {
        reject(new Error('Barcode scan timeout'))
      }, 30000) // 30 second timeout

      try {
        // Send scan_barcode event with scanData and callback
        socketRef.current.emit('scan_barcode', scanData, (response: any) => {
          clearTimeout(timeout)
          
          console.log('Received barcode scan response from server:', response)
          
          if (response && response.success) {
            console.log('Barcode scan completed successfully:', response.data)
            resolve(response.data) // Return the JSON data from barcode scanner
          } else {
            const errorMsg = response?.error || 'Unknown error occurred during barcode scan'
            console.error('Failed to scan barcode:', errorMsg)
            reject(new Error(errorMsg))
          }
        })
      } catch (error) {
        clearTimeout(timeout)
        console.error('Error emitting scan_barcode:', error)
        reject(error)
      }
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

  return {
    socket: socketRef.current,
    isConnected,
    startPCRRun,
    stopPCRRun,
    getSystemStatus,
    scanBarcode,  // Export the new barcode scanner function
    controlDevice, // Export the device control function
  }
}