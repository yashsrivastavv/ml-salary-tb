// src/App.tsx
import React from 'react';
import './App.css';
import MainTable from './MainTable';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>ML Engineer Salary Data</h1>
      </header>
      <MainTable />
    </div>
  );
};

export default App;
