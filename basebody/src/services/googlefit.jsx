const GOOGLE_CLIENT_ID = import.meta.env.REACT_APP_GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/fitness.activity.read";

export const initGoogleFit = () => {
  return new Promise((resolve) => {
    window.gapi.load("client:auth2", async () => {
      await window.gapi.client.init({
        clientId: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/fitness/v1/rest",
        ],
      });
      resolve();
    });
  });
};

export const signInToGoogle = async () => {
  const auth = window.gapi.auth2.getAuthInstance();
  await auth.signIn();
};

export const getStepsToday = async () => {
  const now = Date.now();
  const startOfDay = new Date().setHours(0, 0, 0, 0);

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
};
