import React from 'react';
import type { AnalyzeResponse } from '../services/api';

interface ResultsProps {
  results: AnalyzeResponse;
}

const Results: React.FC<ResultsProps> = ({ results }) => {
  const { ingredients, recipes } = results;

  return (
    <div className="results-container">
      <div className="ingredients-section">
        <h2>Detected Ingredients</h2>
        {ingredients.length > 0 ? (
          <div className="ingredients-list">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-item">
                <span className="ingredient-name">{ingredient.name}</span>
                {ingredient.confidence && (
                  <span className="confidence">
                    {Math.round(ingredient.confidence * 100)}% confidence
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-ingredients">No ingredients detected</p>
        )}
      </div>

      <div className="recipes-section">
        <h2>Suggested Recipes</h2>
        {recipes.length > 0 ? (
          <div className="recipes-list">
            {recipes.map((recipe, index) => (
              <div key={index} className="recipe-card">
                <h3 className="recipe-title">{recipe.title}</h3>
                <div className="recipe-meta">
                  <span className={`difficulty ${recipe.difficulty}`}>
                    {recipe.difficulty}
                  </span>
                  <span className="time">
                    {recipe.timeMinutes} minutes
                  </span>
                </div>
                <div className="used-ingredients">
                  <h4>Ingredients Used:</h4>
                  <div className="ingredients-tags">
                    {recipe.usedIngredients.map((ingredient, idx) => (
                      <span key={idx} className="ingredient-tag">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="instructions">
                  <h4>Instructions:</h4>
                  <ol className="steps-list">
                    {recipe.instructions.map((step, idx) => (
                      <li key={idx} className="step-item">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-recipes">No recipes generated</p>
        )}
      </div>
    </div>
  );
};

export default Results;

