// src/MainTable.tsx
import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';

// interface RawSalaryData {
//   work_year: number;
//   experience_level: string;
//   employment_type: string;
//   job_title: string;
//   salary: number;
//   salary_currency: string;
//   salary_in_usd: number;
//   employee_residence: string;
//   remote_ratio: number;
//   company_location: string;
//   company_size: string;
// }

interface SalaryData {
  year: number;
  totalJobs: number;
  averageSalary: number;
}

const MainTable: React.FC = () => {
  const [data, setData] = useState<SalaryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/salary_data.csv');
        const csvData = await response.text();
        processData(csvData);
      } catch (error) {
        console.error('Error fetching CSV data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processData = (csvData: string) => {
    const rows = csvData.split('\n').slice(1); // Skip header row
    const aggregatedData: { [year: number]: { totalJobs: number; totalSalary: number } } = {};
  
    rows.forEach((row) => {
      const columns = row.split(',');
      const workYear = parseInt(columns[0]);
      const salaryInUSD = parseInt(columns[6]);
  
      if (!aggregatedData[workYear]) {
        aggregatedData[workYear] = { totalJobs: 0, totalSalary: 0 };
      }
      aggregatedData[workYear].totalJobs += 1;
      aggregatedData[workYear].totalSalary += salaryInUSD;
    });
  
    const formattedData: SalaryData[] = Object.keys(aggregatedData).map((yearStr) => {
      const year = parseInt(yearStr);
      return {
        year,
        totalJobs: aggregatedData[year].totalJobs,
        averageSalary: aggregatedData[year].totalSalary / aggregatedData[year].totalJobs,
      };
    });
  
    setData(formattedData);
    setLoading(false);
  };
  

  const columns: ColumnsType<SalaryData> = [
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: 'Number of Total Jobs',
      dataIndex: 'totalJobs',
      key: 'totalJobs',
      sorter: (a, b) => a.totalJobs - b.totalJobs,
    },
    {
      title: 'Average Salary (USD)',
      dataIndex: 'averageSalary',
      key: 'averageSalary',
      sorter: (a, b) => a.averageSalary - b.averageSalary,
      render: (value) => `$${value.toLocaleString()}`,
    },
  ];

  return <Table columns={columns} dataSource={data} rowKey="year" loading={loading} />;
};

export default MainTable;
