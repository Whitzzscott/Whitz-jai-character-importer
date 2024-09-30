let baseUrl = "https://janitorai.com/hampter/characters/";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "retrieveCharacter") {
    const parts = message.details.url.split("/");
    const route = parts[parts.length - 1];
    const strippedRoute = route.split("_")[0];
    const finalUrl = baseUrl + strippedRoute;

    try {
      async function getData() {
        await transformToUniCharacter(finalUrl, sendResponse);
      }
      getData();
    } catch (error) {
      handleError(error, sendResponse);
      return;
    }
    return true;
  }

  if (message.action === "downloadCharacterData") {
    sendResponse({ success: true });
  }
});

async function transformToUniCharacter(url, functionToCall) {
  try {
    const data = await fetchAndCopyCharacterData(url);
    const character = {
      name: data.name,
      description: data.description,
      personality: data.personality,
      scenario: data.scenario,
      example_dialogs: data.example_dialogs,
      first_message: data.first_message,
      char_name: data.name,
      char_persona: data.personality,
      char_greeting: data.first_message,
      world_scenario: data.scenario,
      example_dialogue: data.example_dialogs,
      metadata: {
        version: 1,
        created: Date.now(),
        modified: Date.now(),
        source: null,
        tool: {
          name: "Whitz jai Tool",
          version: "1.0.0",
          url: "https://github.com/Whitzzscott?tab=repositories",
        },
      },
    };
    functionToCall(character);
  } catch (error) {
    handleError(error, functionToCall);
  }
}

async function fetchAndCopyCharacterData(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(`Fetch Error: ${errorDetails.message || response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Network Error: ${error.message || "An unknown error occurred."}`);
  }
}

function handleError(error, sendResponse) {
  const errorMessage = error.message || "An unexpected error occurred.";
  const errorType = determineErrorType(error);
  console.error(`Error Type: ${errorType}, Message: ${errorMessage}`);
  sendResponse({ error: { type: errorType, message: errorMessage } });
}

function determineErrorType(error) {
  if (error.message.includes("Fetch Error")) {
    return "FetchError";
  }
  if (error.message.includes("Network Error")) {
    return "NetworkError";
  }
  return "GeneralError";
}
