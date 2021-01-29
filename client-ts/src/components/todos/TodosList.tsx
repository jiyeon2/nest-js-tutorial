import React, {useState} from 'react';
import {Todo} from './TodosPage';
import {
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Checkbox,
  Button,
  Typography
} from '@material-ui/core';
import axios from 'axios';
import axiosInstance from '../../util/axiosInterceptor';
import {useLoginUserState} from '../../contexts/UserContext';

export function TodosList(props:{todos: Todo[], loadTodos: () => void}):JSX.Element{
  const loginUserState = useLoginUserState();
  const {todos, loadTodos} = props;
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const handleToggle = (value: string) => () => {
    const currentIndex = checkedIds.indexOf(value);
    const newCheckedIds = [...checkedIds];

    if (currentIndex === -1){
      newCheckedIds.push(value);
    } else {
      newCheckedIds.splice(currentIndex, 1);
    }

    setCheckedIds(newCheckedIds);
  }


  const deleteOneTodo = (todoId: string, username: string) => () => {
    console.log('remove ', todoId);
    axiosInstance.delete(
      `/todos/${todoId}`,{
        data:{username}
      }
      )
    .then(res => {
      console.log(res);
      loadTodos();
    })
    .catch(error => {
      if (error.response.status === 401){
        alert('본인이 생성한 todo만 삭제할 수 있습니다')
      }
      console.error(error);
    });
    
  }

  return (
    <div>
    <List dense>
    {todos.map(todo => {
      const {id: todoId, name:todoTitle, description, user} = todo;
      const labelId = `checkbox-list-label-${todoId}`;
      return (
        <ListItem key={todoId} button>
          <ListItemText
            id={labelId}
            primary={todoTitle} 
            secondary={
            <>
              <Typography component="span" variant="body2">{`${user.username}`}</Typography>
              <Typography component="span">{` - ${description}`}</Typography>
            </>
            }
          />
          <ListItemSecondaryAction>
            <Checkbox
              edge="start"
              onChange={handleToggle(todoId)}
              checked={checkedIds.indexOf(todoId) !== -1}
              inputProps={{'aria-labelledby': labelId}}
            />
            <Button onClick={deleteOneTodo(todoId, loginUserState.username)} variant="contained" size="small">
              삭제
            </Button>
          </ListItemSecondaryAction>
        </ListItem>
      )
    })}
    </List>
    </div>
  )
}