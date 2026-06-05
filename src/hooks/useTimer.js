import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export const useGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGoals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("goals")
      .select("*, tasks(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setGoals(data);
    setLoading(false);
  };

  const createGoal = async (title, description) => {
    const today = new Date();
    const weekStart = today.toISOString().split("T")[0];
    const weekEnd = new Date(today.setDate(today.getDate() + 6))
      .toISOString()
      .split("T")[0];

    const { data, error } = await supabase
      .from("goals")
      .insert([
        {
          user_id: user.id,
          title,
          description,
          week_start: weekStart,
          week_end: weekEnd,
        },
      ])
      .select()
      .single();

    if (!error) setGoals((prev) => [data, ...prev]);
    return { data, error };
  };

  const updateGoal = async (id, updates) => {
    const { data, error } = await supabase
      .from("goals")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (!error) setGoals((prev) => prev.map((g) => (g.id === id ? data : g)));
    return { data, error };
  };

  const deleteGoal = async (id) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);

    if (!error) setGoals((prev) => prev.filter((g) => g.id !== id));
    return { error };
  };

  useEffect(() => {
    if (user) fetchGoals();
  }, [user]);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  };
};
