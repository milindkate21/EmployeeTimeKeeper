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
  const totalWorkMinutes = data.reduce(
    (sum, d) => sum + parseHoursWorked(d.hoursWorked),
    0
  );

  const totalWorkHours = Math.floor(totalWorkMinutes / 60); // Full hours
  const remainingMinutes = totalWorkMinutes % 60; // Remaining minutes

  document.getElementById("totalTasks").textContent = totalTasks;
  document.getElementById("totalClients").textContent = totalClients;
  document.getElementById("totalLocations").textContent = totalLocations;
  document.getElementById(
    "totalWorkHours"
  ).textContent = `${totalWorkHours} hr ${remainingMinutes} min`;
}

// Update Charts
function updateCharts(data) {
  // Helper function to aggregate hours worked by a key (e.g., client or location)
  const aggregateData = (array, key) => {
    return array.reduce((acc, item) => {
      const groupKey = item[key];
      const exactHoursWorked = item.hoursWorked || "0 hr"; // Default to "0 hr"

      // Parse hoursWorked to total minutes
      const minutes = parseHoursWorked(exactHoursWorked);

      if (groupKey) {
        acc[groupKey] = acc[groupKey] || { totalMinutes: 0 };
        acc[groupKey].totalMinutes += minutes; // Sum total minutes
      }
      return acc;
    }, {});
  };

  const aggregateTaskCounts = (array, key) => {
    return array.reduce((acc, item) => {
      const groupKey = item[key];

      if (groupKey) {
        acc[groupKey] = (acc[groupKey] || 0) + 1;
      }
      return acc;
    }, {});
  };

  // Format total minutes to "X hr Y min"
  const formatMinutesToHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hr${
      remainingMinutes > 0 ? ` ${remainingMinutes} min` : ""
    }`;
  };

  // Parse hoursWorked (convert "X hr Y min" to total minutes)
  const parseHoursWorked = (hoursWorked) => {
    if (!hoursWorked) return 0;

    const [_, hours = 0, minutes = 0] =
      hoursWorked.match(/(\d+)\s*hr(?:.*?(\d+)?\s*min?)?/) || [];
    return parseInt(hours) * 60 + parseInt(minutes || 0);
  };

  // Aggregate data for bar chart (clients)
  const clientData = aggregateData(data, "name");

  // Prepare data for the bar chart
  const barCategories = Object.keys(clientData);
  const barSeriesData = Object.entries(clientData).map(
    ([name, { totalMinutes }]) => ({
      y: totalMinutes / 60,
      name,
      formattedHours: formatMinutesToHours(totalMinutes),
    })
  );

  // Update Bar Chart (Client Hours)
  Highcharts.chart("hoursPerClient", {
    chart: { type: "column" },
    title: { text: "Total Hours Worked Per Client" },
    xAxis: {
      categories: barCategories,
      crosshair: true,
      title: {
        text: "Client",
        style: {
          fontWeight: "bold",
        },
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "Hours Worked",
        style: {
          fontWeight: "bold",
        },
      },
    },
    tooltip: {
      formatter: function () {
        return `<b>${this.point.name}</b><br>Hours Worked - <b>${this.point.formattedHours}</b>`;
      },
    },
    series: [
      {
        name: "Hours Worked",
        data: barSeriesData,
        color: "#FF5733",
      },
    ],
  });

  // Aggregate task counts for pie chart
  const locationTaskCounts = aggregateTaskCounts(data, "location");

  // Prepare data for pie chart
  const pieSeriesData = Object.entries(locationTaskCounts).map(
    ([name, count]) => ({
      name,
      y: count,
    })
  );

  // Update Pie Chart (Number of Tasks Per Location)
  Highcharts.chart("workHoursDistribution", {
    chart: { type: "pie" },
    title: { text: "Number of Tasks Per Location" },
    tooltip: {
      formatter: function () {
        return `<b>${this.point.name}</b><br>Tasks - <b>${this.point.y}</b>`;
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>",
        },
      },
    },
    series: [
      {
        name: "Tasks",
        colorByPoint: true,
        data: pieSeriesData,
      },
    ],
  });
}

// Fetch Data on Page Load
fetchData();

function parseHoursWorked(hoursWorked) {
  if (!hoursWorked) return 0;

  const [_, hours = 0, minutes = 0] =
    hoursWorked.match(/(\d+)\s*hr(?:.*?(\d+)?\s*min?)?/) || [];

  return parseInt(hours) * 60 + parseInt(minutes || 0);
}

function formatMinutesToHours(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} hr${remainingMinutes > 0 ? ` ${remainingMinutes} min` : ""}`;
}
