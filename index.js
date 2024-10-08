const BitqueryClient = require('./bitqueryClient');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');

const client = new BitqueryClient();

const queryString = `
  query MyQuery {
    cosmos {
      blocks(date: {after: "2023-05-01", before: "2023-06-01"}) {
        count
        date {
          date(format: "%Y-%m-%d")
        }
      }
    }
  }
`;

async function createChart(data) {
  const width = 800;
  const height = 400;
  const chartCallback = (ChartJS) => {
    ChartJS.defaults.responsive = true;
    ChartJS.defaults.maintainAspectRatio = false;
  };
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });

  const configuration = {
    type: 'line',
    data: {
      labels: data.map(item => item.date.date),
      datasets: [{
        label: 'Number of Blocks',
        data: data.map(item => item.count),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  const image = await chartJSNodeCanvas.renderToBuffer(configuration);
  fs.writeFileSync('./chart.png', image);
  console.log('Chart saved as chart.png');
}

async function main() {
  try {
    const result = await client.query(queryString);
    const data = result.data.cosmos.blocks;
    await createChart(data);
  } catch (error) {
    console.error('Error in main function:', error.message);
  }
}

main();