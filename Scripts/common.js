import {
  db,
  ref,
  get,
  set,
  remove,
  getAuth,
  onAuthStateChanged,
} from "./firebase.js";

let table;

onAuthStateChanged(getAuth(), (user) => {
  if (user) {
    $(document).ready(function () {
      $("#kilocheckbox").change(function () {
        if ($(this).is(":checked")) {
          $("#optionsContainer").removeClass("disabled");
          $("#optionsContainer input").prop("disabled", false);
          $("#empname, #emplocation").prop("disabled", true);
          $("#empname").val("");
          $("#emplocation").val("");
        } else {
          $("#optionsContainer").addClass("disabled");
          $("#optionsContainer input").prop("disabled", true);
          $("#empname, #emplocation").prop("disabled", false);
          $("input[name='radioGroup']").prop("checked", false);
          $("#kmnumber").val("");
        }
      });

      let formattedDate = getFormattedCurrentDate();

      const dayElement = document.getElementById("day");

      if (dayElement) {
        dayElement.textContent = getFormattedCurrentDate();
      }

      getEmployeeFormData(convertDate(formattedDate));
    });
  } else {
    console.error("User is not logged in. Permission denied.");
    window.location.href = "/Pages/Login.html";
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

      const userId = user.uid;

      const kilocheckbox = document.getElementById("kilocheckbox");
      const empname = kilocheckbox.checked
        ? ""
        : document.getElementById("empname").value;
      const emplocation = kilocheckbox.checked
        ? ""
        : document.getElementById("emplocation").value;
      const empworkcompleted =
        document.getElementById("empworkcompleted").value;
      const empstartTime = document.getElementById("starttime").value;
      const empendTime = document.getElementById("endtime").value;
      const empnotes = document.getElementById("notes").value;
      const kiloNumber = document.getElementById("kmnumber");

      let selectedRadioValue = "";
      let startKilometer = "";
      let endKilometer = "";
      if (kilocheckbox.checked) {
        const selectedRadio = document.querySelector(
          'input[name="radioGroup"]:checked'
        );

        if (!selectedRadio) {
          showBootstrapAlert(
            "Please select either 'Start Kilometer' or 'End Kilometer'.",
            "danger"
          );
          return;
        }

        selectedRadioValue = selectedRadio ? selectedRadio.value : "";

        if (selectedRadioValue === "startkm") {
          startKilometer = formatKilometers(kiloNumber.value);
        } else if (selectedRadioValue === "endkm") {
          endKilometer = formatKilometers(kiloNumber.value);
        }

        if (!kiloNumber.value.trim()) {
          showBootstrapAlert("Please enter a value for Kilometers.", "danger");
          return;
        }
      } else {
        if (!empname) {
          showBootstrapAlert("Please enter a client name.", "danger");
          return;
        }
        if (!emplocation) {
          showBootstrapAlert("Please enter a location.", "danger");
          return;
        }
      }
      const username = localStorage.getItem("username");

      const currentDate = new Date();
      const formattedTime = currentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      let emphoursWorked = 0;
      if (empstartTime && empendTime) {
        emphoursWorked = calculateHoursWorked(empstartTime, empendTime);
      } else {
        showBootstrapAlert(
          "Please enter both Start Time and End Time.",
          "danger"
        );
        return;
      }

      const UID = generateUID();

      try {
        const employeeRef = ref(
          db,
          `employees/${convertDate(getFormattedCurrentDate())}/${userId}/${UID}`
        );

        // Set data in the specific document
        await set(employeeRef, {
          name: empname,
          location: emplocation,
          workcompleted: empworkcompleted,
          startkilometer: startKilometer,
          endkilometer: endKilometer,
          starttime: convertTo12HourFormat(empstartTime),
          endtime: convertTo12HourFormat(empendTime),
          hoursWorked: emphoursWorked,
          notes: empnotes,
          insertedTime: formattedTime,
          addedby: username,
        });

        employeeForm.reset();
        showBootstrapAlert("Employee data submitted successfully!", "success");
        $("#empname, #emplocation").prop("disabled", false);
        getEmployeeFormData(convertDate(getFormattedCurrentDate()));
      } catch (e) {
        console.error("Error adding document: ", e.message);
        showBootstrapAlert("Failed to submit data.", "danger");
        return;
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
  const employeeRef = ref(db, `employees/${date}/${userId}`);

  try {
    const snapshot = await get(employeeRef);

    if (snapshot.exists()) {
      const employeeData = snapshot.val();
      const tableElement = $("#employeeTable");

      if ($.fn.DataTable.isDataTable(tableElement)) {
        tableElement.DataTable().clear().destroy();
      }

      table = tableElement.DataTable({
        scrollX: true,
        responsive: true,
      });

      $(window).on("resize", function () {
        table.columns.adjust().responsive.recalc();
      });

      table.clear();

      for (const uid in employeeData) {
        if (employeeData.hasOwnProperty(uid)) {
          const employee = employeeData[uid];
          const localDate = new Date(date + "T00:00:00");
          const formattedDate = new Date(localDate).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          );

          const row = table.row
            .add([
              formattedDate,
              employee.name,
              employee.location,
              employee.workcompleted,
              employee.startkilometer,
              employee.endkilometer,
              employee.starttime,
              employee.endtime,
              employee.hoursWorked,
              employee.notes,
              `<button class="btn btn-danger delete-btn" data-uid="${uid}" data-date="${date}">Delete</button>`,
            ])
            .draw()
            .node();

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

// Event listener for delete button click start
$("#employeeTable tbody").on("click", ".delete-btn", function () {
  const uid = $(this).data("uid");
  const date = $(this).data("date");
  if (confirm("Are you sure you want to delete this record?")) {
    const userId = localStorage.getItem("userId");
    const employeeRef = ref(db, `employees/${date}/${userId}/${uid}`);

    remove(employeeRef)
      .then(() => {
        table
          .rows()
          .every(function () {
            const rowNode = this.node();
            if ($(rowNode).attr("data-uid") === uid) {
              this.remove();
            }
          })
          .draw();
        showBootstrapAlert("Record deleted successfully.", "success");
      })
      .catch((error) => {
        console.error("Error deleting document: ", error);
        showBootstrapAlert("Failed to delete the record.", "danger");
        return;
      });
  }
});

//Event listener for delete button click end

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
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

function calculateHoursWorked(startTime, endTime) {
  let start = new Date(`1970-01-01T${startTime}`);
  let end = new Date(`1970-01-01T${endTime}`);

  // Handle night shift case where end time is on the next day
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }

  let diffMs = end - start; // Difference in milliseconds
  let diffMinutes = diffMs / (1000 * 60); // Convert to total minutes

  let hours = Math.floor(diffMinutes / 60); // Get full hours
  let minutes = diffMinutes % 60; // Get remaining minutes

  if (hours === 0) {
    return `${minutes} min`;
  } else if (minutes === 0) {
    return `${hours} hr`;
  } else {
    return `${hours} hr ${minutes} min`;
  }
}
function formatKilometers(kilometers) {
  return `${kilometers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km`;
}

// Function to show Bootstrap alert box
function showBootstrapAlert(message, type) {
  const alertContainer = document.getElementById("alertContainer");
  if (alertContainer) {
    const alertBox = document.createElement("div");
    alertBox.className = `alert alert-${type} alert-dismissible fade show`;
    alertBox.role = "alert";
    alertBox.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alertBox);

    // Scroll to the alert container to ensure visibility
    alertContainer.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(() => {
      alertBox.remove();
    }, 5000);
  }
}
