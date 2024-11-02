import { db, ref, get, set } from "./firebase.js";

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

      const currentDate = new Date().toLocaleDateString().replace(/\//g, "-"); // Get current date as string (MM/DD/YYYY)
      //const currentDate = new Date().toISOString().split("T")[0];

      const UID = generateUID();

      try {
        // Create a reference to the specific document in Firestore
        const employeeRef = ref(
          db,
          `employees/${userId}/${convertDate(getFormattedCurrentDate())}/${UID}`
        );

        // Set data in the specific document
        await set(employeeRef, {
          name: empname,
          address: empaddress,
          hoursWorked: emphoursWorked,
          coWorker: empcoworker,
          notes: empnotes,
        });

        // Clear form after submission
        employeeForm.reset();
        alert("Employee data submitted successfully!");
      } catch (e) {
        console.error("Error adding document: ", e);
        alert("Failed to submit data.");
      }
    });
  }
});

//GET Employee Form Data based on Date and uid
async function getEmployeeFormData(date) {
  console.log(date);
  const userId = localStorage.getItem("userId");
  const employeeRef = ref(db, `employees/${userId}/${date}`);

  try {
    const snapshot = await get(employeeRef);
    if (snapshot.exists()) {
      const employeeData = snapshot.val();
      console.log("Employee Data:", employeeData);

      //binding datatable....
      const table = $("#employeeTable").DataTable();

      // Loop through each UID entry in the data object
      for (const uid in employeeData) {
        if (employeeData.hasOwnProperty(uid)) {
          const employee = employeeData[uid];

          // Add row with employee data, store UID as a data attribute
          const row = table.row
            .add([
              date,
              employee.name,
              employee.address,
              employee.coWorker,
              employee.hoursWorked,
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
          const employeeRef = ref(db, `employees/${userId}/${date}/${uid}`);

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
      console.log("No data available for this date and UID.");
      alert("No data found for the specified date and UID.");
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
