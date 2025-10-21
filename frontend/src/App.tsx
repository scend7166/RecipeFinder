import { useState } from 'react'
import Upload from './components/Upload'
import Results from './components/Results'
import type { AnalyzeResponse } from './services/api'
import './App.css'

function App() {
  const [results, setResults] = useState<AnalyzeResponse | null>(null)

  const handleResults = (newResults: AnalyzeResponse) => {
    setResults(newResults)
  }

  const handleReset = () => {
    setResults(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍳 RecipeFinder</h1>
        <p className="app-description">
          Transform your ingredients into delicious recipes! Simply upload photos of your cooking ingredients 
          and our AI will identify them and suggest amazing recipes you can make.
        </p>
      </header>

      <main className="app-main">
        <section className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>📸 Upload Photos</h3>
                <p>Take photos of your ingredients (up to 3 images)</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>🤖 AI Analysis</h3>
                <p>Our AI identifies all the ingredients in your photos</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>🍽️ Get Recipes</h3>
                <p>Receive 3 personalized recipe suggestions with instructions</p>
              </div>
            </div>
          </div>
        </section>

        <section className="upload-section">
          <h2>Start Cooking</h2>
          <Upload onResults={handleResults} />
        </section>

        {results && (
          <section className="results-section">
            <div className="results-header">
              <h2>Your Recipe Suggestions</h2>
              <button onClick={handleReset} className="reset-button">
                Analyze New Ingredients
              </button>
            </div>
            <Results results={results} />
          </section>
        )}
      </main>
    </div>
  )
}

export default App
