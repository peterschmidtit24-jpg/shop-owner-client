import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [status, setStatus] = useState('')

  async function testServerConnection() {
    setStatus('Loading products...')

    try {
      const response = await axios.get('http://localhost:8080/api/products')
      const products: unknown = response.data
      console.log('Products from server:', products)
      setStatus('Success! Check the browser console for the products.')
    } catch (error) {
      console.error('Could not fetch products:', error)
      setStatus('Connection failed. Check that the server is running.')
    }
  }

  return (
    <>
      <h1>Shop Owner Client</h1>
      <button className="connection-button" onClick={testServerConnection}>
        Test server connection
      </button>
      {status && <p className="connection-status">{status}</p>}
    </>
  )
}

export default App
