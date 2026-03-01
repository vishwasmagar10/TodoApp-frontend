import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BASE_URL } from "../config/api";

type Task = {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: "Low" | "Medium" | "High";
};

type Props = {
  setUserToken: (token: string | null) => void;
};

const HomeScreen: React.FC<Props> = ({ setUserToken }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] =
    useState<"Low" | "Medium" | "High">("Medium");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ================= FETCH TASKS =================
  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Fetch error:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  // ================= ADD TASK =================
  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert("Title is required");
      return;
    }

    try {
      setAdding(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          dueDate: dueDate || null,
          priority,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.log("Server error:", err);
        throw new Error("Failed to add task");
      }

      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("Medium");

      fetchTasks();
    } catch (error) {
      console.log("Add error:", error);
    } finally {
      setAdding(false);
    }
  };

  // ================= TOGGLE =================
  const handleToggle = async (id: string, currentStatus: boolean) => {
    const token = await AsyncStorage.getItem("token");

    await fetch(`${BASE_URL}/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ completed: !currentStatus }),
    });

    fetchTasks();
  };

  // ================= DELETE =================
  const handleDelete = async (id: string) => {
    const token = await AsyncStorage.getItem("token");

    await fetch(`${BASE_URL}/api/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchTasks();
  };

  // ================= LOGOUT =================
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setUserToken(null);
  };

  // ================= HELPERS =================
  const isOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    return !task.completed && new Date(task.dueDate) < new Date();
  };

  const priorityColor = (priority: string) => {
    if (priority === "High") return "#EF4444";
    if (priority === "Medium") return "#F59E0B";
    return "#22C55E";
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Tasks</Text>

      {/* ADD FORM */}
      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.input}
          placeholder="Description"
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
        />

        <TextInput
          style={styles.input}
          placeholder="Due date (YYYY-MM-DD)"
          placeholderTextColor="#aaa"
          value={dueDate}
          onChangeText={setDueDate}
        />

        <View style={styles.priorityRow}>
          {["Low", "Medium", "High"].map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityBtn,
                priority === p && {
                  backgroundColor: priorityColor(p),
                },
              ]}
              onPress={() =>
                setPriority(p as "Low" | "Medium" | "High")
              }
            >
              <Text style={{ color: "#fff" }}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleAddTask}>
          {adding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff" }}>Add Task</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ACTIVE */}
      <Text style={styles.sectionTitle}>
        Active ({activeTasks.length})
      </Text>

      <FlatList
        data={activeTasks}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() =>
                handleToggle(item._id, item.completed)
              }
            >
              <View style={styles.cardHeader}>
                <Text
                  style={[
                    styles.cardTitle,
                    isOverdue(item) && styles.overdueText,
                  ]}
                >
                  {item.title}
                </Text>

                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: priorityColor(item.priority) },
                  ]}
                >
                  <Text style={styles.priorityText}>
                    {item.priority}
                  </Text>
                </View>
              </View>

              {item.description && (
                <Text style={styles.cardDescription}>
                  {item.description}
                </Text>
              )}

              {item.dueDate && (
                <Text style={styles.cardDue}>
                  📅 {item.dueDate.slice(0, 10)}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item._id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* COMPLETED */}
      <Text style={styles.sectionTitle}>
        Completed ({completedTasks.length})
      </Text>

      <FlatList
        data={completedTasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() =>
                handleToggle(item._id, item.completed)
              }
            >
              <View style={styles.cardHeader}>
                <Text
                  style={[
                    styles.cardTitle,
                    styles.completedText,
                  ]}
                >
                  {item.title}
                </Text>

                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: priorityColor(item.priority) },
                  ]}
                >
                  <Text style={styles.priorityText}>
                    {item.priority}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item._id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* LOGOUT */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  addContainer: {
    backgroundColor: "#1E293B",
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#0F172A",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: "#22C55E",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  priorityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  priorityBtn: {
    flex: 1,
    backgroundColor: "#334155",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  card: {
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 18,
    marginBottom: 15,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  cardDescription: {
    color: "#94A3B8",
    marginTop: 6,
  },
  cardDue: {
    marginTop: 6,
    fontSize: 12,
    color: "#CBD5E1",
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  priorityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#64748B",
  },
  overdueText: {
    color: "#EF4444",
  },
  deleteBtn: {
    marginTop: 12,
    alignSelf: "flex-end",
  },
  deleteText: {
    color: "#EF4444",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#22C55E",
    marginTop: 15,
    marginBottom: 10,
  },
  logoutBtn: {
    backgroundColor: "#EF4444",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});