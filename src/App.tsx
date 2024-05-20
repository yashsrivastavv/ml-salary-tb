// src/App.tsx
import React from 'react';
import './App.css';
import MainTable from './MainTable';
// import 'antd/dist/antd.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>ML Engineer Salaries</h1>
        <MainTable />
      </header>
    </div>
  );
};
