// src/MainTable.tsx
import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import Papa, { ParseResult } from 'papaparse';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RawSalaryData {
  work_year: number;
  experience_level: string;
  employment_type: string;
  job_title: string;
  salary: number;
  salary_currency: string;
  salary_in_usd: number;
  employee_residence: string;
  remote_ratio: number;
  company_location: string;
  company_size: string;
}

interface AggregatedData {
  [year: number]: { totalJobs: number; totalSalary: number };
}

interface SalaryData {
  year: number;
  totalJobs: number;
  averageSalary: number;
}

interface JobTitleData {
  jobTitle: string;
  totalJobs: number;
}

const MainTable: React.FC = () => {
  const [data, setData] = useState<SalaryData[]>([]);
  const [jobTitleData, setJobTitleData] = useState<JobTitleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    Papa.parse('/salary_data.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result: ParseResult<RawSalaryData>) => {
        const rawData: RawSalaryData[] = result.data;
        const aggregatedData: AggregatedData = {};

        rawData.forEach((item) => {
          const { work_year, salary_in_usd } = item;
          if (!aggregatedData[work_year]) {
            aggregatedData[work_year] = { totalJobs: 0, totalSalary: 0 };
          }
          aggregatedData[work_year].totalJobs += 1;
          aggregatedData[work_year].totalSalary += salary_in_usd;
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
      },
    });
  }, []);

  const handleRowClick = (year: number) => {
    Papa.parse('/salary_data.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result: ParseResult<RawSalaryData>) => {
        const rawData: RawSalaryData[] = result.data;
        const jobTitleAggregation: { [jobTitle: string]: number } = {};

        rawData.forEach((item) => {
          if (item.work_year === year) {
            if (!jobTitleAggregation[item.job_title]) {
              jobTitleAggregation[item.job_title] = 0;
            }
            jobTitleAggregation[item.job_title] += 1;
          }
        });

        const jobTitleData: JobTitleData[] = Object.keys(jobTitleAggregation).map((jobTitle) => ({
          jobTitle,
          totalJobs: jobTitleAggregation[jobTitle],
        }));

        setJobTitleData(jobTitleData);
        setSelectedYear(year);
      },
    });
  };

  const mainTableColumns: ColumnsType<SalaryData> = [
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

  const jobTitleColumns: ColumnsType<JobTitleData> = [
    {
      title: 'Job Title',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
    },
    {
      title: 'Number of Jobs',
      dataIndex: 'totalJobs',
      key: 'totalJobs',
    },
  ];

  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="totalJobs" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
      <Table
        columns={mainTableColumns}
        dataSource={data}
        rowKey="year"
        loading={loading}
        onRow={(record) => ({
          onClick: () => handleRowClick(record.year),
        })}
      />
      {selectedYear !== null && (
        <div>
          <h2>Job Titles for {selectedYear}</h2>
          <Table
            columns={jobTitleColumns}
            dataSource={jobTitleData}
            rowKey="jobTitle"
          />
        </div>
      )}
    </div>
  );
};

export default MainTable;
