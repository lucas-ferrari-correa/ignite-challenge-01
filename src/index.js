const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const findUser = users.find((user) => {
    return user.username === username;
  })

  if (!findUser) {
    return response.status(400).json({ erro: "User does not exist" });
  }

  request.user = findUser;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const findExistedUser = users.find((user) => {
    return user.username === username;
  })

  if (findExistedUser) {
    return response.status(400).json({ error: "Customer already registered" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const user = request.user;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const user = request.user;

  const findTodo = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!findTodo) {
    return response.status(404).json({ error: "Could not find todo" });
  }

  const updatedTodo = {
    ...findTodo,
    title,
    deadline: new Date(deadline)
  }

  user.todos.splice(findTodo)
  user.todos.push(updatedTodo);

  return response.json(updatedTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const findTodo = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!findTodo) {
    return response.status(404).json({ error: "Could not find todo" });
  }

  const patchedTodo = {
    ...findTodo,
    done: true
  }

  user.todos.splice(findTodo)
  user.todos.push(patchedTodo);

  return response.json(patchedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const findTodo = user.todos.find((todo) => {
    return todo.id === id;
  });

  if (!findTodo) {
    return response.status(404).json({ error: "Could not find todo" });
  }

  user.todos.splice(findTodo);

  return response.status(204).send();
});

module.exports = app;