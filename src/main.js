import axios from 'axios';
import Chart from 'chart.js/auto';

const apiUrl = 'https://graphql.bitquery.io';
const apiKey = 'BQYPTMoFX3jEyykljfsAUAyboqQZ1W0u';
const bearerToken = 'ory_at_bdcuID6qQ7yBQnN7iFIX27bbPNL9oLNgpxanG5_yPRw.UEqTyM4Iyg1EdOuRNwRqbYFSY8HUp2_a2s8sXgbxh0Y';

let chart;
let chartData;

function getQueryString(startDate, endDate) {
  return `
    query MyQuery {
      cosmos {
        blocks(date: {after: "${startDate}", before: "${endDate}"}) {
          count
          date {
            date(format: "%Y-%m-%d")
          }
        }
      }
    }
  `;
}

async function fetchData(startDate, endDate) {
  const config = {
    method: 'post',
    url: apiUrl,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
      'Authorization': `Bearer ${bearerToken}`
    },
    data: JSON.stringify({
      query: getQueryString(startDate, endDate),
      variables: {}
    })
  };

  try {
    const response = await axios.request(config);
    console.log('API Response:', response.data);
    if (response.data.errors) {
      console.error('GraphQL Errors:', response.data.errors);
      throw new Error('GraphQL query returned errors');
    }
    return response.data.data.cosmos.blocks;
  } catch (error) {
    console.error('Error querying Bitquery API:', error.message);
    throw error;
  }
}

function createChart(data) {
  const ctx = document.getElementById('myChart').getContext('2d');
  
  if (chart) {
    chart.destroy();
  }
  
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(item => item.date.date),
      datasets: [{
        label: 'Number of Blocks',
        data: data.map(item => item.count),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Number of Blocks'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      },
      plugins: {
        title: {
          display: false
        },
        subtitle: {
          display: true,
          text: `Date Range: ${startDate} to ${endDate}`,
          font: {
            size: 14,
            style: 'italic'
          }
        }
      }
    }
  });
}

function setDefaultDates() {
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');

  startDateInput.value = '2022-08-01';

  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0];
  endDateInput.value = todayFormatted;
}

async function loadAndDisplayData() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  try {
    chartData = await fetchData(startDate, endDate);
    console.log('Fetched Data:', chartData);
    if (chartData && chartData.length > 0) {
      createChart(chartData);
    } else {
      console.error('No data returned from API');
      document.getElementById('app').innerHTML += '<p>Error: No data available. Please check the console for more information.</p>';
    }
  } catch (error) {
    console.error('Error in loadAndDisplayData function:', error.message);
    document.getElementById('app').innerHTML += `<p>Error: ${error.message}</p>`;
  }
}

function setupEventListeners() {
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const reloadButton = document.getElementById('reloadButton');

  startDateInput.addEventListener('change', loadAndDisplayData);
  endDateInput.addEventListener('change', loadAndDisplayData);
  reloadButton.addEventListener('click', loadAndDisplayData);
}

async function main() {
  setDefaultDates();
  setupEventListeners();
  await loadAndDisplayData();
}

main();