import { db, ref, get, set, remove } from "./firebase.js";

$(document).ready(function () {
  $("#dateField").datepicker({
    showOn: "both",
    buttonText: '<i class="bi bi-calendar3"></i>',
    dateFormat: "dd MM yy",
    maxDate: 0,
    onSelect: function (dateText) {
      const selectedDate = formatDateToLongFormat(dateText); // Format date to "November 14, 2024"
      $("#dateField").val(selectedDate);
      populateTable(selectedDate);
    },
  });

  // Set the initial date to today's date in the desired format
  const currentDate = new Date();
  const formattedDate = formatDateToLongFormat(currentDate);
  $("#dateField").datepicker("setDate", currentDate);
  $("#dateField").val(formattedDate);

  populateTable(formattedDate);
});

async function populateTable(selectedDate) {
  const userId = localStorage.getItem("userId");
  const employeeRef = ref(
    db,
    `employees/${formatDateToYYYYMMDD(selectedDate)}`
  );

  // Get the table element
  const tableElement = $("#employeeTable");

  try {
    const snapshot = await get(employeeRef);
    if (snapshot.exists()) {
      const employeeData = snapshot.val();
      console.log("Employee Report Data:", employeeData);

      // Destroy existing DataTable instance if it exists
      if ($.fn.DataTable.isDataTable(tableElement)) {
        tableElement.DataTable().clear().destroy();
      }

      //binding datatable....
      const table = tableElement.DataTable({
        scrollX: true,
        responsive: true,
        dom: 'l<"toolbar">Bfrtip',
        buttons: [
          {
            extend: "excelHtml5",
            text: "Excel",
            filename: "Timecard Report",
            exportOptions: {
              columns: ":visible",
            },
            action: function (e, dt, node, config) {
              const table = dt; // Reference to DataTable instance
              const rowCount = table.rows().count(); // Get the count of rows

              if (rowCount === 0) {
                alert("No data available for export.");
              } else {
                // Proceed with export if there is data
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

      table.clear();

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
                  //date,
                  selectedDate,
                  individualRecord.name || "",
                  individualRecord.address || "",
                  individualRecord.hoursWorked || 0,
                  individualRecord.coWorker || "",
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
    } else {
      //alert("No data found for the specified date and UID.");
      tableElement.DataTable().clear().draw(false);
    }
  } catch (error) {
    console.error("Error fetching employee data:", error);
  }
}

function formatDateToYYYYMMDD(date) {
  // Parse the date string into a Date object
  const formateddate = new Date(date);

  // Check if the date is valid
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
  return dateObj.toLocaleDateString("en-US", options); // November 14, 2024
}
