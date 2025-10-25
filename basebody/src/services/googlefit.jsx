const GOOGLE_CLIENT_ID = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/fitness.activity.read";
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest";

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Initialize the Google API client
export const initGoogleFit = () => {
  return new Promise((resolve, reject) => {
    // Load gapi for API calls
    window.gapi.load("client", async () => {
      try {
        await window.gapi.client.init({
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeEnableButtons(resolve);
      } catch (error) {
        reject(error);
      }
    });

    // Initialize Google Identity Services for OAuth2
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: "", // Will be set in signInToGoogle
    });
    gisInited = true;
    maybeEnableButtons(resolve);
  });
};

function maybeEnableButtons(resolve) {
  if (gapiInited && gisInited) {
    resolve();
  }
}

// Sign in and get access token
export const signInToGoogle = () => {
  return new Promise((resolve, reject) => {
    tokenClient.callback = async (response) => {
      if (response.error !== undefined) {
        reject(response);
        return;
      }
      // Access token is now set in the client
      resolve(response);
    };

    // Check if user already has valid token
    if (window.gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      // Skip display of account chooser and consent dialog for existing session
      tokenClient.requestAccessToken({ prompt: "" });
    }
  });
};

// Sign out
export const signOutGoogle = () => {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    window.gapi.client.setToken("");
  }
};

// Get steps for today
export const getStepsToday = async () => {
  const now = Date.now();
  const startOfDay = new Date().setHours(0, 0, 0, 0);

  try {
    const response = await window.gapi.client.fitness.users.dataset.aggregate({
      userId: "me",
      resource: {
        aggregateBy: [
          {
            dataTypeName: "com.google.step_count.delta",
            dataSourceId:
              "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
          },
        ],
        startTimeMillis: startOfDay,
        endTimeMillis: now,
      },
    });

    const steps =
      response.result.bucket[0]?.dataset[0]?.point[0]?.value[0]?.intVal || 0;
    return steps;
  } catch (error) {
    console.error("Error fetching steps:", error);
    throw error;
  }
};

// Get steps for a date range
export const getStepsForRange = async (startDate, endDate) => {
  try {
    const response = await window.gapi.client.fitness.users.dataset.aggregate({
      userId: "me",
      resource: {
        aggregateBy: [
          {
            dataTypeName: "com.google.step_count.delta",
            dataSourceId:
              "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
          },
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day in milliseconds
        startTimeMillis: startDate.getTime(),
        endTimeMillis: endDate.getTime(),
      },
    });

    return response.result.bucket.map((bucket) => ({
      date: new Date(parseInt(bucket.startTimeMillis)),
      steps: bucket.dataset[0]?.point[0]?.value[0]?.intVal || 0,
    }));
  } catch (error) {
    console.error("Error fetching steps range:", error);
    throw error;
  }
};

// Check if user is signed in
export const isSignedIn = () => {
  return window.gapi.client.getToken() !== null;
};
