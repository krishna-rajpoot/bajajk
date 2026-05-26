import { useState } from 'react';
import Select from 'react-select';
import axios from 'axios';

function App() {
  const [jsonInput, setJsonInput] = useState('{\n  "data": ["A","C","z"]\n}');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Use environment variable for API URL or fallback to localhost for dev
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/bfhl';

  const filterOptions = [
    { value: 'alphabets', label: 'Alphabets' },
    { value: 'numbers', label: 'Numbers' },
    { value: 'highest_lowercase_alphabet', label: 'Highest lowercase alphabet' }
  ];

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      borderColor: state.isFocused ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '0.25rem',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.2)' : 'none',
      '&:hover': {
        borderColor: '#6366f1'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#6366f1' 
        : state.isFocused 
          ? 'rgba(99, 102, 241, 0.2)' 
          : 'transparent',
      color: state.isSelected ? 'white' : '#f8fafc',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#4f46e5'
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderRadius: '6px'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#c7d2fe'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#c7d2fe',
      ':hover': {
        backgroundColor: '#ef4444',
        color: 'white'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#f8fafc'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#94a3b8'
    }),
    input: (provided) => ({
      ...provided,
      color: '#f8fafc'
    })
  };

  const handleSubmit = async () => {
    setError('');
    setResponse(null);
    
    // Validate JSON
    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
      if (!parsedData.data || !Array.isArray(parsedData.data)) {
        throw new Error("JSON must contain a 'data' array");
      }
    } catch (err) {
      setError(err.message || 'Invalid JSON format');
      return;
    }

    setIsLoading(true);
    try {
      // For production, the URL might need to be relative or pointing to the deployed backend
      const res = await axios.post(API_URL, parsedData);
      setResponse(res.data);
      // Pre-select all options by default to show a rich UI initially
      setSelectedOptions(filterOptions);
    } catch (err) {
      setError(err.response?.data?.message || 'Error calling API');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = (selected) => {
    setSelectedOptions(selected || []);
  };

  const renderFilteredResponse = () => {
    if (!response) return null;

    if (selectedOptions.length === 0) {
      return (
        <div className="response-card" style={{ textAlign: 'center', color: '#94a3b8' }}>
          Select filters to view data
        </div>
      );
    }

    return (
      <div className="response-card">
        {selectedOptions.map(option => {
          const key = option.value;
          const data = response[key];
          
          let displayValue = 'None';
          if (Array.isArray(data) && data.length > 0) {
            displayValue = data.join(', ');
          } else if (typeof data === 'boolean') {
            displayValue = data ? 'True' : 'False';
          } else if (data && !Array.isArray(data)) {
            displayValue = data.toString();
          }

          return (
            <div className="response-item" key={key}>
              <div className="response-label">{option.label}</div>
              <div className="response-value">{displayValue}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container">
      <h1>Data Processor</h1>
      <p className="subtitle">Enter your JSON payload below to process data</p>

      <div className="input-group">
        <label htmlFor="json-input">API Input</label>
        <textarea
          id="json-input"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{ "data": ["A","C","z"] }'
        />
        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        )}
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={isLoading || !jsonInput.trim()}
      >
        {isLoading ? (
          <>
            <div className="spinner"></div> Processing...
          </>
        ) : 'Submit API'}
      </button>

      {response && (
        <div className="response-section">
          <div className="input-group">
            <label>Multi Filter</label>
            <Select
              isMulti
              options={filterOptions}
              value={selectedOptions}
              onChange={handleOptionChange}
              styles={customSelectStyles}
              placeholder="Select data to view..."
            />
          </div>

          <div className="filtered-response">
            <label>Filtered Response</label>
            {renderFilteredResponse()}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
