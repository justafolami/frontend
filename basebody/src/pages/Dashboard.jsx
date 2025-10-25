import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { stepsAPI, rewardsAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  initGoogleFit,
  signInToGoogle,
  getStepsToday,
  isSignedIn,
  signOutGoogle,
} from "../services/googlefit";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [todaySteps, setTodaySteps] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSteps();
    fetchRewards();
    initializeGoogleFit();
  }, []);

  const initializeGoogleFit = async () => {
    try {
      await initGoogleFit();
      setGoogleInitialized(true);

      // Check if user is already signed in
      if (isSignedIn()) {
        setIsGoogleConnected(true);
        setMessage("Google Fit already connected");
        // Optionally auto-sync on load
        // await syncStepsFromGoogleFit();
      }
    } catch (error) {
      console.error("Failed to initialize Google Fit:", error);
      setMessage("Failed to initialize Google Fit. Please refresh the page.");
    }
  };

  const fetchSteps = async () => {
    try {
      const { data } = await stepsAPI.getSteps();
      setTotalSteps(data.totalSteps);
    } catch (err) {
      console.error("Error fetching steps:", err);
    }
  };

  const fetchRewards = async () => {
    try {
      const { data } = await rewardsAPI.getRewards();
      setRewards(data.rewards);
    } catch (err) {
      console.error("Error fetching rewards:", err);
    }
  };

  const connectGoogleFit = async () => {
    if (!googleInitialized) {
      setMessage("Google Fit is still initializing. Please wait...");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await signInToGoogle();
      setIsGoogleConnected(true);
      setMessage("Google Fit connected successfully!");

      // Automatically sync steps after connection
      setTimeout(() => syncStepsFromGoogleFit(), 1000);
    } catch (err) {
      console.error("Google Fit connection error:", err);
      setMessage(
        err.error || "Failed to connect Google Fit. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const disconnectGoogleFit = () => {
    signOutGoogle();
    setIsGoogleConnected(false);
    setMessage("Google Fit disconnected");
  };

  const syncStepsFromGoogleFit = async () => {
    if (!isGoogleConnected) {
      setMessage("Please connect Google Fit first");
      return;
    }

    setLoading(true);
    setMessage("Syncing steps...");

    try {
      const steps = await getStepsToday();
      setTodaySteps(steps);

      // Send to backend
      await stepsAPI.recordSteps(steps);
      setMessage(`Successfully synced ${steps.toLocaleString()} steps!`);
      fetchSteps(); // Refresh total steps
    } catch (err) {
      console.error("Sync error:", err);
      setMessage(err.message || "Failed to sync steps. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data } = await rewardsAPI.claimReward();
      setMessage(`🎉 Reward claimed! TxHash: ${data.txHash}`);
      fetchRewards();
      fetchSteps(); // Refresh steps in case they're deducted
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to claim reward");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (isGoogleConnected) {
      signOutGoogle();
    }
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 bg-green-400">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">BodyBase</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded mb-4 ${
              message.includes("Failed") || message.includes("error")
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">User Info</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong> {user?.email}
              </p>
              <p className="text-gray-700">
                <strong>Wallet:</strong>
                <span className="text-xs block mt-1 break-all">
                  {user?.walletAddress}
                </span>
              </p>
              <p className="text-gray-700">
                <strong>Total Steps:</strong> {totalSteps.toLocaleString()}
              </p>
              <p className="text-gray-700">
                <strong>Today's Steps:</strong> {todaySteps.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Track Steps
            </h2>

            {!googleInitialized ? (
              <div className="text-gray-500 text-center py-4">
                Initializing Google Fit...
              </div>
            ) : !isGoogleConnected ? (
              <button
                onClick={connectGoogleFit}
                disabled={loading}
                className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:bg-gray-400 transition font-medium"
              >
                {loading ? "Connecting..." : "Connect Google Fit"}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-green-50 p-3 rounded">
                  <span className="text-green-700 font-medium">
                    ✓ Connected
                  </span>
                  <button
                    onClick={disconnectGoogleFit}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
                <button
                  onClick={syncStepsFromGoogleFit}
                  disabled={loading}
                  className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 disabled:bg-gray-400 transition font-medium"
                >
                  {loading ? "Syncing..." : "Sync Steps from Google Fit"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Claim Rewards
          </h2>
          <button
            onClick={handleClaimReward}
            disabled={loading || totalSteps === 0}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:bg-gray-400 transition font-medium"
          >
            {loading ? "Claiming..." : "Claim Reward"}
          </button>
          {totalSteps === 0 && (
            <p className="text-gray-500 text-sm mt-2">
              Sync some steps first to claim rewards
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Reward History
          </h2>
          {rewards.length === 0 ? (
            <p className="text-gray-500">
              No rewards claimed yet. Start walking to earn rewards!
            </p>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div
                  key={reward._id}
                  className="border-b border-gray-200 pb-3 last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-700">
                        <strong>Amount:</strong> {reward.amount} tokens
                      </p>
                      <p className="text-gray-700">
                        <strong>Status:</strong>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs ${
                            reward.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {reward.status}
                        </span>
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(reward.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {reward.txHash && (
                    <p className="text-xs text-gray-400 mt-2 break-all">
                      Tx: {reward.txHash}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
