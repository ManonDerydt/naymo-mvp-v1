// components/charts/BarChartSecteurs.tsx
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';

const BarChartSecteurs = () => {
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
      categories: ['Alimentation', 'Mode', 'Technologie', 'Beauté', 'Maison', 'Loisirs'],
    },
    colors: ['#34D399'], // vert style Naymo
    title: {
      text: 'Secteurs d\'achats',
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold'
      }
    }
  };

  const chartSeries = [
    {
      name: "Achats",
      data: [44, 55, 41, 64, 22, 43]
    }
  ];

  return (
    <div className="bg-white p-4 rounded shadow">
      <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={350} />
    </div>
  );
};

export default BarChartSecteurs;
