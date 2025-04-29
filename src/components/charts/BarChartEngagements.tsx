// components/charts/BarChartEngagements.tsx
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';

const BarChartEngagements = () => {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 0,
        horizontal: false,
        columnWidth: '50%',
      },
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: ['Durabilité', 'Local', 'Bio', 'Équitable', 'Recyclage'],
    },
    colors: ['#60A5FA'], // bleu style sérieux
    title: {
      text: 'Engagements',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold'
      }
    }
  };

  const chartSeries = [
    {
      name: "Engagements",
      data: [35, 49, 23, 50, 30]
    }
  ];

  return (
    <div className="bg-white p-4 rounded shadow">
      <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={350} />
    </div>
  );
};

export default BarChartEngagements;
