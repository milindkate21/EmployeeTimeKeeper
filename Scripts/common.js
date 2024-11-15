import { db, ref, get, set, remove } from "./firebase.js";

$(document).ready(function () {
  let formattedDate = getFormattedCurrentDate();
  document.getElementById("day").textContent = getFormattedCurrentDate();

  console.log("User role ---->" + localStorage.getItem("userRole"));
  console.log(convertDate(formattedDate));

  getEmployeeFormData(convertDate(formattedDate));
});

document.addEventListener("DOMContentLoaded", function () {
  const userRole = localStorage.getItem("userRole");

  if (!userRole) {
    window.location.href = "/Pages/Login.html";
  }

  toggleMenuItems(userRole);

  const signOutButton = document.getElementById("signOut");

  if (signOutButton) {
    signOutButton.addEventListener("click", function () {
      localStorage.removeItem("userRole");

      localStorage.clear();
      sessionStorage.clear();

      window.location.href = "/Pages/Login.html";
    });
  }

  if (window.location.pathname === "/Pages/Login.html") {
    preventBackNavigation();
  }

  //.....................Start.....................//
  //Save Employee Form data
  // Form submission event
  const employeeForm = document.getElementById("employeeForm");
  if (employeeForm) {
    employeeForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Get form data
      const userId = localStorage.getItem("userId");

      const empname = document.getElementById("empname").value;
      const empaddress = document.getElementById("empaddress").value;
      const emphoursWorked = document.getElementById("hoursWorked").value;
      const empcoworker = document.getElementById("empcoworker").value;
      const empnotes = document.getElementById("notes").value;

      const currentDate = new Date(); // Get current date as string (MM/DD/YYYY)
      //const currentDate = new Date().toISOString().split("T")[0];
      const formattedTime = currentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const UID = generateUID();

      try {
        // Create a reference to the specific document in Firestore
        const employeeRef = ref(
          db,
          // `employees/${userId}/${convertDate(getFormattedCurrentDate())}/${UID}`
          `employees/${convertDate(
            getFormattedCurrentDate()
          )}/${userId}//${UID}`
        );

        // Set data in the specific document
        await set(employeeRef, {
          name: empname,
          address: empaddress,
          hoursWorked: emphoursWorked,
          coWorker: empcoworker,
          notes: empnotes,
          insertedTime: formattedTime,
        });

        // Clear form after submission
        employeeForm.reset();
        alert("Employee data submitted successfully!");
        getEmployeeFormData(convertDate(getFormattedCurrentDate()));
      } catch (e) {
        console.error("Error adding document: ", e);
        alert("Failed to submit data.");
      }
    });
  }
});

//GET Employee Form Data based on Date and uid
async function getEmployeeFormData(date) {
  const userId = localStorage.getItem("userId");
  // const employeeRef = ref(db, `employees/${userId}/${date}`);
  const employeeRef = ref(db, `employees/${date}/${userId}`);

  try {
    const snapshot = await get(employeeRef);
    if (snapshot.exists()) {
      const employeeData = snapshot.val();
      console.log("Employee Data:", employeeData);

      // Get the table element
      const tableElement = $("#employeeTable");

      // Destroy existing DataTable instance if it exists
      if ($.fn.DataTable.isDataTable(tableElement)) {
        tableElement.DataTable().clear().destroy();
      }

      //binding datatable....
      const table = tableElement.DataTable({
        scrollX: true,
        responsive: true,
      });

      table.clear();

      // Loop through each UID entry in the data object
      for (const uid in employeeData) {
        if (employeeData.hasOwnProperty(uid)) {
          const employee = employeeData[uid];

          console.log(date);

          // Format the date to 'Month Day, Year' format
          const localDate = new Date(date + "T00:00:00");
          const formattedDate = new Date(localDate).toLocaleDateString(
            "en-US",
            {
              month: "long",
              day: "numeric",
              year: "numeric",
            }
          );

          console.log(
            "Ye konsi Date he ....Formatted date--->" + formattedDate
          );

          // Add row with employee data, store UID as a data attribute
          const row = table.row
            .add([
              //date,
              formattedDate,
              employee.name,
              employee.address,
              employee.hoursWorked,
              employee.coWorker,
              employee.notes,
              `<button class="btn btn-danger delete-btn" data-uid="${uid}">Delete</button>`,
            ])
            .draw()
            .node();

          // Set UID as a data attribute for the row
          $(row).attr("data-uid", uid);
        }
      }

      //Delete Employee Form Data
      // Event listener for delete button click
      $("#employeeTable tbody").on("click", ".delete-btn", function () {
        const uid = $(this).data("uid");

        // Confirm deletion
        if (confirm("Are you sure you want to delete this record?")) {
          // Remove the data from Firebase
          const userId = localStorage.getItem("userId"); // Get userId from localStorage
          //const currentDate = new Date().toLocaleDateString(); // Format the current date
          const employeeRef = ref(db, `employees/${date}/${userId}/${uid}`);

          console.log("EMployee delete--->" + employeeRef);

          remove(employeeRef)
            .then(() => {
              // If deletion is successful, remove the row from DataTable
              table
                .rows()
                .every(function () {
                  const rowNode = this.node();
                  if ($(rowNode).attr("data-uid") === uid) {
                    this.remove(); // Remove row from DataTable
                  }
                })
                .draw();
              alert("Record deleted successfully.");
            })
            .catch((error) => {
              console.error("Error deleting document: ", error);
              alert("Failed to delete the record.");
            });
        }
      });
      //end delete function...
    } else {
      //alert("No data found for the specified date and UID.");
    }
  } catch (error) {
    console.error("Error fetching employee data:", error);
  }
}

//.....................End.....................//

function preventBackNavigation() {
  history.pushState(null, null, window.location.href);
  window.onpopstate = function () {
    history.go(1);
  };
}

function generateUID() {
  return (
    "uid-" + Date.now().toString(36) + Math.random().toString(36).substring(2)
  );
}

function convertDate(dateString) {
  const date = new Date(dateString);
  const formattedDate = date.toISOString().split("T")[0];
  return formattedDate;
}

// Toggle visibility of admin-only menu items
function toggleMenuItems(role) {
  const adminItems = document.querySelectorAll(".admin-only");

  adminItems.forEach((item) => {
    item.style.display = role === "admin" ? "block" : "none";
  });
}

function getFormattedCurrentDate() {
  const currentDate = new Date();
  const options = { day: "numeric", month: "long", year: "numeric" };
  return currentDate.toLocaleDateString("en-US", options);
}
