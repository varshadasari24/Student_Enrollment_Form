const jpdbBaseURL = "https://api.login2explore.com:5577";
const jpdbIRL = "/api/irl";
const jpdbIML = "/api/iml";
const dbName = "SCHOOL-DATABASE";
const relName = "STUDENT-TABLE";
const connToken = "90934572|-31949212980659881|90956605";

function initForm() {
  resetForm();
}

function resetForm() {
  $("#rollNo").val("").prop("disabled", false);
  $("#fullName, #classNo, #birthDate, #address, #enrollDate")
    .val("")
    .prop("disabled", true);
  $("#saveBtn, #updateBtn").prop("disabled", true);
  $("#rollNo").focus();
}

function enableInputs() {
  $("#fullName, #classNo, #birthDate, #address, #enrollDate").prop("disabled", false);
  $("#fullName").focus();
}

function getStudent() {
  const studentId = $("#rollNo").val().trim();
  const errorSpan = document.getElementById("rollNoError");

  if (studentId === "") {
    errorSpan.textContent = "Roll Number is required";
    $("#rollNo").focus();
    return;
  } else {
    errorSpan.textContent = "";
  }

  const request = {
    token: connToken,
    dbName: dbName,
    rel: relName,
    cmd: "GET_BY_KEY",
    jsonStr: { rollNo: studentId }
  };

  $.post(jpdbBaseURL + jpdbIRL, JSON.stringify(request), function (response) {
    const result = JSON.parse(response);

    if (result.message === "DATA NOT FOUND") {
      enableInputs();
      $("#saveBtn").prop("disabled", false);
      $("#updateBtn").prop("disabled", true);
    } else {
      const student = JSON.parse(result.data).record;
      $("#fullName").val(student.fullName);
      $("#classNo").val(student.classNo);
      $("#birthDate").val(student.birthDate);
      $("#address").val(student.address);
      $("#enrollDate").val(student.enrollDate);

      $("#rollNo").prop("disabled", true);
      $("#saveBtn").prop("disabled", true);
      $("#updateBtn").prop("disabled", false);
      enableInputs();
    }
  }).fail(function () {
    enableInputs();
    $("#saveBtn").prop("disabled", false);
    $("#updateBtn").prop("disabled", true);
  });
}

function validateData() {
  const roll = $("#rollNo").val().trim();
  const name = $("#fullName").val().trim();
  const cls = $("#classNo").val().trim();
  const bdate = $("#birthDate").val().trim();
  const addr = $("#address").val().trim();
  const edate = $("#enrollDate").val().trim();

  if (!roll || !name || !cls || !bdate || !addr || !edate) {
    alert("All fields are required.");
    return null;
  }

  return {
    rollNo: roll,
    fullName: name,
    classNo: cls,
    birthDate: bdate,
    address: addr,
    enrollDate: edate
  };
}

function saveData() {
  const student = validateData();
  if (!student) return;

  const putRequest = {
    token: connToken,
    dbName: dbName,
    rel: relName,
    cmd: "PUT",
    primaryKey: "rollNo",
    jsonStr: student
  };

  $.post(jpdbBaseURL + jpdbIML, JSON.stringify(putRequest), function (response) {
    alert("Student record saved successfully.");
    resetForm();
  });
}

function updateData() {
  const student = validateData();
  if (!student) return;

  const getRequest = {
    token: connToken,
    dbName: dbName,
    rel: relName,
    cmd: "GET_BY_KEY",
    jsonStr: { rollNo: student.rollNo }
  };

  $.post(jpdbBaseURL + jpdbIRL, JSON.stringify(getRequest), function (getResponse) {
    const parsedResponse = JSON.parse(getResponse);

    if (parsedResponse.status !== 200 || !parsedResponse.data) {
      alert("Record not found for update.");
      return;
    }

    const recNo = JSON.parse(parsedResponse.data).rec_no;

    const updateRequest = {
      token: connToken,
      dbName: dbName,
      rel: relName,
      cmd: "UPDATE",
      primaryKey: "rollNo",
      jsonStr: {
        [recNo]: student
      }
    };

    $.post(jpdbBaseURL + jpdbIML, JSON.stringify(updateRequest), function (updateResponse) {
      alert("Student record updated successfully.");
      resetForm();
    });
  });
}
