const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector("#browseBtn");

const bgProgress = document.querySelector(".bg-progress");

const progressContainer = document.querySelector(".progress-container");
const ProgressBar = document.querySelector(".progress-bar");
const sharingContainer = document.querySelector(".sharing-container");

const iconContainer = document.querySelector(".icon-container");
const fileURL = document.querySelector("#fileURL");
const emailForm = document.querySelector("#emailForm");
const percentDiv = document.querySelector("#progressPercent");

const Toast = document.querySelector(".toast");
const copyBtn = document.querySelector("#copyBtn");
const host = "https://shareitcode.herokuapp.com";
const uploadUrl = `${host}/api/files`;
const emailUrl = `${host}/api/files/send`;
const maxAllowedSize = 100 * 1024 * 1024;

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();

  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragged");
  const files = e.dataTransfer.files;
  console.log(files);
  if (files.length) {
    fileInput.files = files;
    uploadFile();
  }
});

fileInput.addEventListener("change", () => {
  uploadFile();
});

browseBtn.addEventListener("click", () => {
  fileInput.click();
});
iconContainer.addEventListener("click", () => {
  fileInput.click();
});

const uploadFile = () => {
  if (fileInput.files.length > 1) {
    fileInput.value = "";
    showToast("warning", "Upload Only 1 File!");
    fileInput.value = "";
    return;
  }

  const file = fileInput.files;
  console.log(file);
  if (file.size > maxAllowedSize) {
    showToast("warning", "you can't upload more then 100 mb");
    fileInput.value = "";
    return;
  }
  console.log("file2");
  progressContainer.style.display = "block";
  const formData = new FormData();
  formData.append("myfile", file[0]);
  console.log("file3", file);
  const xhr = new XMLHttpRequest();
  console.log("file5");
  xhr.onreadystatechange = () => {
    console.log("file66");
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log(xhr.response);
      onUploadSuccess(JSON.parse(xhr.response));
    }
  };

  xhr.upload.onprogress = updateProgress;

  xhr.upload.onerror = () => {
    fileInput.value = "";
    showToast("error", `Error In Upload: ${xhr.statusText}`);
  };
  console.log(formData);
  console.log(uploadUrl);
  xhr.open("POST", uploadUrl);
  xhr.send(formData);
};

const updateProgress = (e) => {
  const percent = Math.round(e.loaded / e.total) * 100;
  bgProgress.style.width = `${percent}%`;
  percentDiv.innerText = percent;
  ProgressBar.style.transform = `scale(${percent / 100})`;
};

const onUploadSuccess = ({ file: url }) => {
  emailForm[2].removeAttribute("disabled");
  fileInput.value = "";
  progressContainer.style.display = "none";
  sharingContainer.style.display = "block";
  fileURL.value = url;
};

copyBtn.addEventListener("click", () => {
  fileURL.select();
  document.execCommand("copy");

  showToast("success", "Link Copyed To Your Clipboard");
});

emailForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const url = fileURL.value;
  const fromData = {
    uuid: url.split("/").slice(-1, 1)[0],
    emailTo: emailFrom.elements["to-email"].value,
    emailFrom: emailFrom.elements["from-email"].value,
  };

  emailFrom[2].setAttribute("disabled", "true");
  console.table(formData);

  fetch(emailUrl, {
    method: "POST",
    header: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then(({ success }) => {
      if (success) {
        sharingContainer.style.display = "none";
        showToast("success", "Email Sent To The Receiver");
      }
    });
});

let toastTimer;
// the toast function
const showToast = (type, msg) => {
  clearTimeout(toastTimer);
  Toast.innerText = msg;
  Toast.classList.add("show");
  if (type === "success") {
    Toast.style.backgroundColor = "#28a745";
  } else if (type === "warning") {
    Toast.style.backgroundColor = "#ffcc00";
  } else {
    Toast.style.backgroundColor = "#ed4337";
  }

  toastTimer = setTimeout(() => {
    Toast.classList.remove("show");
  }, 2000);
};
