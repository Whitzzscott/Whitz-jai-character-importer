let newButton, spinner, uiContainer;
let isDragging = false, wasDragging = false;
let offsetX, offsetY;

function initializeButton() {
  if (uiContainer) return;

  createDownloadUI();
  setButtonEventListeners();
}

function createDownloadUI() {
  uiContainer = document.createElement("div");
  uiContainer.style.position = "fixed";
  uiContainer.style.backgroundColor = "black";
  uiContainer.style.borderRadius = "8px";
  uiContainer.style.padding = "10px";
  uiContainer.style.zIndex = "9999";
  uiContainer.style.top = "80px";
  uiContainer.style.right = "20px";
  uiContainer.style.display = "flex";
  uiContainer.style.alignItems = "center";
  uiContainer.style.width = "200px";
  uiContainer.style.cursor = "move";

  newButton = document.createElement("button");
  newButton.textContent = "Download JSON";
  newButton.style.backgroundColor = "blue";
  newButton.style.width = "100%";
  newButton.style.height = "40px";
  newButton.style.borderRadius = "5px";
  newButton.style.color = "white";
  newButton.style.cursor = "pointer";

  uiContainer.appendChild(newButton);
  document.body.appendChild(uiContainer);
}

function setButtonEventListeners() {
  newButton.addEventListener("mouseover", () => {
    newButton.style.transform = "scale(1.05)";
  });

  newButton.addEventListener("mouseout", () => {
    newButton.style.transform = "scale(1)";
  });

  newButton.addEventListener("click", async (e) => {
    if (wasDragging) {
      e.preventDefault();
      wasDragging = false;
      return;
    }

    setLoadingState(true);
    const data = await retrieveCharacter();
    if (data.error) {
      alert(data.error);
      setLoadingState(false);
      return;
    }
    downloadJsonData(data);
    setLoadingState(false);
    alert("Character data downloaded!");
  });

  uiContainer.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
}

function handleMouseDown(e) {
  isDragging = true;
  offsetX = e.clientX - uiContainer.getBoundingClientRect().left;
  offsetY = e.clientY - uiContainer.getBoundingClientRect().top;
  e.preventDefault();
}

function handleMouseMove(e) {
  if (isDragging) {
    wasDragging = true;
    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;
    uiContainer.style.left = `${newX}px`;
    uiContainer.style.top = `${newY}px`;
    uiContainer.style.right = "auto";
  }
}

function handleMouseUp() {
  isDragging = false;
}

function setLoadingState(isLoading) {
  if (isLoading) {
    newButton.style.backgroundColor = "orange";
    newButton.textContent = "Loading...";
    showSpinner();
  } else {
    newButton.style.backgroundColor = "blue";
    newButton.textContent = "Download JSON";
    hideSpinner();
  }
}

function showSpinner() {
  if (!spinner) {
    spinner = document.createElement("div");
    spinner.style.width = "16px";
    spinner.style.height = "16px";
    spinner.style.border = "3px solid #fff";
    spinner.style.borderTop = "3px solid #000";
    spinner.style.borderRadius = "50%";
    spinner.style.animation = "spin 1s linear infinite";
    spinner.style.position = "absolute";
    spinner.style.left = "10px";
    spinner.style.top = "50%";
    spinner.style.transform = "translateY(-50%)";
    newButton.appendChild(spinner);
  }
}

function hideSpinner() {
  if (spinner) {
    spinner.remove();
    spinner = null;
  }
}

function downloadJsonData(jsonObject) {
  const jsonString = JSON.stringify(jsonObject).replace(/\n/g, "").replace(/\s{2,}/g, " ");
  const blob = new Blob([jsonString], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `character_${jsonObject.name}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

async function retrieveCharacter() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "retrieveCharacter",
        details: {
          url: window.location.href,
          method: "GET",
        },
      },
      (response) => {
        if (!response) {
          reject(new Error("No response received from the background script"));
        } else {
          resolve(response);
        }
      },
    );
  });
}

initializeButton();
