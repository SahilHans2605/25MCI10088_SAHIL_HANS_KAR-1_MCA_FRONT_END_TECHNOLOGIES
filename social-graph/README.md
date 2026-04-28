# GraphNet — Social Network Analysis Engine

A full-stack social network simulator built on a **graph data structure** (adjacency list) with **DFS** and **BFS** algorithms.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
node server.js

# 3. Open in browser
http://localhost:3000
```

---

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/addUser` | Add a user node |
| `POST` | `/addConnection` | Add a friendship edge |
| `DELETE` | `/removeConnection` | Remove a friendship edge |
| `GET` | `/users` | List all users + their friends |
| `GET` | `/mutualFriends?user1=A&user2=B` | Common friends |
| `GET` | `/suggestFriends?user=A` | BFS level-2 friend suggestions |
| `GET` | `/communities` | DFS connected components |
| `GET` | `/shortestPath?start=A&end=B` | BFS shortest path |
| `GET` | `/graphData` | Full graph (nodes + edges) for viz |

---

## 🧠 Algorithms

### BFS — Breadth-First Search  `O(V + E)`
- **Friend Suggestions**: Traverse level 1 (direct friends), then level 2 (friends of friends). Filter out existing connections and self.
- **Shortest Path**: Standard BFS with a `parent` map for path reconstruction.

### DFS — Depth-First Search  `O(V + E)`
- **Community Detection**: Iterates over all unvisited nodes; each DFS traversal from an unvisited node discovers one connected component.

---

## 📦 Data Structure

```
graph = {
  "Alice": Set { "Bob", "Carol", "Dave" },
  "Bob":   Set { "Alice", "Carol", "Eve" },
  ...
}
```
Pure in-memory adjacency list. No database. Resets on server restart (by design).

---

## ⚡ Complexity Reference

| Operation | Complexity |
|-----------|-----------|
| Add user | O(1) |
| Add/remove edge | O(1) |
| Mutual friends | O(min(deg_a, deg_b)) |
| BFS (suggestions / path) | O(V + E) |
| DFS (communities) | O(V + E) |

---

## 🗂 File Structure

```
social-graph/
├── server.js          # Express backend + graph algorithms
├── public/
│   └── index.html     # Frontend (HTML + CSS + JS, single file)
├── package.json
└── README.md
```
