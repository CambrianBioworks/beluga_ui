// lib/useSocket.ts
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  startPCRRun: (runData: any) => Promise<string | null>
  stopPCRRun: (runId: string) => void
  getSystemStatus: () => void
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

    socket.on('run_error', (data) => {
      console.error('PCR run error:', data)
      // Handle errors here
    })

    socket.on('run_complete', (data) => {
      console.log('PCR run completed:', data)
      // Handle completion
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [serverUrl])

  // Function to start PCR run
  const startPCRRun = async (runData: any): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        reject(new Error('Socket not connected'))
        return
      }

      // Send start_pcr_run event with runData
      socketRef.current.emit('start_pcr_run', runData, (response: any) => {
        if (response.success) {
          console.log('PCR run started successfully:', response.run_id)
          resolve(response.run_id)
        } else {
          console.error('Failed to start PCR run:', response.error)
          reject(new Error(response.error))
        }
      })
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
  }
}