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
    window.location.href = "/Pages/Login.html";
  }
});

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
      responsive: {
        details: {
          type: "inline",
          target: "td",
          renderer: function (api, rowIdx, columns) {
            var data = $.map(columns, function (col) {
              return col.hidden
                ? '<tr data-dt-row="' +
                    col.rowIndex +
                    '" data-dt-column="' +
                    col.columnIndex +
                    '">' +
                    "<td>" +
                    col.title +
                    ":" +
                    "</td> " +
                    "<td>" +
                    col.data +
                    "</td>" +
                    "</tr>"
                : "";
            }).join("");
            return data ? $("<table/>").append(data) : false;
          },
        },
      },
      scrollX: false,
      autoWidth: false,
      order: [[0, "asc"]],
      columnDefs: [{ targets: 0, type: "date" }],
      dom: 'l<"toolbar">Bfrtip',
      buttons: [
        {
          extend: "excelHtml5",
          text: "Download",
          filename: function () {
            return getFormattedFilename();
          },
          exportOptions: {
            columns: ":visible, :hidden",
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

    // Adjust column visibility and recalculate on resize
    $(window).on("resize", function () {
      table.columns.adjust().responsive.recalc();
    });

    table.clear();

    let currentDate = new Date(fromDate);
    let endDate = new Date(toDate);

    while (currentDate <= endDate) {
      const formattedDate = formatDateToYYYYMMDD(currentDate);
      const employeeRef = ref(db, `employees/${formattedDate}`);

      try {
        const snapshot = await get(employeeRef);
        if (snapshot.exists()) {
          const employeeData = snapshot.val();

          // Loop through each UID entry in the data object
          for (const uid in employeeData) {
            if (employeeData.hasOwnProperty(uid)) {
              const employee = employeeData[uid];

              for (const recordEmp in employee) {
                if (employee.hasOwnProperty(recordEmp)) {
                  const individualRecord = employee[recordEmp];

                  const row = table.row
                    .add([
                      formatDateToShortFormat(formattedDate),
                      individualRecord.name || "",
                      individualRecord.location || "",
                      individualRecord.workcompleted || "",
                      individualRecord.startkilometer || "",
                      individualRecord.endkilometer || "",
                      individualRecord.starttime || "",
                      individualRecord.endtime || "",
                      individualRecord.hoursWorked || 0,
                      individualRecord.notes || "",
                      individualRecord.insertedTime || "",
                      individualRecord.addedby || "",
                    ])
                    .draw()
                    .node();

                  $(row).attr("data-uid", uid);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching data for ${formattedDate}:`, error);
      }

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
  const month = String(formateddate.getMonth() + 1).padStart(2, "0");
  const day = String(formateddate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateToLongFormat(date) {
  const dateObj = new Date(date);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return dateObj.toLocaleDateString("en-US", options);
}

function formatDateToShortFormat(date) {
  const [year, month, day] = date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);

  const options = { year: "numeric", month: "short", day: "numeric" };
  return dateObj.toLocaleDateString("en-US", options);
}

function getFormattedFilename() {
  let today = new Date();
  let month = today.toLocaleString("en-US", { month: "short" });
  let day = today.getDate();
  let year = today.getFullYear();
  return `Report_${month}_${day}_${year}`;
}
