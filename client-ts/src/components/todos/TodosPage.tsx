import React, {useEffect, useState} from 'react';
import {Grid, TextField, Button} from '@material-ui/core';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {TodosList} from './TodosList';
import axios from 'axios';

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
export interface Todo{
  id: string;
  name: string;
  description?: string;
  createdOn?: Date;
  tasks?: Task[];
}

export function TodosPage():JSX.Element{
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoTitle, setTodoTitle] = useState<string>('');
  const [todoDesc, setTodoDesc] = useState<string>('');
  const classes = useTodosFormStyle();

  function loadTodos() {
    axios.get('http://localhost:4000/todos')
    .then(res => {
      const {todos} = res.data;
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
    // 로그인 후 토큰 따로 저장해두기... 아직 로그인 폼 안만듦
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFubmUiLCJpYXQiOjE2MTE2NzI5OTUsImV4cCI6MTYxMjg4MjU5NX0.Dj-txB34M0GOuAVKJlmwwddP7CD_--LoCFedFnjpBZc"
    const config ={
      headers: {Authorization: `Bearer ${token}`}
    };

    const param = {
      name: todoTitle,
      description: todoDesc
    }
    axios.post(
      'http://localhost:4000/todos',
      param,
      config
    ).then(res => {
      console.log(res);
      setTodoDesc('');
      setTodoTitle('');
      loadTodos();
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
              multiline
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
        <TodosList todos={todos}/>
      </Grid>
      
    </Grid>
  );
}