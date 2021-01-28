import React, {useState} from 'react';
import {Todo} from './TodosPage';
import {
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Checkbox,
  Button
} from '@material-ui/core';
import axios from 'axios';
import axiosInstance from '../../util/axiosInterceptor';

export function TodosList(props:{todos: Todo[], loadTodos: () => void}):JSX.Element{
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


  const deleteOneTodo = (id: string) => () => {
    console.log('remove ', id);
    axiosInstance.delete(
      `/todos/${id}`,
      )
    .then(res => {
      console.log(res);
      loadTodos();
    })
    .catch(error => console.error(error));
    
  }

  return (
    <div>
    <List dense>
    {todos.map(todo => {
      const {id, name, description} = todo;
      const labelId = `checkbox-list-label-${id}`;
      return (
        <ListItem key={id} button>
          <ListItemText 
            id={labelId}
            primary={name} 
            secondary={description}
          />
          <ListItemSecondaryAction>
            <Checkbox
              edge="end"
              onChange={handleToggle(id)}
              checked={checkedIds.indexOf(id) !== -1}
              inputProps={{'aria-labelledby': labelId}}
            />
            <Button onClick={deleteOneTodo(id)} variant="contained" size="small">
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