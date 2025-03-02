import {
  db,
  ref,
  get,
  set,
  remove,
  getAuth,
  onAuthStateChanged,
} from "./firebase.js";

onAuthStateChanged(getAuth(), (user) => {
  if (user) {
    // Now that the user is authenticated, proceed with your logic
    // $(document).ready(function () {
    //   $("#dateField").datepicker({
    //     showOn: "both",
    //     buttonText: '<i class="bi bi-calendar3"></i>',
    //     dateFormat: "dd MM yy",
    //     maxDate: 0,
    //     onSelect: function (dateText) {
    //       const selectedDate = formatDateToLongFormat(dateText); // Format date to "November 14, 2024"
    //       $("#dateField").val(selectedDate);
    //       populateTable(selectedDate);
    //     },
    //   });
    //   // Set the initial date to today's date in the desired format
    //   const currentDate = new Date();
    //   const formattedDate = formatDateToLongFormat(currentDate);
    //   $("#dateField").datepicker("setDate", currentDate);
    //   $("#dateField").val(formattedDate);
    //   populateTable(formattedDate);
    // });
    $(document).ready(function () {
      function initializeDatepicker(selector, onSelectCallback) {
        $(selector).datepicker({
          showOn: "both",
          buttonText: '<i class="bi bi-calendar3"></i>',
          dateFormat: "dd MM yy",
          maxDate: 0,
          onSelect: function (dateText) {
            const selectedDate = formatDateToLongFormat(dateText);
            $(selector).val(selectedDate);
            onSelectCallback(selectedDate);
          },
        });
      }

      // Initialize Datepickers for From Date and To Date
      initializeDatepicker("#fromDateField", function (fromDate) {
        const parsedFromDate = new Date(fromDate);
        $("#toDateField").datepicker("option", "minDate", parsedFromDate);
        updateTable();
      });

      initializeDatepicker("#toDateField", function (toDate) {
        // $("#fromDateField").datepicker("option", "maxDate", toDate);
        updateTable();
      });

      // Set default dates to today
      const currentDate = new Date();
      const formattedDate = formatDateToLongFormat(currentDate);

      $("#fromDateField").datepicker("setDate", currentDate);
      $("#toDateField").datepicker("setDate", currentDate);

      $("#fromDateField").val(formattedDate);
      $("#toDateField").val(formattedDate);

      updateTable();

      function updateTable() {
        const fromDate = $("#fromDateField").val();
        const toDate = $("#toDateField").val();
        populateTable(fromDate, toDate);
      }
    });
  } else {
    console.error("User is not logged in. Permission denied.");
    window.location.href = "/Pages/Login.html"; // Redirect to login if not logged in
  }
});

// async function populateTable(selectedDate) {
//   const auth = getAuth();

//   const user = auth.currentUser;

//   if (!user) {
//     console.error("User is not logged in. Permission denied.");
//     return;
//   }

//   const userId = user.uid;
//   //const userId = localStorage.getItem("userId");
//   const employeeRef = ref(
//     db,
//     `employees/${formatDateToYYYYMMDD(selectedDate)}`
//   );

//   // Get the table element
//   const tableElement = $("#employeeTable");

//   try {
//     const snapshot = await get(employeeRef);

//     if (snapshot.exists()) {
//       const employeeData = snapshot.val();
//       console.log("Employee Report Data:", employeeData);

//       // Destroy existing DataTable instance if it exists
//       if ($.fn.DataTable.isDataTable(tableElement)) {
//         tableElement.DataTable().clear().destroy();
//       }

//       //binding datatable....
//       const table = tableElement.DataTable({
//         responsive: true,
//         scrollX: true,
//         dom: 'l<"toolbar">Bfrtip',
//         buttons: [
//           {
//             extend: "excelHtml5",
//             text: "Download",
//             filename: function () {
//               return getFormattedFilename();
//             },
//             exportOptions: {
//               columns: ":visible",
//             },
//             action: function (e, dt, node, config) {
//               const table = dt; // Reference to DataTable instance
//               const rowCount = table.rows().count(); // Get the count of rows

//               if (rowCount === 0) {
//                 alert("No data available for export.");
//               } else {
//                 // Proceed with export if there is data
//                 $.fn.dataTable.ext.buttons.excelHtml5.action.call(
//                   this,
//                   e,
//                   dt,
//                   node,
//                   config
//                 );
//               }
//             },
//           },
//         ],
//       });

//       $(window).on("resize", function () {
//         table.columns.adjust().responsive.recalc();
//       });

//       table.clear();

//       // Loop through each UID entry in the data object
//       for (const uid in employeeData) {
//         if (employeeData.hasOwnProperty(uid)) {
//           const employee = employeeData[uid];

//           for (const recordEmp in employee) {
//             if (employee.hasOwnProperty(recordEmp)) {
//               const individualRecord = employee[recordEmp];

//               // Add row with employee data, store UID as a data attribute
//               const row = table.row
//                 .add([
//                   selectedDate,
//                   individualRecord.name || "",
//                   individualRecord.location || "",
//                   individualRecord.workcompleted || "",
//                   individualRecord.starttime || "",
//                   individualRecord.endtime || "",
//                   individualRecord.hoursWorked || 0,
//                   individualRecord.notes || "",
//                   individualRecord.insertedTime || "",
//                 ])
//                 .draw()
//                 .node();

//               // Set UID as a data attribute for the row
//               $(row).attr("data-uid", uid);
//             }
//           }
//         }
//       }
//     } else {
//       tableElement.DataTable().clear().draw(false);
//     }
//   } catch (error) {
//     console.error("Error fetching employee data:", error);
//   }
// }
async function populateTable(fromDate, toDate) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error("User is not logged in. Permission denied.");
    return;
  }

  const userId = user.uid;
  const tableElement = $("#employeeTable");

  try {
    // Destroy existing DataTable instance if it exists
    if ($.fn.DataTable.isDataTable(tableElement)) {
      tableElement.DataTable().clear().destroy();
    }

    // Initialize DataTable
    const table = tableElement.DataTable({
      responsive: true,
      scrollX: true,
      order: [[0, "asc"]], // Sorting by first column (date) in ascending order
      columnDefs: [
        {
          targets: 0, // Date column index
          type: "date", // Ensure it is treated as a date column
        },
      ],
      dom: 'l<"toolbar">Bfrtip',
      buttons: [
        {
          extend: "excelHtml5",
          text: "Download",
          filename: function () {
            return getFormattedFilename();
          },
          exportOptions: {
            columns: ":visible",
          },
          action: function (e, dt, node, config) {
            const rowCount = dt.rows().count();
            if (rowCount === 0) {
              alert("No data available for export.");
            } else {
              $.fn.dataTable.ext.buttons.excelHtml5.action.call(
                this,
                e,
                dt,
                node,
                config
              );
            }
          },
        },
      ],
    });

    $(window).on("resize", function () {
      table.columns.adjust().responsive.recalc();
    });

    table.clear();

    // Loop through dates from 'fromDate' to 'toDate'
    let currentDate = new Date(fromDate);
    let endDate = new Date(toDate);

    while (currentDate <= endDate) {
      const formattedDate = formatDateToYYYYMMDD(currentDate);
      const employeeRef = ref(db, `employees/${formattedDate}`);

      try {
        const snapshot = await get(employeeRef);
        if (snapshot.exists()) {
          const employeeData = snapshot.val();
          console.log(`Employee Data for ${formattedDate}:`, employeeData);

          console.log(
            `Employee Data for ${formatDateToShortFormat(formattedDate)}:`
          );

          // Loop through each UID entry in the data object
          for (const uid in employeeData) {
            if (employeeData.hasOwnProperty(uid)) {
              const employee = employeeData[uid];

              for (const recordEmp in employee) {
                if (employee.hasOwnProperty(recordEmp)) {
                  const individualRecord = employee[recordEmp];

                  // Add row with employee data, store UID as a data attribute
                  const row = table.row
                    .add([
                      formatDateToShortFormat(formattedDate),
                      individualRecord.name || "",
                      individualRecord.location || "",
                      individualRecord.workcompleted || "",
                      individualRecord.starttime || "",
                      individualRecord.endtime || "",
                      individualRecord.hoursWorked || 0,
                      individualRecord.notes || "",
                      individualRecord.insertedTime || "",
                    ])
                    .draw()
                    .node();

                  // Set UID as a data attribute for the row
                  $(row).attr("data-uid", uid);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching data for ${formattedDate}:`, error);
      }

      // Move to the next date
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } catch (error) {
    console.error("Error fetching employee data:", error);
  }
}

function formatDateToYYYYMMDD(date) {
  const formateddate = new Date(date);

  if (isNaN(formateddate)) {
    console.error("Invalid date format");
    return null;
  }

  const year = formateddate.getFullYear();
  const month = String(formateddate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(formateddate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateToLongFormat(date) {
  const dateObj = new Date(date);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return dateObj.toLocaleDateString("en-US", options); // Nov 14, 2024
}

function formatDateToShortFormat(date) {
  const [year, month, day] = date.split("-").map(Number); // Extract year, month, day
  const dateObj = new Date(year, month - 1, day); // Months are 0-based in JS Date

  const options = { year: "numeric", month: "short", day: "numeric" };
  return dateObj.toLocaleDateString("en-US", options);
}

function getFormattedFilename() {
  let today = new Date();
  let month = today.toLocaleString("en-US", { month: "short" }); // Short month name
  let day = today.getDate();
  let year = today.getFullYear();
  return `Report_${month}_${day}_${year}`;
}
