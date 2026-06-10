import { createContext, useContext, useState, ReactNode } from "react";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

interface GoalContextType {
  goals: Goal[];
  addGoal: (title: string, description?: string) => void;
  toggleGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
}

const GoalContext = createContext<GoalContextType | null>(null);

export const GoalProvider = ({ children }: { children: ReactNode }) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  const addGoal = (title: string, description?: string) => {
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setGoals((prev) => [...prev, newGoal]);
  };

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              completed: !goal.completed,
            }
          : goal,
      ),
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  return (
    <GoalContext.Provider
      value={{
        goals,
        addGoal,
        toggleGoal,
        deleteGoal,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalContext);

  if (!context) throw new Error("useGoals must be used inside GoalProvider");

  return context;
};
