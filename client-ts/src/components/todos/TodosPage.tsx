import React, {useEffect, useState} from 'react';
import {Grid, TextField, Button} from '@material-ui/core';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {TodosList} from './TodosList';
import {useHistory} from 'react-router-dom';
import {AxiosError} from 'axios';
import axios from '../../util/axiosInstance';
import axiosInstance from '../../util/axiosInterceptor';

const useTodosFormStyle = makeStyles((theme: Theme) => createStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    '&>*': {
      marginBottom: theme.spacing(2)
    }
  }
}))

export interface Task{
  id: string;
  name: string;
  createdOn?: Date;
}
export interface User extends Record<string, any>{
  id: string;
  username: string;
  email: string;
}
export interface Todo{
  id: string;
  name: string;
  description?: string;
  createdOn?: Date;
  tasks?: Task[];
  user: User;
}

export function TodosPage():JSX.Element{
  const history = useHistory();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoTitle, setTodoTitle] = useState<string>('');
  const [todoDesc, setTodoDesc] = useState<string>('');
  const classes = useTodosFormStyle();

  function loadTodos() {
    axios.get('http://localhost:4000/todos')
    .then(res => {
      const {todos} = res.data;
      console.log(todos);
      setTodos(todos);
    });
  }

  function changeTodoTitle(event: React.ChangeEvent<HTMLInputElement>){
    setTodoTitle(event.currentTarget.value);
  }

  function changeTodoDescription(event: React.ChangeEvent<HTMLInputElement>){
    setTodoDesc(event.currentTarget.value);
  }

  function addTodo(){
    const param = {
      name: todoTitle,
      description: todoDesc
    }

    axiosInstance.post(
      '/todos',
      param,
    ).then(res => {
      if (res.status === 201){
        setTodoDesc('');
        setTodoTitle('');
        loadTodos();
      }
    }).catch((e:AxiosError) => {
      console.error(e);
        alert(e);
      });
  }


  useEffect(() => {
    loadTodos();
  },[])

  return (
    <Grid container>
      <Grid item xs={4}>
        <form className={classes.form}>
          <TextField
              id="outlined-textarea"
              label="할 일 제목"
              placeholder="할 일을 입력하세요"
              value={todoTitle}
              onChange={changeTodoTitle}
              variant="outlined"
            />
            <TextField
              id="outlined-multiline-static"
              label="내용"
              multiline
              rows={4}
              placeholder="할일에 대한 설명을 입력하세요"
              value={todoDesc}
              onChange={changeTodoDescription}
              variant="outlined"
            />
            <Button color="primary" variant="contained" onClick={addTodo}>추가하기</Button>
        </form>
      </Grid>
      
      <Grid item xs={8}>
        <TodosList todos={todos} loadTodos={loadTodos}/>
      </Grid>
      
    </Grid>
  );
}