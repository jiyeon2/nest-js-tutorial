import React, {useEffect, useState} from 'react';
import {Grid, TextField, Button} from '@material-ui/core';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {TodosList} from './TodosList';
import {useHistory} from 'react-router-dom';
import axios, {AxiosError} from 'axios';

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
  const history = useHistory();
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
    
    const token = localStorage.getItem('accessToken');

    if (!token){
      alert('로그인 후 작성이 가능합니다. 로그인 해주세요');
      history.push('/login');
    }

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
      if (res.status === 201){
        setTodoDesc('');
        setTodoTitle('');
        loadTodos();
      }
    }).catch((e:AxiosError) => {
      if (e.response?.status === 401){
        localStorage.setItem('accessToken','');
        alert('토큰이 만료되었습니다');
        // 만약 로그아웃 안했으면
        refreshToken();
        // history.push('/login');
      }
    });
  }

  function refreshToken(){
    axios.post('http://localhost:4000/auth/refresh-token').then(res => {
      console.log(res);
    }).catch(e => {
      console.error(e);
    })
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