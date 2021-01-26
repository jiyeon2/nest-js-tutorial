import React, {useState, useEffect} from 'react';
import './App.css';
import axios from 'axios';

interface Task {
  id: string;
  name: string;
}
interface Todo {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  function loadTodos() {
    axios.get('http://localhost:4000/todos')
    .then(res => {
      const {todos} = res.data;
      console.log(todos);
      setTodos(todos);
    })
    .catch(e => {
      console.log(e);
    })
  }
  useEffect(() => {
    loadTodos();
  },[])

  return (
    <div className="App">
      <div>
        {todos.map(todo => {
          const {id, name, description, tasks} = todo;
          const subTasks = tasks.map(task => {
            const {id, name} = task;
            return (
              <span key={id}>{name}</span>
            )
          })
          return (
            <div key={id}>
              <p>{`할 일 : ${name}`}</p>
              <p>{`설명 : ${description}`}</p>
              <p>{`세부 할 일 : ${subTasks}`}</p>
              </div>
          )
        })}
      </div>
    </div>
  );
}

export default App;
