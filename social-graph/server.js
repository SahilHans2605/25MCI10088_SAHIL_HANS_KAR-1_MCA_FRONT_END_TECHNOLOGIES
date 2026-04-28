const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors({ origin: '*', methods: ['GET','POST','DELETE'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
//  GRAPH DATA STRUCTURE (Adjacency List)
// ─────────────────────────────────────────────
// graph[user] = Set of friends
// users       = Map of user metadata
// ─────────────────────────────────────────────

const graph = {};   // adjacency list: { "Alice": Set{"Bob","Carol"}, ... }
const users = {};   // user metadata:  { "Alice": { name, avatar, createdAt }, ... }

// ── Seed data for demo ──────────────────────
function seed() {
  const names = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Hank'];
  const edges = [
    ['Alice','Bob'], ['Alice','Carol'], ['Alice','Dave'],
    ['Bob','Carol'], ['Bob','Eve'],
    ['Carol','Frank'],
    ['Dave','Grace'],
    ['Eve','Frank'], ['Eve','Hank'],
    ['Grace','Hank']
  ];
  names.forEach(n => addUser(n));
  edges.forEach(([a,b]) => addEdge(a, b));
}

function addUser(name) {
  if (!graph[name]) {
    graph[name] = new Set();
    users[name]  = { name, createdAt: new Date().toISOString() };
  }
}

function addEdge(a, b) {
  if (!graph[a] || !graph[b] || a === b) return false;
  graph[a].add(b);
  graph[b].add(a);
  return true;
}

function removeEdge(a, b) {
  if (!graph[a] || !graph[b]) return false;
  graph[a].delete(b);
  graph[b].delete(a);
  return true;
}

seed();

// ─────────────────────────────────────────────
//  ALGORITHMS
// ─────────────────────────────────────────────

// Mutual Friends — intersection of two adjacency sets  O(min(deg_a, deg_b))
function mutualFriends(u1, u2) {
  if (!graph[u1] || !graph[u2]) return [];
  return [...graph[u1]].filter(f => graph[u2].has(f));
}

// Friend Suggestions — BFS level-2  O(V + E)
function suggestFriends(user) {
  if (!graph[user]) return [];
  const visited = new Set([user]);
  const queue   = [[user, 0]];        // [node, depth]
  const suggestions = new Set();

  while (queue.length) {
    const [curr, depth] = queue.shift();
    if (depth >= 2) break;

    for (const neighbor of graph[curr]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, depth + 1]);
        if (depth === 1 && !graph[user].has(neighbor)) {
          suggestions.add(neighbor);
        }
      }
    }
  }
  return [...suggestions];
}

// Community Detection — DFS connected components  O(V + E)
function detectCommunities() {
  const visited    = new Set();
  const communities = [];

  function dfs(node, community) {
    visited.add(node);
    community.push(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, community);
      }
    }
  }

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      const community = [];
      dfs(node, community);
      communities.push(community);
    }
  }
  return communities;
}

// Shortest Path — BFS with parent tracking  O(V + E)
function shortestPath(start, end) {
  if (!graph[start] || !graph[end]) return null;
  if (start === end) return [start];

  const visited = new Set([start]);
  const queue   = [start];
  const parent  = { [start]: null };

  while (queue.length) {
    const curr = queue.shift();
    for (const neighbor of graph[curr]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent[neighbor] = curr;
        if (neighbor === end) {
          // Reconstruct path
          const path = [];
          let node = end;
          while (node !== null) {
            path.unshift(node);
            node = parent[node];
          }
          return path;
        }
        queue.push(neighbor);
      }
    }
  }
  return null; // no path
}

// ─────────────────────────────────────────────
//  API ROUTES
// ─────────────────────────────────────────────

// POST /addUser
app.post('/addUser', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim())
    return res.status(400).json({ error: 'Name is required' });
  const n = name.trim();
  if (graph[n])
    return res.status(409).json({ error: `User "${n}" already exists` });
  addUser(n);
  res.json({ success: true, user: n, totalUsers: Object.keys(graph).length });
});

// POST /addConnection
app.post('/addConnection', (req, res) => {
  const { user1, user2 } = req.body;
  if (!user1 || !user2)
    return res.status(400).json({ error: 'Both users required' });
  if (!graph[user1]) return res.status(404).json({ error: `User "${user1}" not found` });
  if (!graph[user2]) return res.status(404).json({ error: `User "${user2}" not found` });
  if (user1 === user2) return res.status(400).json({ error: 'Cannot connect user to themselves' });
  if (graph[user1].has(user2))
    return res.status(409).json({ error: 'Connection already exists' });
  addEdge(user1, user2);
  res.json({ success: true, edge: [user1, user2] });
});

// DELETE /removeConnection
app.delete('/removeConnection', (req, res) => {
  const { user1, user2 } = req.body;
  if (!graph[user1] || !graph[user2])
    return res.status(404).json({ error: 'One or both users not found' });
  if (!graph[user1].has(user2))
    return res.status(404).json({ error: 'Connection does not exist' });
  removeEdge(user1, user2);
  res.json({ success: true });
});

// GET /users
app.get('/users', (req, res) => {
  const result = Object.keys(graph).map(name => ({
    name,
    friends: [...graph[name]],
    degree:  graph[name].size
  }));
  res.json(result);
});

// GET /mutualFriends?user1=A&user2=B
app.get('/mutualFriends', (req, res) => {
  const { user1, user2 } = req.query;
  if (!graph[user1] || !graph[user2])
    return res.status(404).json({ error: 'User(s) not found' });
  res.json({ user1, user2, mutual: mutualFriends(user1, user2) });
});

// GET /suggestFriends?user=A
app.get('/suggestFriends', (req, res) => {
  const { user } = req.query;
  if (!graph[user]) return res.status(404).json({ error: 'User not found' });
  res.json({ user, suggestions: suggestFriends(user) });
});

// GET /communities
app.get('/communities', (req, res) => {
  res.json({ communities: detectCommunities() });
});

// GET /shortestPath?start=A&end=B
app.get('/shortestPath', (req, res) => {
  const { start, end } = req.query;
  if (!graph[start] || !graph[end])
    return res.status(404).json({ error: 'User(s) not found' });
  const path = shortestPath(start, end);
  res.json({ start, end, path, length: path ? path.length - 1 : null });
});

// GET /graphData — full graph for visualization
app.get('/graphData', (req, res) => {
  const nodes = Object.keys(graph).map(name => ({ id: name, degree: graph[name].size }));
  const edges = [];
  const seen  = new Set();
  for (const [u, set] of Object.entries(graph)) {
    for (const v of set) {
      const key = [u, v].sort().join('|||');
      if (!seen.has(key)) { seen.add(key); edges.push({ source: u, target: v }); }
    }
  }
  res.json({ nodes, edges });
});

const PORT = 5500;
app.listen(PORT, () => console.log(`🌐 Social Graph API running on http://localhost:${PORT}`));