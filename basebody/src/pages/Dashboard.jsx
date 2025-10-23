import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { stepsAPI, rewardsAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  initGoogleFit,
  signInToGoogle,
  getStepsToday,
} from "../services/googleFit";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [todaySteps, setTodaySteps] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSteps();
    fetchRewards();
    initGoogleFit();
  }, []);

  const fetchSteps = async () => {
    try {
      const { data } = await stepsAPI.getSteps();
      setTotalSteps(data.totalSteps);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRewards = async () => {
    try {
      const { data } = await rewardsAPI.getRewards();
      setRewards(data.rewards);
    } catch (err) {
      console.error(err);
    }
  };

  const connectGoogleFit = async () => {
    try {
      await signInToGoogle();
      setIsGoogleConnected(true);
      setMessage("Google Fit connected!");
    } catch (err) {
      setMessage("Failed to connect Google Fit");
    }
  };

  const syncStepsFromGoogleFit = async () => {
    if (!isGoogleConnected) {
      setMessage("Please connect Google Fit first");
      return;
    }

    setLoading(true);
    try {
      const steps = await getStepsToday();
      setTodaySteps(steps);

      // Send to backend
      await stepsAPI.recordSteps(steps);
      setMessage(`Synced ${steps} steps!`);
      fetchSteps();
    } catch (err) {
      setMessage("Failed to sync steps");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data } = await rewardsAPI.claimReward();
      setMessage(`Reward claimed! TxHash: ${data.txHash}`);
      fetchRewards();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to claim reward");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Walk to Earn Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        {message && (
          <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">User Info</h2>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Wallet:</strong> {user?.walletAddress}
            </p>
            <p>
              <strong>Total Steps:</strong> {totalSteps}
            </p>
            <p>
              <strong>Today's Steps:</strong> {todaySteps}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Track Steps</h2>

            {!isGoogleConnected ? (
              <button
                onClick={connectGoogleFit}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-4"
              >
                Connect Google Fit
              </button>
            ) : (
              <button
                onClick={syncStepsFromGoogleFit}
                disabled={loading}
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {loading ? "Syncing..." : "Sync Steps from Google Fit"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Claim Rewards</h2>
          <button
            onClick={handleClaimReward}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Claiming..." : "Claim Reward"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Reward History</h2>
          {rewards.length === 0 ? (
            <p>No rewards yet</p>
          ) : (
            <div className="space-y-2">
              {rewards.map((reward) => (
                <div key={reward._id} className="border-b py-2">
                  <p>
                    <strong>Amount:</strong> {reward.amount}
                  </p>
                  <p>
                    <strong>Status:</strong> {reward.status}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(reward.createdAt).toLocaleDateString()}
                  </p>
                  {reward.txHash && (
                    <p className="text-xs text-gray-500">Tx: {reward.txHash}</p>
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
