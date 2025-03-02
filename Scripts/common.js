import {
  db,
  ref,
  get,
  set,
  remove,
  getAuth,
  onAuthStateChanged,
} from "./firebase.js";

let table; // Declare table variable globally

onAuthStateChanged(getAuth(), (user) => {
  if (user) {
    // Now that the user is authenticated, proceed with your logic
    $(document).ready(function () {
      let formattedDate = getFormattedCurrentDate();

      const dayElement = document.getElementById("day");

      if (dayElement) {
        dayElement.textContent = getFormattedCurrentDate(); // Safely set the textContent
      }

      getEmployeeFormData(convertDate(formattedDate));
    });
  } else {
    console.error("User is not logged in. Permission denied.");
    window.location.href = "/Pages/Login.html"; // Redirect to login if not logged in
  }
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

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User is not logged in. Permission denied.");
        return;
      }

      // Get form data
      //const userId = localStorage.getItem("userId");
      const userId = user.uid;

      const empname = document.getElementById("empname").value;
      const emplocation = document.getElementById("emplocation").value;
      const empworkcompleted =
        document.getElementById("empworkcompleted").value;
      const empstartTime = document.getElementById("starttime").value;
      const empendTime = document.getElementById("endtime").value;
      const empnotes = document.getElementById("notes").value;

      const currentDate = new Date(); // Get current date as string (MM/DD/YYYY)
      //const currentDate = new Date().toISOString().split("T")[0];
      const formattedTime = currentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      //calculate hours from start and end time..
      let emphoursWorked = 0;
      if (empstartTime && empendTime) {
        const start = new Date(`1970-01-01T${empstartTime}:00`);
        const end = new Date(`1970-01-01T${empendTime}:00`);

        let hoursWorked = (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours

        if (hoursWorked < 0) {
          hoursWorked += 24; // Handle overnight shifts
        }

        emphoursWorked = hoursWorked.toFixed(2); // Set the calculated hours in the input field
      } else {
        alert("Please enter both Start Time and End Time.");
      }

      const UID = generateUID();

      try {
        // Create a reference to the specific document in Firestore
        const employeeRef = ref(
          db,
          // `employees/${userId}/${convertDate(getFormattedCurrentDate())}/${UID}`
          `employees/${convertDate(getFormattedCurrentDate())}/${userId}/${UID}`
        );

        // Set data in the specific document
        await set(employeeRef, {
          name: empname,
          location: emplocation,
          workcompleted: empworkcompleted,
          starttime: convertTo12HourFormat(empstartTime),
          endtime: convertTo12HourFormat(empendTime),
          hoursWorked: emphoursWorked,
          notes: empnotes,
          insertedTime: formattedTime,
        });

        // Clear form after submission
        employeeForm.reset();
        alert("Employee data submitted successfully!");
        getEmployeeFormData(convertDate(getFormattedCurrentDate()));
      } catch (e) {
        console.error("Error adding document: ", e.message);
        alert("Failed to submit data.");
      }
    });
  }
});

//GET Employee Form Data based on Date and uid
async function getEmployeeFormData(date) {
  const auth = getAuth();

  const user = auth.currentUser;

  if (!user) {
    console.error("User is not logged in. Permission denied.");
    return;
  }

  const userId = user.uid;

  //const userId = localStorage.getItem("userId");

  console.log("user id ----> " + userId);

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
      table = tableElement.DataTable({
        scrollX: true,
        responsive: true,
      });

      table.clear();

      // Loop through each UID entry in the data object
      for (const uid in employeeData) {
        if (employeeData.hasOwnProperty(uid)) {
          const employee = employeeData[uid];

          console.log(employee);

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

          // Add row with employee data, store UID as a data attribute
          const row = table.row
            .add([
              formattedDate,
              employee.name,
              employee.location,
              employee.workcompleted,
              employee.starttime,
              employee.endtime,
              employee.hoursWorked,
              employee.notes,
              `<button class="btn btn-danger delete-btn" data-uid="${uid}" data-date="${date}">Delete</button>`,
            ])
            .draw()
            .node();

          // Set UID as a data attribute for the row
          $(row).attr("data-uid", uid).attr("data-date", date);
        }
      }
    } else {
      //alert("No data found for the specified date and UID.");
    }
  } catch (error) {
    console.error("Error fetching employee data:", error);
  }
}

//Delete Employee Form Data
// Event listener for delete button click
$("#employeeTable tbody").on("click", ".delete-btn", function () {
  const uid = $(this).data("uid");
  const date = $(this).data("date");

  // Confirm deletion
  if (confirm("Are you sure you want to delete this record?")) {
    // Remove the data from Firebase
    const userId = localStorage.getItem("userId"); // Get userId from localStorage
    //const currentDate = new Date().toLocaleDateString(); // Format the current date
    const employeeRef = ref(db, `employees/${date}/${userId}/${uid}`);

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

function convertTo12HourFormat(time) {
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours);
  let period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 to 12 for midnight
  return `${hours}:${minutes} ${period}`;
}
