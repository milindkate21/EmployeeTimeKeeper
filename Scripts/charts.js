import {
  db,
  ref,
  get,
  set,
  remove,
  getAuth,
  onAuthStateChanged,
} from "./firebase.js";

const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user.uid);
    fetchData(user.uid);
  } else {
    console.log("User not signed in");
  }
});

async function fetchData() {
  try {
    debugger;
    const snapshot = await get(ref(db, "employees")); // Fetch all employees data

    if (!snapshot.exists()) {
      console.log("No data found");
      return;
    }

    let allData = [];
    const employees = snapshot.val();

    // Iterate over all dates
    Object.entries(employees).forEach(([date, users]) => {
      // Iterate over all users within a date
      Object.values(users).forEach((records) => {
        // Iterate over all records of that user
        Object.values(records).forEach((entry) => {
          allData.push(entry);
        });
      });
    });

    console.log(allData);

    updateMetrics(allData);
    updateCharts(allData);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Update Metrics
function updateMetrics(data) {
  const totalTasks = data.length;
  const totalClients = new Set(data.map((d) => d.name)).size;
  const totalLocations = new Set(data.map((d) => d.location)).size;
  const totalWorkHours = data.reduce((sum, d) => sum + (d.workHours || 0), 0);

  document.getElementById("totalTasks").textContent = totalTasks;
  document.getElementById("totalClients").textContent = totalClients;
  document.getElementById("totalLocations").textContent = totalLocations;
  document.getElementById("totalWorkHours").textContent =
    totalWorkHours.toFixed(2);
}

// Update Charts
function updateCharts(data) {
  const clientHours = {};
  const industryHours = {};

  data.forEach(({ client, workHours, industry }) => {
    clientHours[client] = (clientHours[client] || 0) + workHours;
    industryHours[industry] = (industryHours[industry] || 0) + workHours;
  });

  // Update Bar Chart
  Highcharts.chart("hoursPerClient", {
    chart: { type: "column" },
    title: { text: "Total Hours Worked Per Client" },
    xAxis: { categories: Object.keys(clientHours), crosshair: true },
    yAxis: { min: 0, title: { text: "Hours Worked" } },
    series: [
      { name: "Hours", data: Object.values(clientHours), color: "#FF5733" },
    ],
  });

  // Update Pie Chart
  // Highcharts.chart("workHoursDistribution", {
  //   chart: { type: "pie" },
  //   title: { text: "Work Hours Distribution Per Industry" },
  //   series: [
  //     {
  //       name: "Hours",
  //       data: Object.entries(industryHours).map(([name, y]) => ({ name, y })),
  //     },
  //   ],
  // });
}

// Fetch Data on Page Load
fetchData();

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

// /////-------------------------------------------------------------------------
// // Sample Data
// const data = [
//   {
//     date: "Mar 3, 2025",
//     client: "Loblaw Ltd.",
//     location: "London",
//     work: "Remove snow from front lobby",
//     startTime: "09:00 AM",
//     endTime: "10:00 AM",
//     notes: "Temp around 6 degree",
//   },
//   // Add more entries
// ];

// // Calculate Metrics
// const totalTasks = data.length;
// const totalClients = new Set(data.map((d) => d.client)).size;
// const totalLocations = new Set(data.map((d) => d.location)).size;
// const totalWorkHours = data.reduce((sum, d) => {
//   const startTime = new Date(`1970-01-01T${convertTo24Hour(d.startTime)}`);
//   const endTime = new Date(`1970-01-01T${convertTo24Hour(d.endTime)}`);
//   return sum + (endTime - startTime) / (1000 * 60 * 60); // Convert milliseconds to hours
// }, 0);

// // Update Metrics in HTML
// document.getElementById("totalTasks").textContent = totalTasks;
// document.getElementById("totalClients").textContent = totalClients;
// document.getElementById("totalLocations").textContent = totalLocations;
// document.getElementById("totalWorkHours").textContent =
//   totalWorkHours.toFixed(2);

// // Convert 12-hour time to 24-hour time
// function convertTo24Hour(timeStr) {
//   const [time, modifier] = timeStr.split(" ");
//   let [hours, minutes] = time.split(":");
//   if (modifier === "PM" && hours !== "12") {
//     hours = parseInt(hours, 10) + 12;
//   }
//   return `${hours}:${minutes}`;
// }
