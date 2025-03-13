// Highcharts.chart("tasksPerIndustry", {
//   chart: {
//     type: "column",
//   },
//   title: {
//     text: "Number of Tasks Per Industry",
//   },
//   xAxis: {
//     categories: [
//       "Retail",
//       "Banking & Finance",
//       "Automotive",
//       "Telecom",
//       "Healthcare",
//       "Technology",
//       "Entertainment",
//       "Hospitality",
//       "Food & Beverage",
//       "Transportation",
//       "Education",
//     ],
//     crosshair: true,
//   },
//   yAxis: {
//     min: 0,
//     title: {
//       text: "Number of Tasks",
//     },
//   },
//   series: [
//     {
//       name: "Tasks",
//       data: [2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Adjust based on your data
//       color: "#008FFB",
//     },
//   ],
// });

// // Work Distribution - Pie Chart
// Highcharts.chart("workDistribution", {
//   chart: {
//     type: "pie",
//   },
//   title: {
//     text: "Work Distribution Across Industries",
//   },
//   series: [
//     {
//       name: "Tasks",
//       data: [
//         { name: "Retail", y: 2 },
//         { name: "Banking & Finance", y: 2 },
//         { name: "Automotive", y: 1 },
//         { name: "Telecom", y: 1 },
//         { name: "Healthcare", y: 1 },
//         { name: "Technology", y: 1 },
//         { name: "Entertainment", y: 1 },
//         { name: "Hospitality", y: 1 },
//         { name: "Food & Beverage", y: 1 },
//         { name: "Transportation", y: 1 },
//         { name: "Education", y: 1 },
//       ],
//     },
//   ],
// });

// Highcharts.chart("hoursPerClient", {
//   chart: { type: "column" },
//   title: { text: "Total Hours Worked Per Client" },
//   xAxis: {
//     categories: [
//       "Loblaw Ltd.",
//       "RBC Bank",
//       "Tesla",
//       "Bell Canada",
//       "St. Michael's Hospital",
//       "Shopify",
//       "Cineplex",
//       "Fairmont Hotel",
//       "Tim Hortons",
//       "CN Rail",
//     ],
//     crosshair: true,
//   },
//   yAxis: { min: 0, title: { text: "Hours Worked" } },
//   series: [
//     {
//       name: "Hours",
//       data: [1, 1.75, 2, 2.5, 2.5, 2, 1.5, 1.75, 2, 1.5], // Adjust based on your data
//       color: "#FF5733",
//     },
//   ],
// });

// // 2. Work Hours Distribution Per Industry - Pie Chart
// Highcharts.chart("workHoursDistribution", {
//   chart: { type: "pie" },
//   title: { text: "Work Hours Distribution Per Industry" },
//   series: [
//     {
//       name: "Hours",
//       data: [
//         { name: "Retail", y: 2 },
//         { name: "Banking & Finance", y: 1.75 },
//         { name: "Automotive", y: 2 },
//         { name: "Telecom", y: 2.5 },
//         { name: "Healthcare", y: 2.5 },
//         { name: "Technology", y: 2 },
//         { name: "Entertainment", y: 1.5 },
//         { name: "Hospitality", y: 1.75 },
//         { name: "Food & Beverage", y: 2 },
//         { name: "Transportation", y: 1.5 },
//       ],
//     },
//   ],
// });

// // 3. Client Workload Overview - Bar Chart
// Highcharts.chart("clientWorkload", {
//   chart: { type: "bar" },
//   title: { text: "Number of Tasks Per Client" },
//   xAxis: {
//     categories: [
//       "Loblaw Ltd.",
//       "RBC Bank",
//       "Tesla",
//       "Bell Canada",
//       "St. Michael's Hospital",
//       "Shopify",
//       "Cineplex",
//       "Fairmont Hotel",
//       "Tim Hortons",
//       "CN Rail",
//     ],
//   },
//   yAxis: { min: 0, title: { text: "Number of Tasks" } },
//   series: [
//     {
//       name: "Tasks",
//       data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Adjust based on your data
//       color: "#28B463",
//     },
//   ],
// });

// Highcharts.chart("workHoursTrend", {
//   chart: { type: "line" },
//   title: { text: "Work Hours Over Time" },
//   xAxis: { categories: ["Mar 3", "Mar 4", "Mar 5", "Mar 6", "Mar 7"] },
//   yAxis: { title: { text: "Total Hours Worked" } },
//   series: [
//     {
//       name: "Hours",
//       data: [6, 8, 7, 9, 6], // Example hours worked per day
//       color: "#FF5733",
//     },
//   ],
// });
// Highcharts.chart("stackedIndustry", {
//   chart: { type: "bar" },
//   title: { text: "Work Hours Per Industry Per Client" },
//   xAxis: {
//     categories: ["Retail", "Banking", "Automotive", "Telecom", "Healthcare"],
//   },
//   yAxis: { title: { text: "Total Hours Worked" } },
//   plotOptions: { series: { stacking: "normal" } },
//   series: [
//     { name: "Loblaw Ltd.", data: [2, 0, 0, 0, 0], color: "#FF5733" },
//     { name: "RBC Bank", data: [0, 2, 0, 0, 0], color: "#33FF57" },
//     { name: "Tesla", data: [0, 0, 3, 0, 0], color: "#3357FF" },
//     { name: "Bell Canada", data: [0, 0, 0, 2, 0], color: "#F39C12" },
//     { name: "St. Michael's Hospital", data: [0, 0, 0, 0, 4], color: "#8E44AD" },
//   ],
// });

/////---------------------------------
// Sample Data
const data = [
  {
    date: "Mar 3, 2025",
    client: "Loblaw Ltd.",
    location: "London",
    work: "Remove snow from front lobby",
    startTime: "09:00 AM",
    endTime: "10:00 AM",
    notes: "Temp around 6 degree",
  },
  // Add more entries
];

// Calculate Metrics
const totalTasks = data.length;
const totalClients = new Set(data.map((d) => d.client)).size;
const totalLocations = new Set(data.map((d) => d.location)).size;
const totalWorkHours = data.reduce((sum, d) => {
  const startTime = new Date(`1970-01-01T${convertTo24Hour(d.startTime)}`);
  const endTime = new Date(`1970-01-01T${convertTo24Hour(d.endTime)}`);
  return sum + (endTime - startTime) / (1000 * 60 * 60); // Convert milliseconds to hours
}, 0);

// Update Metrics in HTML
document.getElementById("totalTasks").textContent = totalTasks;
document.getElementById("totalClients").textContent = totalClients;
document.getElementById("totalLocations").textContent = totalLocations;
document.getElementById("totalWorkHours").textContent =
  totalWorkHours.toFixed(2);

// Convert 12-hour time to 24-hour time
function convertTo24Hour(timeStr) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");
  if (modifier === "PM" && hours !== "12") {
    hours = parseInt(hours, 10) + 12;
  }
  return `${hours}:${minutes}`;
}

// Pie Chart for Work Distribution
Highcharts.chart("pieChart", {
  chart: {
    type: "pie",
  },
  title: {
    text: "Work Distribution",
  },
  series: [
    {
      name: "Tasks",
      data: [...new Set(data.map((d) => d.work))].map((work) => ({
        name: work,
        y: data.filter((d) => d.work === work).length,
      })),
    },
  ],
});

// Line Chart for Total Hours Worked
Highcharts.chart("lineChart", {
  chart: {
    type: "line",
  },
  title: {
    text: "Total Hours Worked Over Time",
  },
  xAxis: {
    categories: data.map((d) => d.date),
  },
  yAxis: {
    title: {
      text: "Hours Worked",
    },
  },
  series: [
    {
      name: "Hours Worked",
      data: data.map((d) => {
        const startTime = new Date(
          `1970-01-01T${convertTo24Hour(d.startTime)}`
        );
        const endTime = new Date(`1970-01-01T${convertTo24Hour(d.endTime)}`);
        return (endTime - startTime) / (1000 * 60 * 60);
      }),
    },
  ],
});

// Bar Chart for Hours by Location
Highcharts.chart("barChart", {
  chart: {
    type: "column",
  },
  title: {
    text: "Work Hours by Location",
  },
  xAxis: {
    categories: [...new Set(data.map((d) => d.location))],
    title: {
      text: "Locations",
    },
  },
  yAxis: {
    title: {
      text: "Total Hours Worked",
    },
  },
  series: [
    {
      name: "Hours",
      data: [...new Set(data.map((d) => d.location))].map((location) =>
        data
          .filter((d) => d.location === location)
          .reduce((sum, d) => {
            const startTime = new Date(
              `1970-01-01T${convertTo24Hour(d.startTime)}`
            );
            const endTime = new Date(
              `1970-01-01T${convertTo24Hour(d.endTime)}`
            );
            return sum + (endTime - startTime) / (1000 * 60 * 60);
          }, 0)
      ),
    },
  ],
});

// Sample task data
const taskData = [
  {
    date: "Mar 3, 2025",
    tasks: { "Snow Removal": 2, Maintenance: 1, Cleaning: 0 },
  },
  {
    date: "Mar 4, 2025",
    tasks: { "Snow Removal": 3, Maintenance: 2, Cleaning: 1 },
  },
  {
    date: "Mar 5, 2025",
    tasks: { "Snow Removal": 4, Maintenance: 0, Cleaning: 2 },
  },
];

// Stacked Bar Chart for Task Timing
Highcharts.chart("stackedBarChart", {
  chart: {
    type: "column",
  },
  title: {
    text: "Task Timing Distribution",
  },
  xAxis: {
    categories: taskData.map((d) => d.date),
    title: {
      text: "Dates",
    },
  },
  yAxis: {
    min: 0,
    title: {
      text: "Total Hours Worked",
    },
    stackLabels: {
      enabled: true,
      style: {
        fontWeight: "bold",
      },
    },
  },
  plotOptions: {
    column: {
      stacking: "normal",
      dataLabels: {
        enabled: true,
      },
    },
  },
  series: [
    {
      name: "Snow Removal",
      data: taskData.map((d) => d.tasks["Snow Removal"]),
      color: "#4CAF50",
    },
    {
      name: "Maintenance",
      data: taskData.map((d) => d.tasks["Maintenance"]),
      color: "#FF9800",
    },
    {
      name: "Cleaning",
      data: taskData.map((d) => d.tasks["Cleaning"]),
      color: "#03A9F4",
    },
  ],
});
